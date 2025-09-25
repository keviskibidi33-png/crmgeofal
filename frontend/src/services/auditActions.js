import { apiFetch } from './api';

// Obtener detalles de un registro de auditoría
export const getAuditDetails = async (id) => {
  const response = await apiFetch(`/api/audit/${id}`);
  return response;
};

// Editar un registro de auditoría
export const editAuditRecord = async (id, data) => {
  const response = await apiFetch(`/api/audit/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  return response;
};

// Eliminar un registro de auditoría
export const deleteAuditRecord = async (id) => {
  const response = await apiFetch(`/api/audit/${id}`, {
    method: 'DELETE'
  });
  return response;
};

// Eliminar múltiples registros
export const deleteBulkAuditRecords = async (ids) => {
  const response = await apiFetch('/api/audit/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ ids })
  });
  return response;
};

// Archivar registros
export const archiveAuditRecords = async (ids) => {
  const response = await apiFetch('/api/audit/archive', {
    method: 'POST',
    body: JSON.stringify({ ids })
  });
  return response;
};

// Obtener analytics de auditoría
export const getAuditAnalytics = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  Object.keys(filters).forEach(key => {
    if (filters[key] && filters[key] !== 'all') {
      queryParams.append(key, filters[key]);
    }
  });
  
  const response = await apiFetch(`/api/audit/analytics?${queryParams.toString()}`);
  return response;
};

// Obtener usuarios activos en auditoría
export const getActiveUsers = async () => {
  const response = await apiFetch('/api/audit/active-users');
  return response;
};

// Limpiar registros antiguos
export const cleanupOldRecords = async (hours = 24) => {
  const response = await apiFetch('/api/audit/cleanup', {
    method: 'POST',
    body: JSON.stringify({ hours })
  });
  return response;
};

// Obtener estadísticas de limpieza
export const getCleanupStats = async () => {
  const response = await apiFetch('/api/audit/cleanup-stats');
  return response;
};

export const getHourlyDistribution = async (hours = 24) => {
  const response = await apiFetch(`/api/audit/hourly-distribution?hours=${hours}`);
  return response;
};

export default {
  getAuditDetails,
  editAuditRecord,
  deleteAuditRecord,
  deleteBulkAuditRecords,
  archiveAuditRecords,
  getAuditAnalytics,
  getActiveUsers,
  cleanupOldRecords,
  getCleanupStats,
  getHourlyDistribution
};
