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

// Items de la cotización
// Backend route expects /api/quote-items/quote/:quote_id
export const listQuoteItems = (quoteId) => apiFetch(`/api/quote-items/quote/${quoteId}`);

export const addQuoteItem = (payload) =>
  apiFetch('/api/quote-items', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateQuoteItem = (id, payload) =>
  apiFetch(`/api/quote-items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const deleteQuoteItem = (id) =>
  apiFetch(`/api/quote-items/${id}`, {
    method: 'DELETE',
  });

export default {
  listQuotes,
  getQuote,
  createQuote,
  updateQuote,
  deleteQuote,
  listQuoteItems,
  addQuoteItem,
  updateQuoteItem,
  deleteQuoteItem,
};
