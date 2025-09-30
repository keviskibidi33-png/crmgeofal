// Test script para probar la actualización de perfil
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:4000';

async function testProfileUpdate() {
  try {
    // Primero hacer login para obtener un token
    console.log('1. Haciendo login...');
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@crm.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (!loginData.token) {
      console.error('No se pudo obtener el token');
      return;
    }

    const token = loginData.token;

    // Obtener perfil actual
    console.log('\n2. Obteniendo perfil actual...');
    const profileResponse = await fetch(`${API_BASE}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const profileData = await profileResponse.json();
    console.log('Perfil actual:', profileData);

    // Actualizar perfil
    console.log('\n3. Actualizando perfil...');
    const updateResponse = await fetch(`${API_BASE}/api/auth/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Admin Actualizado',
        apellido: 'Test',
        area: 'Administración'
      })
    });

    const updateData = await updateResponse.json();
    console.log('Resultado de actualización:', updateData);

  } catch (error) {
    console.error('Error en test:', error);
  }
}

testProfileUpdate();