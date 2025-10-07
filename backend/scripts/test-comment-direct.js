const pool = require('../config/db');
const TicketComment = require('../models/ticketComment');

console.log('🔍 Probando creación de comentario directamente...');

async function testDirectComment() {
  try {
    // 1. Verificar conexión a la base de datos
    console.log('📊 Probando conexión a la base de datos...');
    const dbTest = await pool.query('SELECT NOW()');
    console.log('✅ Base de datos conectada:', dbTest.rows[0].now);

    // 2. Verificar que la tabla existe
    console.log('📋 Verificando tabla ticket_comments...');
    const tableCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'ticket_comments'
    `);
    console.log('✅ Columnas de la tabla:', tableCheck.rows);

    // 3. Probar crear comentario directamente
    console.log('💬 Creando comentario de prueba...');
    const comment = await TicketComment.create({
      ticket_id: 14,
      user_id: 6, // ID del admin
      comment: 'Comentario de prueba directo',
      is_system: false
    });
    console.log('✅ Comentario creado:', comment);

    // 4. Verificar que se guardó
    console.log('🔍 Verificando comentarios del ticket 14...');
    const comments = await TicketComment.getByTicketId(14);
    console.log('✅ Comentarios encontrados:', comments.length);
    console.log('📋 Último comentario:', comments[comments.length - 1]);

  } catch (error) {
    console.error('❌ Error en la prueba:');
    console.error('📊 Error message:', error.message);
    console.error('📊 Error stack:', error.stack);
    console.error('📊 Error code:', error.code);
    console.error('📊 Error detail:', error.detail);
  }
}

testDirectComment();