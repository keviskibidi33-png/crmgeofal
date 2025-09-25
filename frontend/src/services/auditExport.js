import { apiFetch } from './api';

// Exportar auditoría a Excel
export const exportAuditToExcel = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  // Agregar filtros a los parámetros
  Object.keys(filters).forEach(key => {
    if (filters[key] && filters[key] !== 'all') {
      queryParams.append(key, filters[key]);
    }
  });
  
  const response = await apiFetch(`/api/audit/export/excel?${queryParams.toString()}`, {
    method: 'GET',
    responseType: 'blob'
  });
  
  return response;
};

// Exportar auditoría a PDF
export const exportAuditToPDF = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  Object.keys(filters).forEach(key => {
    if (filters[key] && filters[key] !== 'all') {
      queryParams.append(key, filters[key]);
    }
  });
  
  const response = await apiFetch(`/api/audit/export/pdf?${queryParams.toString()}`, {
    method: 'GET',
    responseType: 'blob'
  });
  
  return response;
};

// Exportar auditoría a CSV
export const exportAuditToCSV = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  Object.keys(filters).forEach(key => {
    if (filters[key] && filters[key] !== 'all') {
      queryParams.append(key, filters[key]);
    }
  });
  
  const response = await apiFetch(`/api/audit/export/csv?${queryParams.toString()}`, {
    method: 'GET',
    responseType: 'blob'
  });
  
  return response;
};

// Descargar archivo
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Obtener estadísticas de exportación
export const getExportStats = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  Object.keys(filters).forEach(key => {
    if (filters[key] && filters[key] !== 'all') {
      queryParams.append(key, filters[key]);
    }
  });
  
  const response = await apiFetch(`/api/audit/export/stats?${queryParams.toString()}`);
  return response;
};

export default {
  exportAuditToExcel,
  exportAuditToPDF,
  exportAuditToCSV,
  downloadFile,
  getExportStats
};
