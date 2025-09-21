import { apiFetch } from './api';

// Nota: apiFetch ya agrega el header Authorization usando localStorage.
// Aceptamos `token` en la firma para no romper llamadas existentes, pero no es necesario.

// Admin dashboard: usa el endpoint /api/reports/dashboard
export const getAdminDashboardData = async (_token) => {
  const data = await apiFetch('/api/reports/dashboard');
  // Mapea los datos para el dashboard admin
  return {
    totalUsuarios: data.totalUsuarios,
    totalEmpresas: data.totalEmpresas,
    totalProyectos: data.totalProyectos,
    totalCotizaciones: data.totalCotizaciones,
  };
};

export const getVentasDashboardData = async (_token) => {
  return apiFetch('/api/dashboard/ventas');
};

export const getLaboratorioDashboardData = async (_token) => {
  return apiFetch('/api/dashboard/laboratorio');
};

export const getJefeDashboardData = async (_token) => {
  return apiFetch('/api/dashboard/jefe');
};

export const getGerenciaDashboardData = async (_token) => {
  return apiFetch('/api/dashboard/gerencia');
};

export const getSoporteDashboardData = async (_token) => {
  return apiFetch('/api/dashboard/soporte');
};
