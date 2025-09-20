import { apiFetch } from './api';

export const listCategories = (params = {}) => {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', params.page);
  if (params.limit) sp.set('limit', params.limit);
  if (params.q) sp.set('q', params.q);
  const qs = sp.toString();
  const path = qs ? `/api/categories?${qs}` : '/api/categories';
  return apiFetch(path);
};

export const createCategory = (payload) => apiFetch('/api/categories', { method: 'POST', body: JSON.stringify(payload) });
export const updateCategory = (id, payload) => apiFetch(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const deleteCategory = (id) => apiFetch(`/api/categories/${id}`, { method: 'DELETE' });

export default { listCategories, createCategory, updateCategory, deleteCategory };
