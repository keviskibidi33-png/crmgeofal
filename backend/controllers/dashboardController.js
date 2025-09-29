const pool = require('../config/db');

// Obtener estadísticas del dashboard (versión simplificada)
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

    // Obtener estadísticas básicas con manejo de errores individual
    try {
      const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
      stats.totalUsers = parseInt(usersResult.rows[0].count);
    } catch (error) {
      console.error('Error getting users count:', error);
      stats.totalUsers = 0;
    }

    try {
      const projectsResult = await pool.query('SELECT COUNT(*) as count FROM projects');
      stats.totalProjects = parseInt(projectsResult.rows[0].count);
    } catch (error) {
      console.error('Error getting projects count:', error);
      stats.totalProjects = 0;
    }

    try {
      const quotesResult = await pool.query('SELECT COUNT(*) as count FROM quotes');
      stats.totalQuotes = parseInt(quotesResult.rows[0].count);
    } catch (error) {
      console.error('Error getting quotes count:', error);
      stats.totalQuotes = 0;
    }

    try {
      const ticketsResult = await pool.query('SELECT COUNT(*) as count FROM tickets');
      stats.totalTickets = parseInt(ticketsResult.rows[0].count);
    } catch (error) {
      console.error('Error getting tickets count:', error);
      stats.totalTickets = 0;
    }

    try {
      const clientsResult = await pool.query('SELECT COUNT(*) as count FROM companies');
      stats.totalClients = parseInt(clientsResult.rows[0].count);
    } catch (error) {
      console.error('Error getting clients count:', error);
      stats.totalClients = 0;
    }

    try {
      const evidencesResult = await pool.query('SELECT COUNT(*) as count FROM evidences');
      stats.totalEvidences = parseInt(evidencesResult.rows[0].count);
    } catch (error) {
      console.error('Error getting evidences count:', error);
      stats.totalEvidences = 0;
    }

    // Obtener estadísticas por estado
    try {
      const openTicketsResult = await pool.query("SELECT COUNT(*) as count FROM tickets WHERE status = 'abierto'");
      stats.openTickets = parseInt(openTicketsResult.rows[0].count);
    } catch (error) {
      console.error('Error getting open tickets count:', error);
      stats.openTickets = 0;
    }

    // Para proyectos y cotizaciones, usamos el total ya que no tienen columna status
    stats.activeProjects = stats.totalProjects;
    stats.pendingQuotes = stats.totalQuotes;
    stats.completedProjects = 0;

    // Obtener estadísticas de tendencias (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      const newUsersResult = await pool.query('SELECT COUNT(*) as count FROM users WHERE created_at >= $1', [thirtyDaysAgo]);
      stats.newUsersThisMonth = parseInt(newUsersResult.rows[0].count);
    } catch (error) {
      console.error('Error getting new users count:', error);
      stats.newUsersThisMonth = 0;
    }

    try {
      const newProjectsResult = await pool.query('SELECT COUNT(*) as count FROM projects WHERE created_at >= $1', [thirtyDaysAgo]);
      stats.newProjectsThisMonth = parseInt(newProjectsResult.rows[0].count);
    } catch (error) {
      console.error('Error getting new projects count:', error);
      stats.newProjectsThisMonth = 0;
    }

    try {
      const newQuotesResult = await pool.query('SELECT COUNT(*) as count FROM quotes WHERE created_at >= $1', [thirtyDaysAgo]);
      stats.newQuotesThisMonth = parseInt(newQuotesResult.rows[0].count);
    } catch (error) {
      console.error('Error getting new quotes count:', error);
      stats.newQuotesThisMonth = 0;
    }

    try {
      const newTicketsResult = await pool.query('SELECT COUNT(*) as count FROM tickets WHERE created_at >= $1', [thirtyDaysAgo]);
      stats.newTicketsThisMonth = parseInt(newTicketsResult.rows[0].count);
    } catch (error) {
      console.error('Error getting new tickets count:', error);
      stats.newTicketsThisMonth = 0;
    }

    // Obtener cotizaciones recientes
    try {
      const recentQuotesResult = await pool.query(`
        SELECT q.id, q.quote_number, q.client_contact as client_name, q.total_amount, q.status, q.created_at
        FROM quotes q
        ORDER BY q.created_at DESC
        LIMIT 5
      `);
      stats.recentQuotes = recentQuotesResult.rows;
    } catch (error) {
      console.error('Error getting recent quotes:', error);
      stats.recentQuotes = [];
    }

    // Estadísticas por rol (simplificado)
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
      approved: 0,
      newThisMonth: stats.newQuotesThisMonth
    };
    stats.ticketStats = {
      total: stats.totalTickets,
      open: stats.openTickets,
      closed: stats.totalTickets - stats.openTickets,
      newThisMonth: stats.newTicketsThisMonth
    };

    res.json(stats);
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ error: error.message });
  }
};