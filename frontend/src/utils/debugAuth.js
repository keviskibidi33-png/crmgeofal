// Script de depuración para verificar autenticación
export const debugAuth = () => {
  console.log('🔍 DEBUG: Verificando autenticación...');
  
  // Verificar token en localStorage
  const token = localStorage.getItem('token');
  console.log('🔑 Token en localStorage:', token ? `${token.substring(0, 50)}...` : 'NO ENCONTRADO');
  
  // Verificar si el token es válido
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('👤 Usuario del token:', payload);
      console.log('⏰ Token expira en:', new Date(payload.exp * 1000));
    } catch (error) {
      console.error('❌ Error decodificando token:', error);
    }
  }
  
  // Verificar configuración de API
  const apiUrl = import.meta.env?.VITE_API_URL;
  console.log('🌐 API URL configurada:', apiUrl || 'No configurada (usando proxy)');
  
  return {
    hasToken: !!token,
    token: token,
    apiUrl: apiUrl
  };
};

// Función para probar la conexión con el backend
export const testBackendConnection = async () => {
  console.log('🧪 Probando conexión con backend...');
  
  try {
    const response = await fetch('/api/dashboard/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    console.log('📡 Respuesta del backend:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 Datos del dashboard:', data);
      return data;
    } else {
      const error = await response.text();
      console.error('❌ Error del backend:', error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    return null;
  }
};

// Función para verificar el estado de autenticación
export const checkAuthStatus = () => {
  const debug = debugAuth();
  
  if (!debug.hasToken) {
    console.log('🚨 PROBLEMA: No hay token de autenticación');
    console.log('💡 SOLUCIÓN: El usuario necesita iniciar sesión');
    return false;
  }
  
  console.log('✅ Token encontrado, verificando validez...');
  return true;
};

export default {
  debugAuth,
  testBackendConnection,
  checkAuthStatus
};
