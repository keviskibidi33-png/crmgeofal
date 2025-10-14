const Company = require('../models/company');
const Audit = require('../models/audit');

// Listar empresas con paginación y filtros
const listCompanies = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', type = '', city = '', sector = '', priority = '', status = '', includeTotals = false } = req.query;
    
    console.log('🔍 listCompanies - Llamando a:', req.url);
    console.log('🔍 listCompanies - Token:', req.headers.authorization ? 'Presente' : 'Ausente');
    console.log('🔍 listCompanies - Filtros:', { search, type, city, sector, priority, status, includeTotals });
    
    // Consultar datos reales de la base de datos
    const pool = require('../config/db');
    
    // Construir consulta SQL con filtros
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;
    
    if (search) {
      whereConditions.push(`(name ILIKE $${paramIndex} OR contact_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }
    
    if (type) {
      whereConditions.push(`type = $${paramIndex}`);
      queryParams.push(type);
      paramIndex++;
    }
    
    if (city) {
      whereConditions.push(`city = $${paramIndex}`);
      queryParams.push(city);
      paramIndex++;
    }
    
    if (sector) {
      whereConditions.push(`sector = $${paramIndex}`);
      queryParams.push(sector);
      paramIndex++;
    }
    
    if (priority) {
      whereConditions.push(`priority = $${paramIndex}`);
      queryParams.push(priority);
      paramIndex++;
    }
    
    if (status) {
      whereConditions.push(`status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    console.log('🔍 listCompanies - Condiciones WHERE:', whereClause);
    console.log('🔍 listCompanies - Parámetros:', queryParams);
    
    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM companies ${whereClause}`;
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);
    
    // Obtener datos paginados
    const offset = (page - 1) * limit;
    
    // Construir consulta con o sin totales según el parámetro
    let dataQuery;
    if (includeTotals === 'true') {
      dataQuery = `
        SELECT 
          c.id,
          c.name,
          c.ruc,
          c.dni,
          c.type,
          c.contact_name,
          c.email,
          c.phone,
          c.city,
          c.sector,
          c.address,
          c.status,
          c.priority,
          c.actividad,
          c.servicios,
          c.created_at,
          
          -- Totales de cotizaciones (excluyendo aprobadas y facturadas)
          COALESCE(quote_totals.total_quoted, 0) as total_quoted,
          COALESCE(quote_totals.quotes_count, 0) as quotes_count,
          COALESCE(quote_totals.won_quotes_total, 0) as won_quotes_total,
          COALESCE(quote_totals.won_quotes_count, 0) as won_quotes_count,
          
          -- Totales de cotizaciones aprobadas para facturación (para referencia)
          COALESCE(quote_totals.approved_for_billing, 0) as approved_for_billing,
          COALESCE(quote_totals.approved_count, 0) as approved_count,
          
          -- Totales generales
          COALESCE(quote_totals.total_all_quotes, 0) as total_all_quotes,
          COALESCE(quote_totals.total_quotes_count, 0) as total_quotes_count,
          
          -- Proyectos
          COALESCE(project_totals.projects_count, 0) as projects_count,
          COALESCE(project_totals.completed_projects_count, 0) as completed_projects_count,
          
          -- Total acumulado (SOLO cotizaciones, NO aprobadas para facturación)
          COALESCE(quote_totals.total_quoted, 0) as total_accumulated
        FROM companies c
        LEFT JOIN (
          SELECT 
            p.company_id,
            -- Total de cotizaciones (excluyendo aprobadas y facturadas)
            COALESCE(SUM(CASE WHEN q.status NOT IN ('aprobada', 'facturada') THEN q.total ELSE 0 END), 0) as total_quoted,
            COUNT(CASE WHEN q.status NOT IN ('aprobada', 'facturada') THEN 1 END) as quotes_count,
            
            -- Total de cotizaciones ganadas
            COALESCE(SUM(CASE WHEN q.status = 'ganado' THEN q.total ELSE 0 END), 0) as won_quotes_total,
            COUNT(CASE WHEN q.status = 'ganado' THEN 1 END) as won_quotes_count,
            
            -- Total de cotizaciones aprobadas para facturación (para referencia)
            COALESCE(SUM(CASE WHEN q.status IN ('aprobada', 'facturada') THEN q.total ELSE 0 END), 0) as approved_for_billing,
            COUNT(CASE WHEN q.status IN ('aprobada', 'facturada') THEN 1 END) as approved_count,
            
            -- Total general
            COALESCE(SUM(q.total), 0) as total_all_quotes,
            COUNT(q.id) as total_quotes_count
          FROM quotes q
          LEFT JOIN projects p ON q.project_id = p.id
          WHERE p.company_id IS NOT NULL
          GROUP BY p.company_id
        ) quote_totals ON c.id = quote_totals.company_id
        LEFT JOIN (
          SELECT 
            company_id,
            COUNT(id) as projects_count,
            COUNT(CASE WHEN status = 'completado' THEN 1 END) as completed_projects_count
          FROM projects
          GROUP BY company_id
        ) project_totals ON c.id = project_totals.company_id
        ${whereClause}
        ORDER BY c.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
    } else {
      dataQuery = `
      SELECT 
        c.id,
        c.name,
        c.ruc,
        c.dni,
        c.type,
        c.contact_name,
        c.email,
        c.phone,
        c.city,
        c.sector,
        c.address,
        c.status,
        c.priority,
        c.actividad,
        c.servicios,
        c.created_at
      FROM companies c
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    }
    
    queryParams.push(parseInt(limit));
    queryParams.push(offset);
    
    const dataResult = await pool.query(dataQuery, queryParams);
    const companies = dataResult.rows;
    
    console.log(`📊 listCompanies - Consultando BD: ${total} empresas encontradas, mostrando ${companies.length}`);
    console.log(`📊 listCompanies - Paginación: página ${page}, límite ${limit}, total ${total}`);
    
    // Aplicar paginación
    const paginatedCompanies = companies;
    
    res.json({
      success: true,
      data: paginatedCompanies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ listCompanies - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de empresas
const getCompanyStats = async (req, res) => {
  try {
    console.log('📊 getCompanyStats - Llamando a:', req.url);
    console.log('📊 getCompanyStats - Token:', req.headers.authorization ? 'Presente' : 'Ausente');
    
    const stats = await Company.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ getCompanyStats - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener opciones de filtros
const getCompanyFilterOptions = async (req, res) => {
  try {
    console.log('🔍 getCompanyFilterOptions - Llamando a:', req.url);
    console.log('🔍 getCompanyFilterOptions - Token:', req.headers.authorization ? 'Presente' : 'Ausente');
    
    const options = await Company.getFilterOptions();
    
    console.log('✅ getCompanyFilterOptions - Respuesta enviada:', {
      success: true,
      dataKeys: Object.keys(options),
      typesCount: options.types?.length || 0,
      sectorsCount: options.sectors?.length || 0,
      citiesCount: options.cities?.length || 0
    });
    
    res.json({
      success: true,
      data: options
    });
  } catch (error) {
    console.error('❌ getCompanyFilterOptions - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener opciones de filtros',
      error: error.message
    });
  }
};

// Buscar empresas/personas por tipo y texto
const searchCompanies = async (req, res) => {
  try {
    const { type, q } = req.query;
    
    if (!type || !q) {
      return res.status(400).json({
        success: false,
        message: 'Tipo y término de búsqueda son requeridos'
      });
    }

    const results = await Company.searchByType(type, q);
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error en búsqueda de empresas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear empresa
const createCompany = async (req, res) => {
  try {
    console.log('🔍 createCompany - Datos recibidos:', req.body);
    
    const { 
      type = 'empresa',
      ruc, 
      name, 
      address, 
      email, 
      phone, 
      contact_name, 
      city, 
      sector,
      priority = 'normal',
      dni,
      actividad,
      servicios,
      assigned_user_id
    } = req.body;
    
    // Validaciones obligatorias según el tipo
    if (!name) {
      return res.status(400).json({ 
        error: 'El nombre es obligatorio' 
      });
    }
    
    if (type === 'empresa' && !ruc) {
      return res.status(400).json({ 
        error: 'El RUC es obligatorio para empresas' 
      });
    }
    
    if (type === 'persona' && !dni) {
      return res.status(400).json({ 
        error: 'El DNI es obligatorio para personas naturales' 
      });
    }
    
    console.log('✅ createCompany - Validaciones pasadas, tipo:', type, 'ruc:', ruc, 'dni:', dni);
    
    // Verificar si ya existe una empresa con ese RUC o DNI
    // EXCEPCIÓN: Solo RUCs que empiecen con "209999999" pueden ser duplicados (datos temporales)
    let existingCompany = null;
    const isTemporaryRuc = ruc && ruc.startsWith('209999999');
    
    if (type === 'empresa' && ruc) {
      existingCompany = await Company.getByRuc(ruc);
      
      if (existingCompany) {
        if (isTemporaryRuc) {
          // RUC temporal: generar RUC único automáticamente
          console.log('🔄 RUC temporal duplicado detectado, generando RUC único');
          console.log(`   RUC original: ${ruc} ya existe en cliente: ${existingCompany.name}`);
          
          // Generar RUC temporal único automáticamente
          console.log('   🔄 Generando RUC temporal único...');
          
          let newRuc;
          let counter = 1;
          let isUnique = false;
          
          // Buscar el siguiente RUC temporal disponible
          while (!isUnique && counter <= 99) {
            newRuc = `209999999${String(counter).padStart(2, '0')}`;
            const checkResult = await pool.query('SELECT id FROM companies WHERE ruc = $1', [newRuc]);
            isUnique = checkResult.rows.length === 0;
            counter++;
          }
          
          // Si no se encuentra uno disponible, usar timestamp
          if (!isUnique) {
            newRuc = `209999999${Date.now().toString().slice(-2)}`;
            console.log('   ⚠️ Usando timestamp para RUC único');
          }
          
          console.log(`   ✅ RUC temporal generado: ${newRuc}`);
          ruc = newRuc; // Actualizar el RUC para la creación
        } else {
          // RUC real: no permitir duplicados
          console.log('❌ RUC real duplicado detectado, devolviendo cliente existente');
          return res.status(200).json({
            ...existingCompany,
            isExisting: true,
            message: 'Cliente existente encontrado'
          });
        }
      }
    } else if (type === 'persona' && dni) {
      existingCompany = await Company.getByDni(dni);
      if (existingCompany) {
        console.log('❌ DNI duplicado detectado, devolviendo cliente existente');
        return res.status(200).json({
          ...existingCompany,
          warning: `Ya existe un cliente con este DNI: ${existingCompany.name}`
        });
      }
    }
    
    console.log('🔨 createCompany - Creando empresa con datos:', {
      type,
      ruc: type === 'empresa' ? ruc : null,
      name,
      address,
      email,
      phone,
      contact_name,
      city,
      sector,
      dni: type === 'persona' ? dni : null,
      actividad,
      servicios,
      managed_by: assigned_user_id
    });
    
    const company = await Company.create({
      type,
      ruc: type === 'empresa' ? ruc : null,
      name,
      address,
      email,
      phone,
      contact_name,
      city,
      sector,
      priority,
      dni: type === 'persona' ? dni : null,
      actividad,
      servicios,
      managed_by: assigned_user_id
    });
    
    // Auditoría
    await Audit.log({
      user_id: req.user?.id,
      action: 'crear',
      entity: 'company',
      entity_id: company.id,
      details: JSON.stringify({ ruc, name, contact_name })
    });
    
    res.status(201).json(company);
  } catch (err) {
    console.error('❌ createCompany - Error:', err);
    res.status(500).json({ error: 'Error al crear empresa' });
  }
};

// Obtener o crear empresa (para cotizaciones)
const getOrCreateCompany = async (req, res) => {
  try {
    const { ruc, name, address, email, phone, contact_name, city, sector } = req.body;
    
    // Validaciones obligatorias
    if (!ruc || !name) {
      return res.status(400).json({ 
        error: 'RUC y nombre son campos obligatorios' 
      });
    }
    
    // Buscar empresa existente
    // EXCEPCIÓN: Solo RUCs que empiecen con "209999999" pueden ser duplicados (datos temporales)
    const isTemporaryRuc = ruc && ruc.startsWith('209999999');
    const existingCompany = await Company.getByRuc(ruc);
    
    if (existingCompany) {
      if (isTemporaryRuc) {
        // RUC temporal: generar RUC único automáticamente
        console.log('🔄 RUC temporal duplicado detectado, generando RUC único');
        console.log(`   RUC original: ${ruc} ya existe en cliente: ${existingCompany.name}`);
        
        // Generar RUC temporal único automáticamente
        console.log('   🔄 Generando RUC temporal único...');
        
        let newRuc;
        let counter = 1;
        let isUnique = false;
        
        // Buscar el siguiente RUC temporal disponible
        while (!isUnique && counter <= 99) {
          newRuc = `209999999${String(counter).padStart(2, '0')}`;
          const checkResult = await pool.query('SELECT id FROM companies WHERE ruc = $1', [newRuc]);
          isUnique = checkResult.rows.length === 0;
          counter++;
        }
        
        // Si no se encuentra uno disponible, usar timestamp
        if (!isUnique) {
          newRuc = `209999999${Date.now().toString().slice(-2)}`;
          console.log('   ⚠️ Usando timestamp para RUC único');
        }
        
        console.log(`   ✅ RUC temporal generado: ${newRuc}`);
        ruc = newRuc; // Actualizar el RUC para la creación
      } else {
        // RUC real: devolver cliente existente
        console.log('✅ Empresa existente encontrada:', existingCompany.name);
        return res.status(200).json({
          ...existingCompany,
          isExisting: true,
          message: 'Cliente existente encontrado'
        });
      }
    }
    
    // Crear nueva empresa si no existe
    const company = await Company.create({
      type: 'empresa',
      ruc,
      name,
      address,
      email,
      phone,
      contact_name,
      city,
      sector
    });
    
    console.log('✅ Nueva empresa creada:', company.name);
    
    // Auditoría
    await Audit.log({
      user_id: req.user?.id,
      action: 'crear',
      entity: 'company',
      entity_id: company.id,
      details: JSON.stringify({ ruc, name, contact_name })
    });
    
    res.status(201).json(company);
  } catch (err) {
    console.error('❌ getOrCreateCompany - Error:', err);
    res.status(500).json({ error: 'Error al obtener o crear empresa' });
  }
};

// Actualizar estado de cliente
const updateClientStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`🔄 updateClientStatus - Cliente ID: ${id}`);
    console.log(`🔄 updateClientStatus - Nuevo estado: ${status}`);
    console.log(`🔄 updateClientStatus - Usuario: ${req.user?.name} (ID: ${req.user?.id})`);

    // Validar que el estado sea válido
    const validStatuses = Company.getAvailableStatuses();
    console.log(`🔄 updateClientStatus - Estados válidos:`, validStatuses);
    
    if (!validStatuses.includes(status)) {
      console.log(`❌ updateClientStatus - Estado inválido: ${status}`);
      return res.status(400).json({
        error: 'Estado inválido',
        validStatuses: validStatuses
      });
    }

    console.log(`✅ updateClientStatus - Estado válido, actualizando en BD...`);

    // Actualizar el estado en la base de datos
    const pool = require('../config/db');
    console.log(`🔄 updateClientStatus - Ejecutando SQL: UPDATE companies SET status = '${status}', updated_at = NOW() WHERE id = ${id}`);
    
    const result = await pool.query(
      'UPDATE companies SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    console.log(`🔄 updateClientStatus - Filas afectadas: ${result.rows.length}`);

    if (result.rows.length === 0) {
      console.log(`❌ updateClientStatus - Cliente no encontrado con ID: ${id}`);
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // VERIFICACIÓN INMEDIATA: Comprobar que el cambio se guardó
    console.log(`🔍 updateClientStatus - Verificando cambio inmediatamente...`);
    const verifyResult = await pool.query(
      'SELECT id, name, status FROM companies WHERE id = $1',
      [id]
    );
    
    if (verifyResult.rows.length > 0) {
      const currentStatus = verifyResult.rows[0].status;
      console.log(`🔍 updateClientStatus - Estado actual en BD inmediatamente después del UPDATE: ${currentStatus}`);
      if (currentStatus !== status) {
        console.log(`❌ updateClientStatus - ¡PROBLEMA! El estado en BD (${currentStatus}) no coincide con el esperado (${status})`);
      } else {
        console.log(`✅ updateClientStatus - Verificación exitosa: el estado se guardó correctamente`);
      }
    }

    const updatedClient = result.rows[0];
    console.log(`✅ updateClientStatus - Cliente actualizado:`, {
      id: updatedClient.id,
      name: updatedClient.name,
      old_status: req.body.old_status || 'unknown',
      new_status: updatedClient.status
    });

    // Registrar en auditoría
    await Audit.log({
      user_id: req.user.id,
      action: 'status_updated',
      entity: 'company',
      entity_id: id,
      details: JSON.stringify({ 
        old_status: req.body.old_status || 'unknown',
        new_status: status,
        client_name: updatedClient.name
      })
    });

    console.log(`✅ updateClientStatus - Respuesta enviada exitosamente`);

    res.json({
      message: 'Estado actualizado correctamente',
      client: updatedClient
    });

  } catch (err) {
    console.error('❌ updateClientStatus - Error:', err);
    res.status(500).json({ error: 'Error al actualizar estado del cliente' });
  }
};

// Actualizar gestor de cliente
const updateClientManager = async (req, res) => {
  try {
    const { id } = req.params;
    const { managed_by } = req.body;

    // Actualizar el gestor
    const updatedClient = await Company.updateManager(id, managed_by);

    if (!updatedClient) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Registrar en auditoría
    await Audit.log({
      user_id: req.user.id,
      action: 'manager_updated',
      entity: 'company',
      entity_id: id,
      details: JSON.stringify({ 
        old_manager: req.body.old_manager || 'unknown',
        new_manager: managed_by,
        client_name: updatedClient.name
      })
    });

    res.json({
      message: 'Gestor actualizado correctamente',
      client: updatedClient
    });

  } catch (err) {
    console.error('Error updating client manager:', err);
    res.status(500).json({ error: 'Error al actualizar gestor del cliente' });
  }
};

// Obtener historial de cliente
const getClientHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const history = await Company.getClientHistory(id);

    res.json({
      success: true,
      data: history
    });

  } catch (err) {
    console.error('Error getting client history:', err);
    res.status(500).json({ error: 'Error al obtener historial del cliente' });
  }
};

// Eliminar cliente (solo admin)
const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    console.log(`🗑️ deleteCompany - Usuario ${userId} intentando eliminar cliente ${id}`);

    // Verificar que el cliente existe antes de eliminar
    const existingClient = await Company.getById(id);
    if (!existingClient) {
      return res.status(404).json({ 
        success: false,
        error: 'Cliente no encontrado' 
      });
    }

    // Eliminar el cliente
    await Company.delete(id);

    // Registrar en auditoría
    await Audit.log({
      user_id: userId,
      action: 'eliminar',
      entity: 'company',
      entity_id: id,
      details: JSON.stringify({ 
        client_name: existingClient.name,
        client_type: existingClient.type,
        client_ruc: existingClient.ruc,
        client_dni: existingClient.dni
      })
    });

    console.log(`✅ deleteCompany - Cliente ${id} eliminado exitosamente por usuario ${userId}`);

    res.json({
      success: true,
      message: 'Cliente eliminado exitosamente',
      deletedClient: {
        id: existingClient.id,
        name: existingClient.name,
        type: existingClient.type
      }
    });

  } catch (err) {
    console.error('❌ deleteCompany - Error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Error al eliminar cliente' 
    });
  }
};

// Obtener empresa por ID
const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const { includeTotals } = req.query;
    const userId = req.user?.id;

    console.log(`🔍 getCompanyById - Usuario ${userId} obteniendo cliente ${id}, includeTotals: ${includeTotals}`);

    let company;
    if (includeTotals === 'true') {
      // Obtener la empresa con totales usando una consulta directa
      const pool = require('../config/db');
      const result = await pool.query(`
        SELECT 
          c.id, c.type, c.ruc, c.dni, c.name, c.address, c.email, c.phone, 
          c.contact_name, c.city, c.sector, c.status, c.priority, c.actividad, c.servicios, c.created_at,
          
          -- Totales de cotizaciones (excluyendo aprobadas y facturadas)
          COALESCE(quote_totals.total_quoted, 0) as total_quoted,
          COALESCE(quote_totals.quotes_count, 0) as quotes_count,
          COALESCE(quote_totals.won_quotes_total, 0) as won_quotes_total,
          COALESCE(quote_totals.won_quotes_count, 0) as won_quotes_count,
          
          -- Totales de cotizaciones aprobadas para facturación (para referencia)
          COALESCE(quote_totals.approved_for_billing, 0) as approved_for_billing,
          COALESCE(quote_totals.approved_count, 0) as approved_count,
          
          -- Totales generales
          COALESCE(quote_totals.total_all_quotes, 0) as total_all_quotes,
          COALESCE(quote_totals.total_quotes_count, 0) as total_quotes_count,
          
          -- Proyectos
          COALESCE(project_totals.projects_count, 0) as projects_count,
          COALESCE(project_totals.completed_projects_count, 0) as completed_projects_count,
          
          -- Total acumulado (SOLO cotizaciones, NO aprobadas para facturación)
          COALESCE(quote_totals.total_quoted, 0) as total_accumulated
        FROM companies c
        LEFT JOIN (
          SELECT 
            p.company_id,
            -- Total de cotizaciones (excluyendo aprobadas y facturadas)
            COALESCE(SUM(CASE WHEN q.status NOT IN ('aprobada', 'facturada') THEN q.total ELSE 0 END), 0) as total_quoted,
            COUNT(CASE WHEN q.status NOT IN ('aprobada', 'facturada') THEN 1 END) as quotes_count,
            
            -- Total de cotizaciones ganadas
            COALESCE(SUM(CASE WHEN q.status = 'ganado' THEN q.total ELSE 0 END), 0) as won_quotes_total,
            COUNT(CASE WHEN q.status = 'ganado' THEN 1 END) as won_quotes_count,
            
            -- Total de cotizaciones aprobadas para facturación (para referencia)
            COALESCE(SUM(CASE WHEN q.status IN ('aprobada', 'facturada') THEN q.total ELSE 0 END), 0) as approved_for_billing,
            COUNT(CASE WHEN q.status IN ('aprobada', 'facturada') THEN 1 END) as approved_count,
            
            -- Total general
            COALESCE(SUM(q.total), 0) as total_all_quotes,
            COUNT(q.id) as total_quotes_count
          FROM quotes q
          LEFT JOIN projects p ON q.project_id = p.id
          WHERE p.company_id IS NOT NULL
          GROUP BY p.company_id
        ) quote_totals ON c.id = quote_totals.company_id
        LEFT JOIN (
          SELECT 
            company_id,
            COUNT(id) as projects_count,
            COUNT(CASE WHEN status = 'completado' THEN 1 END) as completed_projects_count
          FROM projects
          GROUP BY company_id
        ) project_totals ON c.id = project_totals.company_id
        WHERE c.id = $1
      `, [id]);
      
      company = result.rows[0];
    } else {
      // Obtener solo la empresa básica
      company = await Company.getById(id);
    }

    if (!company) {
      return res.status(404).json({ 
        success: false,
        error: 'Cliente no encontrado' 
      });
    }

    console.log(`✅ getCompanyById - Cliente ${id} obtenido exitosamente`);
    console.log(`📋 getCompanyById - Datos del cliente:`, {
      id: company.id,
      name: company.name,
      priority: company.priority,
      status: company.status
    });

    res.json({
      success: true,
      data: company
    });

  } catch (err) {
    console.error('❌ getCompanyById - Error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener cliente' 
    });
  }
};

// Actualizar empresa
const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const updateData = req.body;

    console.log(`🔄 updateCompany - Usuario ${userId} actualizando cliente ${id}`);

    // Verificar que la empresa existe
    const existingCompany = await Company.getById(id);
    if (!existingCompany) {
      return res.status(404).json({ 
        success: false,
        error: 'Cliente no encontrado' 
      });
    }

    // Actualizar la empresa
    const updatedCompany = await Company.update(id, updateData);

    // Auditoría
    await Audit.log({
      user_id: userId,
      action: 'actualizar',
      entity: 'company',
      entity_id: id,
      details: JSON.stringify({ 
        client_name: existingCompany.name,
        updated_fields: Object.keys(updateData)
      })
    });

    console.log(`✅ updateCompany - Cliente ${id} actualizado exitosamente por usuario ${userId}`);

    res.json({
      success: true,
      message: 'Cliente actualizado exitosamente',
      data: updatedCompany
    });

  } catch (err) {
    console.error('❌ updateCompany - Error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Error al actualizar cliente' 
    });
  }
};

module.exports = {
  listCompanies,
  getCompanyStats,
  getCompanyFilterOptions,
  searchCompanies,
  createCompany,
  getCompanyById,
  updateCompany,
  getOrCreateCompany,
  updateClientStatus,
  updateClientManager,
  getClientHistory,
  deleteCompany
};