const pool = require('../config/db');

const Project = {
  async getAllByUser(user, { page = 1, limit = 20, search = '', status = '', company_id = '', project_type = '', priority = '' }) {
    console.log('🔍 Project.getAllByUser - Parámetros recibidos:', { page, limit, search, status, company_id, project_type, priority });
    console.log('🔍 Project.getAllByUser - Usuario:', { id: user.id, role: user.role });
    
    const offset = (page - 1) * limit;
    let where = [];
    let params = [];
    let paramIndex = 1;

    // Filtros por rol de usuario
    // Los vendedores comerciales pueden ver todos los proyectos (trabajan con todos los clientes)
    if (user.role === 'usuario_laboratorio') {
      where.push(`p.laboratorio_id = $${paramIndex}`);
      params.push(user.id);
      paramIndex++;
    } else if (user.role !== 'jefa_comercial' && user.role !== 'jefe_laboratorio' && user.role !== 'admin' && user.role !== 'vendedor_comercial' && user.role !== 'vendedor') {
      return { rows: [], total: 0 };
    }

    // Búsqueda en múltiples campos
    if (search) {
      params.push(`%${search}%`);
      params.push(`%${search}%`);
      params.push(`%${search}%`);
      where.push(`(LOWER(p.name) LIKE LOWER($${paramIndex}) OR LOWER(p.location) LIKE LOWER($${paramIndex + 1}) OR LOWER(c.name) LIKE LOWER($${paramIndex + 2}))`);
      paramIndex += 3;
    }

    // Filtro por estado
    if (status) {
      console.log('🔍 getAllByUser - Aplicando filtro de estado:', status);
      where.push(`p.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    // Filtro por empresa
    if (company_id) {
      console.log('🔍 getAllByUser - Aplicando filtro de empresa:', company_id);
      where.push(`p.company_id = $${paramIndex}`);
      params.push(company_id);
      paramIndex++;
    }

    // Filtro por tipo de proyecto
    if (project_type) {
      console.log('🔍 getAllByUser - Aplicando filtro de tipo de proyecto:', project_type);
      where.push(`p.project_type = $${paramIndex}`);
      params.push(project_type);
      paramIndex++;
    }

    // Filtro por prioridad
    if (priority) {
      console.log('🔍 getAllByUser - Aplicando filtro de prioridad:', priority);
      console.log('🔍 getAllByUser - Tipo de prioridad:', typeof priority);
      where.push(`p.priority = $${paramIndex}`);
      params.push(priority);
      paramIndex++;
    }

    let whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    params.push(limit, offset);

    console.log('🔍 Project.getAllByUser - whereClause:', whereClause);
    console.log('🔍 Project.getAllByUser - params:', params);
    console.log('🔍 Project.getAllByUser - paramIndex:', paramIndex);

    // Query con JOINs para obtener información de empresa, usuarios y categorías
    try {
      const data = await pool.query(`
        SELECT 
          p.*,
          c.name as company_name,
          c.ruc as company_ruc,
          v.name as vendedor_name,
          l.name as laboratorio_name
        FROM projects p
        LEFT JOIN companies c ON p.company_id = c.id
        LEFT JOIN users v ON p.vendedor_id = v.id
        LEFT JOIN users l ON p.laboratorio_id = l.id
        ${whereClause}
        ORDER BY p.id DESC 
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `, params);
      
      console.log('✅ Project.getAllByUser - Query ejecutada exitosamente, filas:', data.rows.length);

      // Total con filtros
      let totalParams = params.slice(0, params.length - 2);
      const total = await pool.query(`
        SELECT COUNT(*) FROM projects p
        LEFT JOIN companies c ON p.company_id = c.id
        LEFT JOIN users v ON p.vendedor_id = v.id
        LEFT JOIN users l ON p.laboratorio_id = l.id
        ${whereClause}
      `, totalParams);

      console.log('✅ Project.getAllByUser - Total calculado:', parseInt(total.rows[0].count));
      return { rows: data.rows, total: parseInt(total.rows[0].count) };
    } catch (error) {
      console.error('❌ Project.getAllByUser - Error en query:', error.message);
      console.error('❌ Project.getAllByUser - Error completo:', error);
      throw error;
    }
  },
  async getById(id, user) {
    // Solo acceso si el usuario tiene permiso
    const res = await pool.query(`
      SELECT 
        p.*,
        c.name as company_name,
        c.ruc as company_ruc,
        v.name as vendedor_name,
        l.name as laboratorio_name
      FROM projects p
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN users v ON p.vendedor_id = v.id
      LEFT JOIN users l ON p.laboratorio_id = l.id
      WHERE p.id = $1
    `, [id]);
    const project = res.rows[0];
    if (!project) return null;
    if (
      user.role === 'jefa_comercial' ||
      user.role === 'jefe_laboratorio' ||
      user.role === 'admin' ||
      (user.role === 'vendedor_comercial' && project.vendedor_id === user.id) ||
      (user.role === 'usuario_laboratorio' && project.laboratorio_id === user.id)
    ) {
      return project;
    }
    return null;
  },

  async searchByName(name, company_id = null) {
    let query = `
      SELECT 
        p.id,
        p.name,
        p.location,
        p.status,
        p.created_at,
        c.name as company_name,
        c.ruc as company_ruc,
        v.name as vendedor_name,
        COUNT(q.id) as quotes_count
      FROM projects p
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN users v ON p.vendedor_id = v.id
      LEFT JOIN quotes q ON p.id = q.project_id
      WHERE LOWER(p.name) = LOWER($1)
    `;
    
    let params = [name.trim()];
    
    if (company_id) {
      query += ` AND p.company_id = $2`;
      params.push(company_id);
    }
    
    query += `
      GROUP BY p.id, p.name, p.location, p.status, p.created_at, c.name, c.ruc, v.name
      ORDER BY p.created_at DESC
      LIMIT 10
    `;
    
    console.log('🔍 Project.searchByName - Query:', query);
    console.log('🔍 Project.searchByName - Params:', params);
    
    const result = await pool.query(query, params);
    console.log('🔍 Project.searchByName - Resultados:', result.rows.length);
    
    return result.rows;
  },

  async create({ company_id, name, location, vendedor_id, laboratorio_id, requiere_laboratorio = false, requiere_ingenieria = false, requiere_consultoria = false, requiere_capacitacion = false, requiere_auditoria = false, contact_name, contact_phone, contact_email, queries, marked = false, priority = 'normal' }) {
    const res = await pool.query(
      'INSERT INTO projects (company_id, name, location, vendedor_id, laboratorio_id, requiere_laboratorio, requiere_ingenieria, requiere_consultoria, requiere_capacitacion, requiere_auditoria, contact_name, contact_phone, contact_email, queries, marked, priority, laboratorio_status, ingenieria_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *',
      [company_id, name, location, vendedor_id, laboratorio_id, requiere_laboratorio, requiere_ingenieria, requiere_consultoria, requiere_capacitacion, requiere_auditoria, contact_name, contact_phone, contact_email, queries, marked, priority, requiere_laboratorio ? 'pendiente' : 'no_requerido', requiere_ingenieria ? 'pendiente' : 'no_requerido']
    );
    return res.rows[0];
  },
  async updateStatus(id, { status, laboratorio_status, ingenieria_status, status_notes }) {
    const res = await pool.query(
      'UPDATE projects SET status = $1, laboratorio_status = $2, ingenieria_status = $3, status_notes = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
      [status, laboratorio_status, ingenieria_status, status_notes, id]
    );
    return res.rows[0];
  },

  async updateCategories(id, { requiere_laboratorio, requiere_ingenieria, requiere_consultoria, requiere_capacitacion, requiere_auditoria }) {
    console.log('🔍 Project.updateCategories - ID:', id);
    console.log('🔍 Project.updateCategories - Params:', { requiere_laboratorio, requiere_ingenieria, requiere_consultoria, requiere_capacitacion, requiere_auditoria });
    
    try {
      const res = await pool.query(
        'UPDATE projects SET requiere_laboratorio = $1, requiere_ingenieria = $2, requiere_consultoria = $3, requiere_capacitacion = $4, requiere_auditoria = $5, updated_at = NOW() WHERE id = $6 RETURNING *',
        [requiere_laboratorio, requiere_ingenieria, requiere_consultoria, requiere_capacitacion, requiere_auditoria, id]
      );
      console.log('✅ Project.updateCategories - Resultado:', res.rows[0]);
      return res.rows[0];
    } catch (error) {
      console.error('❌ Project.updateCategories - Error SQL:', error);
      throw error;
    }
  },

  async updateQueries(id, { queries }) {
    const res = await pool.query(
      'UPDATE projects SET queries = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [queries, id]
    );
    return res.rows[0];
  },

  async updateMark(id, { marked, priority }) {
    const res = await pool.query(
      'UPDATE projects SET marked = $1, priority = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [marked, priority, id]
    );
    return res.rows[0];
  },

  async update(id, { 
    name, 
    location, 
    vendedor_id, 
    laboratorio_id, 
    requiere_laboratorio, 
    requiere_ingenieria, 
    requiere_consultoria,
    requiere_capacitacion,
    requiere_auditoria,
    contact_name, 
    contact_phone, 
    contact_email,
    queries,
    queries_history,
    priority,
    marked,
    status,
    laboratorio_status,
    ingenieria_status,
  }, user) {
    console.log('🔍 Project.update - ID:', id);
    console.log('🔍 Project.update - User:', user);
    
    // Solo el vendedor asignado o jefa comercial puede editar
    const res = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    const project = res.rows[0];
    if (!project) {
      console.log('❌ Project.update - Proyecto no encontrado');
      return null;
    }
    
    console.log('🔍 Project.update - Proyecto encontrado:', project);
    console.log('🔍 Project.update - User role:', user.role);
    console.log('🔍 Project.update - Project vendedor_id:', project.vendedor_id);
    console.log('🔍 Project.update - User id:', user.id);
    
    if (
      user.role === 'jefa_comercial' ||
      user.role === 'admin' ||
      (user.role === 'vendedor_comercial' && project.vendedor_id === user.id) ||
      (user.role === 'vendedor' && project.vendedor_id === user.id)
    ) {
      console.log('✅ Project.update - Usuario autorizado para editar');
      
      console.log('🔧 Project.update - Parámetros de la consulta SQL:');
      console.log('  $1 (name):', name);
      console.log('  $2 (location):', location);
      console.log('  $3 (vendedor_id):', vendedor_id);
      console.log('  $4 (laboratorio_id):', laboratorio_id);
      console.log('  $5 (requiere_laboratorio):', requiere_laboratorio);
      console.log('  $6 (requiere_ingenieria):', requiere_ingenieria);
      console.log('  $7 (requiere_consultoria):', requiere_consultoria);
      console.log('  $8 (requiere_capacitacion):', requiere_capacitacion);
      console.log('  $9 (requiere_auditoria):', requiere_auditoria);
      console.log('  $10 (contact_name):', contact_name);
      console.log('  $11 (contact_phone):', contact_phone);
      console.log('  $12 (contact_email):', contact_email);
      console.log('  $13 (queries):', queries);
      
      // Manejar queries_history de forma segura
      let queriesHistoryValue = null;
      if (queries_history) {
        try {
          if (typeof queries_history === 'string') {
            // Si ya es un string, verificar que sea JSON válido
            JSON.parse(queries_history);
            queriesHistoryValue = queries_history;
          } else if (Array.isArray(queries_history) || typeof queries_history === 'object') {
            // Si es un array u objeto, convertir a JSON
            queriesHistoryValue = JSON.stringify(queries_history);
          }
          console.log('  $14 (queries_history):', queriesHistoryValue);
        } catch (jsonError) {
          console.warn('⚠️ Project.update - queries_history no es JSON válido, usando null:', jsonError.message);
          queriesHistoryValue = null;
        }
      } else {
        console.log('  $14 (queries_history): null (no proporcionado)');
      }
      
      console.log('  $15 (priority):', priority);
      console.log('  $16 (marked):', marked);
      console.log('  $17 (status):', status);
      console.log('  $18 (laboratorio_status):', laboratorio_status);
      console.log('  $19 (ingenieria_status):', ingenieria_status);
      console.log('  $20 (id):', id);
      
      try {
        const updated = await pool.query(
          `UPDATE projects SET 
            name = $1, 
            location = $2, 
            vendedor_id = $3, 
            laboratorio_id = $4, 
            requiere_laboratorio = $5, 
            requiere_ingenieria = $6, 
            requiere_consultoria = $7,
            requiere_capacitacion = $8,
            requiere_auditoria = $9,
            contact_name = $10, 
            contact_phone = $11, 
            contact_email = $12,
            queries = $13,
            queries_history = $14,
            priority = $15,
            marked = $16,
            status = $17,
            laboratorio_status = $18,
            ingenieria_status = $19,
            updated_at = NOW()
          WHERE id = $20 RETURNING *`,
          [
            name, 
            location, 
            vendedor_id, 
            laboratorio_id, 
            requiere_laboratorio, 
            requiere_ingenieria, 
            requiere_consultoria,
            requiere_capacitacion,
            requiere_auditoria,
            contact_name, 
            contact_phone, 
            contact_email,
            queries,
            queriesHistoryValue,
            priority,
            marked,
            status,
            laboratorio_status,
            ingenieria_status,
            id
          ]
        );
        console.log('✅ Project.update - SQL ejecutado exitosamente:', updated.rows[0]);
        return updated.rows[0];
      } catch (sqlError) {
        console.error('❌ Project.update - Error SQL detallado:', {
          message: sqlError.message,
          code: sqlError.code,
          detail: sqlError.detail,
          hint: sqlError.hint,
          position: sqlError.position,
          stack: sqlError.stack
        });
        throw sqlError;
      }
    }
    console.log('❌ Project.update - Usuario NO autorizado para editar');
    return null;
  },
  async delete(id, user) {
    // Solo jefa comercial puede eliminar
    if (user.role !== 'jefa_comercial') return false;
    await pool.query('DELETE FROM projects WHERE id = $1', [id]);
    return true;
  },

  async getStats(user) {
    try {
      console.log('📊 Project.getStats - Obteniendo estadísticas de proyectos...');
      console.log('📊 Project.getStats - Usuario:', { id: user.id, role: user.role });
      
      let whereClause = '';
      let params = [];
      
      // Filtros por rol de usuario
      // Los vendedores comerciales pueden ver estadísticas de todos los proyectos
      if (user.role === 'usuario_laboratorio') {
        whereClause = 'WHERE laboratorio_id = $1';
        params = [user.id];
        console.log('📊 getStats - Aplicando filtro usuario_laboratorio:', whereClause);
      } else if (user.role !== 'jefa_comercial' && user.role !== 'jefe_laboratorio' && user.role !== 'admin' && user.role !== 'vendedor_comercial') {
        console.log('📊 getStats - Usuario sin permisos, retornando estadísticas vacías');
        return {
          total: 0,
          activos: 0,
          completados: 0,
          pendientes: 0,
          cancelados: 0,
          alta_prioridad: 0,
          byStatus: {},
          byPriority: {}
        };
      } else {
        console.log('📊 getStats - Usuario admin/jefa/jefe, sin filtros aplicados');
      }

      // Estadísticas por estado
      const statusStats = await pool.query(`
        SELECT 
          status,
          COUNT(*) as count
        FROM projects 
        ${whereClause}
        GROUP BY status
      `, params);

      // Estadísticas por prioridad
      const priorityStats = await pool.query(`
        SELECT 
          priority,
          COUNT(*) as count
        FROM projects 
        ${whereClause}
        GROUP BY priority
      `, params);

      // Total de proyectos
      const totalResult = await pool.query(`
        SELECT COUNT(*) as total FROM projects ${whereClause}
      `, params);

      const total = parseInt(totalResult.rows[0].total);
      
      const stats = {
        total: total,
        activos: 0,
        completados: 0,
        pendientes: 0,
        cancelados: 0,
        alta_prioridad: 0,
        byStatus: {},
        byPriority: {}
      };

      statusStats.rows.forEach(row => {
        const status = row.status || 'pendiente'; // Default status
        const count = parseInt(row.count);
        stats.byStatus[status] = count;
        
        if (status === 'activo') {
          stats.activos = count;
        } else if (status === 'completado') {
          stats.completados = count;
        } else if (status === 'pendiente') {
          stats.pendientes = count;
        } else if (status === 'cancelado') {
          stats.cancelados = count;
        }
      });

      // Procesar estadísticas de prioridad
      console.log('🔍 getStats - priorityStats.rows:', priorityStats.rows);
      priorityStats.rows.forEach(row => {
        const priority = row.priority || 'normal'; // Default priority
        const count = parseInt(row.count);
        stats.byPriority[priority] = count;
        
        console.log(`🔍 getStats - Procesando prioridad: ${priority}, count: ${count}`);
        
        // Contar proyectos de alta prioridad (urgent + high)
        if (priority === 'urgent' || priority === 'high') {
          console.log(`🔍 getStats - Agregando a alta_prioridad: ${count} (prioridad: ${priority})`);
          stats.alta_prioridad += count;
        }
      });
      
      console.log('🔍 getStats - stats.alta_prioridad final:', stats.alta_prioridad);

      console.log('✅ Project.getStats - Estadísticas calculadas:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Project.getStats - Error:', error);
      throw error;
    }
  },

  // Obtener servicios únicos de proyectos existentes
  async getExistingServices() {
    try {
      console.log('🔍 Project.getExistingServices - Obteniendo servicios existentes...');
      
      const result = await pool.query(`
        SELECT DISTINCT 
          p.name as service_name,
          COUNT(*) as usage_count
        FROM projects p
        WHERE p.name IS NOT NULL 
          AND p.name != ''
          AND LENGTH(TRIM(p.name)) > 0
        GROUP BY p.name
        ORDER BY usage_count DESC, p.name ASC
        LIMIT 50
      `);
      
      console.log('✅ Project.getExistingServices - Servicios encontrados:', result.rows.length);
      return result.rows;
    } catch (error) {
      console.error('❌ Project.getExistingServices - Error:', error);
      throw error;
    }
  },
};

module.exports = Project;
