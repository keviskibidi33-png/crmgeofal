import { apiFetch } from './api';

// Obtener lista de usuarios
export const listUsers = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.search) queryParams.append('search', params.search);
  
  const response = await apiFetch(`/api/users?${queryParams.toString()}`);
  return response;
};

// Obtener usuario por ID
export const getUserById = async (id) => {
  const response = await apiFetch(`/api/users/${id}`);
  return response;
};

// Obtener usuarios para mapeo de auditoría
export const getUsersForAudit = async () => {
  try {
    const response = await apiFetch('/api/users?limit=100');
    return response.data || response.rows || response || [];
  } catch (error) {
    console.error('Error obteniendo usuarios para auditoría:', error);
    return [];
  }
};

// Crear nuevo usuario
export const createUser = async (userData) => {
  const response = await apiFetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
  return response;
};

// Actualizar usuario
export const updateUser = async (id, userData) => {
  const response = await apiFetch(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  });
  return response;
};

// Eliminar usuario
export const deleteUser = async (id) => {
  const response = await apiFetch(`/api/users/${id}`, {
    method: 'DELETE'
  });
  return response;
};

// Mapear ID de usuario a nombre real
export const mapUserIdToName = async (userId) => {
  try {
    if (!userId) return 'Sistema';
    
    // Cache local para evitar múltiples requests
    if (!window.userCache) {
      window.userCache = new Map();
    }
    
    if (window.userCache.has(userId)) {
      return window.userCache.get(userId);
    }
    
    const user = await getUserById(userId);
    const userName = user?.name || user?.full_name || user?.username || `Usuario ${userId}`;
    
    window.userCache.set(userId, userName);
    return userName;
  } catch (error) {
    console.error('Error mapeando usuario:', error);
    return `Usuario ${userId}`;
  }
};

export default {
  listUsers,
  getUserById,
  getUsersForAudit,
  createUser,
  updateUser,
  deleteUser,
  mapUserIdToName
};