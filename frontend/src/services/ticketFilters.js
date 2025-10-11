import { apiFetch } from './api';

// Obtener usuarios para asignación
export const getUsersForAssignment = async () => {
  try {
    const response = await apiFetch('/api/ticket-filters/users');
    return response || [];
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return [];
  }
};

// Obtener módulos disponibles
export const getModules = async () => {
  try {
    const response = await apiFetch('/api/ticket-filters/modules');
    return response || [];
  } catch (error) {
    console.error('Error obteniendo módulos:', error);
    return [];
  }
};

// Obtener categorías disponibles
export const getCategories = async () => {
  try {
    const response = await apiFetch('/api/ticket-filters/categories');
    return response || [];
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    return [];
  }
};

// Obtener tipos disponibles
export const getTypes = async () => {
  try {
    const response = await apiFetch('/api/ticket-filters/types');
    return response || [];
  } catch (error) {
    console.error('Error obteniendo tipos:', error);
    return [];
  }
};

// Obtener estadísticas de tickets
export const getTicketStats = async () => {
  try {
    const response = await apiFetch('/api/ticket-filters/stats');
    return response || {};
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return {};
  }
};
