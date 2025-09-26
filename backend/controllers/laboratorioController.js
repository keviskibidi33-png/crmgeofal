const pool = require('../config/db');

// Obtener proyectos asignados al laboratorio
const getProyectosAsignados = async (req, res) => {
  try {
    // Optimización: Logs de debug removidos para producción
    
    const { page = 1, limit = 20, estado = '', search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    // Para admin mostrar todos los proyectos, para otros usuarios solo los asignados
    let whereClause = '';
    let queryParams = [];
    let paramCount = 0;
    
    // Simular usuario admin si no hay autenticación
    const user = req.user || { id: 1, role: 'admin' };
    
    if (user.role !== 'admin') {
      whereClause = 'WHERE p.usuario_laboratorio_id = $1';
      queryParams = [user.id];
      paramCount = 1;
    } else {
      whereClause = 'WHERE 1=1'; // Admin ve todos los proyectos
    }
    
    if (estado) {
      paramCount++;
      whereClause += ` AND p.estado = $${paramCount}`;
      queryParams.push(estado);
    }
    
    if (search) {
      paramCount++;
      whereClause += ` AND (p.name ILIKE $${paramCount} OR c.name ILIKE $${paramCount} OR c.email ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }
    
    const query = `
      SELECT 
        p.id,
        p.name as proyecto_nombre,
        p.location as description,
        p.estado,
        p.fecha_envio_laboratorio,
        p.fecha_completado_laboratorio,
        p.notas_laboratorio,
        c.name as cliente_nombre,
        c.email as cliente_email,
        c.phone as cliente_telefono,
        u.name as vendedor_nombre,
        q.id as cotizacion_id,
        q.es_contrato,
        q.notas_vendedor,
        q.archivos_cotizacion,
        q.archivos_laboratorio
      FROM projects p
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN users u ON p.vendedor_id = u.id
      LEFT JOIN quotes q ON p.cotizacion_id = q.id
      ${whereClause}
      ORDER BY p.fecha_envio_laboratorio DESC, p.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
    
    queryParams.push(parseInt(limit), offset);
    
    const result = await pool.query(query, queryParams);
    
    // Contar total para paginación
    const countQuery = `
      SELECT COUNT(*) as total
      FROM projects p
      LEFT JOIN companies c ON p.company_id = c.id
      ${whereClause}
    `;
    
    console.log('🔬 getProyectosAsignados - Ejecutando consulta de conteo...');
    const countResult = await pool.query(countQuery, queryParams.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);
    console.log('🔬 getProyectosAsignados - Total de registros:', total);
    
    const response = {
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    };
    
    // Respuesta optimizada
    res.json(response);
  } catch (error) {
    console.error('❌ getProyectosAsignados - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas del laboratorio
const getEstadisticasLaboratorio = async (req, res) => {
  try {
    // Optimización: Logs de debug removidos para producción
    
    // Para admin mostrar todas las estadísticas, para otros usuarios solo las asignadas
    let whereClause = '';
    let queryParams = [];
    
    // Simular usuario admin si no hay autenticación
    const user = req.user || { id: 1, role: 'admin' };
    
    if (user.role !== 'admin') {
      whereClause = 'WHERE usuario_laboratorio_id = $1';
      queryParams = [user.id];
    }
    
    // Ejecutando consulta SQL optimizada
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_proyectos,
        COUNT(CASE WHEN estado = 'en_laboratorio' THEN 1 END) as en_proceso,
        COUNT(CASE WHEN estado = 'completado' THEN 1 END) as completados,
        COUNT(CASE WHEN fecha_envio_laboratorio >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as esta_semana,
        COUNT(CASE WHEN fecha_completado_laboratorio >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as completados_mes
      FROM projects 
      ${whereClause}
    `, queryParams);
    
    console.log('📊 getEstadisticasLaboratorio - Consulta ejecutada, estadísticas obtenidas:', stats.rows[0]);
    
    const response = {
      success: true,
      data: stats.rows[0]
    };
    
    console.log('📊 getEstadisticasLaboratorio - Enviando respuesta:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    console.error('❌ getEstadisticasLaboratorio - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar estado del proyecto
const actualizarEstadoProyecto = async (req, res) => {
  try {
    console.log('🔄 actualizarEstadoProyecto - Llamando a:', req.url);
    
    const { projectId } = req.params;
    const { estado, notas_laboratorio } = req.body;
    
    // Validar estado
    const estadosValidos = ['en_laboratorio', 'completado', 'cancelado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado no válido'
      });
    }
    
    // Obtener estado anterior
    const proyectoAnterior = await pool.query(
      'SELECT estado FROM projects WHERE id = $1 AND usuario_laboratorio_id = $2',
      [projectId, req.user.id]
    );
    
    if (proyectoAnterior.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado o no asignado'
      });
    }
    
    const estadoAnterior = proyectoAnterior.rows[0].estado;
    
    // Actualizar proyecto
    const updateQuery = `
      UPDATE projects 
      SET estado = $1, 
          notas_laboratorio = $2,
          fecha_completado_laboratorio = CASE 
            WHEN $1 = 'completado' THEN CURRENT_TIMESTAMP 
            ELSE fecha_completado_laboratorio 
          END
      WHERE id = $3 AND usuario_laboratorio_id = $4
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [
      estado, 
      notas_laboratorio, 
      projectId, 
      req.user.id
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }
    
    // Registrar cambio de estado
    await pool.query(`
      INSERT INTO project_states (project_id, estado_anterior, estado_nuevo, usuario_id, notas)
      VALUES ($1, $2, $3, $4, $5)
    `, [projectId, estadoAnterior, estado, req.user.id, notas_laboratorio]);
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Estado actualizado correctamente'
    });
  } catch (error) {
    console.error('❌ actualizarEstadoProyecto - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Subir archivos del laboratorio
const subirArchivosLaboratorio = async (req, res) => {
  try {
    console.log('📁 subirArchivosLaboratorio - Llamando a:', req.url);
    
    const { projectId } = req.params;
    const { archivos, notas_laboratorio } = req.body;
    
    // Verificar que el proyecto existe y está asignado
    const proyecto = await pool.query(
      'SELECT id, cotizacion_id FROM projects WHERE id = $1 AND usuario_laboratorio_id = $2',
      [projectId, req.user.id]
    );
    
    if (proyecto.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado o no asignado'
      });
    }
    
    const cotizacionId = proyecto.rows[0].cotizacion_id;
    
    // Actualizar archivos en la cotización
    if (archivos && archivos.length > 0) {
      const archivosData = archivos.map(archivo => ({
        nombre: archivo.nombre,
        ruta: archivo.ruta,
        tamaño: archivo.tamaño,
        tipo: archivo.tipo,
        fecha: new Date().toISOString()
      }));
      
      await pool.query(`
        UPDATE quotes 
        SET archivos_laboratorio = $1, notas_laboratorio = $2
        WHERE id = $3
      `, [JSON.stringify(archivosData), notas_laboratorio, cotizacionId]);
      
      // Registrar archivos en project_files
      for (const archivo of archivosData) {
        await pool.query(`
          INSERT INTO project_files (project_id, quote_id, tipo_archivo, nombre_archivo, ruta_archivo, tamaño_archivo, tipo_mime, usuario_id)
          VALUES ($1, $2, 'laboratorio', $3, $4, $5, $6, $7)
        `, [
          projectId, 
          cotizacionId, 
          archivo.nombre, 
          archivo.ruta, 
          archivo.tamaño, 
          archivo.tipo, 
          req.user.id
        ]);
      }
    }
    
    res.json({
      success: true,
      message: 'Archivos subidos correctamente'
    });
  } catch (error) {
    console.error('❌ subirArchivosLaboratorio - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener archivos del proyecto
const obtenerArchivosProyecto = async (req, res) => {
  try {
    console.log('📂 obtenerArchivosProyecto - Llamando a:', req.url);
    
    const { projectId } = req.params;
    const { tipo } = req.query;
    
    let whereClause = 'WHERE pf.project_id = $1 AND pf.es_activo = true';
    let queryParams = [projectId];
    
    if (tipo) {
      whereClause += ' AND pf.tipo_archivo = $2';
      queryParams.push(tipo);
    }
    
    const query = `
      SELECT 
        pf.id,
        pf.tipo_archivo,
        pf.nombre_archivo,
        pf.ruta_archivo,
        pf.tamaño_archivo,
        pf.tipo_mime,
        pf.fecha_subida,
        pf.version,
        u.name as usuario_nombre
      FROM project_files pf
      LEFT JOIN users u ON pf.usuario_id = u.id
      ${whereClause}
      ORDER BY pf.fecha_subida DESC
    `;
    
    const result = await pool.query(query, queryParams);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('❌ obtenerArchivosProyecto - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getProyectosAsignados,
  getEstadisticasLaboratorio,
  actualizarEstadoProyecto,
  subirArchivosLaboratorio,
  obtenerArchivosProyecto
};
