const pool = require('../config/db');

// Obtener distribución de servicios por categoría
exports.getServiceDistribution = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.name as category_name,
        c.id as category_id,
        COUNT(q.id) as quote_count,
        COALESCE(SUM(q.total), 0) as total_amount,
        COALESCE(AVG(q.total), 0) as average_amount
      FROM categories c
      LEFT JOIN services s ON c.id = s.category_id
      LEFT JOIN subservices ss ON s.id = ss.service_id
      LEFT JOIN quote_items qi ON ss.id = qi.subservice_id
      LEFT JOIN quotes q ON qi.quote_id = q.id
      WHERE c.is_active = true
      GROUP BY c.id, c.name
      ORDER BY total_amount DESC, quote_count DESC
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting service distribution:', error);
    res.status(500).json({ error: 'Error obteniendo distribución de servicios' });
  }
};

// Obtener conversión por categoría (borradores vs aprobadas)
exports.getConversionByCategory = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.name as category_name,
        c.id as category_id,
        COUNT(CASE WHEN q.status = 'borrador' THEN 1 END) as draft_count,
        COUNT(CASE WHEN q.status = 'aprobada' THEN 1 END) as approved_count,
        COUNT(CASE WHEN q.status = 'facturada' THEN 1 END) as invoiced_count,
        COALESCE(SUM(CASE WHEN q.status = 'borrador' THEN q.total ELSE 0 END), 0) as draft_amount,
        COALESCE(SUM(CASE WHEN q.status = 'aprobada' THEN q.total ELSE 0 END), 0) as approved_amount,
        COALESCE(SUM(CASE WHEN q.status = 'facturada' THEN q.total ELSE 0 END), 0) as invoiced_amount,
        CASE 
          WHEN COUNT(CASE WHEN q.status = 'borrador' THEN 1 END) > 0 
          THEN ROUND(
            (COUNT(CASE WHEN q.status = 'aprobada' THEN 1 END)::decimal / 
             COUNT(CASE WHEN q.status = 'borrador' THEN 1 END)) * 100, 2
          )
          ELSE 0 
        END as conversion_rate
      FROM categories c
      LEFT JOIN services s ON c.id = s.category_id
      LEFT JOIN subservices ss ON s.id = ss.service_id
      LEFT JOIN quote_items qi ON ss.id = qi.subservice_id
      LEFT JOIN quotes q ON qi.quote_id = q.id
      WHERE c.is_active = true
      GROUP BY c.id, c.name
      ORDER BY conversion_rate DESC, approved_amount DESC
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting conversion by category:', error);
    res.status(500).json({ error: 'Error obteniendo conversión por categoría' });
  }
};

// Obtener tendencias mensuales
exports.getMonthlyTrends = async (req, res) => {
  try {
    const query = `
      SELECT 
        DATE_TRUNC('month', q.created_at) as month,
        COUNT(q.id) as quote_count,
        COALESCE(SUM(q.total), 0) as total_amount,
        COUNT(CASE WHEN q.status = 'aprobada' THEN 1 END) as approved_count,
        COUNT(CASE WHEN q.status = 'facturada' THEN 1 END) as invoiced_count
      FROM quotes q
      WHERE q.created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', q.created_at)
      ORDER BY month DESC
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting monthly trends:', error);
    res.status(500).json({ error: 'Error obteniendo tendencias mensuales' });
  }
};

// Obtener servicios subutilizados
exports.getUnderutilizedServices = async (req, res) => {
  try {
    const query = `
      SELECT 
        s.name as service_name,
        s.area,
        c.name as category_name,
        COUNT(qi.id) as usage_count,
        COALESCE(SUM(q.total), 0) as total_revenue
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.id
      LEFT JOIN subservices ss ON s.id = ss.service_id
      LEFT JOIN quote_items qi ON ss.id = qi.subservice_id
      LEFT JOIN quotes q ON qi.quote_id = q.id
      WHERE s.is_active = true
      GROUP BY s.id, s.name, s.area, c.name
      HAVING COUNT(qi.id) < 3 OR COALESCE(SUM(q.total), 0) < 1000
      ORDER BY usage_count ASC, total_revenue ASC
      LIMIT 10
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting underutilized services:', error);
    res.status(500).json({ error: 'Error obteniendo servicios subutilizados' });
  }
};

