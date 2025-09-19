import { apiFetch } from './api';

export const listVariants = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const path = qs ? `/api/quote-variants?${qs}` : '/api/quote-variants';
  return apiFetch(path);
};

export const getVariant = (id) => apiFetch(`/api/quote-variants/${id}`);

export const createVariant = (payload) =>
  apiFetch('/api/quote-variants', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateVariant = (id, payload) =>
  apiFetch(`/api/quote-variants/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const deleteVariant = (id) =>
  apiFetch(`/api/quote-variants/${id}`, {
    method: 'DELETE',
  });

export default {
  listVariants,
  getVariant,
  createVariant,
  updateVariant,
  deleteVariant,
};
