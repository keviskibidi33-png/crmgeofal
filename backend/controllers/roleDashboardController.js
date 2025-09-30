const pool = require('../config/db');

// Dashboard para Jefa Comercial - Métricas de embudo y gestión de vendedores
exports.getJefaComercialDashboard = async (req, res) => {
  try {
    const userId = req.user?.id;
    console.log('📊 Jefa Comercial Dashboard - Usuario:', userId);

    const stats = {
      // Métricas generales
      totalVendedores: 0,
      totalCotizaciones: 0,
      cotizacionesAprobadas: 0,
      cotizacionesFacturadas: 0,
      totalIngresos: 0,
      
      // Métricas de embudo por categoría
      embudoPorCategoria: {},
      
      // Rendimiento de vendedores
      rendimientoVendedores: [],
      
      // Cotizaciones recientes
      cotizacionesRecientes: [],
      
      // Métricas mensuales
      cotizacionesEsteMes: 0,
      ingresosEsteMes: 0,
      conversionRate: 0
    };

    // Obtener total de vendedores comerciales
    const vendedoresResult = await pool.query(
      "SELECT COUNT(*) as total FROM users WHERE role = 'vendedor_comercial' AND active = true"
    );
    stats.totalVendedores = parseInt(vendedoresResult.rows[0].total);

    // Obtener métricas de cotizaciones
    const cotizacionesResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'aprobada' THEN 1 ELSE 0 END) as aprobadas,
        SUM(CASE WHEN status = 'facturada' THEN 1 ELSE 0 END) as facturadas,
        SUM(CASE WHEN status = 'aprobada' THEN total_amount ELSE 0 END) as ingresos_aprobadas,
        SUM(CASE WHEN status = 'facturada' THEN total_amount ELSE 0 END) as ingresos_facturadas
      FROM quotes
    `);
    
    const cotizaciones = cotizacionesResult.rows[0];
    stats.totalCotizaciones = parseInt(cotizaciones.total);
    stats.cotizacionesAprobadas = parseInt(cotizaciones.aprobadas);
    stats.cotizacionesFacturadas = parseInt(cotizaciones.facturadas);
    stats.totalIngresos = parseFloat(cotizaciones.ingresos_aprobadas || 0) + parseFloat(cotizaciones.ingresos_facturadas || 0);

    // Métricas de embudo por categoría de servicios
    const embudoResult = await pool.query(`
      SELECT 
        s.name as categoria,
        COUNT(q.id) as total_cotizaciones,
        SUM(CASE WHEN q.status = 'aprobada' THEN 1 ELSE 0 END) as aprobadas,
        SUM(CASE WHEN q.status = 'facturada' THEN 1 ELSE 0 END) as facturadas,
        SUM(CASE WHEN q.status = 'aprobada' THEN q.total_amount ELSE 0 END) as ingresos
      FROM services s
      LEFT JOIN quote_items qi ON s.id = qi.service_id
      LEFT JOIN quotes q ON qi.quote_id = q.id
      GROUP BY s.id, s.name
      ORDER BY total_cotizaciones DESC
    `);
    
    stats.embudoPorCategoria = embudoResult.rows.map(row => ({
      categoria: row.categoria,
      total: parseInt(row.total_cotizaciones),
      aprobadas: parseInt(row.aprobadas),
      facturadas: parseInt(row.facturadas),
      ingresos: parseFloat(row.ingresos || 0),
      conversionRate: row.total_cotizaciones > 0 ? (row.aprobadas / row.total_cotizaciones * 100).toFixed(1) : 0
    }));

    // Rendimiento de vendedores
    const vendedoresResult = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.apellido,
        COUNT(q.id) as total_cotizaciones,
        SUM(CASE WHEN q.status = 'aprobada' THEN 1 ELSE 0 END) as cotizaciones_aprobadas,
        SUM(CASE WHEN q.status = 'facturada' THEN 1 ELSE 0 END) as cotizaciones_facturadas,
        SUM(CASE WHEN q.status = 'aprobada' THEN q.total_amount ELSE 0 END) as ingresos_generados
      FROM users u
      LEFT JOIN quotes q ON u.id = q.created_by
      WHERE u.role = 'vendedor_comercial' AND u.active = true
      GROUP BY u.id, u.name, u.apellido
      ORDER BY ingresos_generados DESC
    `);
    
    stats.rendimientoVendedores = vendedoresResult.rows.map(row => ({
      id: row.id,
      nombre: `${row.name} ${row.apellido}`,
      totalCotizaciones: parseInt(row.total_cotizaciones),
      cotizacionesAprobadas: parseInt(row.cotizaciones_aprobadas),
      cotizacionesFacturadas: parseInt(row.cotizaciones_facturadas),
      ingresosGenerados: parseFloat(row.ingresos_generados || 0),
      conversionRate: row.total_cotizaciones > 0 ? (row.cotizaciones_aprobadas / row.total_cotizaciones * 100).toFixed(1) : 0
    }));

    // Cotizaciones recientes
    const cotizacionesRecientesResult = await pool.query(`
      SELECT 
        q.id,
        q.quote_number,
        q.client_contact,
        q.total_amount,
        q.status,
        q.created_at,
        c.name as company_name,
        u.name as created_by_name
      FROM quotes q
      LEFT JOIN companies c ON q.company_id = c.id
      LEFT JOIN users u ON q.created_by = u.id
      ORDER BY q.created_at DESC
      LIMIT 10
    `);
    
    stats.cotizacionesRecientes = cotizacionesRecientesResult.rows;

    // Métricas del mes actual
    const mesActual = new Date();
    mesActual.setDate(1);
    
    const metricasMesResult = await pool.query(`
      SELECT 
        COUNT(*) as cotizaciones_mes,
        SUM(CASE WHEN status = 'aprobada' THEN total_amount ELSE 0 END) as ingresos_mes
      FROM quotes 
      WHERE created_at >= $1
    `, [mesActual]);
    
    stats.cotizacionesEsteMes = parseInt(metricasMesResult.rows[0].cotizaciones_mes);
    stats.ingresosEsteMes = parseFloat(metricasMesResult.rows[0].ingresos_mes || 0);
    stats.conversionRate = stats.totalCotizaciones > 0 ? (stats.cotizacionesAprobadas / stats.totalCotizaciones * 100).toFixed(1) : 0;

    res.json(stats);
  } catch (error) {
    console.error('Error en dashboard Jefa Comercial:', error);
    res.status(500).json({ error: 'Error al obtener métricas de Jefa Comercial' });
  }
};

