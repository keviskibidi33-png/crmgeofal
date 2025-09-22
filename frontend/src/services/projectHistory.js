import { apiFetch } from './api';

export const getProjectHistory = (projectId, params = {}) => {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', params.page);
  if (params.limit) sp.set('limit', params.limit);
  const qs = sp.toString();
  const path = `/api/project-history/project/${projectId}` + (qs ? `?${qs}` : '');
  return apiFetch(path);
};

export default {
  getProjectHistory,
};