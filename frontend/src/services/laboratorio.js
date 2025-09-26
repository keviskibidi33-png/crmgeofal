import { apiFetch } from './api';

// Obtener proyectos asignados al laboratorio
export const getProyectosAsignados = async (filtros = {}) => {
  try {
    // Optimización: Logs de debug removidos para producción
    const params = new URLSearchParams();
    
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.search) params.append('search', filtros.search);
    if (filtros.page) params.append('page', filtros.page);
    if (filtros.limit) params.append('limit', filtros.limit);
    
    const queryString = params.toString();
    const url = `/api/laboratorio/proyectos${queryString ? `?${queryString}` : ''}`;
    
    // URL optimizada
    
    // Agregar timeout a la petición
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
    
    try {
      const response = await apiFetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      // Respuesta optimizada
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Timeout: La petición tardó demasiado tiempo');
      }
      throw error;
    }
  } catch (error) {
    // Error handling optimizado
    // Error details optimizado
    throw error;
  }
};

// Obtener estadísticas del laboratorio
export const getEstadisticasLaboratorio = async () => {
  try {
    // Optimización: Logs de debug removidos para producción
    
    // Agregar timeout a la petición
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
    
    try {
      const response = await apiFetch('/api/laboratorio/estadisticas', { signal: controller.signal });
      clearTimeout(timeoutId);
      // Respuesta optimizada
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Timeout: La petición tardó demasiado tiempo');
      }
      throw error;
    }
  } catch (error) {
    // Error handling optimizado
    throw error;
  }
};

// Actualizar estado de un proyecto
export const actualizarEstadoProyecto = async (projectId, data) => {
  try {
    console.log('🔄 actualizarEstadoProyecto - Llamando a: /api/laboratorio/proyectos/' + projectId + '/estado');
    const response = await apiFetch(`/api/laboratorio/proyectos/${projectId}/estado`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    console.log('✅ actualizarEstadoProyecto - Respuesta recibida:', response);
    return response;
  } catch (error) {
    console.error('❌ actualizarEstadoProyecto - Error:', error);
    throw error;
  }
};

// Subir archivos del laboratorio
export const subirArchivosLaboratorio = async (projectId, data) => {
  try {
    console.log('📁 subirArchivosLaboratorio - Llamando a: /api/laboratorio/proyectos/' + projectId + '/archivos');
    const response = await apiFetch(`/api/laboratorio/proyectos/${projectId}/archivos`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    console.log('✅ subirArchivosLaboratorio - Respuesta recibida:', response);
    return response;
  } catch (error) {
    console.error('❌ subirArchivosLaboratorio - Error:', error);
    throw error;
  }
};

// Obtener archivos de un proyecto
export const obtenerArchivosProyecto = async (projectId, tipo = '') => {
  try {
    console.log('📂 obtenerArchivosProyecto - Llamando a: /api/laboratorio/proyectos/' + projectId + '/archivos');
    const params = new URLSearchParams();
    if (tipo) params.append('tipo', tipo);
    
    const queryString = params.toString();
    const url = `/api/laboratorio/proyectos/${projectId}/archivos${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiFetch(url);
    console.log('✅ obtenerArchivosProyecto - Respuesta recibida:', response);
    return response;
  } catch (error) {
    console.error('❌ obtenerArchivosProyecto - Error:', error);
    throw error;
  }
};

export default {
  getProyectosAsignados,
  getEstadisticasLaboratorio,
  actualizarEstadoProyecto,
  subirArchivosLaboratorio,
  obtenerArchivosProyecto
};
