const axios = require('axios');
const pool = require('../config/db');

console.log('🔍 DIAGNÓSTICO COMPLETO DEL ERROR 500');
console.log('=====================================');

async function completeDiagnosis() {
  try {
    // 1. Verificar si el backend está corriendo
    console.log('\n1️⃣ VERIFICANDO BACKEND...');
    try {
      const healthResponse = await axios.get('http://localhost:4000/api/health', { timeout: 5000 });
      console.log('✅ Backend corriendo:', healthResponse.data);
    } catch (error) {
      console.log('❌ Backend NO está corriendo:', error.message);
      console.log('🔧 Solución: Iniciar backend con "node index.js"');
      return;
    }

    // 2. Verificar conexión a base de datos
    console.log('\n2️⃣ VERIFICANDO BASE DE DATOS...');
    try {
      const dbTest = await pool.query('SELECT NOW()');
      console.log('✅ Base de datos conectada:', dbTest.rows[0].now);
    } catch (error) {
      console.log('❌ Error en base de datos:', error.message);
      return;
    }

    // 3. Verificar tabla ticket_comments
    console.log('\n3️⃣ VERIFICANDO TABLA TICKET_COMMENTS...');
    try {
      const tableCheck = await pool.query(`
        SELECT COUNT(*) as count FROM ticket_comments
      `);
      console.log('✅ Tabla ticket_comments existe, registros:', tableCheck.rows[0].count);
    } catch (error) {
      console.log('❌ Error en tabla ticket_comments:', error.message);
      return;
    }

    // 4. Verificar usuario admin
    console.log('\n4️⃣ VERIFICANDO USUARIO ADMIN...');
    try {
      const userCheck = await pool.query(`
        SELECT id, name, email, role, active FROM users WHERE role = 'admin' LIMIT 1
      `);
      if (userCheck.rows.length > 0) {
        console.log('✅ Usuario admin encontrado:', userCheck.rows[0]);
      } else {
        console.log('❌ No hay usuario admin');
        return;
      }
    } catch (error) {
      console.log('❌ Error verificando usuario:', error.message);
      return;
    }

    // 5. Probar autenticación
    console.log('\n5️⃣ PROBANDO AUTENTICACIÓN...');
    let token;
    try {
      const loginResponse = await axios.post('http://localhost:4000/api/auth/login', {
        email: 'admin@crm.com',
        password: 'admin123'
      });
      token = loginResponse.data.token;
      console.log('✅ Autenticación exitosa, token:', token ? 'Presente' : 'Ausente');
    } catch (error) {
      console.log('❌ Error en autenticación:', error.response?.data || error.message);
      return;
    }

    // 6. Probar endpoint de comentarios con logging detallado
    console.log('\n6️⃣ PROBANDO ENDPOINT DE COMENTARIOS...');
    try {
      const commentData = {
        ticket_id: 14,
        comment: 'Comentario de diagnóstico completo'
      };

      console.log('📤 Enviando datos:', commentData);
      console.log('🔑 Token:', token ? 'Presente' : 'Ausente');

      const commentResponse = await axios.post('http://localhost:4000/api/ticket-comments', commentData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log('✅ Comentario creado exitosamente:', commentResponse.data);

    } catch (error) {
      console.log('❌ ERROR EN ENDPOINT DE COMENTARIOS:');
      console.log('📊 Status:', error.response?.status);
      console.log('📊 Status Text:', error.response?.statusText);
      console.log('📊 Response Data:', error.response?.data);
      console.log('📊 Request Headers:', error.config?.headers);
      console.log('📊 Request Data:', error.config?.data);
      console.log('📊 Error Message:', error.message);
      
      if (error.response?.data?.stack) {
        console.log('📊 Stack Trace del servidor:');
        console.log(error.response.data.stack);
      }
    }

    // 7. Verificar comentarios en base de datos
    console.log('\n7️⃣ VERIFICANDO COMENTARIOS EN BD...');
    try {
      const comments = await pool.query(`
        SELECT tc.*, u.name, u.role 
        FROM ticket_comments tc 
        LEFT JOIN users u ON tc.user_id = u.id 
        WHERE tc.ticket_id = 14 
        ORDER BY tc.created_at DESC 
        LIMIT 5
      `);
      console.log('✅ Comentarios en BD:', comments.rows.length);
      comments.rows.forEach((comment, index) => {
        console.log(`   ${index + 1}. ${comment.comment} (${comment.name})`);
      });
    } catch (error) {
      console.log('❌ Error consultando comentarios:', error.message);
    }

  } catch (error) {
    console.error('❌ Error general en diagnóstico:', error);
  }
}

completeDiagnosis();
