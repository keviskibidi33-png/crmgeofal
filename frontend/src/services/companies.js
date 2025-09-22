import { apiFetch } from './api';

export const listCompanies = (params = {}) => {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', params.page);
  if (params.limit) sp.set('limit', params.limit);
  if (params.search) sp.set('search', params.search);
  if (params.type) sp.set('type', params.type);
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

export const createCompany = (payload) =>
  apiFetch('/api/companies', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateCompany = (id, payload) =>
  apiFetch(`/api/companies/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

export const deleteCompany = (id) =>
  apiFetch(`/api/companies/${id}`, {
    method: 'DELETE',
  });

export default { listCompanies, getCompany, createCompany, updateCompany, deleteCompany };
