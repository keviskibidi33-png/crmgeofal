const pool = require('../config/db');
const { authMiddleware } = require('../middlewares/auth');

// Función para obtener el último día del mes
const getLastDayOfMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

// Obtener estadísticas generales del sistema
const getSystemStats = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    // Validar fechas
    if (start_date && end_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Fechas inválidas'
        });
      }
    }
    
    // Construir filtros de fecha
    let projectsDateFilter = '';
    let quotesDateFilter = '';
    let clientsDateFilter = '';
    
    if (start_date && end_date) {
      projectsDateFilter = `AND p.created_at BETWEEN '${start_date}' AND '${end_date}'`;
      quotesDateFilter = `AND q.created_at BETWEEN '${start_date}' AND '${end_date}'`;
      clientsDateFilter = `AND p.created_at BETWEEN '${start_date}' AND '${end_date}'`;
    }

    // Total de proyectos
    const projectsQuery = `
      SELECT COUNT(*) as total_projects,
             COUNT(*) as active_projects,
             0 as completed_projects,
             0 as pending_projects
      FROM projects p
      WHERE 1=1 ${projectsDateFilter}
    `;

    // Total de cotizaciones
    const quotesQuery = `
      SELECT COUNT(*) as total_quotes,
             COUNT(CASE WHEN status = 'enviada' THEN 1 END) as sent_quotes,
             COUNT(CASE WHEN status = 'aprobada' THEN 1 END) as approved_quotes,
             SUM(CAST(total AS DECIMAL)) as total_value
      FROM quotes q
      WHERE 1=1 ${quotesDateFilter}
    `;

    // Total de clientes activos
    const clientsQuery = `
      SELECT COUNT(DISTINCT c.id) as total_clients,
             COUNT(DISTINCT c.id) as active_clients
      FROM companies c
      LEFT JOIN projects p ON c.id = p.company_id
      WHERE 1=1 ${clientsDateFilter}
    `;

    // Ventas del mes
    const salesQuery = `
      SELECT COALESCE(SUM(CAST(q.total AS DECIMAL)), 0) as monthly_sales
      FROM quotes q
      WHERE q.status = 'aprobada'
      AND EXTRACT(YEAR FROM q.created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
      AND EXTRACT(MONTH FROM q.created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
    `;

    const projectsResult = await pool.query(projectsQuery);
    const quotesResult = await pool.query(quotesQuery);
    const clientsResult = await pool.query(clientsQuery);
    const salesResult = await pool.query(salesQuery);

    const stats = {
      total_projects: projectsResult.rows[0].total_projects,
      active_projects: projectsResult.rows[0].active_projects,
      completed_projects: projectsResult.rows[0].completed_projects,
      pending_projects: projectsResult.rows[0].pending_projects,
      total_quotes: quotesResult.rows[0].total_quotes,
      sent_quotes: quotesResult.rows[0].sent_quotes,
      approved_quotes: quotesResult.rows[0].approved_quotes,
      total_quotes_value: quotesResult.rows[0].total_value || 0,
      total_clients: clientsResult.rows[0].total_clients,
      active_clients: clientsResult.rows[0].active_clients,
      monthly_sales: salesResult.rows[0].monthly_sales
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error getting system stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener ventas por vendedor
const getVentasPorVendedor = async (req, res) => {
  try {
    const { start_date, end_date, vendedor_id, page = 1, limit = 20, sort_by = 'total_sales' } = req.query;
    
    // Validar fechas
    if (start_date && end_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Fechas inválidas'
        });
      }
    }
    
    let dateFilter = '';
    let vendedorFilter = '';
    
    if (start_date && end_date) {
      dateFilter = `AND q.created_at BETWEEN '${start_date}' AND '${end_date}'`;
    }
    
    if (vendedor_id) {
      vendedorFilter = `AND q.created_by = ${vendedor_id}`;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Determinar el ordenamiento
    let orderBy = 'total_sales DESC, total_quotes DESC';
    switch (sort_by) {
      case 'total_projects':
        orderBy = 'total_projects DESC, total_sales DESC';
        break;
      case 'total_quotes':
        orderBy = 'total_quotes DESC, total_sales DESC';
        break;
      case 'approval_rate':
        orderBy = 'approval_rate DESC, total_sales DESC';
        break;
      default:
        orderBy = 'total_sales DESC, total_quotes DESC';
    }
    
    const query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        COUNT(DISTINCT q.id) as total_quotes,
        COUNT(DISTINCT CASE WHEN q.status = 'aprobada' THEN q.id END) as approved_quotes,
        COUNT(DISTINCT p.id) as total_projects,
        COUNT(DISTINCT c.id) as total_clients,
        COALESCE(SUM(CASE WHEN q.status = 'aprobada' THEN CAST(q.total AS DECIMAL) ELSE 0 END), 0) as total_sales,
        COALESCE(AVG(CASE WHEN q.status = 'aprobada' THEN CAST(q.total AS DECIMAL) END), 0) as avg_quote_value,
        CASE 
          WHEN COUNT(DISTINCT q.id) > 0 THEN 
            ROUND((COUNT(DISTINCT CASE WHEN q.status = 'aprobada' THEN q.id END)::DECIMAL / COUNT(DISTINCT q.id)) * 100, 2)
          ELSE 0 
        END as approval_rate,
        EXTRACT(YEAR FROM q.created_at) as year,
        EXTRACT(MONTH FROM q.created_at) as month
      FROM users u
      LEFT JOIN quotes q ON u.id = q.created_by ${dateFilter} ${vendedorFilter}
      LEFT JOIN projects p ON q.project_id = p.id
      LEFT JOIN companies c ON p.company_id = c.id
      WHERE u.role = 'vendedor_comercial'
      GROUP BY u.id, u.name, u.email, u.role, EXTRACT(YEAR FROM q.created_at), EXTRACT(MONTH FROM q.created_at)
      ORDER BY ${orderBy}
      LIMIT ${parseInt(limit)} OFFSET ${offset}
    `;

    // Consulta para obtener el total de registros
    const countQuery = `
      SELECT COUNT(DISTINCT u.id) as total
      FROM users u
      LEFT JOIN quotes q ON u.id = q.created_by ${dateFilter} ${vendedorFilter}
      WHERE u.role = 'vendedor_comercial'
    `;
    
    const countResult = await pool.query(countQuery);
    const totalRecords = parseInt(countResult.rows[0].total);
    
    const results = await pool.query(query);

    // Procesar datos para el frontend
    const processedData = results.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      total_quotes: parseInt(row.total_quotes) || 0,
      approved_quotes: parseInt(row.approved_quotes) || 0,
      total_projects: parseInt(row.total_projects) || 0,
      total_clients: parseInt(row.total_clients) || 0,
      total_sales: parseFloat(row.total_sales) || 0,
      avg_quote_value: parseFloat(row.avg_quote_value) || 0,
      approval_rate: parseFloat(row.approval_rate) || 0,
      year: row.year,
      month: row.month
    }));

    res.json({
      success: true,
      data: processedData,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalRecords / parseInt(limit)),
        totalRecords: totalRecords,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error getting ventas por vendedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener proyectos por estado
const getProyectosPorEstado = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    if (start_date && end_date) {
      dateFilter = `AND created_at BETWEEN '${start_date}' AND '${end_date}'`;
    }

    const query = `
      SELECT 
        'activo' as estado,
        COUNT(*) as cantidad,
        100.0 as porcentaje
      FROM projects
      WHERE 1=1 ${dateFilter}
      ORDER BY cantidad DESC
    `;

    const results = await pool.query(query);

    res.json({
      success: true,
      data: results.rows
    });

  } catch (error) {
    console.error('Error getting proyectos por estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener cotizaciones por período
const getCotizacionesPorPeriodo = async (req, res) => {
  try {
    const { start_date, end_date, vendedor_id } = req.query;
    
    let dateFilter = '';
    let vendedorFilter = '';
    
    if (start_date && end_date) {
      dateFilter = `AND q.created_at BETWEEN '${start_date}' AND '${end_date}'`;
    }
    
    if (vendedor_id) {
      vendedorFilter = `AND q.created_by = ${vendedor_id}`;
    }

    const query = `
      SELECT 
        q.id,
        CONCAT('COT-', q.id) as quote_number,
        q.total,
        q.status,
        q.created_at,
        q.issue_date,
        u.name as vendedor_name,
        u.email as vendedor_email,
        c.name as company_name,
        p.name as project_name,
        p.location as project_location
      FROM quotes q
      LEFT JOIN users u ON q.created_by = u.id
      LEFT JOIN projects p ON q.project_id = p.id
      LEFT JOIN companies c ON p.company_id = c.id
      WHERE 1=1 ${dateFilter} ${vendedorFilter}
      ORDER BY q.created_at DESC
    `;

    const results = await pool.query(query);

    res.json({
      success: true,
      data: results.rows
    });

  } catch (error) {
    console.error('Error getting cotizaciones por periodo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener clientes activos
const getClientesActivos = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    if (start_date && end_date) {
      dateFilter = `AND p.created_at BETWEEN '${start_date}' AND '${end_date}'`;
    }

    const query = `
      SELECT 
        c.id,
        c.name,
        c.email,
        c.phone,
        c.city,
        c.sector,
        COUNT(DISTINCT p.id) as total_projects,
        COUNT(DISTINCT p.id) as active_projects,
        COUNT(DISTINCT q.id) as total_quotes,
        COALESCE(SUM(CASE WHEN q.status = 'aprobada' THEN CAST(q.total AS DECIMAL) ELSE 0 END), 0) as total_value
      FROM companies c
      LEFT JOIN projects p ON c.id = p.company_id ${dateFilter}
      LEFT JOIN quotes q ON p.id = q.project_id
      GROUP BY c.id, c.name, c.email, c.phone, c.city, c.sector
      HAVING COUNT(DISTINCT p.id) > 0
      ORDER BY total_value DESC, total_projects DESC
    `;

    const results = await pool.query(query);

    res.json({
      success: true,
      data: results.rows
    });

  } catch (error) {
    console.error('Error getting clientes activos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener lista de vendedores para filtros
const getVendedores = async (req, res) => {
  try {
    const query = `
      SELECT id, name, email, role
      FROM users 
      WHERE role = 'vendedor_comercial'
      ORDER BY name
    `;

    const results = await pool.query(query);

    res.json({
      success: true,
      data: results.rows
    });

  } catch (error) {
    console.error('Error getting vendedores:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener dashboard top 10 vendedores
const getDashboardTop10 = async (req, res) => {
  try {
    const { start_date, end_date, sort_by = 'total_quotes', vendedor_id } = req.query;
    
    // Validar fechas
    if (start_date && end_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Fechas inválidas'
        });
      }

      if (startDate > endDate) {
        return res.status(400).json({
          success: false,
          message: 'La fecha de inicio debe ser anterior a la fecha de fin'
        });
      }
    }

    // Construir filtros de fecha
    let dateFilter = '';
    if (start_date && end_date) {
      dateFilter = `AND q.created_at >= '${start_date}' AND q.created_at <= '${end_date}'`;
    }

    // Construir filtro de vendedor
    let vendedorFilter = '';
    if (vendedor_id) {
      vendedorFilter = `AND u.id = ${vendedor_id}`;
    }

    // Determinar el ordenamiento
    let orderBy = 'total_sales DESC, total_quotes DESC';
    switch (sort_by) {
      case 'total_projects':
        orderBy = 'total_projects DESC, total_sales DESC';
        break;
      case 'total_quotes':
        orderBy = 'total_quotes DESC, total_sales DESC';
        break;
      case 'approval_rate':
        orderBy = 'approval_rate DESC, total_sales DESC';
        break;
      default:
        orderBy = 'total_sales DESC, total_quotes DESC';
    }
    
    const query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        COUNT(DISTINCT q.id) as total_quotes,
        COUNT(DISTINCT CASE WHEN q.status = 'aprobada' THEN q.id END) as approved_quotes,
        COUNT(DISTINCT p.id) as total_projects,
        COUNT(DISTINCT c.id) as total_clients,
        COALESCE(SUM(CASE WHEN q.status = 'aprobada' THEN CAST(q.total AS DECIMAL) ELSE 0 END), 0) as total_sales,
        COALESCE(AVG(CASE WHEN q.status = 'aprobada' THEN CAST(q.total AS DECIMAL) END), 0) as avg_quote_value,
        CASE 
          WHEN COUNT(DISTINCT q.id) > 0 THEN 
            ROUND((COUNT(DISTINCT CASE WHEN q.status = 'aprobada' THEN q.id END)::DECIMAL / COUNT(DISTINCT q.id)) * 100, 2)
          ELSE 0 
        END as approval_rate
      FROM users u
      LEFT JOIN quotes q ON u.id = q.created_by ${dateFilter}
      LEFT JOIN projects p ON q.project_id = p.id
      LEFT JOIN companies c ON p.company_id = c.id
      WHERE u.role = 'vendedor_comercial' ${vendedorFilter}
      GROUP BY u.id, u.name, u.email, u.role
      ORDER BY ${orderBy}
      LIMIT 10
    `;

    const results = await pool.query(query);

    // Procesar datos para el frontend
    const processedData = results.rows.map((row, index) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      position: index + 1,
      total_quotes: parseInt(row.total_quotes) || 0,
      approved_quotes: parseInt(row.approved_quotes) || 0,
      total_projects: parseInt(row.total_projects) || 0,
      total_clients: parseInt(row.total_clients) || 0,
      total_sales: parseFloat(row.total_sales) || 0,
      avg_quote_value: parseFloat(row.avg_quote_value) || 0,
      approval_rate: parseFloat(row.approval_rate) || 0
    }));

    // Calcular estadísticas generales
    const totalSales = processedData.reduce((sum, vendedor) => sum + vendedor.total_sales, 0);
    const totalProjects = processedData.reduce((sum, vendedor) => sum + vendedor.total_projects, 0);
    const totalQuotes = processedData.reduce((sum, vendedor) => sum + vendedor.total_quotes, 0);
    const avgApprovalRate = processedData.length > 0 
      ? processedData.reduce((sum, vendedor) => sum + vendedor.approval_rate, 0) / processedData.length 
      : 0;

    res.json({
      success: true,
      data: processedData,
      stats: {
        totalSales,
        totalProjects,
        totalQuotes,
        avgApprovalRate: Math.round(avgApprovalRate * 100) / 100,
        top3Sales: processedData.slice(0, 3).reduce((sum, v) => sum + v.total_sales, 0),
        restSales: processedData.slice(3).reduce((sum, v) => sum + v.total_sales, 0)
      }
    });

  } catch (error) {
    console.error('Error getting dashboard top 10:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener meta mensual
const getMonthlyGoal = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: 'Año y mes son requeridos'
      });
    }

    const query = `
      SELECT goal_quantity, created_at, updated_at
      FROM monthly_goals 
      WHERE year = $1 AND month = $2
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const result = await pool.query(query, [year, month]);

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          goal_quantity: 0,
          has_goal: false
        }
      });
    }

    res.json({
      success: true,
      data: {
        goal_quantity: parseInt(result.rows[0].goal_quantity),
        has_goal: true,
        created_at: result.rows[0].created_at,
        updated_at: result.rows[0].updated_at
      }
    });

  } catch (error) {
    console.error('Error getting monthly goal:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Crear o actualizar meta mensual
const setMonthlyGoal = async (req, res) => {
  try {
    const { year, month, goal_quantity } = req.body;
    const userId = req.user.id;

    if (!year || !month || !goal_quantity || goal_quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Año, mes y cantidad de meta son requeridos'
      });
    }

    // Verificar si ya existe una meta para este mes
    const checkQuery = `
      SELECT id FROM monthly_goals 
      WHERE year = $1 AND month = $2
    `;
    
    const existingGoal = await pool.query(checkQuery, [year, month]);

    if (existingGoal.rows.length > 0) {
      // Actualizar meta existente
      const updateQuery = `
        UPDATE monthly_goals 
        SET goal_quantity = $1, updated_at = NOW(), updated_by = $2
        WHERE year = $3 AND month = $4
        RETURNING *
      `;
      
      const result = await pool.query(updateQuery, [goal_quantity, userId, year, month]);
      
      res.json({
        success: true,
        message: 'Meta mensual actualizada exitosamente',
        data: result.rows[0]
      });
    } else {
      // Crear nueva meta
      const insertQuery = `
        INSERT INTO monthly_goals (year, month, goal_quantity, created_by, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING *
      `;
      
      const result = await pool.query(insertQuery, [year, month, goal_quantity, userId]);
      
      res.json({
        success: true,
        message: 'Meta mensual creada exitosamente',
        data: result.rows[0]
      });
    }

  } catch (error) {
    console.error('Error setting monthly goal:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  getSystemStats,
  getVentasPorVendedor,
  getProyectosPorEstado,
  getCotizacionesPorPeriodo,
  getClientesActivos,
  getVendedores,
  getDashboardTop10,
  getMonthlyGoal,
  setMonthlyGoal
};
