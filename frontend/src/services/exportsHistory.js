import { apiFetch } from './api';

export const listExportHistory = (params = {}) => {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', params.page);
  if (params.limit) sp.set('limit', params.limit);
  if (params.q) sp.set('q', params.q);
  if (params.type) sp.set('type', params.type);
  if (params.range) sp.set('range', params.range);
  const qs = sp.toString();
  return apiFetch('/api/export/history' + (qs ? `?${qs}` : ''));
};

export default { listExportHistory };
