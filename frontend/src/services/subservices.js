import { apiFetch } from './api';

export const listSubservices = (service_id, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const base = `/api/subservices/service/${service_id}`;
  return apiFetch(qs ? `${base}?${qs}` : base);
};

export const createSubservice = (payload) => apiFetch('/api/subservices', { method: 'POST', body: JSON.stringify(payload) });

export const updateSubservice = (id, payload) => apiFetch(`/api/subservices/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const deleteSubservice = (id) => apiFetch(`/api/subservices/${id}`, { method: 'DELETE' });

export default { listSubservices, createSubservice, updateSubservice, deleteSubservice };
