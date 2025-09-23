import { apiFetch } from './api';

// Obtener estadísticas generales del sistema
export const getSystemStats = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);
  
  const url = `/api/reports/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiFetch(url);
};

// Obtener ventas por vendedor
export const getVentasPorVendedor = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);
  if (params.vendedor_id) queryParams.append('vendedor_id', params.vendedor_id);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.sort_by) queryParams.append('sort_by', params.sort_by);
  
  const url = `/api/reports/ventas-por-vendedor${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiFetch(url);
};

// Obtener proyectos por estado
export const getProyectosPorEstado = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);
  
  const url = `/api/reports/proyectos-por-estado${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiFetch(url);
};

// Obtener cotizaciones por período
export const getCotizacionesPorPeriodo = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);
  if (params.vendedor_id) queryParams.append('vendedor_id', params.vendedor_id);
  
  const url = `/api/reports/cotizaciones${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiFetch(url);
};

// Obtener clientes activos
export const getClientesActivos = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);
  
  const url = `/api/reports/clientes-activos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiFetch(url);
};

// Obtener lista de vendedores para filtros
export const getVendedores = async () => {
  return apiFetch('/api/reports/vendedores');
};

// Obtener dashboard top 10 vendedores
export const getDashboardTop10 = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);
  if (params.sort_by) queryParams.append('sort_by', params.sort_by);
  if (params.vendedor_id) queryParams.append('vendedor_id', params.vendedor_id);
  
  const url = `/api/reports/dashboard-top10${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiFetch(url);
};

// Obtener meta mensual
export const getMonthlyGoal = async (year, month) => {
  const url = `/api/reports/monthly-goal?year=${year}&month=${month}`;
  return apiFetch(url);
};

// Establecer meta mensual
export const setMonthlyGoal = async (goalData) => {
  return apiFetch('/api/reports/monthly-goal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(goalData)
  });
};

// Exportar reporte a Excel
export const exportReport = async (reportType, params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);
  if (params.vendedor_id) queryParams.append('vendedor_id', params.vendedor_id);
  
  const url = `/api/reports/export/${reportType}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  // Para descargas de archivos, necesitamos manejar la respuesta de manera diferente
  const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}${url}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Error al exportar el reporte');
  }
  
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `reporte_${reportType}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
};