// Obtener rendimiento de vendedores
exports.getSalespersonPerformance = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id,
        u.name,
        u.apellido,
        u.area,
        COUNT(q.id) as total_quotes,
        COUNT(CASE WHEN q.status = 'aprobada' THEN 1 END) as approved_quotes,
        COUNT(CASE WHEN q.status = 'facturada' THEN 1 END) as invoiced_quotes,
        COALESCE(SUM(q.total), 0) as total_amount,
        COALESCE(SUM(CASE WHEN q.status = 'aprobada' THEN q.total ELSE 0 END), 0) as approved_amount,
        COALESCE(SUM(CASE WHEN q.status = 'facturada' THEN q.total ELSE 0 END), 0) as invoiced_amount,
        CASE 
          WHEN COUNT(q.id) > 0 
          THEN ROUND(
            (COUNT(CASE WHEN q.status = 'aprobada' THEN 1 END)::decimal / COUNT(q.id)) * 100, 2
          )
          ELSE 0 
        END as approval_rate
      FROM users u
      LEFT JOIN quotes q ON u.id = q.created_by
      WHERE u.role IN ('vendedor_comercial', 'jefa_comercial') 
        AND u.active IS NOT FALSE
        AND q.created_at >= NOW() - INTERVAL '6 months'
      GROUP BY u.id, u.name, u.apellido, u.area
      ORDER BY approved_amount DESC, approval_rate DESC
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting salesperson performance:', error);
    res.status(500).json({ error: 'Error obteniendo rendimiento de vendedores' });
  }
};

// Obtener resumen ejecutivo
exports.getExecutiveSummary = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(CASE WHEN q.status = 'aprobada' THEN 1 END) as approved_quotes,
        COUNT(CASE WHEN q.status = 'facturada' THEN 1 END) as invoiced_quotes,
        COALESCE(SUM(CASE WHEN q.status = 'aprobada' THEN q.total ELSE 0 END), 0) as approved_amount,
        COALESCE(SUM(CASE WHEN q.status = 'facturada' THEN q.total ELSE 0 END), 0) as invoiced_amount,
        COALESCE(AVG(CASE WHEN q.status = 'aprobada' THEN q.total END), 0) as average_approved_amount,
        COALESCE(AVG(CASE WHEN q.status = 'facturada' THEN q.total END), 0) as average_invoiced_amount,
        COUNT(DISTINCT q.created_by) as active_salespeople,
        COUNT(DISTINCT q.project_id) as unique_projects
      FROM quotes q
      WHERE q.created_at >= NOW() - INTERVAL '3 months'
    `;
    
    const result = await pool.query(query);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting executive summary:', error);
    res.status(500).json({ error: 'Error obteniendo resumen ejecutivo' });
  }
};

// Obtener embudo por área (Laboratorio vs Ingeniería)
exports.getFunnelByArea = async (req, res) => {
  try {
    const query = `
      SELECT 
        s.area,
        COUNT(q.id) as total_quotes,
        COUNT(CASE WHEN q.status = 'borrador' THEN 1 END) as draft_count,
        COUNT(CASE WHEN q.status = 'aprobada' THEN 1 END) as approved_count,
        COUNT(CASE WHEN q.status = 'facturada' THEN 1 END) as invoiced_count,
        COALESCE(SUM(CASE WHEN q.status = 'borrador' THEN q.total ELSE 0 END), 0) as draft_amount,
        COALESCE(SUM(CASE WHEN q.status = 'aprobada' THEN q.total ELSE 0 END), 0) as approved_amount,
        COALESCE(SUM(CASE WHEN q.status = 'facturada' THEN q.total ELSE 0 END), 0) as invoiced_amount
      FROM services s
      LEFT JOIN subservices ss ON s.id = ss.service_id
      LEFT JOIN quote_items qi ON ss.id = qi.subservice_id
      LEFT JOIN quotes q ON qi.quote_id = q.id
      WHERE s.is_active = true
        AND q.created_at >= NOW() - INTERVAL '6 months'
      GROUP BY s.area
      ORDER BY approved_amount DESC
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting funnel by area:', error);
    res.status(500).json({ error: 'Error obteniendo embudo por área' });
  }
};

// Obtener métricas de tiempo de aprobación
exports.getApprovalMetrics = async (req, res) => {
  try {
    const query = `
      SELECT 
        AVG(EXTRACT(EPOCH FROM (q.updated_at - q.created_at))/3600) as avg_approval_hours,
        MIN(EXTRACT(EPOCH FROM (q.updated_at - q.created_at))/3600) as min_approval_hours,
        MAX(EXTRACT(EPOCH FROM (q.updated_at - q.created_at))/3600) as max_approval_hours,
        COUNT(CASE WHEN q.status = 'aprobada' AND q.updated_at - q.created_at <= INTERVAL '24 hours' THEN 1 END) as fast_approvals,
        COUNT(CASE WHEN q.status = 'aprobada' THEN 1 END) as total_approvals
      FROM quotes q
      WHERE q.status = 'aprobada'
        AND q.created_at >= NOW() - INTERVAL '3 months'
    `;
    
    const result = await pool.query(query);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting approval metrics:', error);
    res.status(500).json({ error: 'Error obteniendo métricas de aprobación' });
  }
};