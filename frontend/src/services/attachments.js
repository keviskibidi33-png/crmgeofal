import { apiFetch } from './api';

export const listAttachments = (params = {}) => {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', params.page);
  if (params.limit) sp.set('limit', params.limit);
  if (params.q) sp.set('q', params.q);
  const qs = sp.toString();
  const path = qs ? `/api/project-attachments?${qs}` : '/api/project-attachments';
  return apiFetch(path);
};

export const createAttachment = async ({ project_id, description, file }) => {
  const form = new FormData();
  form.append('project_id', project_id);
  if (description) form.append('description', description);
  form.append('file', file);
  return apiFetch('/api/project-attachments', {
    method: 'POST',
    body: form,
  });
};

export const deleteAttachment = (id) => apiFetch(`/api/project-attachments/${id}`, { method: 'DELETE' });

export default { listAttachments, createAttachment, deleteAttachment };