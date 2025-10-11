import { apiFetch } from './api';

export const listCompanies = (params = {}) => {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', params.page);
  if (params.limit) sp.set('limit', params.limit);
  if (params.search) sp.set('search', params.search);
  if (params.type) sp.set('type', params.type);
  if (params.city) sp.set('city', params.city);
  if (params.sector) sp.set('sector', params.sector);
  const qs = sp.toString();
  const path = qs ? `/api/companies?${qs}` : '/api/companies';
  
  console.log('🔍 listCompanies - Llamando a:', path);
  console.log('🔍 listCompanies - Token:', localStorage.getItem('token') ? 'Presente' : 'Ausente');
  
  return apiFetch(path).then(data => {
    console.log('✅ listCompanies - Respuesta recibida:', data);
    return data;
  }).catch(error => {
    console.error('❌ listCompanies - Error:', error);
    throw error;
  });
};

export const getCompany = (id) => apiFetch(`/api/companies/${id}`);

export const getCompanyStats = () => {
  console.log('📊 getCompanyStats - Llamando a: /api/companies/stats');
  console.log('📊 getCompanyStats - Token:', localStorage.getItem('token') ? 'Presente' : 'Ausente');
  
  return apiFetch('/api/companies/stats').then(data => {
    console.log('✅ getCompanyStats - Respuesta recibida:', data);
    return data;
  }).catch(error => {
    console.error('❌ getCompanyStats - Error:', error);
    throw error;
  });
};

export const getCompanyFilterOptions = () => {
  console.log('🔍 getCompanyFilterOptions - Llamando a: /api/companies/filter-options');
  console.log('🔍 getCompanyFilterOptions - Token:', localStorage.getItem('token') ? 'Presente' : 'Ausente');
  
  return apiFetch('/api/companies/filter-options').then(data => {
    console.log('✅ getCompanyFilterOptions - Respuesta recibida:', data);
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

export const updateCompany = (id, payload) =>
  apiFetch(`/api/companies/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

export const deleteCompany = (id) =>
  apiFetch(`/api/companies/${id}`, {
    method: 'DELETE',
  });

export const updateClientStatus = (id, status) =>
  apiFetch(`/api/companies/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

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
