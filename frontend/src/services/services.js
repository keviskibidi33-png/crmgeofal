import { apiFetch } from './api';

// Obtener todos los servicios
export const listServices = (params = {}) => {
  const sp = new URLSearchParams();
  if (params.type) sp.set('type', params.type);
  if (params.search) sp.set('search', params.search);
  if (params.page) sp.set('page', params.page);
  if (params.limit) sp.set('limit', params.limit);
  
  const qs = sp.toString();
  const path = qs ? `/api/services?${qs}` : '/api/services';
  return apiFetch(path);
};

// Obtener servicio por ID
export const getService = (id) => {
  return apiFetch(`/api/services/${id}`);
};

// Obtener subservicios de un servicio
export const listSubservices = (params = {}) => {
  const sp = new URLSearchParams();
  if (params.service_id) sp.set('service_id', params.service_id);
  if (params.search) sp.set('search', params.search);
  if (params.page) sp.set('page', params.page);
  if (params.limit) sp.set('limit', params.limit);
  
  const qs = sp.toString();
  const path = qs ? `/api/subservices?${qs}` : '/api/subservices';
  return apiFetch(path);
};

// Crear nuevo servicio
export const createService = (serviceData) => {
  return apiFetch('/api/services', {
    method: 'POST',
    body: JSON.stringify(serviceData)
  });
};

// Actualizar servicio
export const updateService = (id, serviceData) => {
  return apiFetch(`/api/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(serviceData)
  });
};

// Eliminar servicio
export const deleteService = (id) => {
  return apiFetch(`/api/services/${id}`, {
    method: 'DELETE'
  });
};

// Obtener estadísticas de servicios
export const getServiceStats = () => {
  return apiFetch('/api/services/stats/overview');
};

export default {
  listServices,
  getService,
  listSubservices,
  createService,
  updateService,
  deleteService,
  getServiceStats
};