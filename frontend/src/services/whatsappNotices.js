import { apiFetch } from './api';

export const listNoticesByProject = (project_id, params = {}) => {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', params.page);
  if (params.limit) sp.set('limit', params.limit);
  const qs = sp.toString();
  const path = `/api/project-whatsapp-notices/project/${project_id}` + (qs ? `?${qs}` : '');
  return apiFetch(path);
};

export const createNotice = ({ project_id, sent_to, message }) =>
  apiFetch('/api/project-whatsapp-notices', {
    method: 'POST',
    body: JSON.stringify({ project_id, sent_to, message }),
  });

export const listAllNotices = (params = {}) => {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', params.page);
  if (params.limit) sp.set('limit', params.limit);
  if (params.q) sp.set('q', params.q);
  if (params.status) sp.set('status', params.status);
  if (params.range) sp.set('range', params.range);
  if (params.project_id) sp.set('project_id', params.project_id);
  const qs = sp.toString();
  return apiFetch('/api/project-whatsapp-notices' + (qs ? `?${qs}` : ''));
};

export default { listNoticesByProject, createNotice, listAllNotices };
