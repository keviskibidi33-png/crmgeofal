import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';


// Admin dashboard: usa el endpoint /api/reports/dashboard
export const getAdminDashboardData = async (token) => {
  const res = await axios.get(`${API_URL}/reports/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  // Mapea los datos para el dashboard admin
  return {
    totalUsuarios: res.data.totalUsuarios,
    totalEmpresas: res.data.totalEmpresas,
    totalProyectos: res.data.totalProyectos,
    totalCotizaciones: res.data.totalCotizaciones
  };
};

export const getVentasDashboardData = async (token) => {
  const res = await axios.get(`${API_URL}/dashboard/ventas`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getLaboratorioDashboardData = async (token) => {
  const res = await axios.get(`${API_URL}/dashboard/laboratorio`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getJefeDashboardData = async (token) => {
  const res = await axios.get(`${API_URL}/dashboard/jefe`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getGerenciaDashboardData = async (token) => {
  const res = await axios.get(`${API_URL}/dashboard/gerencia`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getSoporteDashboardData = async (token) => {
  const res = await axios.get(`${API_URL}/dashboard/soporte`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
