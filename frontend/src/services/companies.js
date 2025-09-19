import { apiFetch } from './api';

export const listCompanies = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const path = qs ? `/api/companies?${qs}` : '/api/companies';
  return apiFetch(path);
};

export const getCompany = (id) => apiFetch(`/api/companies/${id}`);

export const createCompany = (payload) =>
  apiFetch('/api/companies', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export default { listCompanies, getCompany, createCompany };