// Dashboard para Vendedor Comercial - Métricas personales
exports.getVendedorComercialDashboard = async (req, res) => {
  try {
    const userId = req.user?.id;
    console.log('📊 Vendedor Comercial Dashboard - Usuario:', userId);

    const stats = {
      // Métricas personales
      misCotizaciones: 0,
      cotizacionesAprobadas: 0,
      cotizacionesFacturadas: 0,
      ingresosGenerados: 0,
      
      // Clientes
      totalClientes: 0,
      clientesNuevosEsteMes: 0,
      
      // Proyectos
      proyectosActivos: 0,
      proyectosCompletados: 0,
      
      // Métricas mensuales
      cotizacionesEsteMes: 0,
      ingresosEsteMes: 0,
      conversionRate: 0,
      
      // Datos recientes
      cotizacionesRecientes: [],
      clientesRecientes: [],
      proyectosRecientes: []
    };

    // Métricas de cotizaciones personales
    const cotizacionesResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'aprobada' THEN 1 ELSE 0 END) as aprobadas,
        SUM(CASE WHEN status = 'facturada' THEN 1 ELSE 0 END) as facturadas,
        SUM(CASE WHEN status = 'aprobada' THEN total_amount ELSE 0 END) as ingresos_aprobadas,
        SUM(CASE WHEN status = 'facturada' THEN total_amount ELSE 0 END) as ingresos_facturadas
      FROM quotes 
      WHERE created_by = $1
    `, [userId]);
    
    const cotizaciones = cotizacionesResult.rows[0];
    stats.misCotizaciones = parseInt(cotizaciones.total);
    stats.cotizacionesAprobadas = parseInt(cotizaciones.aprobadas);
    stats.cotizacionesFacturadas = parseInt(cotizaciones.facturadas);
    stats.ingresosGenerados = parseFloat(cotizaciones.ingresos_aprobadas || 0) + parseFloat(cotizaciones.ingresos_facturadas || 0);

    // Métricas de clientes
    const clientesResult = await pool.query(`
      SELECT 
        COUNT(DISTINCT company_id) as total_clientes
      FROM quotes 
      WHERE created_by = $1
    `, [userId]);
    
    stats.totalClientes = parseInt(clientesResult.rows[0].total_clientes);

    // Clientes nuevos este mes
    const mesActual = new Date();
    mesActual.setDate(1);
    
    const clientesNuevosResult = await pool.query(`
      SELECT 
        COUNT(DISTINCT company_id) as clientes_nuevos
      FROM quotes 
      WHERE created_by = $1 AND created_at >= $2
    `, [userId, mesActual]);
    
    stats.clientesNuevosEsteMes = parseInt(clientesNuevosResult.rows[0].clientes_nuevos);

    // Métricas de proyectos
    const proyectosResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'activo' THEN 1 ELSE 0 END) as activos,
        SUM(CASE WHEN status = 'completado' THEN 1 ELSE 0 END) as completados
      FROM projects p
      LEFT JOIN quotes q ON p.id = q.project_id
      WHERE q.created_by = $1
    `, [userId]);
    
    const proyectos = proyectosResult.rows[0];
    stats.proyectosActivos = parseInt(proyectos.activos);
    stats.proyectosCompletados = parseInt(proyectos.completados);

    // Métricas del mes actual
    const metricasMesResult = await pool.query(`
      SELECT 
        COUNT(*) as cotizaciones_mes,
        SUM(CASE WHEN status = 'aprobada' THEN total_amount ELSE 0 END) as ingresos_mes
      FROM quotes 
      WHERE created_by = $1 AND created_at >= $2
    `, [userId, mesActual]);
    
    stats.cotizacionesEsteMes = parseInt(metricasMesResult.rows[0].cotizaciones_mes);
    stats.ingresosEsteMes = parseFloat(metricasMesResult.rows[0].ingresos_mes || 0);
    stats.conversionRate = stats.misCotizaciones > 0 ? (stats.cotizacionesAprobadas / stats.misCotizaciones * 100).toFixed(1) : 0;

    // Cotizaciones recientes personales
    const cotizacionesRecientesResult = await pool.query(`
      SELECT 
        q.id,
        q.quote_number,
        q.client_contact,
        q.total_amount,
        q.status,
        q.created_at,
        c.name as company_name
      FROM quotes q
      LEFT JOIN companies c ON q.company_id = c.id
      WHERE q.created_by = $1
      ORDER BY q.created_at DESC
      LIMIT 5
    `, [userId]);
    
    stats.cotizacionesRecientes = cotizacionesRecientesResult.rows;

    // Clientes recientes
    const clientesRecientesResult = await pool.query(`
      SELECT DISTINCT
        c.id,
        c.name,
        c.ruc,
        MAX(q.created_at) as ultima_cotizacion
      FROM companies c
      LEFT JOIN quotes q ON c.id = q.company_id
      WHERE q.created_by = $1
      GROUP BY c.id, c.name, c.ruc
      ORDER BY ultima_cotizacion DESC
      LIMIT 5
    `, [userId]);
    
    stats.clientesRecientes = clientesRecientesResult.rows;

    // Proyectos recientes
    const proyectosRecientesResult = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.status,
        p.created_at,
        c.name as company_name
      FROM projects p
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN quotes q ON p.id = q.project_id
      WHERE q.created_by = $1
      ORDER BY p.created_at DESC
      LIMIT 5
    `, [userId]);
    
    stats.proyectosRecientes = proyectosRecientesResult.rows;

    res.json(stats);
  } catch (error) {
    console.error('Error en dashboard Vendedor Comercial:', error);
    res.status(500).json({ error: 'Error al obtener métricas de Vendedor Comercial' });
  }
};

// Dashboard para Laboratorio - Proyectos y evidencias
exports.getLaboratorioDashboard = async (req, res) => {
  try {
    const userId = req.user?.id;
    console.log('📊 Laboratorio Dashboard - Usuario:', userId);

    const stats = {
      // Proyectos
      proyectosAsignados: 0,
      proyectosEnProceso: 0,
      proyectosCompletados: 0,
      
      // Evidencias
      evidenciasSubidas: 0,
      evidenciasEsteMes: 0,
      
      // Envíos
      enviosRecibidos: 0,
      enviosEnProceso: 0,
      enviosCompletados: 0,
      
      // Métricas mensuales
      proyectosNuevosEsteMes: 0,
      evidenciasEsteMes: 0,
      
      // Datos recientes
      proyectosRecientes: [],
      evidenciasRecientes: [],
      enviosRecientes: []
    };

    // Métricas de proyectos
    const proyectosResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'activo' THEN 1 ELSE 0 END) as activos,
        SUM(CASE WHEN status = 'completado' THEN 1 ELSE 0 END) as completados
      FROM projects
      WHERE status IN ('activo', 'completado')
    `);
    
    const proyectos = proyectosResult.rows[0];
    stats.proyectosAsignados = parseInt(proyectos.total);
    stats.proyectosEnProceso = parseInt(proyectos.activos);
    stats.proyectosCompletados = parseInt(proyectos.completados);

    // Métricas de evidencias
    const evidenciasResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 ELSE 0 END) as este_mes
      FROM project_evidence
    `);
    
    const evidencias = evidenciasResult.rows[0];
    stats.evidenciasSubidas = parseInt(evidencias.total);
    stats.evidenciasEsteMes = parseInt(evidencias.este_mes);

    // Métricas de envíos (si existe la tabla shipments)
    try {
      const enviosResult = await pool.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'recibido' THEN 1 ELSE 0 END) as recibidos,
          SUM(CASE WHEN status = 'en_proceso' THEN 1 ELSE 0 END) as en_proceso,
          SUM(CASE WHEN status = 'completado' THEN 1 ELSE 0 END) as completados
        FROM shipments
      `);
      
      const envios = enviosResult.rows[0];
      stats.enviosRecibidos = parseInt(envios.recibidos);
      stats.enviosEnProceso = parseInt(envios.en_proceso);
      stats.enviosCompletados = parseInt(envios.completados);
    } catch (error) {
      console.log('Tabla shipments no existe, omitiendo métricas de envíos');
    }

    // Proyectos nuevos este mes
    const mesActual = new Date();
    mesActual.setDate(1);
    
    const proyectosNuevosResult = await pool.query(`
      SELECT COUNT(*) as proyectos_nuevos
      FROM projects 
      WHERE created_at >= $1
    `, [mesActual]);
    
    stats.proyectosNuevosEsteMes = parseInt(proyectosNuevosResult.rows[0].proyectos_nuevos);

    // Proyectos recientes
    const proyectosRecientesResult = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.status,
        p.created_at,
        c.name as company_name,
        u.name as created_by_name
      FROM projects p
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN users u ON p.created_by = u.id
      ORDER BY p.created_at DESC
      LIMIT 5
    `);
    
    stats.proyectosRecientes = proyectosRecientesResult.rows;

    // Evidencias recientes
    const evidenciasRecientesResult = await pool.query(`
      SELECT 
        pe.id,
        pe.notes,
        pe.created_at,
        p.name as project_name,
        u.name as uploaded_by_name
      FROM project_evidence pe
      LEFT JOIN projects p ON pe.project_id = p.id
      LEFT JOIN users u ON pe.uploaded_by = u.id
      ORDER BY pe.created_at DESC
      LIMIT 5
    `);
    
    stats.evidenciasRecientes = evidenciasRecientesResult.rows;

    // Envíos recientes (si existe la tabla)
    try {
      const enviosRecientesResult = await pool.query(`
        SELECT 
          s.id,
          s.tracking_number,
          s.status,
          s.created_at,
          u.name as sender_name
        FROM shipments s
        LEFT JOIN users u ON s.sender_id = u.id
        ORDER BY s.created_at DESC
        LIMIT 5
      `);
      
      stats.enviosRecientes = enviosRecientesResult.rows;
    } catch (error) {
      stats.enviosRecientes = [];
    }

    res.json(stats);
  } catch (error) {
    console.error('Error en dashboard Laboratorio:', error);
    res.status(500).json({ error: 'Error al obtener métricas de Laboratorio' });
  }
};

// Dashboard para Facturación - Comprobantes y pagos
exports.getFacturacionDashboard = async (req, res) => {
  try {
    const userId = req.user?.id;
    console.log('📊 Facturación Dashboard - Usuario:', userId);

    const stats = {
      // Comprobantes
      comprobantesPendientes: 0,
      comprobantesAprobados: 0,
      comprobantesRechazados: 0,
      totalComprobantes: 0,
      
      // Pagos
      montoTotalPendiente: 0,
      montoTotalAprobado: 0,
      montoTotalRechazado: 0,
      
      // Métricas mensuales
      comprobantesEsteMes: 0,
      montoEsteMes: 0,
      
      // Datos recientes
      comprobantesRecientes: [],
      pagosRecientes: []
    };

    // Métricas de comprobantes de pago
    const comprobantesResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN status = 'aprobado' THEN 1 ELSE 0 END) as aprobados,
        SUM(CASE WHEN status = 'rechazado' THEN 1 ELSE 0 END) as rechazados,
        SUM(CASE WHEN status = 'pendiente' THEN amount ELSE 0 END) as monto_pendiente,
        SUM(CASE WHEN status = 'aprobado' THEN amount ELSE 0 END) as monto_aprobado,
        SUM(CASE WHEN status = 'rechazado' THEN amount ELSE 0 END) as monto_rechazado
      FROM payment_proofs
    `);
    
    const comprobantes = comprobantesResult.rows[0];
    stats.totalComprobantes = parseInt(comprobantes.total);
    stats.comprobantesPendientes = parseInt(comprobantes.pendientes);
    stats.comprobantesAprobados = parseInt(comprobantes.aprobados);
    stats.comprobantesRechazados = parseInt(comprobantes.rechazados);
    stats.montoTotalPendiente = parseFloat(comprobantes.monto_pendiente || 0);
    stats.montoTotalAprobado = parseFloat(comprobantes.monto_aprobado || 0);
    stats.montoTotalRechazado = parseFloat(comprobantes.monto_rechazado || 0);

    // Métricas del mes actual
    const mesActual = new Date();
    mesActual.setDate(1);
    
    const metricasMesResult = await pool.query(`
      SELECT 
        COUNT(*) as comprobantes_mes,
        SUM(amount) as monto_mes
      FROM payment_proofs 
      WHERE created_at >= $1
    `, [mesActual]);
    
    stats.comprobantesEsteMes = parseInt(metricasMesResult.rows[0].comprobantes_mes);
    stats.montoEsteMes = parseFloat(metricasMesResult.rows[0].monto_mes || 0);

    // Comprobantes recientes
    const comprobantesRecientesResult = await pool.query(`
      SELECT 
        pp.id,
        pp.amount,
        pp.status,
        pp.created_at,
        pp.rejection_reason,
        c.name as company_name,
        u.name as uploaded_by_name
      FROM payment_proofs pp
      LEFT JOIN companies c ON pp.company_id = c.id
      LEFT JOIN users u ON pp.uploaded_by = u.id
      ORDER BY pp.created_at DESC
      LIMIT 10
    `);
    
    stats.comprobantesRecientes = comprobantesRecientesResult.rows;

    // Pagos recientes (comprobantes aprobados)
    const pagosRecientesResult = await pool.query(`
      SELECT 
        pp.id,
        pp.amount,
        pp.approved_at,
        c.name as company_name,
        u.name as approved_by_name
      FROM payment_proofs pp
      LEFT JOIN companies c ON pp.company_id = c.id
      LEFT JOIN users u ON pp.approved_by = u.id
      WHERE pp.status = 'aprobado'
      ORDER BY pp.approved_at DESC
      LIMIT 10
    `);
    
    stats.pagosRecientes = pagosRecientesResult.rows;

    res.json(stats);
  } catch (error) {
    console.error('Error en dashboard Facturación:', error);
    res.status(500).json({ error: 'Error al obtener métricas de Facturación' });
  }
};

