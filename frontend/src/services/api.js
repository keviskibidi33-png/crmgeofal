// Small API helper for frontend
// Use VITE_API_URL if provided; otherwise rely on same-origin and dev proxy
const API_BASE = import.meta.env?.VITE_API_URL || '';

function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...getAuthHeader(), ...(opts.headers || {}) };
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch (err) {
    // not JSON
    body = text;
  }
  if (!res.ok) {
    const message = (body && body.error) || (body && body.message) || res.statusText || 'Error en la petición';
    const error = new Error(message);
    error.status = res.status;
    error.body = body;
    throw error;
  }
  return body;
}

export default apiFetch;
