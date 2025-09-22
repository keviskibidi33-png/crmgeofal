const pool = require('../config/db');

// Obtener estadísticas del dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    
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
      ticketStats: {}
    };

    // Obtener estadísticas básicas
    const [
      usersResult,
      projectsResult,
      quotesResult,
      ticketsResult,
      clientsResult,
      evidencesResult
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users'),
      pool.query('SELECT COUNT(*) as count FROM projects'),
      pool.query('SELECT COUNT(*) as count FROM quotes'),
      pool.query('SELECT COUNT(*) as count FROM tickets'),
      pool.query('SELECT COUNT(*) as count FROM companies'),
      pool.query('SELECT COUNT(*) as count FROM evidences')
    ]);

    stats.totalUsers = parseInt(usersResult.rows[0].count);
    stats.totalProjects = parseInt(projectsResult.rows[0].count);
    stats.totalQuotes = parseInt(quotesResult.rows[0].count);
    stats.totalTickets = parseInt(ticketsResult.rows[0].count);
    stats.totalClients = parseInt(clientsResult.rows[0].count);
    stats.totalEvidences = parseInt(evidencesResult.rows[0].count);

    // Obtener estadísticas por estado (usando las columnas que existen)
    const [
      openTicketsResult
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) as count FROM tickets WHERE status = 'abierto'")
    ]);

    // Para proyectos y cotizaciones, usamos el total ya que no tienen columna status
    stats.activeProjects = stats.totalProjects; // Todos los proyectos se consideran activos
    stats.pendingQuotes = stats.totalQuotes; // Todas las cotizaciones se consideran pendientes
    stats.openTickets = parseInt(openTicketsResult.rows[0].count);
    stats.completedProjects = 0; // No hay columna status en projects

    // Obtener estadísticas de tendencias (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      newUsersResult,
      newProjectsResult,
      newQuotesResult,
      newTicketsResult
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users WHERE created_at >= $1', [thirtyDaysAgo]),
      pool.query('SELECT COUNT(*) as count FROM projects WHERE created_at >= $1', [thirtyDaysAgo]),
      pool.query('SELECT COUNT(*) as count FROM quotes WHERE created_at >= $1', [thirtyDaysAgo]),
      pool.query('SELECT COUNT(*) as count FROM tickets WHERE created_at >= $1', [thirtyDaysAgo])
    ]);

    stats.newUsersThisMonth = parseInt(newUsersResult.rows[0].count);
    stats.newProjectsThisMonth = parseInt(newProjectsResult.rows[0].count);
    stats.newQuotesThisMonth = parseInt(newQuotesResult.rows[0].count);
    stats.newTicketsThisMonth = parseInt(newTicketsResult.rows[0].count);

    // Estadísticas por rol (si no es admin, filtrar por usuario)
    if (userRole === 'admin') {
      // Admin ve todas las estadísticas
      stats.userStats = {
        total: stats.totalUsers,
        active: stats.totalUsers,
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
        newThisMonth: stats.newQuotesThisMonth
      };
      stats.ticketStats = {
        total: stats.totalTickets,
        open: stats.openTickets,
        newThisMonth: stats.newTicketsThisMonth
      };
    } else {
      // Otros roles ven solo sus estadísticas
      const [
        userProjectsResult,
        userQuotesResult,
        userTicketsResult
      ] = await Promise.all([
        pool.query('SELECT COUNT(*) as count FROM projects WHERE assigned_to = $1 AND deleted_at IS NULL', [userId]),
        pool.query('SELECT COUNT(*) as count FROM quotes WHERE assigned_to = $1 AND deleted_at IS NULL', [userId]),
        pool.query('SELECT COUNT(*) as count FROM tickets WHERE assigned_to = $1 AND deleted_at IS NULL', [userId])
      ]);

      stats.userStats = {
        total: 1, // Solo el usuario actual
        active: 1,
        newThisMonth: 0
      };
      stats.projectStats = {
        total: parseInt(userProjectsResult.rows[0].count),
        active: 0, // Se calculará por estado
        completed: 0,
        newThisMonth: 0
      };
      stats.quoteStats = {
        total: parseInt(userQuotesResult.rows[0].count),
        pending: 0,
        newThisMonth: 0
      };
      stats.ticketStats = {
        total: parseInt(userTicketsResult.rows[0].count),
        open: 0,
        newThisMonth: 0
      };
    }

    // Calcular porcentajes de cambio (simulado para demo)
    const calculateChangePercentage = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    // Simular datos anteriores para calcular tendencias
    const previousStats = {
      users: Math.max(0, stats.totalUsers - stats.newUsersThisMonth),
      projects: Math.max(0, stats.totalProjects - stats.newProjectsThisMonth),
      quotes: Math.max(0, stats.totalQuotes - stats.newQuotesThisMonth),
      tickets: Math.max(0, stats.totalTickets - stats.newTicketsThisMonth)
    };

    stats.changePercentages = {
      users: calculateChangePercentage(stats.totalUsers, previousStats.users),
      projects: calculateChangePercentage(stats.totalProjects, previousStats.projects),
      quotes: calculateChangePercentage(stats.totalQuotes, previousStats.quotes),
      tickets: calculateChangePercentage(stats.totalTickets, previousStats.tickets)
    };

    res.json({
      success: true,
      stats,
      userRole,
      lastUpdated: new Date().toISOString()
    });

  } catch (err) {
    console.error('Error getting dashboard stats:', err);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener estadísticas del dashboard' 
    });
  }
};
