import { apiFetch } from './api';

export const listEvidences = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const path = qs ? `/api/evidences?${qs}` : '/api/evidences';
  return apiFetch(path);
};

export const createEvidence = async ({ project_id, invoice_id, type, file }) => {
  const form = new FormData();
  if (project_id) form.append('project_id', project_id);
  if (invoice_id) form.append('invoice_id', invoice_id);
  if (type) form.append('type', type);
  if (file) form.append('file', file);
  return apiFetch('/api/evidences', {
    method: 'POST',
    body: form,
    headers: { 'Content-Type': undefined },
  });
};

export default { listEvidences, createEvidence };
