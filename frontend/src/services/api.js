// Small API helper for frontend
// Use VITE_API_URL if provided; otherwise rely on same-origin and dev proxy
const RAW_BASE = (import.meta.env?.VITE_API_URL || '').trim();
const API_BASE = RAW_BASE.replace(/\/$/, ''); // quita la barra final

function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...getAuthHeader(), ...(opts.headers || {}) };
  // Si el body es FormData, eliminamos Content-Type para que el navegador establezca los límites correctamente
  if (opts && opts.body instanceof FormData) {
    delete headers['Content-Type'];
  }
  // normaliza path para no duplicar /api ni barras dobles
  let normPath = String(path || '')
    .replace(/^[\s]*\//, '/') // asegura que inicia con '/'
    .replace(/\/+/g, '/'); // colapsa barras múltiples
  // Si el BASE ya termina en /api y el path empieza por /api/, quita un /api para no duplicar
  if (/\/api$/i.test(API_BASE) && /^\/api(\/|$)/i.test(normPath)) {
    normPath = normPath.replace(/^\/api(\/|$)/i, '/');
  }
  const url = API_BASE ? `${API_BASE}${normPath}` : normPath;

  const res = await fetch(url, { ...opts, headers });
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
    // Manejo centralizado de 401: limpiar token
    if (res.status === 401) {
      try { localStorage.removeItem('token'); } catch { /* ignore */ }
    }
    throw error;
  }
  return body;
}

export default apiFetch;
