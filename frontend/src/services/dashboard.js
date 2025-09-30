import { apiFetch } from './api';

// Obtener estadísticas generales del dashboard
export const getDashboardStats = () => {
  return apiFetch('/api/role-dashboard/stats');
};

// Dashboards específicos por rol
export const getSalesDashboard = () => {
  return apiFetch('/api/role-dashboard/jefa-comercial');
};

export const getVendedorDashboard = () => {
  return apiFetch('/api/role-dashboard/vendedor-comercial');
};

export const getLabDashboard = () => {
  return apiFetch('/api/role-dashboard/laboratorio');
};

export const getBillingDashboard = () => {
  return apiFetch('/api/role-dashboard/facturacion');
};

export const getSupportDashboard = () => {
  return apiFetch('/api/role-dashboard/soporte');
};

export const getManagementDashboard = () => {
  return apiFetch('/api/role-dashboard/gerencia');
};

// Función helper para obtener el dashboard correcto según el rol
export const getDashboardByRole = (userRole) => {
  switch (userRole) {
    case 'jefa_comercial':
      return getSalesDashboard();
    case 'vendedor_comercial':
      return getVendedorDashboard();
    case 'jefe_laboratorio':
    case 'usuario_laboratorio':
      return getLabDashboard();
    case 'facturacion':
      return getBillingDashboard();
    case 'soporte':
      return getSupportDashboard();
    case 'gerencia':
    case 'admin':
      return getManagementDashboard();
    default:
      return getDashboardStats();
  }
};

export default {
  getDashboardStats,
  getSalesDashboard,
  getVendedorDashboard,
  getLabDashboard,
  getBillingDashboard,
  getSupportDashboard,
  getManagementDashboard,
  getDashboardByRole
};
