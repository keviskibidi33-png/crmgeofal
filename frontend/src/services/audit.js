import { apiFetch } from './api';

export const listAudit = (params = {}) => {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', params.page);
  if (params.limit) sp.set('limit', params.limit);
  // Filtros básicos
  if (params.search) sp.set('search', params.search);
  if (params.action && params.action !== 'all') sp.set('action', params.action);
  if (params.user && params.user !== 'all') sp.set('user', params.user);
  if (params.date && params.date !== 'all') sp.set('date', params.date);
  // Filtros avanzados
  if (params.dateStart) sp.set('dateStart', params.dateStart);
  if (params.dateEnd) sp.set('dateEnd', params.dateEnd);
  if (params.timeStart) sp.set('timeStart', params.timeStart);
  if (params.timeEnd) sp.set('timeEnd', params.timeEnd);

  const qs = sp.toString();
  const path = qs ? `/api/audit?${qs}` : '/api/audit';
  return apiFetch(path);
};

export default { listAudit };
