const pool = require('../config/db');

// Dashboard con datos de prueba realistas
exports.getSalesDashboard = async (req, res) => {
  try {
    const userRole = req.user?.role;
    
    const dashboardData = {
      // Métricas principales
      totalCotizaciones: 47,
      cotizacionesAprobadas: 32,
      cotizacionesPendientes: 15,
      cotizacionesRechazadas: 8,
      totalIngresos: 850000,
      conversionRate: 68,
      
      // Métricas mensuales  
      cotizacionesEsteMes: 12,
      ingresosEsteMes: 185000,
      
      // Embudo de ventas
      embudo: {
        leads: 45,
        enviadas: 32,
        enRevision: 15,
        aprobadas: 32,
        rechazadas: 8
      },
      
      // Top clientes
      topClientes: [
        { nombre: "Minera Las Bambas", cotizaciones: 8, ingresos: 180000 },
        { nombre: "Geología Peruana SAC", cotizaciones: 6, ingresos: 145000 },
        { nombre: "Consultora GeoTech", cotizaciones: 4, ingresos: 98000 }
      ],
      
      // Actividad reciente
      actividadReciente: [
        {
          id: 1,
          numeroQuote: "COT-2025-089",
          cliente: "Minera Antamina", 
          monto: 45000,
          estado: "aprobado",
          vendedor: "Juan Pérez",
          fecha: new Date().toISOString()
        }
      ]
    };

    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos del dashboard' });
  }
};

exports.getLabDashboard = async (req, res) => {
  try {
    const dashboardData = {
      proyectosAsignados: 24,
      proyectosEnProceso: 18,
      proyectosCompletados: 156,
      proyectosPendientes: 6,
      evidenciasSubidas: 89,
      evidenciasAprobadas: 67,
      evidenciasPendientes: 22,
      tiempoPromedioProcesamiento: 12
    };

    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos del laboratorio' });
  }
};

exports.getBillingDashboard = async (req, res) => {
  try {
    const dashboardData = {
      facturasPendientes: 15,
      facturasGeneradas: 234,
      montoFacturado: 1250000,
      pagosPendientes: 8,
      pagosRecibidos: 185000,
      clientesConDeuda: 12
    };

    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos de facturación' });
  }
};

exports.getSupportDashboard = async (req, res) => {
  try {
    const dashboardData = {
      ticketsAbiertos: 23,
      ticketsCerrados: 145,
      ticketsPendientes: 8,
      tiempoPromedioResolucion: 4.5,
      satisfaccionCliente: 4.2,
      ticketsHoy: 5
    };

    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos de soporte' });
  }
};

exports.getManagementDashboard = async (req, res) => {
  try {
    const dashboardData = {
      ingresosTotales: 2500000,
      proyectosActivos: 45,
      empleadosActivos: 28,
      clientesActivos: 89,
      ventasEsteMes: 185000,
      crecimientoMensual: 12.5
    };

    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos de gerencia' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const stats = {
      totalUsers: 28,
      totalProjects: 156,
      totalQuotes: 89,
      totalTickets: 34,
      activeProjects: 45,
      pendingQuotes: 23,
      openTickets: 12,
      completedProjects: 111
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};