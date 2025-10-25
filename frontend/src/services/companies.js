import { apiFetch } from './api';

export const listCompanies = (params = {}) => {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', params.page);
  if (params.limit) sp.set('limit', params.limit);
  if (params.search) sp.set('search', params.search);
  if (params.type) sp.set('type', params.type);
  if (params.city) sp.set('city', params.city);
  if (params.sector) sp.set('sector', params.sector);
  
  // Agregar timestamp para evitar cache del navegador
  sp.set('_t', Date.now().toString());
  
  const qs = sp.toString();
  const path = qs ? `/api/companies?${qs}` : '/api/companies';
  
  
  return apiFetch(path).then(data => {
    return data;
  }).catch(error => {
    console.error('❌ listCompanies - Error:', error);
    throw error;
  });
};

export const listCompaniesWithTotals = (params = {}) => {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', params.page);
  if (params.limit) sp.set('limit', params.limit);
  if (params.search) sp.set('search', params.search);
  if (params.type) sp.set('type', params.type);
  if (params.city) sp.set('city', params.city);
  if (params.sector) sp.set('sector', params.sector);
  if (params.status) sp.set('status', params.status);
  if (params.priority) sp.set('priority', params.priority);
  if (params.sortBy) sp.set('sortBy', params.sortBy);
  if (params.sortOrder) sp.set('sortOrder', params.sortOrder);
  
  // Incluir totales
  sp.set('includeTotals', 'true');
  
  // Agregar timestamp para evitar cache del navegador
  sp.set('_t', Date.now().toString());
  
  const qs = sp.toString();
  const path = qs ? `/api/companies?${qs}` : '/api/companies';
  
  
  return apiFetch(path).then(data => {
    return data;
  }).catch(error => {
    console.error('❌ listCompaniesWithTotals - Error:', error);
    throw error;
  });
};

export const getCompany = (id) => apiFetch(`/api/companies/${id}`);
export const getCompanyById = (id) => apiFetch(`/api/companies/${id}`);

export const getCompanyWithTotals = (id) => {
  console.log('💰 getCompanyWithTotals - Obteniendo cliente con totales:', id);
  return apiFetch(`/api/companies/${id}?includeTotals=true`);
};

export const getCompanyStats = () => {
  
  return apiFetch('/api/companies/stats').then(data => {
    return data;
  }).catch(error => {
    console.error('❌ getCompanyStats - Error:', error);
    throw error;
  });
};

export const getCompanyFilterOptions = () => {
  
  return apiFetch('/api/companies/filter-options').then(data => {
    return data;
  }).catch(error => {
    console.error('❌ getCompanyFilterOptions - Error:', error);
    throw error;
  });
};

export const createCompany = (payload) =>
  apiFetch('/api/companies', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const getOrCreateCompany = (payload) => {
  console.log('🔍 getOrCreateCompany - Llamando a: /api/companies/get-or-create');
  console.log('🔍 getOrCreateCompany - Payload:', payload);
  
  return apiFetch('/api/companies/get-or-create', {
    method: 'POST',
    body: JSON.stringify(payload),
  }).then(data => {
    console.log('✅ getOrCreateCompany - Respuesta recibida:', data);
    return data;
  }).catch(error => {
    console.error('❌ getOrCreateCompany - Error:', error);
    throw error;
  });
};

export const updateCompany = (id, payload) => {
  console.log('📝 updateCompany - Actualizando cliente:', id, payload);
  return apiFetch(`/api/companies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }).then(response => {
    console.log('✅ updateCompany - Cliente actualizado:', response);
    return response;
  }).catch(error => {
    console.error('❌ updateCompany - Error:', error);
    throw error;
  });
};

export const deleteCompany = (id) =>
  apiFetch(`/api/companies/${id}`, {
    method: 'DELETE',
  });

export const updateClientStatus = (id, status) => {
  console.log(`🔄 updateClientStatus - Llamando a: /api/companies/${id}/status`);
  console.log(`🔄 updateClientStatus - Estado: ${status}`);
  console.log(`🔄 updateClientStatus - Token:`, localStorage.getItem('token') ? 'Presente' : 'Ausente');
  
  return apiFetch(`/api/companies/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }).then(data => {
    console.log('✅ updateClientStatus - Respuesta recibida:', data);
    return data;
  }).catch(error => {
    console.error('❌ updateClientStatus - Error:', error);
    throw error;
  });
};

export const updateClientManager = (id, managed_by) =>
  apiFetch(`/api/companies/${id}/manager`, {
    method: 'PATCH',
    body: JSON.stringify({ managed_by }),
  });

export const getClientHistory = (id) =>
  apiFetch(`/api/companies/${id}/history`);

export default { 
  listCompanies, 
  getCompany, 
  createCompany, 
  updateCompany, 
  deleteCompany,
  updateClientStatus,
  updateClientManager,
  getClientHistory
};
