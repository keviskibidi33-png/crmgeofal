import apiFetch from './api';

export async function listInvoices({ page = 1, limit = 20, payment_status } = {}) {
  const params = new URLSearchParams();
  params.set('page', page);
  params.set('limit', limit);
  if (payment_status) params.set('payment_status', payment_status);
  return apiFetch(`/api/invoices?${params.toString()}`);
}

export async function getInvoice(id) {
  return apiFetch(`/api/invoices/${id}`);
}

export async function createInvoice(payload) {
  return apiFetch('/api/invoices', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateInvoiceStatus(id, payment_status) {
  return apiFetch(`/api/invoices/${id}/status`, { method: 'PUT', body: JSON.stringify({ payment_status }) });
}

export default { listInvoices, getInvoice, createInvoice, updateInvoiceStatus };
