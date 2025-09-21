import { apiFetch } from './api';

export const listSubcategories = (category_id, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const base = `/api/subcategories/category/${category_id}`;
  return apiFetch(qs ? `${base}?${qs}` : base);
};

export const createSubcategory = (payload) => apiFetch('/api/subcategories', { method: 'POST', body: JSON.stringify(payload) });
export const updateSubcategory = (id, payload) => apiFetch(`/api/subcategories/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const deleteSubcategory = (id) => apiFetch(`/api/subcategories/${id}`, { method: 'DELETE' });

export default { listSubcategories, createSubcategory, updateSubcategory, deleteSubcategory };
