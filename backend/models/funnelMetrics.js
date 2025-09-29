const pool = require('../config/db');

const FunnelMetrics = {
  // Obtener métricas de embudo por servicio
  async getServiceFunnelMetrics(filters = {}) {
    let whereClause = 'WHERE qa.status = $1';
    let params = [require('./quoteApproval').STATUS.APPROVED];
    let paramCount = 1;
    
    // Filtros de fecha
    if (filters.date_from) {
      paramCount++;
      whereClause += ` AND qa.approved_at >= $${paramCount}`;
      params.push(filters.date_from);
    }
    
    if (filters.date_to) {
      paramCount++;
      whereClause += ` AND qa.approved_at <= $${paramCount}`;
      params.push(filters.date_to);
    }
    
    const result = await pool.query(`
      SELECT 
        ss.name as service_name,
        ss.codigo as service_code,
        ss.precio as service_price,
        COUNT(qi.id) as total_selections,
        COUNT(DISTINCT qa.quote_id) as unique_quotes,
        SUM(qi.quantity * qi.unit_price) as total_revenue,
        AVG(qi.quantity) as avg_quantity,
        AVG(qi.unit_price) as avg_price
      FROM quote_approvals qa
      JOIN quotes q ON qa.quote_id = q.id
      JOIN quote_items qi ON q.id = qi.quote_id
      JOIN subservices ss ON qi.subservice_id = ss.id
      ${whereClause}
      GROUP BY ss.id, ss.name, ss.codigo, ss.precio
      ORDER BY total_selections DESC
    `, params);
    
    return result.rows;
  },

  // Obtener distribución de servicios (embudo de conversión)
  async getServiceDistribution(filters = {}) {
    let whereClause = 'WHERE qa.status = $1';
    let params = [require('./quoteApproval').STATUS.APPROVED];
    let paramCount = 1;
    
    if (filters.date_from) {
      paramCount++;
      whereClause += ` AND qa.approved_at >= $${paramCount}`;
      params.push(filters.date_from);
    }
    
    if (filters.date_to) {
      paramCount++;
      whereClause += ` AND qa.approved_at <= $${paramCount}`;
      params.push(filters.date_to);
    }
    
    const result = await pool.query(`
      WITH service_stats AS (
        SELECT 
          ss.name as service_name,
          ss.codigo as service_code,
          COUNT(qi.id) as selection_count,
          SUM(qi.quantity * qi.unit_price) as revenue
        FROM quote_approvals qa
        JOIN quotes q ON qa.quote_id = q.id
        JOIN quote_items qi ON q.id = qi.quote_id
        JOIN subservices ss ON qi.subservice_id = ss.id
        ${whereClause}
        GROUP BY ss.id, ss.name, ss.codigo
      ),
      total_stats AS (
        SELECT 
          SUM(selection_count) as total_selections,
          SUM(revenue) as total_revenue
        FROM service_stats
      )
      SELECT 
        ss.*,
        ROUND((ss.selection_count * 100.0 / ts.total_selections), 2) as selection_percentage,
        ROUND((ss.revenue * 100.0 / ts.total_revenue), 2) as revenue_percentage,
        ts.total_selections,
        ts.total_revenue
      FROM service_stats ss
      CROSS JOIN total_stats ts
      ORDER BY ss.selection_count DESC
    `, params);
    
    return result.rows;
  },

  // Obtener métricas de conversión por categoría
  async getCategoryConversionMetrics(filters = {}) {
    let whereClause = 'WHERE qa.status = $1';
    let params = [require('./quoteApproval').STATUS.APPROVED];
    let paramCount = 1;
    
    if (filters.date_from) {
      paramCount++;
      whereClause += ` AND qa.approved_at >= $${paramCount}`;
      params.push(filters.date_from);
    }
    
    if (filters.date_to) {
      paramCount++;
      whereClause += ` AND qa.approved_at <= $${paramCount}`;
      params.push(filters.date_to);
    }
    
    const result = await pool.query(`
      SELECT 
        s.name as category_name,
        s.id as category_id,
        COUNT(DISTINCT qa.quote_id) as total_quotes,
        COUNT(qi.id) as total_items,
        SUM(qi.quantity * qi.unit_price) as total_revenue,
        AVG(q.total_amount) as avg_quote_value,
        COUNT(DISTINCT p.company_id) as unique_companies
      FROM quote_approvals qa
      JOIN quotes q ON qa.quote_id = q.id
      JOIN quote_items qi ON q.id = qi.quote_id
      JOIN subservices ss ON qi.subservice_id = ss.id
      JOIN services s ON ss.service_id = s.id
      LEFT JOIN projects p ON q.project_id = p.id
      ${whereClause}
      GROUP BY s.id, s.name
      ORDER BY total_revenue DESC
    `, params);
    
    return result.rows;
  },

  // Obtener tendencias mensuales
  async getMonthlyTrends(filters = {}) {
    let whereClause = 'WHERE qa.status = $1';
    let params = [require('./quoteApproval').STATUS.APPROVED];
    let paramCount = 1;
    
    if (filters.date_from) {
      paramCount++;
      whereClause += ` AND qa.approved_at >= $${paramCount}`;
      params.push(filters.date_from);
    }
    
    if (filters.date_to) {
      paramCount++;
      whereClause += ` AND qa.approved_at <= $${paramCount}`;
      params.push(filters.date_to);
    }
    
    const result = await pool.query(`
      SELECT 
        DATE_TRUNC('month', qa.approved_at) as month,
        COUNT(DISTINCT qa.quote_id) as total_quotes,
        SUM(q.total_amount) as total_revenue,
        COUNT(DISTINCT p.company_id) as unique_companies,
        AVG(q.total_amount) as avg_quote_value
      FROM quote_approvals qa
      JOIN quotes q ON qa.quote_id = q.id
      LEFT JOIN projects p ON q.project_id = p.id
      ${whereClause}
      GROUP BY DATE_TRUNC('month', qa.approved_at)
      ORDER BY month DESC
    `, params);
    
    return result.rows;
  },

  // Obtener servicios menos usados (oportunidades)
  async getUnderutilizedServices(filters = {}) {
    let whereClause = 'WHERE qa.status = $1';
    let params = [require('./quoteApproval').STATUS.APPROVED];
    let paramCount = 1;
    
    if (filters.date_from) {
      paramCount++;
      whereClause += ` AND qa.approved_at >= $${paramCount}`;
      params.push(filters.date_from);
    }
    
    if (filters.date_to) {
      paramCount++;
      whereClause += ` AND qa.approved_at <= $${paramCount}`;
      params.push(filters.date_to);
    }
    
    const result = await pool.query(`
      WITH service_usage AS (
        SELECT 
          ss.id,
          ss.name,
          ss.codigo,
          ss.precio,
          COUNT(qi.id) as usage_count,
          SUM(qi.quantity * qi.unit_price) as revenue
        FROM subservices ss
        LEFT JOIN quote_items qi ON ss.id = qi.subservice_id
        LEFT JOIN quotes q ON qi.quote_id = q.id
        LEFT JOIN quote_approvals qa ON q.id = qa.quote_id
        ${whereClause}
        GROUP BY ss.id, ss.name, ss.codigo, ss.precio
      ),
      total_services AS (
        SELECT COUNT(*) as total_count
        FROM subservices
        WHERE is_active = true
      )
      SELECT 
        su.*,
        ts.total_count,
        ROUND((su.usage_count * 100.0 / ts.total_count), 2) as usage_percentage
      FROM service_usage su
      CROSS JOIN total_services ts
      WHERE su.usage_count = 0 OR su.usage_count < 3
      ORDER BY su.usage_count ASC, su.revenue ASC
    `, params);
    
    return result.rows;
  },

  // Obtener métricas de rendimiento por vendedor
  async getSalesPerformanceMetrics(filters = {}) {
    let whereClause = 'WHERE qa.status = $1';
    let params = [require('./quoteApproval').STATUS.APPROVED];
    let paramCount = 1;
    
    if (filters.date_from) {
      paramCount++;
      whereClause += ` AND qa.approved_at >= $${paramCount}`;
      params.push(filters.date_from);
    }
    
    if (filters.date_to) {
      paramCount++;
      whereClause += ` AND qa.approved_at <= $${paramCount}`;
      params.push(filters.date_to);
    }
    
    const result = await pool.query(`
      SELECT 
        u.name as salesperson_name,
        u.role,
        COUNT(DISTINCT qa.quote_id) as total_quotes,
        SUM(q.total_amount) as total_revenue,
        AVG(q.total_amount) as avg_quote_value,
        COUNT(DISTINCT p.company_id) as unique_companies,
        COUNT(DISTINCT qi.subservice_id) as unique_services_used
      FROM quote_approvals qa
      JOIN quotes q ON qa.quote_id = q.id
      JOIN users u ON qa.requested_by = u.id
      LEFT JOIN projects p ON q.project_id = p.id
      LEFT JOIN quote_items qi ON q.id = qi.quote_id
      ${whereClause}
      GROUP BY u.id, u.name, u.role
      ORDER BY total_revenue DESC
    `, params);
    
    return result.rows;
  },

  // Obtener resumen ejecutivo
  async getExecutiveSummary(filters = {}) {
    let whereClause = 'WHERE qa.status = $1';
    let params = [require('./quoteApproval').STATUS.APPROVED];
    let paramCount = 1;
    
    if (filters.date_from) {
      paramCount++;
      whereClause += ` AND qa.approved_at >= $${paramCount}`;
      params.push(filters.date_from);
    }
    
    if (filters.date_to) {
      paramCount++;
      whereClause += ` AND qa.approved_at <= $${paramCount}`;
      params.push(filters.date_to);
    }
    
    const result = await pool.query(`
      SELECT 
        COUNT(DISTINCT qa.quote_id) as total_approved_quotes,
        SUM(q.total_amount) as total_revenue,
        AVG(q.total_amount) as avg_quote_value,
        COUNT(DISTINCT p.company_id) as unique_companies,
        COUNT(DISTINCT qi.subservice_id) as unique_services_used,
        COUNT(DISTINCT u.id) as active_salespeople,
        MAX(qa.approved_at) as last_approval_date,
        MIN(qa.approved_at) as first_approval_date
      FROM quote_approvals qa
      JOIN quotes q ON qa.quote_id = q.id
      LEFT JOIN projects p ON q.project_id = p.id
      LEFT JOIN quote_items qi ON q.id = qi.quote_id
      LEFT JOIN users u ON qa.requested_by = u.id
      ${whereClause}
    `, params);
    
    return result.rows[0];
  }
};

module.exports = FunnelMetrics;
