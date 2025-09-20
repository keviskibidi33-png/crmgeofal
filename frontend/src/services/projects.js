import { apiFetch } from './api';

export const listProjects = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const path = qs ? `/api/projects?${qs}` : '/api/projects';
  return apiFetch(path);
};

export const createProject = (payload) =>
  apiFetch('/api/projects', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const getProject = (id) => apiFetch(`/api/projects/${id}`);

export default { listProjects, createProject, getProject };
