import { apiFetch } from './api';

export const listTickets = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const path = qs ? `/api/tickets?${qs}` : '/api/tickets';
  const response = await apiFetch(path);
  
  // Manejar diferentes formatos de respuesta
  if (Array.isArray(response)) {
    return response;
  } else if (response && Array.isArray(response.data)) {
    return response.data;
  } else if (response && Array.isArray(response.tickets)) {
    return response.tickets;
  } else {
    console.warn('⚠️ Formato de respuesta inesperado para tickets:', response);
    return [];
  }
};

export const getTicket = (id) => apiFetch(`/api/tickets/${id}`);

export const createTicket = async ({ 
  title, 
  description, 
  priority, 
  module,
  category,
  type,
  assigned_to,
  estimated_time,
  tags,
  additional_notes,
  file 
}) => {
  // multipart form for optional attachment under field name 'attachment'
  const form = new FormData();
  if (title) form.append('title', title);
  if (description) form.append('description', description);
  if (priority) form.append('priority', priority);
  if (module) form.append('module', module);
  if (category) form.append('category', category);
  if (type) form.append('type', type);
  if (assigned_to) form.append('assigned_to', assigned_to);
  if (estimated_time) form.append('estimated_time', estimated_time);
  if (tags) form.append('tags', tags);
  if (additional_notes) form.append('additional_notes', additional_notes);
  if (file) form.append('attachment', file);
  return apiFetch('/api/tickets', {
    method: 'POST',
    body: form,
    headers: { 'Content-Type': undefined },
  });
};

export const updateTicketStatus = (id, status) =>
  apiFetch(`/api/tickets/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });

export const listTicketHistory = (ticket_id, params = {}) => {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', params.page);
  if (params.limit) sp.set('limit', params.limit);
  const qs = sp.toString();
  const path = qs ? `/api/tickets/${ticket_id}/history?${qs}` : `/api/tickets/${ticket_id}/history`;
  return apiFetch(path);
};

export const listTicketHistoryGlobal = (params = {}) => {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', params.page);
  if (params.limit) sp.set('limit', params.limit);
  if (params.q) sp.set('q', params.q);
  if (params.action) sp.set('action', params.action);
  if (params.range) sp.set('range', params.range);
  const qs = sp.toString();
  return apiFetch('/api/tickets/history/global' + (qs ? `?${qs}` : ''));
};

export default { listTickets, getTicket, createTicket, updateTicketStatus, listTicketHistory, listTicketHistoryGlobal };
