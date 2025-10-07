const TicketComment = require('../models/ticketComment');
const Ticket = require('../models/ticket');

// Crear un nuevo comentario - VERSIÓN SIMPLIFICADA
exports.create = async (req, res) => {
  try {
    console.log('🔍 [SIMPLE] Creando comentario:', req.body);
    console.log('👤 [SIMPLE] Usuario:', req.user);
    
    const { ticket_id, comment } = req.body;
    const user_id = req.user.id;
    
    console.log('🔍 [SIMPLE] Datos extraídos:', { ticket_id, comment, user_id });

    // Verificar que el ticket existe
    const ticket = await Ticket.getById(ticket_id);
    if (!ticket) {
      console.log('❌ [SIMPLE] Ticket no encontrado:', ticket_id);
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    console.log('✅ [SIMPLE] Ticket encontrado:', ticket.title);

    // Crear el comentario
    const newComment = await TicketComment.create({
      ticket_id,
      user_id,
      comment,
      is_system: false
    });

    console.log('✅ [SIMPLE] Comentario creado:', newComment);

    res.status(201).json({
      success: true,
      message: 'Comentario agregado exitosamente',
      comment: newComment
    });

  } catch (error) {
    console.error('❌ [SIMPLE] Error creando comentario:', error);
    console.error('❌ [SIMPLE] Stack trace:', error.stack);
    console.error('❌ [SIMPLE] Error message:', error.message);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};

// Obtener comentarios de un ticket - VERSIÓN SIMPLIFICADA
exports.getByTicket = async (req, res) => {
  try {
    const { ticket_id } = req.params;
    const comments = await TicketComment.getByTicketId(ticket_id);
    
    res.json({
      success: true,
      comments: comments
    });
  } catch (error) {
    console.error('❌ [SIMPLE] Error obteniendo comentarios:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};

// Marcar comentarios como leídos - VERSIÓN SIMPLIFICADA
exports.markAsRead = async (req, res) => {
  try {
    const { ticket_id } = req.params;
    const user_id = req.user.id;
    
    await TicketComment.markAsRead(ticket_id, user_id);
    
    res.json({
      success: true,
      message: 'Comentarios marcados como leídos'
    });
  } catch (error) {
    console.error('❌ [SIMPLE] Error marcando como leído:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};