// Dashboard para Soporte - Tickets y resolución
exports.getSoporteDashboard = async (req, res) => {
  try {
    const userId = req.user?.id;
    console.log('📊 Soporte Dashboard - Usuario:', userId);

    const stats = {
      // Tickets
      ticketsAbiertos: 0,
      ticketsResueltos: 0,
      ticketsEnProceso: 0,
      totalTickets: 0,
      
      // Por prioridad
      ticketsAltaPrioridad: 0,
      ticketsMediaPrioridad: 0,
      ticketsBajaPrioridad: 0,
      
      // Tiempos de respuesta
      tiempoPromedioResolucion: 0,
      ticketsResueltosEsteMes: 0,
      
      // Datos recientes
      ticketsRecientes: [],
      ticketsPorResolver: []
    };

    // Métricas de tickets
    const ticketsResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'abierto' THEN 1 ELSE 0 END) as abiertos,
        SUM(CASE WHEN status = 'resuelto' THEN 1 ELSE 0 END) as resueltos,
        SUM(CASE WHEN status = 'en_proceso' THEN 1 ELSE 0 END) as en_proceso,
        SUM(CASE WHEN priority = 'alta' THEN 1 ELSE 0 END) as alta_prioridad,
        SUM(CASE WHEN priority = 'media' THEN 1 ELSE 0 END) as media_prioridad,
        SUM(CASE WHEN priority = 'baja' THEN 1 ELSE 0 END) as baja_prioridad
      FROM tickets
    `);
    
    const tickets = ticketsResult.rows[0];
    stats.totalTickets = parseInt(tickets.total);
    stats.ticketsAbiertos = parseInt(tickets.abiertos);
    stats.ticketsResueltos = parseInt(tickets.resueltos);
    stats.ticketsEnProceso = parseInt(tickets.en_proceso);
    stats.ticketsAltaPrioridad = parseInt(tickets.alta_prioridad);
    stats.ticketsMediaPrioridad = parseInt(tickets.media_prioridad);
    stats.ticketsBajaPrioridad = parseInt(tickets.baja_prioridad);

    // Tiempo promedio de resolución
    const tiempoResolucionResult = await pool.query(`
      SELECT 
        AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) as horas_promedio
      FROM tickets 
      WHERE status = 'resuelto' AND resolved_at IS NOT NULL
    `);
    
    stats.tiempoPromedioResolucion = parseFloat(tiempoResolucionResult.rows[0].horas_promedio || 0);

    // Tickets resueltos este mes
    const mesActual = new Date();
    mesActual.setDate(1);
    
    const ticketsMesResult = await pool.query(`
      SELECT COUNT(*) as resueltos_mes
      FROM tickets 
      WHERE status = 'resuelto' AND resolved_at >= $1
    `, [mesActual]);
    
    stats.ticketsResueltosEsteMes = parseInt(ticketsMesResult.rows[0].resueltos_mes);

    // Tickets recientes
    const ticketsRecientesResult = await pool.query(`
      SELECT 
        t.id,
        t.title,
        t.status,
        t.priority,
        t.created_at,
        u.name as created_by_name
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
      LIMIT 10
    `);
    
    stats.ticketsRecientes = ticketsRecientesResult.rows;

    // Tickets por resolver (abiertos y en proceso)
    const ticketsPorResolverResult = await pool.query(`
      SELECT 
        t.id,
        t.title,
        t.status,
        t.priority,
        t.created_at,
        u.name as created_by_name
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.status IN ('abierto', 'en_proceso')
      ORDER BY 
        CASE t.priority 
          WHEN 'alta' THEN 1 
          WHEN 'media' THEN 2 
          WHEN 'baja' THEN 3 
        END,
        t.created_at ASC
      LIMIT 10
    `);
    
    stats.ticketsPorResolver = ticketsPorResolverResult.rows;

    res.json(stats);
  } catch (error) {
    console.error('Error en dashboard Soporte:', error);
    res.status(500).json({ error: 'Error al obtener métricas de Soporte' });
  }
};

// Dashboard para Gerencia - KPIs ejecutivos
exports.getGerenciaDashboard = async (req, res) => {
  try {
    const userId = req.user?.id;
    console.log('📊 Gerencia Dashboard - Usuario:', userId);

    const stats = {
      // KPIs generales
      totalUsuarios: 0,
      totalProyectos: 0,
      totalCotizaciones: 0,
      totalIngresos: 0,
      
      // Por área
      usuariosPorArea: {},
      proyectosPorArea: {},
      ingresosPorArea: {},
      
      // Rendimiento mensual
      crecimientoUsuarios: 0,
      crecimientoProyectos: 0,
      crecimientoIngresos: 0,
      
      // Métricas de conversión
      conversionRate: 0,
      ticketResolutionRate: 0,
      
      // Datos ejecutivos
      resumenEjecutivo: {},
      tendenciasMensuales: []
    };

    // KPIs generales
    const generalesResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE active = true) as usuarios,
        (SELECT COUNT(*) FROM projects) as proyectos,
        (SELECT COUNT(*) FROM quotes) as cotizaciones,
        (SELECT SUM(total_amount) FROM quotes WHERE status IN ('aprobada', 'facturada')) as ingresos
    `);
    
    const generales = generalesResult.rows[0];
    stats.totalUsuarios = parseInt(generales.usuarios);
    stats.totalProyectos = parseInt(generales.proyectos);
    stats.totalCotizaciones = parseInt(generales.cotizaciones);
    stats.totalIngresos = parseFloat(generales.ingresos || 0);

    // Usuarios por área
    const usuariosAreaResult = await pool.query(`
      SELECT 
        area,
        COUNT(*) as total
      FROM users 
      WHERE active = true
      GROUP BY area
      ORDER BY total DESC
    `);
    
    stats.usuariosPorArea = usuariosAreaResult.rows.reduce((acc, row) => {
      acc[row.area] = parseInt(row.total);
      return acc;
    }, {});

    // Proyectos por área (basado en creador)
    const proyectosAreaResult = await pool.query(`
      SELECT 
        u.area,
        COUNT(p.id) as total
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      GROUP BY u.area
      ORDER BY total DESC
    `);
    
    stats.proyectosPorArea = proyectosAreaResult.rows.reduce((acc, row) => {
      acc[row.area] = parseInt(row.total);
      return acc;
    }, {});

    // Ingresos por área
    const ingresosAreaResult = await pool.query(`
      SELECT 
        u.area,
        SUM(q.total_amount) as total
      FROM quotes q
      LEFT JOIN users u ON q.created_by = u.id
      WHERE q.status IN ('aprobada', 'facturada')
      GROUP BY u.area
      ORDER BY total DESC
    `);
    
    stats.ingresosPorArea = ingresosAreaResult.rows.reduce((acc, row) => {
      acc[row.area] = parseFloat(row.total || 0);
      return acc;
    }, {});

    // Crecimiento mensual
    const mesActual = new Date();
    const mesAnterior = new Date();
    mesAnterior.setMonth(mesAnterior.getMonth() - 1);
    
    const crecimientoResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE created_at >= $1) as usuarios_mes,
        (SELECT COUNT(*) FROM projects WHERE created_at >= $1) as proyectos_mes,
        (SELECT SUM(total_amount) FROM quotes WHERE created_at >= $1 AND status IN ('aprobada', 'facturada')) as ingresos_mes,
        (SELECT COUNT(*) FROM users WHERE created_at >= $2 AND created_at < $1) as usuarios_mes_anterior,
        (SELECT COUNT(*) FROM projects WHERE created_at >= $2 AND created_at < $1) as proyectos_mes_anterior,
        (SELECT SUM(total_amount) FROM quotes WHERE created_at >= $2 AND created_at < $1 AND status IN ('aprobada', 'facturada')) as ingresos_mes_anterior
    `, [mesActual, mesAnterior]);
    
    const crecimiento = crecimientoResult.rows[0];
    const usuariosMes = parseInt(crecimiento.usuarios_mes);
    const usuariosMesAnterior = parseInt(crecimiento.usuarios_mes_anterior);
    const proyectosMes = parseInt(crecimiento.proyectos_mes);
    const proyectosMesAnterior = parseInt(crecimiento.proyectos_mes_anterior);
    const ingresosMes = parseFloat(crecimiento.ingresos_mes || 0);
    const ingresosMesAnterior = parseFloat(crecimiento.ingresos_mes_anterior || 0);
    
    stats.crecimientoUsuarios = usuariosMesAnterior > 0 ? ((usuariosMes - usuariosMesAnterior) / usuariosMesAnterior * 100).toFixed(1) : 0;
    stats.crecimientoProyectos = proyectosMesAnterior > 0 ? ((proyectosMes - proyectosMesAnterior) / proyectosMesAnterior * 100).toFixed(1) : 0;
    stats.crecimientoIngresos = ingresosMesAnterior > 0 ? ((ingresosMes - ingresosMesAnterior) / ingresosMesAnterior * 100).toFixed(1) : 0;

    // Métricas de conversión
    const conversionResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM quotes WHERE status = 'aprobada') as aprobadas,
        (SELECT COUNT(*) FROM quotes) as total_cotizaciones,
        (SELECT COUNT(*) FROM tickets WHERE status = 'resuelto') as tickets_resueltos,
        (SELECT COUNT(*) FROM tickets) as total_tickets
    `);
    
    const conversion = conversionResult.rows[0];
    stats.conversionRate = conversion.total_cotizaciones > 0 ? (conversion.aprobadas / conversion.total_cotizaciones * 100).toFixed(1) : 0;
    stats.ticketResolutionRate = conversion.total_tickets > 0 ? (conversion.tickets_resueltos / conversion.total_tickets * 100).toFixed(1) : 0;

    // Resumen ejecutivo
    stats.resumenEjecutivo = {
      totalUsuariosActivos: stats.totalUsuarios,
      totalProyectosActivos: stats.totalProyectos,
      ingresosTotales: stats.totalIngresos,
      conversionRate: stats.conversionRate,
      ticketResolutionRate: stats.ticketResolutionRate,
      areaMasProductiva: Object.keys(stats.ingresosPorArea).reduce((a, b) => 
        stats.ingresosPorArea[a] > stats.ingresosPorArea[b] ? a : b, 'N/A'
      )
    };

    // Tendencias mensuales (últimos 6 meses)
    const tendenciasResult = await pool.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as mes,
        COUNT(*) as cotizaciones,
        SUM(total_amount) as ingresos
      FROM quotes 
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY mes DESC
    `);
    
    stats.tendenciasMensuales = tendenciasResult.rows.map(row => ({
      mes: row.mes,
      cotizaciones: parseInt(row.cotizaciones),
      ingresos: parseFloat(row.ingresos || 0)
    }));

    res.json(stats);
  } catch (error) {
    console.error('Error en dashboard Gerencia:', error);
    res.status(500).json({ error: 'Error al obtener métricas de Gerencia' });
  }
};
