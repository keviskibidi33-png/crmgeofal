import { apiFetch } from './api';

export const listProjects = (params = {}) => {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', params.page);
  if (params.limit) sp.set('limit', params.limit);
  if (params.search) sp.set('search', params.search);
  if (params.q) sp.set('q', params.q);
  const qs = sp.toString();
  const path = qs ? `/api/projects?${qs}` : '/api/projects';
  return apiFetch(path);
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

export default { listProjects, createProject, getProject, updateProject, deleteProject };
