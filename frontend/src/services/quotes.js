import { apiFetch } from './api';

export const listQuotes = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const path = qs ? `/api/quotes?${qs}` : '/api/quotes';
  return apiFetch(path);
};

export const getQuote = (id) => apiFetch(`/api/quotes/${id}`);

export const createQuote = (payload) =>
  apiFetch('/api/quotes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateQuote = (id, payload) =>
  apiFetch(`/api/quotes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const deleteQuote = (id) =>
  apiFetch(`/api/quotes/${id}`, {
    method: 'DELETE',
  });

// Items de la cotización se manejan directamente en el frontend
// No se envían al backend por separado

export default {
  listQuotes,
  getQuote,
  createQuote,
  updateQuote,
  deleteQuote,
};
