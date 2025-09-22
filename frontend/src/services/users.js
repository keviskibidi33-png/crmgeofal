import { apiFetch } from './api';

export const listUsers = (params = {}) => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', params.page);
  if (params.limit) searchParams.set('limit', params.limit);
  if (params.search) searchParams.set('search', params.search);
  if (params.area) searchParams.set('area', params.area);
  if (params.role) searchParams.set('role', params.role);
  const qs = searchParams.toString();
  const path = qs ? `/api/users?${qs}` : '/api/users';
  
  console.log('🔍 listUsers - Llamando a:', path);
  console.log('🔍 listUsers - Token:', localStorage.getItem('token') ? 'Presente' : 'Ausente');
  
  return apiFetch(path).then(data => {
    console.log('✅ listUsers - Respuesta recibida:', data);
    return data;
  }).catch(error => {
    console.error('❌ listUsers - Error:', error);
    throw error;
  });
};

export const createUser = (payload) =>
  apiFetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateUser = (id, payload) =>
  apiFetch(`/api/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

export const deleteUser = (id) =>
  apiFetch(`/api/users/${id}`, { method: 'DELETE' });

export const resetPassword = (id, password) =>
  apiFetch(`/api/users/${id}/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ password }),
  });

export const setNotificationEnabled = (id, enabled) =>
  apiFetch(`/api/users/${id}/notification`, {
    method: 'PATCH',
    body: JSON.stringify({ enabled }),
  });

export default {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
  setNotificationEnabled,
};
