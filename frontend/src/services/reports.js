import { apiFetch } from './api';

export const getVentasPorVendedor = () => {
  return apiFetch('/api/reports/ventas-por-vendedor');
};

export default {
  getVentasPorVendedor,
};