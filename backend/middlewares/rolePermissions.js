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
      }
    },
    isolatedViews: [
      'dashboard-analytics',  // Dashboard analítico
      'funnel-metrics',      // Métricas de embudo
      'service-analysis',    // Análisis de servicios
      'conversion-reports'   // Reportes de conversión
    ]
  },

  // ADMIN - Acceso completo
  admin: {
    name: 'Administrador',
    permissions: {
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
      reports: {
        operational: true,
        financial: true,
        analytical: true
      },
      notifications: {
        receive: true,
        send: true,
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
