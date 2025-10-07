const pool = require('../config/db');
const TicketComment = require('../models/ticketComment');
const Ticket = require('../models/ticket');

async function testCommentCreation() {
  try {
    console.log('🧪 Probando creación de comentario...');
    
    // Verificar que el ticket existe
    const ticket = await Ticket.getById(14);
    console.log('📋 Ticket encontrado:', ticket ? `ID: ${ticket.id}` : 'No encontrado');
    
    if (!ticket) {
      console.log('❌ Ticket no encontrado');
      return;
    }
    
    // Intentar crear un comentario
    const testComment = await TicketComment.create({
      ticket_id: 14,
      user_id: 6, // ID del usuario actual
      comment: 'Comentario de prueba',
      is_system: false
    });
    
    console.log('✅ Comentario creado exitosamente:', testComment);
    
    // Obtener comentarios del ticket
    const comments = await TicketComment.getByTicketId(14);
    console.log('📝 Comentarios del ticket:', comments.length);
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    process.exit(0);
  }
}

testCommentCreation();
