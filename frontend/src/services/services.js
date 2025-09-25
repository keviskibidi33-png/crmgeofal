import { apiFetch } from './api';

export const listServices = (params = {}) => {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', params.page);
  if (params.limit) sp.set('limit', params.limit);
  if (params.q) sp.set('q', params.q);
  const qs = sp.toString();
  const path = qs ? `/api/services?${qs}` : '/api/services';
  return apiFetch(path);
};

export default { listServices };
