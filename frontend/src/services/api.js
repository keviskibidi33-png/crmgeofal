// Small API helper for frontend
// Use VITE_API_URL if provided; otherwise use localhost:4000 for production
const RAW_BASE = (import.meta.env?.VITE_API_URL || 'http://localhost:4000/api').trim();
const API_BASE = RAW_BASE.replace(/\/$/, ''); // quita la barra final

function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch(path, opts = {}) {
  // Headers por defecto con anti-cache para evitar HTTP 304
  const headers = { 
    'Content-Type': 'application/json', 
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'ngrok-skip-browser-warning': 'true', // Bypass ngrok warning page
    ...getAuthHeader(), 
    ...(opts.headers || {}) 
  };
  
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
  
  // Debug log para verificar la URL
  console.log('🌐 API Request:', { url, API_BASE, normPath, RAW_BASE });

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
    // Manejo centralizado de 403 por usuario desactivado
    if (res.status === 403 && /desactivad/i.test(String(message))) {
      try { localStorage.removeItem('token'); } catch { /* ignore */ }
      try {
        // Opcional: notificar y redirigir a login
        console.warn('⚠️ Token inválido. Cerrando sesión.');
        if (typeof window !== 'undefined') {
          // Evita bucles si ya estamos en login
          const atLogin = window.location.pathname.toLowerCase().includes('login');
          if (!atLogin) {
            window.location.href = '/login';
          }
        }
      } catch { /* ignore */ }
    }
    throw error;
  }
  return body;
}

export default apiFetch;
