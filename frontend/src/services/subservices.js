import apiFetch from './api';

// Listar subservicios con filtros
export const listSubservices = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.serviceId) queryParams.append('serviceId', params.serviceId);
  if (params.area) queryParams.append('area', params.area);
  if (params.q) queryParams.append('q', params.q);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  
  const response = await apiFetch(`/subservices?${queryParams.toString()}`);
  return response;
};

// Búsqueda inteligente de subservicios
export const searchSubservices = async (query, serviceId = null) => {
  const params = new URLSearchParams();
  params.append('q', query);
  if (serviceId) params.append('serviceId', serviceId);
  
  const response = await apiFetch(`/subservices/search?${params.toString()}`);
  return response;
};

// Obtener subservicio por código
export const getSubserviceByCode = async (code) => {
  const response = await apiFetch(`/subservices/code/${code}`);
  return response;
};

// Crear subservicio
export const createSubservice = async (data) => {
  const response = await apiFetch('/subservices', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response;
};

// Actualizar subservicio
export const updateSubservice = async (id, data) => {
  const response = await apiFetch(`/subservices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  return response;
};

// Eliminar subservicio
export const deleteSubservice = async (id) => {
  const response = await apiFetch(`/subservices/${id}`, {
    method: 'DELETE'
  });
  return response;
};

// Obtener subservicios por categoría (para mostrar en el módulo de Laboratorio)
export const getSubservicesByCategory = async (category) => {
  const response = await apiFetch(`/subservices/category/${category}`);
  return response;
};