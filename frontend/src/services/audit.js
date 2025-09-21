import { apiFetch } from './api';

export const listAudit = (params = {}) => {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', params.page);
  if (params.limit) sp.set('limit', params.limit);
  const qs = sp.toString();
  const path = qs ? `/api/audit?${qs}` : '/api/audit';
  return apiFetch(path);
};

export default { listAudit };
