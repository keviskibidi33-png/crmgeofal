const pool = require('../config/db');

// Estados de clientes
const CLIENT_STATUS = {
  PROSPECCION: 'prospeccion',
  INTERESADO: 'interesado',
  PENDIENTE_COTIZACION: 'pendiente_cotizacion',
  COTIZACION_ENVIADA: 'cotizacion_enviada',
  NEGOCIACION: 'negociacion',
  GANADO: 'ganado',
  PERDIDO: 'perdido',
  OTRO: 'otro'
};

const Company = {
  // Exponer los estados para uso en otros módulos
  STATUS: CLIENT_STATUS,

  async getAll({ page = 1, limit = 20, search = '', type = '', area = '', city = '', sector = '', priority = '', status = '' }) {
    const offset = (page - 1) * limit;
    let where = [];
    let params = [];
    
    // Búsqueda en múltiples campos
    if (search) {
      params.push(`%${search}%`);
      params.push(`%${search}%`);
      params.push(`%${search}%`);
      params.push(`%${search}%`);
      where.push(`(LOWER(name) LIKE LOWER($${params.length-3}) OR LOWER(contact_name) LIKE LOWER($${params.length-2}) OR LOWER(email) LIKE LOWER($${params.length-1}) OR LOWER(phone) LIKE LOWER($${params.length}))`);
    }
    
    // Filtro por tipo
    if (type) {
      params.push(type);
      where.push(`type = $${params.length}`);
    }
    if (city) {
      params.push(city);
      where.push(`city = $${params.length}`);
    }
    if (sector) {
      params.push(sector);
      where.push(`sector = $${params.length}`);
    }
    if (priority) {
      params.push(priority);
      where.push(`priority = $${params.length}`);
    }
    if (status) {
      params.push(status);
      where.push(`status = $${params.length}`);
    }
    
    let whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    params.push(limit, offset);
    
        const data = await pool.query(
          `SELECT id, type, ruc, dni, name, address, email, phone, contact_name, city, sector, status, priority, actividad, servicios, created_at FROM companies ${whereClause} ORDER BY created_at DESC, id DESC LIMIT $${params.length-1} OFFSET $${params.length}`,
          params
        );
    
    // Total con filtros
    let totalParams = params.slice(0, params.length-2);
    const total = await pool.query(
      `SELECT COUNT(*) FROM companies ${whereClause}`,
      totalParams
    );
    
    return { rows: data.rows, total: parseInt(total.rows[0].count) };
  },
  async getById(id) {
    const res = await pool.query('SELECT * FROM companies WHERE id = $1', [id]);
    return res.rows[0];
  },
  async getByRuc(ruc) {
    const res = await pool.query('SELECT * FROM companies WHERE ruc = $1', [ruc]);
    return res.rows[0];
  },
  async getByDni(dni) {
    const res = await pool.query('SELECT * FROM companies WHERE dni = $1', [dni]);
    return res.rows[0];
  },
  async create({ type, ruc, dni, name, address, email, phone, contact_name, city, sector, priority, actividad, servicios }) {
    const res = await pool.query(
      `INSERT INTO companies (type, ruc, dni, name, address, email, phone, contact_name, city, sector, priority, actividad, servicios)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [type, ruc, dni, name, address, email, phone, contact_name, city, sector, priority, actividad, servicios]
    );
    return res.rows[0];
  },
  async update(id, { type, ruc, dni, name, address, email, phone, contact_name, city, sector, priority, actividad, servicios, managed_by, status }) {
    const res = await pool.query(
      `UPDATE companies SET type = $1, ruc = $2, dni = $3, name = $4, address = $5, email = $6, phone = $7, contact_name = $8, city = $9, sector = $10, priority = $11, actividad = $12, servicios = $13, managed_by = $14, status = $15 WHERE id = $16 RETURNING *`,
      [type, ruc, dni, name, address, email, phone, contact_name, city, sector, priority, actividad, servicios, managed_by, status, id]
    );
    return res.rows[0];
  },
  // Métodos de status y manager removidos ya que las columnas no existen en la tabla
  // Obtener todos los estados disponibles
  getAvailableStatuses() {
    return Object.values(CLIENT_STATUS);
  },
  // Obtener historial de cotizaciones y proyectos de un cliente
  async getClientHistory(clientId) {
    try {
      console.log(`📋 Company.getClientHistory - Obteniendo historial para cliente ID: ${clientId}`);
      
      // Obtener cotizaciones del cliente
      const quotesResult = await pool.query(`
        SELECT 
          q.id,
          q.total,
          q.status,
          q.created_at,
          q.updated_at,
          u.name as created_by_name,
          u.role as created_by_role
        FROM quotes q
        LEFT JOIN users u ON q.created_by = u.id
        LEFT JOIN companies c ON c.id = $1
        WHERE q.client_ruc = c.ruc OR q.client_ruc = c.dni
        ORDER BY q.created_at DESC
      `, [clientId]);
      
      // Obtener proyectos del cliente
      const projectsResult = await pool.query(`
        SELECT 
          p.id,
          p.name,
          p.status,
          p.created_at,
          p.updated_at,
          u.name as created_by_name,
          u.role as created_by_role
        FROM projects p
        LEFT JOIN users u ON p.vendedor_id = u.id
        WHERE p.company_id = $1
        ORDER BY p.created_at DESC
      `, [clientId]);
      
      // Obtener información del gestor actual (removido ya que la columna managed_by no existe)
      const managerResult = { rows: [] };
      
      const history = {
        quotes: quotesResult.rows,
        projects: projectsResult.rows,
        manager: managerResult.rows[0] || null,
        stats: {
          totalQuotes: quotesResult.rows.length,
          totalProjects: projectsResult.rows.length,
          quotesByStatus: {},
          projectsByStatus: {}
        }
      };
      
      // Calcular estadísticas de cotizaciones por estado
      quotesResult.rows.forEach(quote => {
        history.stats.quotesByStatus[quote.status] = (history.stats.quotesByStatus[quote.status] || 0) + 1;
      });
      
      // Calcular estadísticas de proyectos por estado
      projectsResult.rows.forEach(project => {
        history.stats.projectsByStatus[project.status] = (history.stats.projectsByStatus[project.status] || 0) + 1;
      });
      
      console.log(`✅ Company.getClientHistory - Historial obtenido: ${history.stats.totalQuotes} cotizaciones, ${history.stats.totalProjects} proyectos`);
      return history;
    } catch (error) {
      console.error('❌ Company.getClientHistory - Error:', error);
      throw error;
    }
  },
  async delete(id) {
    await pool.query('DELETE FROM companies WHERE id = $1', [id]);
    return true;
  },

  async getStats() {
    try {
      console.log('📊 Company.getStats - Obteniendo estadísticas de clientes...');
      
      // Obtener estadísticas por tipo
      const typeStats = await pool.query(`
        SELECT 
          type,
          COUNT(*) as count
        FROM companies 
        GROUP BY type
      `);
      
      // Obtener estadísticas por estado
      const statusStats = await pool.query(`
        SELECT 
          status,
          COUNT(*) as count
        FROM companies 
        GROUP BY status
      `);
      
      // Obtener estadísticas por sector
      const sectorStats = await pool.query(`
        SELECT 
          sector,
          COUNT(*) as count
        FROM companies 
        WHERE sector IS NOT NULL AND sector <> ''
        GROUP BY sector
      `);
      
      // Obtener estadísticas por prioridad
      const priorityStats = await pool.query(`
        SELECT 
          priority,
          COUNT(*) as count
        FROM companies 
        WHERE priority IS NOT NULL AND priority <> ''
        GROUP BY priority
      `);
      
      // Obtener total de clientes
      const totalResult = await pool.query('SELECT COUNT(*) as total FROM companies');
      const total = parseInt(totalResult.rows[0].total);
      
      // Obtener clientes con email
      const emailResult = await pool.query('SELECT COUNT(*) as with_email FROM companies WHERE email IS NOT NULL AND email <> \'\'');
      const withEmail = parseInt(emailResult.rows[0].with_email);
      
      // Obtener clientes con teléfono
      const phoneResult = await pool.query('SELECT COUNT(*) as with_phone FROM companies WHERE phone IS NOT NULL AND phone <> \'\'');
      const withPhone = parseInt(phoneResult.rows[0].with_phone);
      
      // Procesar estadísticas por tipo
      const stats = {
        total: total,
        empresas: 0,
        personas: 0,
        withEmail: withEmail,
        withPhone: withPhone,
        byType: {},
        byStatus: {},
        bySector: {},
        byPriority: {
          urgent: 0,
          high: 0,
          medium: 0,
          low: 0
        }
      };
      
      // Mapear tipos a categorías
      typeStats.rows.forEach(row => {
        const type = row.type;
        const count = parseInt(row.count);
        stats.byType[type] = count;
        
        if (type === 'empresa') {
          stats.empresas = count;
        } else if (type === 'persona') {
          stats.personas = count;
        }
      });
      
      // Mapear estados
      statusStats.rows.forEach(row => {
        const status = row.status;
        const count = parseInt(row.count);
        stats.byStatus[status] = count;
      });
      
      // Mapear sectores
      sectorStats.rows.forEach(row => {
        const sector = row.sector;
        const count = parseInt(row.count);
        stats.bySector[sector] = count;
      });
      
      // Mapear prioridades usando el campo priority real
      priorityStats.rows.forEach(row => {
        const priority = row.priority;
        const count = parseInt(row.count);
        
        // Mapear a las categorías esperadas
        if (priority === 'urgent') {
          stats.byPriority.urgent = count;
        } else if (priority === 'high') {
          stats.byPriority.high = count;
        } else if (priority === 'normal') {
          stats.byPriority.medium = count; // Mapear normal a medium para compatibilidad
        } else if (priority === 'low') {
          stats.byPriority.low = count;
        }
      });
      
      console.log('✅ Company.getStats - Estadísticas calculadas:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Company.getStats - Error:', error);
      throw error;
    }
  },

  async getClientTotalValue(companyId) {
    try {
      console.log('💰 Company.getClientTotalValue - Calculando valor total para cliente:', companyId);
      
      // Obtener total de cotizaciones del cliente (SOLO cotizaciones, NO aprobadas para facturación)
      const quotesResult = await pool.query(`
        SELECT 
          -- Total de cotizaciones (excluyendo aprobadas y facturadas)
          COALESCE(SUM(CASE WHEN q.status NOT IN ('aprobada', 'facturada') THEN q.total ELSE 0 END), 0) as total_quoted,
          COUNT(CASE WHEN q.status NOT IN ('aprobada', 'facturada') THEN 1 END) as quotes_count,
          
          -- Total de cotizaciones ganadas (excluyendo aprobadas y facturadas)
          COALESCE(SUM(CASE WHEN q.status = 'ganado' THEN q.total ELSE 0 END), 0) as won_quotes_total,
          COUNT(CASE WHEN q.status = 'ganado' THEN 1 END) as won_quotes_count,
          
          -- Total de cotizaciones aprobadas para facturación (para referencia, NO incluido en total acumulado)
          COALESCE(SUM(CASE WHEN q.status IN ('aprobada', 'facturada') THEN q.total ELSE 0 END), 0) as approved_for_billing,
          COUNT(CASE WHEN q.status IN ('aprobada', 'facturada') THEN 1 END) as approved_count,
          
          -- Total general (todas las cotizaciones)
          COALESCE(SUM(q.total), 0) as total_all_quotes,
          COUNT(q.id) as total_quotes_count
        FROM quotes q
        LEFT JOIN projects p ON q.project_id = p.id
        WHERE p.company_id = $1
      `, [companyId]);
      
      // Obtener total de proyectos del cliente
      const projectsResult = await pool.query(`
        SELECT 
          COUNT(p.id) as projects_count,
          COUNT(CASE WHEN p.status = 'completado' THEN 1 END) as completed_projects_count
        FROM projects p
        WHERE p.company_id = $1
      `, [companyId]);
      
      const quotesData = quotesResult.rows[0];
      const projectsData = projectsResult.rows[0];
      
      const totalValue = {
        // Valores principales (solo cotizaciones, NO aprobadas para facturación)
        total_quoted: parseFloat(quotesData.total_quoted) || 0,
        quotes_count: parseInt(quotesData.quotes_count) || 0,
        won_quotes_total: parseFloat(quotesData.won_quotes_total) || 0,
        won_quotes_count: parseInt(quotesData.won_quotes_count) || 0,
        
        // Valores de referencia (aprobados para facturación - NO incluidos en total acumulado)
        approved_for_billing: parseFloat(quotesData.approved_for_billing) || 0,
        approved_count: parseInt(quotesData.approved_count) || 0,
        
        // Totales generales
        total_all_quotes: parseFloat(quotesData.total_all_quotes) || 0,
        total_quotes_count: parseInt(quotesData.total_quotes_count) || 0,
        
        // Proyectos
        projects_count: parseInt(projectsData.projects_count) || 0,
        completed_projects_count: parseInt(projectsData.completed_projects_count) || 0,
        
        // Total acumulado (SOLO cotizaciones, NO aprobadas para facturación)
        total_accumulated: parseFloat(quotesData.total_quoted) || 0
      };
      
      console.log('✅ Company.getClientTotalValue - Valor calculado:', totalValue);
      return totalValue;
    } catch (error) {
      console.error('❌ Company.getClientTotalValue - Error:', error);
      throw error;
    }
  },

  async getAllWithTotals({ page = 1, limit = 20, search = '', type = '', area = '', city = '', sector = '', priority = '', status = '' }) {
    try {
      console.log('💰 Company.getAllWithTotals - Obteniendo clientes con totales...');
      
      const offset = (page - 1) * limit;
      let where = [];
      let params = [];
      
      // Búsqueda en múltiples campos
      if (search) {
        params.push(`%${search}%`);
        params.push(`%${search}%`);
        params.push(`%${search}%`);
        params.push(`%${search}%`);
        where.push(`(LOWER(name) LIKE LOWER($${params.length-3}) OR LOWER(contact_name) LIKE LOWER($${params.length-2}) OR LOWER(email) LIKE LOWER($${params.length-1}) OR LOWER(phone) LIKE LOWER($${params.length}))`);
      }
      
      // Filtros
      if (type) {
        params.push(type);
        where.push(`type = $${params.length}`);
      }
      if (city) {
        params.push(city);
        where.push(`city = $${params.length}`);
      }
      if (sector) {
        params.push(sector);
        where.push(`sector = $${params.length}`);
      }
      if (priority) {
        params.push(priority);
        where.push(`priority = $${params.length}`);
      }
      if (status) {
        params.push(status);
        where.push(`status = $${params.length}`);
      }
      
      let whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
      params.push(limit, offset);
      
      // Query principal con totales calculados (SOLO cotizaciones, NO aprobadas para facturación)
      const data = await pool.query(`
        SELECT 
          c.id, c.type, c.ruc, c.dni, c.name, c.address, c.email, c.phone, 
          c.contact_name, c.city, c.sector, c.status, c.actividad, c.servicios, c.created_at,
          
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
        ORDER BY c.created_at DESC, c.id DESC 
        LIMIT $${params.length-1} OFFSET $${params.length}
      `, params);
      
      // Total con filtros
      let totalParams = params.slice(0, params.length-2);
      const total = await pool.query(`
        SELECT COUNT(*) FROM companies c ${whereClause}
      `, totalParams);
      
      return {
        rows: data.rows,
        total: parseInt(total.rows[0].count),
        page: page,
        limit: limit,
        totalPages: Math.ceil(parseInt(total.rows[0].count) / limit)
      };
    } catch (error) {
      console.error('❌ Company.getAllWithTotals - Error:', error);
      throw error;
    }
  },

  async getFilterOptions() {
    try {
      console.log('🔍 Company.getFilterOptions - Obteniendo opciones de filtros...');
      
      // Obtener ciudades únicas
      const citiesResult = await pool.query(`
        SELECT DISTINCT city, COUNT(*) as count
        FROM companies 
        WHERE city IS NOT NULL AND city <> ''
        GROUP BY city
        ORDER BY count DESC, city ASC
      `);
      
      // Obtener sectores únicos
      const sectorsResult = await pool.query(`
        SELECT DISTINCT sector, COUNT(*) as count
        FROM companies 
        WHERE sector IS NOT NULL AND sector <> ''
        GROUP BY sector
        ORDER BY count DESC, sector ASC
      `);
      
      // Obtener tipos únicos
      const typesResult = await pool.query(`
        SELECT DISTINCT type, COUNT(*) as count
        FROM companies 
        WHERE type IS NOT NULL AND type <> ''
        GROUP BY type
        ORDER BY count DESC, type ASC
      `);
      
      const filterOptions = {
        cities: citiesResult.rows.map(row => ({
          value: row.city,
          label: row.city,
          count: parseInt(row.count)
        })),
        sectors: sectorsResult.rows.map(row => ({
          value: row.sector,
          label: row.sector,
          count: parseInt(row.count)
        })),
        types: typesResult.rows.map(row => ({
          value: row.type,
          label: row.type === 'empresa' ? 'Empresa' : 'Persona Natural',
          count: parseInt(row.count)
        }))
      };
      
      console.log('✅ Company.getFilterOptions - Opciones obtenidas:', filterOptions);
      return filterOptions;
    } catch (error) {
      console.error('❌ Company.getFilterOptions - Error:', error);
      throw error;
    }
  },

  // Búsqueda inteligente por tipo y texto
  async searchByType(type, searchTerm) {
    try {
      console.log(`🔍 Company.searchByType - Buscando ${type} con término: "${searchTerm}"`);
      
      let query = `
        SELECT id, type, ruc, dni, name, address, email, phone, contact_name, city, sector, created_at
        FROM companies 
        WHERE type = $1
      `;
      
      const params = [type];
      
      if (searchTerm && searchTerm.trim()) {
        // Búsqueda en múltiples campos según el tipo
        if (type === 'empresa') {
          // Para empresas: buscar por nombre, RUC, contacto
          query += ` AND (
            LOWER(name) LIKE LOWER($2) OR 
            LOWER(ruc) LIKE LOWER($2) OR 
            LOWER(contact_name) LIKE LOWER($2) OR
            LOWER(email) LIKE LOWER($2)
          )`;
        } else if (type === 'persona_natural') {
          // Para personas: buscar por nombre, DNI, contacto
          query += ` AND (
            LOWER(name) LIKE LOWER($2) OR 
            LOWER(dni) LIKE LOWER($2) OR 
            LOWER(contact_name) LIKE LOWER($2) OR
            LOWER(email) LIKE LOWER($2)
          )`;
        }
        
        params.push(`%${searchTerm}%`);
      }
      
      query += ` ORDER BY name ASC LIMIT 20`;
      
      const result = await pool.query(query, params);
      
      console.log(`✅ Company.searchByType - Encontrados ${result.rows.length} resultados`);
      return result.rows;
    } catch (error) {
      console.error('❌ Company.searchByType - Error:', error);
      throw error;
    }
  },
};

module.exports = Company;
