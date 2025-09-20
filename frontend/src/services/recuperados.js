import { apiFetch } from './api';

export const listRecuperados = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const path = qs ? `/api/recuperados?${qs}` : '/api/recuperados';
  return apiFetch(path);
};

export default { listRecuperados };
