/**
 * Sistema de Permisos Diferenciados por Rol
 * Aislamiento total entre Facturación y Jefe Comercial
 */

const ROLE_PERMISSIONS = {
  // FACTURACIÓN - Gestión operativa completa
  facturacion: {
    name: 'Facturación',
    permissions: {
      // Cotizaciones
      quotes: {
        create: true,
        read: true,
        update: true,
        delete: false,
        approve: true,        // Puede aprobar/rechazar
        reject: true,
        viewAll: true,        // Ve todas las cotizaciones
        viewPending: true,    // Ve solicitudes pendientes
        viewApproved: true,   // Ve cotizaciones aprobadas
        viewRejected: true    // Ve cotizaciones rechazadas
      },
      // Clientes
      clients: {
        create: true,
        read: true,
        update: true,
        delete: false
      },
      // Reportes (solo operativos)
      reports: {
        operational: true,    // Reportes operativos
        financial: true,     // Reportes financieros
        analytical: false     // NO tiene acceso a métricas analíticas
      },
      // Notificaciones
      notifications: {
        receive: true,
        send: true,
        manage: true
      },
      // jsreport - Generación de PDFs
      jsreport: {
        create: true,    // Generar PDFs
        read: true,      // Ver estado, descargar PDFs
        update: true,    // Probar plantillas
        delete: false
      }
    },
    isolatedViews: [
      'quotes-pending',      // Solo ve solicitudes pendientes
      'quotes-approval',     // Panel de aprobaciones
      'clients-management',  // Gestión de clientes
      'operational-reports'  // Reportes operativos
    ]
  },

  // JEFE COMERCIAL - Solo métricas y análisis
  jefe_comercial: {
    name: 'Jefe Comercial',
    permissions: {
      // Cotizaciones (solo lectura de aprobadas)
      quotes: {
        create: false,
        read: true,
        update: false,
        delete: false,
        approve: false,       // NO puede aprobar
        reject: false,
        viewAll: false,       // NO ve todas
        viewPending: false,   // NO ve pendientes
        viewApproved: true,   // SOLO ve aprobadas
        viewRejected: false   // NO ve rechazadas
      },
      // Reportes (solo analíticos)
      reports: {
        operational: false,   // NO reportes operativos
        financial: false,     // NO reportes financieros
        analytical: true      // SOLO métricas analíticas
      },
      // Dashboard
      dashboard: {
        metrics: true,        // Métricas de embudo
        funnels: true,        // Análisis de embudo
        conversions: true,    // Conversiones por servicio
        trends: true          // Tendencias
      },
      // Notificaciones (solo lectura)
      notifications: {
        receive: true,
        send: false,
        manage: false
      },
      // jsreport - Solo lectura para reportes
      jsreport: {
        create: false,   // NO puede generar PDFs
        read: true,      // Puede ver estado y descargar
        update: false,   // NO puede probar plantillas
        delete: false
      }
    },
    isolatedViews: [
      'dashboard-analytics',  // Dashboard analítico
      'funnel-metrics',      // Métricas de embudo
      'service-analysis',    // Análisis de servicios
      'conversion-reports'   // Reportes de conversión
    ]
  },

  // VENDEDOR COMERCIAL - Gestión comercial completa
  vendedor_comercial: {
    name: 'Vendedor Comercial',
    permissions: {
      // Cotizaciones - Gestión completa
      quotes: {
        create: true,
        read: true,
        update: true,
        delete: true,
        approve: false,       // NO puede aprobar (solo jefa_comercial)
        reject: false,
        viewAll: true,        // Ve todas las cotizaciones
        viewPending: true,    // Ve cotizaciones pendientes
        viewApproved: true,   // Ve cotizaciones aprobadas
        viewRejected: true    // Ve cotizaciones rechazadas
      },
      // Clientes - Gestión completa
      clients: {
        create: true,
        read: true,
        update: true,
        delete: true
      },
      // Proyectos - Gestión completa
      projects: {
        create: true,
        read: true,
        update: true,
        delete: true,
        manage: true
      },
      // Reportes (operativos y analíticos)
      reports: {
        operational: true,    // Reportes operativos
        financial: true,      // Reportes financieros
        analytical: true      // Métricas analíticas
      },
      // Dashboard
      dashboard: {
        metrics: true,        // Métricas de embudo
        funnels: true,        // Análisis de embudo
        conversions: true,    // Conversiones por servicio
        trends: true          // Tendencias
      },
      // Notificaciones
      notifications: {
        receive: true,
        send: true,
        manage: true
      },
      // jsreport - Generación de PDFs
      jsreport: {
        create: true,    // Generar PDFs
        read: true,      // Ver estado, descargar PDFs
        update: true,    // Probar plantillas
        delete: false
      },
      // Tickets - Gestión de tickets comerciales
      tickets: {
        create: true,
        read: true,
        update: true,
        delete: false,
        manage: false,
        assign: false
      }
    },
    isolatedViews: [
      'quotes-management',    // Gestión de cotizaciones
      'clients-management',   // Gestión de clientes
      'projects-management',  // Gestión de proyectos
      'commercial-dashboard', // Dashboard comercial
      'commercial-reports'    // Reportes comerciales
    ]
  },

  // ADMIN - Acceso completo
  admin: {
    name: 'Administrador',
    permissions: {
      // Cotizaciones - Acceso completo
      quotes: {
        create: true,
        read: true,
        update: true,
        delete: true,
        approve: true,
        reject: true,
        viewAll: true,
        viewPending: true,
        viewApproved: true,
        viewRejected: true
      },
      // Clientes - Acceso completo
      clients: {
        create: true,
        read: true,
        update: true,
        delete: true
      },
      // Proyectos - Acceso completo
      projects: {
        create: true,
        read: true,
        update: true,
        delete: true,
        manage: true
      },
      // Usuarios - Acceso completo
      users: {
        create: true,
        read: true,
        update: true,
        delete: true,
        manage: true
      },
      // Servicios - Acceso completo
      services: {
        create: true,
        read: true,
        update: true,
        delete: true,
        manage: true
      },
      // Laboratorio - Acceso completo
      laboratory: {
        create: true,
        read: true,
        update: true,
        delete: true,
        manage: true
      },
      // Tickets - Acceso completo
      tickets: {
        create: true,
        read: true,
        update: true,
        delete: true,
        manage: true,
        assign: true
      },
      // Reportes - Acceso completo
      reports: {
        operational: true,
        financial: true,
        analytical: true,
        generate: true,
        export: true
      },
      // Dashboard - Acceso completo
      dashboard: {
        metrics: true,
        funnels: true,
        conversions: true,
        trends: true,
        analytics: true
      },
      // Notificaciones - Acceso completo
      notifications: {
        receive: true,
        send: true,
        manage: true,
        configure: true
      },
      // jsreport - Acceso completo
      jsreport: {
        create: true,    // Generar PDFs
        read: true,      // Ver estado, descargar PDFs
        update: true,    // Probar plantillas
        delete: true,    // Eliminar PDFs
        manage: true     // Gestionar plantillas
      },
      // Comprobantes de pago - Acceso completo
      paymentProofs: {
        create: true,
        read: true,
        update: true,
        delete: true,
        verify: true,
        approve: true,
        reject: true
      },
      // Aprobaciones - Acceso completo
      approvals: {
        create: true,
        read: true,
        update: true,
        delete: true,
        approve: true,
        reject: true,
        manage: true
      },
      // Facturas - Acceso completo
      invoices: {
        create: true,
        read: true,
        update: true,
        delete: true,
        manage: true
      },
      // Auditoría - Acceso completo
      audit: {
        read: true,
        export: true,
        manage: true
      },
      // Archivos - Acceso completo
      files: {
        upload: true,
        download: true,
        delete: true,
        manage: true
      },
      // Configuración - Acceso completo
      settings: {
        read: true,
        update: true,
        manage: true
      }
    },
    isolatedViews: ['*'] // Acceso a todas las vistas
  }
};

