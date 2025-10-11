import { apiFetch } from './api';

export const getProjectHistory = (projectId, params = {}) => {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', params.page);
  if (params.limit) sp.set('limit', params.limit);
  if (params.search) sp.set('search', params.search);
  if (params.action && params.action !== 'all') sp.set('action', params.action);
  if (params.date && params.date !== 'all') sp.set('date', params.date);
  
  const qs = sp.toString();
  const path = `/api/project-history/project/${projectId}` + (qs ? `?${qs}` : '');
  return apiFetch(path);
};

export const addProjectHistoryEntry = async (projectId, action, notes) => {
  return apiFetch('/api/project-history', {
    method: 'POST',
    body: JSON.stringify({
      project_id: projectId,
      action,
      notes
    })
  });
};

export default {
  getProjectHistory,
  addProjectHistoryEntry,
};