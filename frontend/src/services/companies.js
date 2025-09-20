import { apiFetch } from './api';

export const listCompanies = (params = {}) => {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', params.page);
  if (params.limit) sp.set('limit', params.limit);
  if (params.q) sp.set('q', params.q);
  const qs = sp.toString();
  const path = qs ? `/api/companies?${qs}` : '/api/companies';
  return apiFetch(path);
};

export const getCompany = (id) => apiFetch(`/api/companies/${id}`);

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
