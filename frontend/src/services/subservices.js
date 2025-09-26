import { apiFetch } from './api';

// Buscar subservicios para autocompletado
export const searchSubservices = async (query, limit = 10) => {
  if (!query || query.length < 2) {
    return { data: [] };
  }

  try {
    const response = await apiFetch(`/api/subservices/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    return response;
  } catch (error) {
    console.error('Error buscando subservicios:', error);
    throw error;
  }
};

// Obtener subservicio por código
export const getSubserviceByCode = async (codigo) => {
  try {
    const response = await apiFetch(`/api/subservices/by-code/${encodeURIComponent(codigo)}`);
    return response;
  } catch (error) {
    console.error('Error obteniendo subservicio por código:', error);
    throw error;
  }
};

// Obtener sugerencias por categoría
export const getSuggestionsByCategory = async (category = 'all', limit = 5) => {
  try {
    const response = await apiFetch(`/api/subservices/suggestions?category=${encodeURIComponent(category)}&limit=${limit}`);
    return response;
  } catch (error) {
    console.error('Error obteniendo sugerencias:', error);
    throw error;
  }
};

// Obtener todos los subservicios (para uso en formularios)
export const getAllSubservices = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.service_id) queryParams.append('service_id', params.service_id);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const response = await apiFetch(`/api/subservices?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error('Error obteniendo subservicios:', error);
    throw error;
  }
};