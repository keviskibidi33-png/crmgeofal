import { apiFetch } from './api';

// Obtener estadísticas del dashboard
export const getDashboardStats = () => {
  return apiFetch('/api/dashboard/stats');
};

export default {
  getDashboardStats
};
