import { apiFetch } from './api';

export const listServices = (params = {}) => {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', params.page);
  if (params.limit) sp.set('limit', params.limit);
  if (params.q) sp.set('q', params.q);
  const qs = sp.toString();
  const path = qs ? `/api/services?${qs}` : '/api/services';
  return apiFetch(path);
};

export const createService = (payload) => apiFetch('/api/services', { method: 'POST', body: JSON.stringify(payload) });

export const updateService = (id, payload) => apiFetch(`/api/services/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const deleteService = (id) => apiFetch(`/api/services/${id}`, { method: 'DELETE' });

export default { listServices, createService, updateService, deleteService };
