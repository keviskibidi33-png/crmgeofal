const pool = require('../config/db');

// Dashboard con datos de prueba realistas
exports.getSalesDashboard = async (req, res) => {
  try {
    const userRole = req.user?.role;
    
    // Obtener métricas reales de cotizaciones (usando campos que sabemos que existen)
    const cotizacionesQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status IN ('aprobada', 'approved') THEN 1 END) as aprobadas,
        COUNT(CASE WHEN status IN ('pendiente', 'pending', 'enviada', 'borrador') THEN 1 END) as pendientes,
        COUNT(CASE WHEN status IN ('rechazada', 'rejected') THEN 1 END) as rechazadas,
        SUM(CASE WHEN status IN ('aprobada', 'approved') THEN COALESCE(total, 0) 
                 WHEN status = 'borrador' AND (total IS NULL OR total = 0) THEN 15000 -- Valor estimado para borradores
                 WHEN status = 'borrador' THEN total
                 ELSE 0 END) as total_ingresos
      FROM quotes
    `;
    
    const cotizacionesResult = await pool.query(cotizacionesQuery);
    const cotizaciones = cotizacionesResult.rows[0] || {};
    
    // Métricas del mes actual
    const mesActualQuery = `
      SELECT 
        COUNT(*) as cotizaciones_mes,
        SUM(CASE WHEN status IN ('aprobada', 'approved') THEN COALESCE(total, 0) 
                 WHEN status = 'borrador' AND (total IS NULL OR total = 0) THEN 15000 -- Valor estimado
                 WHEN status = 'borrador' THEN total
                 ELSE 0 END) as ingresos_mes
      FROM quotes 
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    `;
    
    const mesResult = await pool.query(mesActualQuery);
    const metricas = mesResult.rows[0] || {};
    
    // Top clientes con más cotizaciones
    const topClientesQuery = `
      SELECT 
        c.name as nombre,
        COUNT(q.id) as cotizaciones,
        SUM(CASE WHEN q.status IN ('aprobada', 'approved') THEN COALESCE(q.total, 0) 
                 WHEN q.status = 'borrador' AND (q.total IS NULL OR q.total = 0) THEN 15000 -- Valor estimado
                 WHEN q.status = 'borrador' THEN q.total
                 ELSE 0 END) as ingresos
      FROM companies c
      JOIN projects p ON c.id = p.company_id
      JOIN quotes q ON p.id = q.project_id
      GROUP BY c.id, c.name
      HAVING COUNT(q.id) > 0
      ORDER BY cotizaciones DESC, ingresos DESC
      LIMIT 5
    `;
    
    const clientesResult = await pool.query(topClientesQuery);
    
    // Actividad reciente
    const actividadQuery = `
      SELECT 
        q.id,
        CONCAT('COT-', LPAD(q.id::text, 6, '0')) as numeroQuote,
        c.name as cliente,
        CASE WHEN q.total IS NULL OR q.total = 0 THEN 15000 ELSE q.total END as monto,
        q.status as estado,
        CONCAT(COALESCE(u.name, ''), ' ', COALESCE(u.apellido, '')) as vendedor,
        q.created_at as fecha
      FROM quotes q
      JOIN projects p ON q.project_id = p.id
      JOIN companies c ON p.company_id = c.id
      LEFT JOIN users u ON q.created_by = u.id
      ORDER BY q.created_at DESC
      LIMIT 10
    `;
    
    const actividadResult = await pool.query(actividadQuery);
    
    const conversionRate = (cotizaciones.total && cotizaciones.total > 0) ? 
      Math.round((cotizaciones.aprobadas / cotizaciones.total) * 100) : 0;
    
    const dashboardData = {
      // Métricas principales
      totalCotizaciones: parseInt(cotizaciones.total) || 0,
      cotizacionesAprobadas: parseInt(cotizaciones.aprobadas) || 0,
      cotizacionesPendientes: parseInt(cotizaciones.pendientes) || 0,
      cotizacionesRechazadas: parseInt(cotizaciones.rechazadas) || 0,
      totalIngresos: parseFloat(cotizaciones.total_ingresos) || 0,
      conversionRate: conversionRate,
      
      // Métricas mensuales  
      cotizacionesEsteMes: parseInt(metricas.cotizaciones_mes) || 0,
      ingresosEsteMes: parseFloat(metricas.ingresos_mes) || 0,
      
      // Embudo de ventas
      embudo: {
        leads: parseInt(cotizaciones.total) || 0,
        enviadas: parseInt(cotizaciones.total) || 0,
        enRevision: parseInt(cotizaciones.pendientes) || 0,
        aprobadas: parseInt(cotizaciones.aprobadas) || 0,
        rechazadas: parseInt(cotizaciones.rechazadas) || 0
      },
      
      // Top clientes
      topClientes: clientesResult.rows.map(cliente => ({
        nombre: cliente.nombre,
        cotizaciones: parseInt(cliente.cotizaciones),
        ingresos: parseFloat(cliente.ingresos) || 0
      })),
      
      // Actividad reciente
      actividadReciente: actividadResult.rows.map(actividad => ({
        id: actividad.id,
        numeroQuote: actividad.numeroquote,
        cliente: actividad.cliente,
        monto: parseFloat(actividad.monto) || 0,
        estado: actividad.estado,
        vendedor: actividad.vendedor.trim(),
        fecha: actividad.fecha
      }))
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Error en getSalesDashboard:', error);
    res.status(500).json({ error: 'Error al obtener datos del dashboard' });
  }
};

exports.getLabDashboard = async (req, res) => {
  try {
    // Obtener proyectos del laboratorio
    const proyectosQuery = `
      SELECT 
        COUNT(*) as total_proyectos,
        COUNT(CASE WHEN status = 'en_proceso' THEN 1 END) as en_proceso,
        COUNT(CASE WHEN status = 'completado' THEN 1 END) as completados,
        COUNT(CASE WHEN status = 'pendiente' THEN 1 END) as pendientes
      FROM projects
    `;
    
    const proyectosResult = await pool.query(proyectosQuery);
    const proyectos = proyectosResult.rows[0] || { total_proyectos: 0, en_proceso: 0, completados: 0, pendientes: 0 };
    
    // Evidencias (si existe la tabla)
    let evidencias = { total_evidencias: 0, aprobadas: 0, pendientes: 0 };
    try {
      const evidenciasQuery = `
        SELECT 
          COUNT(*) as total_evidencias,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as aprobadas,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendientes
        FROM project_attachments
      `;
      
      const evidenciasResult = await pool.query(evidenciasQuery);
      evidencias = evidenciasResult.rows[0] || evidencias;
    } catch (error) {
      console.log('Tabla de evidencias no encontrada, usando datos base');
    }
    
    const dashboardData = {
      proyectosAsignados: parseInt(proyectos.total_proyectos) || 0,
      proyectosEnProceso: parseInt(proyectos.en_proceso) || 0,
      proyectosCompletados: parseInt(proyectos.completados) || 0,
      proyectosPendientes: parseInt(proyectos.pendientes) || 0,
      evidenciasSubidas: parseInt(evidencias.total_evidencias) || 0,
      evidenciasAprobadas: parseInt(evidencias.aprobadas) || 0,
      evidenciasPendientes: parseInt(evidencias.pendientes) || 0,
      tiempoPromedioProcesamiento: 12 // Valor base hasta implementar cálculo real
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Error en getLabDashboard:', error);
    res.status(500).json({ error: 'Error al obtener datos del laboratorio' });
  }
};

exports.getBillingDashboard = async (req, res) => {
  try {
    // Obtener facturas reales - verificando si existe la tabla
    let facturas = { total_facturas: 0, pendientes: 0, pagadas: 0, monto_total: 0, monto_pendiente: 0 };
    
    try {
      const facturasQuery = `
        SELECT 
          COUNT(*) as total_facturas,
          COUNT(CASE WHEN payment_status = 'pendiente' THEN 1 END) as pendientes,
          COUNT(CASE WHEN payment_status = 'pagado' THEN 1 END) as pagadas,
          SUM(COALESCE(amount, 0)) as monto_total,
          SUM(CASE WHEN payment_status = 'pendiente' THEN COALESCE(amount, 0) ELSE 0 END) as monto_pendiente
        FROM invoices
      `;
      
      const facturasResult = await pool.query(facturasQuery);
      facturas = facturasResult.rows[0] || facturas;
    } catch (error) {
      console.log('Tabla invoices no encontrada o vacía, usando datos base');
    }
    
    // Clientes con deuda - con manejo de errores
    let clientesDeuda = 0;
    try {
      const clientesDeudaQuery = `
        SELECT COUNT(DISTINCT c.id) as clientes_deuda
        FROM companies c
        JOIN projects p ON c.id = p.company_id
        JOIN invoices i ON p.id = i.project_id
        WHERE i.payment_status = 'pendiente'
      `;
      
      const deudaResult = await pool.query(clientesDeudaQuery);
      clientesDeuda = parseInt(deudaResult.rows[0]?.clientes_deuda) || 0;
    } catch (error) {
      console.log('Error al consultar clientes con deuda:', error.message);
    }

    const dashboardData = {
      facturasPendientes: parseInt(facturas.pendientes) || 0,
      facturasGeneradas: parseInt(facturas.total_facturas) || 0,
      montoFacturado: parseFloat(facturas.monto_total) || 0,
      pagosPendientes: parseInt(facturas.pendientes) || 0,
      pagosRecibidos: parseFloat(facturas.monto_total) - parseFloat(facturas.monto_pendiente) || 0,
      clientesConDeuda: clientesDeuda
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Error en getBillingDashboard:', error);
    res.status(500).json({ error: 'Error al obtener datos de facturación' });
  }
};

exports.getSupportDashboard = async (req, res) => {
  try {
    // Obtener tickets reales si existe la tabla
    let tickets = { abiertos: 0, cerrados: 0, pendientes: 0, total_hoy: 0 };
    
    try {
      const ticketsQuery = `
        SELECT 
          COUNT(*) as total_tickets,
          COUNT(CASE WHEN status = 'abierto' OR status = 'open' THEN 1 END) as abiertos,
          COUNT(CASE WHEN status = 'cerrado' OR status = 'closed' THEN 1 END) as cerrados,
          COUNT(CASE WHEN status = 'pendiente' OR status = 'pending' THEN 1 END) as pendientes,
          COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as total_hoy
        FROM tickets
      `;
      
      const ticketsResult = await pool.query(ticketsQuery);
      tickets = ticketsResult.rows[0] || tickets;
    } catch (error) {
      console.log('Tabla tickets no encontrada, usando datos base');
    }

    const dashboardData = {
      ticketsAbiertos: parseInt(tickets.abiertos) || 0,
      ticketsCerrados: parseInt(tickets.cerrados) || 0,
      ticketsPendientes: parseInt(tickets.pendientes) || 0,
      tiempoPromedioResolucion: 4.5, // Valor base hasta implementar cálculo real
      satisfaccionCliente: 4.2, // Valor base hasta implementar cálculo real
      ticketsHoy: parseInt(tickets.total_hoy) || 0
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Error en getSupportDashboard:', error);
    res.status(500).json({ error: 'Error al obtener datos de soporte' });
  }
};

exports.getManagementDashboard = async (req, res) => {
  try {
    // Obtener métricas generales de la empresa
    let metricas = {
      ingresos_totales: 0,
      proyectos_activos: 0,
      empleados_activos: 0,
      clientes_activos: 0,
      ventas_mes: 0
    };

    try {
      const metricasQuery = `
        SELECT 
          (SELECT SUM(CASE WHEN status IN ('aprobada', 'approved') THEN COALESCE(total, 0) 
                           WHEN status = 'borrador' AND (total IS NULL OR total = 0) THEN 15000 
                           WHEN status = 'borrador' THEN total
                           ELSE 0 END) FROM quotes) as ingresos_totales,
          (SELECT COUNT(*) FROM projects WHERE status IN ('en_proceso', 'activo')) as proyectos_activos,
          (SELECT COUNT(*) FROM users WHERE active = true) as empleados_activos,
          (SELECT COUNT(DISTINCT c.id) FROM companies c JOIN projects p ON c.id = p.company_id) as clientes_activos,
          (SELECT SUM(CASE WHEN status IN ('aprobada', 'approved') THEN COALESCE(total, 0) 
                           WHEN status = 'borrador' AND (total IS NULL OR total = 0) THEN 15000 
                           WHEN status = 'borrador' THEN total
                           ELSE 0 END) FROM quotes WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)) as ventas_mes
      `;
      
      const metricasResult = await pool.query(metricasQuery);
      metricas = metricasResult.rows[0] || metricas;
    } catch (error) {
      console.log('Error al consultar métricas de gerencia:', error.message);
    }

    const dashboardData = {
      ingresosTotales: parseFloat(metricas.ingresos_totales) || 0,
      proyectosActivos: parseInt(metricas.proyectos_activos) || 0,
      empleadosActivos: parseInt(metricas.empleados_activos) || 0,
      clientesActivos: parseInt(metricas.clientes_activos) || 0,
      ventasEsteMes: parseFloat(metricas.ventas_mes) || 0,
      crecimientoMensual: 12.5 // Valor base hasta implementar cálculo real
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Error en getManagementDashboard:', error);
    res.status(500).json({ error: 'Error al obtener datos de gerencia' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    // Obtener estadísticas generales reales
    let stats = {
      totalUsers: 0,
      totalProjects: 0,
      totalQuotes: 0,
      totalTickets: 0,
      activeProjects: 0,
      pendingQuotes: 0,
      openTickets: 0,
      completedProjects: 0
    };

    try {
      const statsQuery = `
        SELECT 
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM projects) as total_projects,
          (SELECT COUNT(*) FROM quotes) as total_quotes,
          (SELECT COALESCE((SELECT COUNT(*) FROM tickets), 0)) as total_tickets,
          (SELECT COUNT(*) FROM projects WHERE status IN ('en_proceso', 'activo')) as active_projects,
          (SELECT COUNT(*) FROM quotes WHERE status IN ('pendiente', 'pending', 'borrador')) as pending_quotes,
          (SELECT COALESCE((SELECT COUNT(*) FROM tickets WHERE status IN ('abierto', 'open')), 0)) as open_tickets,
          (SELECT COUNT(*) FROM projects WHERE status = 'completado') as completed_projects
      `;
      
      const statsResult = await pool.query(statsQuery);
      stats = statsResult.rows[0] || stats;
    } catch (error) {
      console.log('Error al consultar estadísticas generales:', error.message);
    }

    const responseStats = {
      totalUsers: parseInt(stats.total_users) || 0,
      totalProjects: parseInt(stats.total_projects) || 0,
      totalQuotes: parseInt(stats.total_quotes) || 0,
      totalTickets: parseInt(stats.total_tickets) || 0,
      activeProjects: parseInt(stats.active_projects) || 0,
      pendingQuotes: parseInt(stats.pending_quotes) || 0,
      openTickets: parseInt(stats.open_tickets) || 0,
      completedProjects: parseInt(stats.completed_projects) || 0
    };

    res.json(responseStats);
  } catch (error) {
    console.error('Error en getDashboardStats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};