import { apiFetch } from './api';

export const listProjects = (params = {}) => {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', params.page);
  if (params.limit) sp.set('limit', params.limit);
  if (params.search) sp.set('search', params.search);
  if (params.status) sp.set('status', params.status);
  if (params.company_id) sp.set('company_id', params.company_id);
  if (params.project_type) sp.set('project_type', params.project_type);
  if (params.q) sp.set('q', params.q);
  const qs = sp.toString();
  const path = qs ? `/api/projects?${qs}` : '/api/projects';
  
  console.log('🔍 listProjects - Llamando a:', path);
  console.log('🔍 listProjects - Token:', localStorage.getItem('token') ? 'Presente' : 'Ausente');
  
  return apiFetch(path).then(data => {
    console.log('✅ listProjects - Respuesta recibida:', data);
    return data;
  }).catch(error => {
    console.error('❌ listProjects - Error:', error);
    throw error;
  });
};

export const createProject = (payload) =>
  apiFetch('/api/projects', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const getProject = (id) => apiFetch(`/api/projects/${id}`);

export const updateProject = (id, payload) =>
  apiFetch(`/api/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

export const deleteProject = (id) =>
  apiFetch(`/api/projects/${id}`, {
    method: 'DELETE',
  });

export const getProjectStats = () => {
  console.log('📊 getProjectStats - Llamando a: /api/projects/stats');
  console.log('📊 getProjectStats - Token:', localStorage.getItem('token') ? 'Presente' : 'Ausente');
  
  return apiFetch('/api/projects/stats').then(data => {
    console.log('✅ getProjectStats - Respuesta recibida:', data);
    return data;
  }).catch(error => {
    console.error('❌ getProjectStats - Error:', error);
    throw error;
  });
};

export default { listProjects, createProject, getProject, updateProject, deleteProject, getProjectStats };
