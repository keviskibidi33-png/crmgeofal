const pool = require('../config/db');

// Obtener estadísticas del dashboard (versión mejorada)
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    
    console.log('📊 Obteniendo estadísticas del dashboard para usuario:', userId, 'rol:', userRole);
    
    // Estadísticas básicas
    const stats = {
      totalUsers: 0,
      totalProjects: 0,
      totalQuotes: 0,
      totalTickets: 0,
      activeProjects: 0,
      pendingQuotes: 0,
      openTickets: 0,
      completedProjects: 0,
      totalClients: 0,
      totalEvidences: 0,
      // Estadísticas de tendencias (últimos 30 días)
      newUsersThisMonth: 0,
      newProjectsThisMonth: 0,
      newQuotesThisMonth: 0,
      newTicketsThisMonth: 0,
      // Estadísticas por rol
      userStats: {},
      projectStats: {},
      quoteStats: {},
      ticketStats: {},
      // Datos recientes
      recentQuotes: [],
      recentActivities: []
    };

    // Función helper para ejecutar consultas de forma segura
    const safeQuery = async (query, params = []) => {
      try {
        const result = await pool.query(query, params);
        return result.rows[0]?.count || 0;
      } catch (error) {
        console.error('Error en consulta:', query, error.message);
        return 0;
      }
    };

    // Obtener estadísticas básicas
    console.log('🔍 Obteniendo estadísticas básicas...');
    
    stats.totalUsers = await safeQuery('SELECT COUNT(*) as count FROM users');
    stats.totalProjects = await safeQuery('SELECT COUNT(*) as count FROM projects');
    stats.totalQuotes = await safeQuery('SELECT COUNT(*) as count FROM quotes');
    stats.totalTickets = await safeQuery('SELECT COUNT(*) as count FROM tickets');
    stats.totalClients = await safeQuery('SELECT COUNT(*) as count FROM companies');
    stats.totalEvidences = await safeQuery('SELECT COUNT(*) as count FROM evidences');

    // Obtener estadísticas por estado
    console.log('🔍 Obteniendo estadísticas por estado...');
    
    stats.openTickets = await safeQuery("SELECT COUNT(*) as count FROM tickets WHERE status = 'abierto'");
    stats.activeProjects = await safeQuery("SELECT COUNT(*) as count FROM projects WHERE status = 'activo'");
    stats.pendingQuotes = await safeQuery("SELECT COUNT(*) as count FROM quotes WHERE status = 'borrador'");
    stats.completedProjects = await safeQuery("SELECT COUNT(*) as count FROM projects WHERE status = 'completado'");

    // Obtener estadísticas de tendencias (últimos 30 días)
    console.log('🔍 Obteniendo estadísticas de tendencias...');
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    stats.newUsersThisMonth = await safeQuery('SELECT COUNT(*) as count FROM users WHERE created_at >= $1', [thirtyDaysAgo]);
    stats.newProjectsThisMonth = await safeQuery('SELECT COUNT(*) as count FROM projects WHERE created_at >= $1', [thirtyDaysAgo]);
    stats.newQuotesThisMonth = await safeQuery('SELECT COUNT(*) as count FROM quotes WHERE created_at >= $1', [thirtyDaysAgo]);
    stats.newTicketsThisMonth = await safeQuery('SELECT COUNT(*) as count FROM tickets WHERE created_at >= $1', [thirtyDaysAgo]);

    // Obtener cotizaciones recientes
    console.log('🔍 Obteniendo cotizaciones recientes...');
    
    try {
      const recentQuotesResult = await pool.query(`
        SELECT 
          q.id, 
          q.quote_number, 
          q.client_contact as client_name, 
          q.total_amount, 
          q.status, 
          q.created_at,
          c.name as company_name
        FROM quotes q
        LEFT JOIN companies c ON q.company_id = c.id
        ORDER BY q.created_at DESC
        LIMIT 5
      `);
      stats.recentQuotes = recentQuotesResult.rows;
    } catch (error) {
      console.error('Error getting recent quotes:', error);
      stats.recentQuotes = [];
    }

    // Obtener actividades recientes
    console.log('🔍 Obteniendo actividades recientes...');
    
    try {
      const recentActivitiesResult = await pool.query(`
        SELECT 
          'quote' as type,
          q.quote_number as title,
          q.client_contact as description,
          q.created_at,
          u.name as user_name
        FROM quotes q
        LEFT JOIN users u ON q.created_by = u.id
        WHERE q.created_at >= NOW() - INTERVAL '7 days'
        
        UNION ALL
        
        SELECT 
          'project' as type,
          p.name as title,
          p.description,
          p.created_at,
          u.name as user_name
        FROM projects p
        LEFT JOIN users u ON p.created_by = u.id
        WHERE p.created_at >= NOW() - INTERVAL '7 days'
        
        UNION ALL
        
        SELECT 
          'ticket' as type,
          t.title,
          t.description,
          t.created_at,
          u.name as user_name
        FROM tickets t
        LEFT JOIN users u ON t.created_by = u.id
        WHERE t.created_at >= NOW() - INTERVAL '7 days'
        
        ORDER BY created_at DESC
        LIMIT 10
      `);
      stats.recentActivities = recentActivitiesResult.rows;
    } catch (error) {
      console.error('Error getting recent activities:', error);
      stats.recentActivities = [];
    }

    // Estadísticas por rol
    stats.userStats = {
      total: stats.totalUsers,
      active: stats.totalUsers,
      inactive: 0,
      newThisMonth: stats.newUsersThisMonth
    };
    
    stats.projectStats = {
      total: stats.totalProjects,
      active: stats.activeProjects,
      completed: stats.completedProjects,
      newThisMonth: stats.newProjectsThisMonth
    };
    
    stats.quoteStats = {
      total: stats.totalQuotes,
      pending: stats.pendingQuotes,
      approved: stats.totalQuotes - stats.pendingQuotes,
      newThisMonth: stats.newQuotesThisMonth
    };
    
    stats.ticketStats = {
      total: stats.totalTickets,
      open: stats.openTickets,
      closed: stats.totalTickets - stats.openTickets,
      newThisMonth: stats.newTicketsThisMonth
    };

    console.log('✅ Estadísticas obtenidas exitosamente:', {
      totalUsers: stats.totalUsers,
      totalProjects: stats.totalProjects,
      totalQuotes: stats.totalQuotes,
      totalTickets: stats.totalTickets,
      totalClients: stats.totalClients
    });

    res.json(stats);
  } catch (error) {
    console.error('❌ Error getting dashboard stats:', error);
    res.status(500).json({ 
      error: 'Error al obtener estadísticas del dashboard',
      details: error.message 
    });
  }
};

// Obtener actividades recientes
exports.getRecentActivities = async (req, res) => {
  try {
    const { limit = 10, userId, role } = req.query;
    
    let activities = [];
    
    try {
      const activitiesResult = await pool.query(`
        SELECT 
          'quote' as type,
          q.quote_number as title,
          q.client_contact as description,
          q.created_at,
          u.name as user_name,
          q.status
        FROM quotes q
        LEFT JOIN users u ON q.created_by = u.id
        ORDER BY q.created_at DESC
        LIMIT $1
      `, [parseInt(limit)]);
      
      activities = activitiesResult.rows;
    } catch (error) {
      console.error('Error getting recent activities:', error);
      activities = [];
    }

    res.json(activities);
  } catch (error) {
    console.error('Error getting recent activities:', error);
    res.status(500).json({ error: 'Error al obtener actividades recientes' });
  }
};