/**
 * Middleware para verificar permisos específicos
 */
const checkPermission = (resource, action) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    
    if (!userRole || !ROLE_PERMISSIONS[userRole]) {
      return res.status(403).json({ 
        error: 'Rol no válido',
        code: 'INVALID_ROLE'
      });
    }

    const rolePermissions = ROLE_PERMISSIONS[userRole].permissions;
    
    if (!rolePermissions[resource] || !rolePermissions[resource][action]) {
      return res.status(403).json({ 
        error: 'Permiso denegado',
        code: 'PERMISSION_DENIED',
        required: `${resource}.${action}`,
        role: userRole
      });
    }

    // Agregar información de permisos al request
    req.userPermissions = rolePermissions[resource];
    req.userIsolatedViews = ROLE_PERMISSIONS[userRole].isolatedViews;
    
    next();
  };
};

/**
 * Middleware para verificar acceso a vistas aisladas
 */
const checkViewAccess = (viewName) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    const isolatedViews = ROLE_PERMISSIONS[userRole]?.isolatedViews || [];
    
    if (!isolatedViews.includes(viewName) && !isolatedViews.includes('*')) {
      return res.status(403).json({ 
        error: 'Acceso denegado a esta vista',
        code: 'VIEW_ACCESS_DENIED',
        view: viewName,
        role: userRole
      });
    }
    
    next();
  };
};

/**
 * Filtro de datos basado en rol
 */
const filterDataByRole = (role, data, dataType) => {
  const permissions = ROLE_PERMISSIONS[role]?.permissions;
  
  if (!permissions) return data;
  
  switch (dataType) {
    case 'quotes':
      if (!permissions.quotes.viewAll) {
        if (permissions.quotes.viewApproved && !permissions.quotes.viewPending) {
          // Solo cotizaciones aprobadas
          return data.filter(quote => quote.status === 'approved');
        }
        if (permissions.quotes.viewPending && !permissions.quotes.viewApproved) {
          // Solo cotizaciones pendientes
          return data.filter(quote => ['pending', 'in_review'].includes(quote.status));
        }
      }
      return data;
      
    case 'reports':
      if (!permissions.reports.analytical) {
        // Filtrar métricas analíticas
        return data.filter(report => !report.isAnalytical);
      }
      return data;
      
    default:
      return data;
  }
};

/**
 * Obtener configuración de rol
 */
const getRoleConfig = (role) => {
  return ROLE_PERMISSIONS[role] || null;
};

/**
 * Verificar si un rol puede acceder a una funcionalidad
 */
const canAccess = (role, resource, action) => {
  const permissions = ROLE_PERMISSIONS[role]?.permissions;
  return permissions?.[resource]?.[action] || false;
};

module.exports = {
  ROLE_PERMISSIONS,
  checkPermission,
  checkViewAccess,
  filterDataByRole,
  getRoleConfig,
  canAccess
};
