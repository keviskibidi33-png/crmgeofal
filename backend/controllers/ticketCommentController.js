const TicketComment = require('../models/ticketComment');
const Ticket = require('../models/ticket');
const { sendNotification } = require('../services/notificationService');

// Crear un nuevo comentario
exports.create = async (req, res) => {
  try {
    console.log('🔍 Creando comentario:', req.body);
    console.log('👤 Usuario:', req.user);
    console.log('🔍 Headers:', req.headers);
    
    const { ticket_id, comment } = req.body;
    const user_id = req.user.id;
    
    console.log('🔍 Datos extraídos:', { ticket_id, comment, user_id });

    // Verificar que el ticket existe
    const ticket = await Ticket.getById(ticket_id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    // Crear el comentario
    const newComment = await TicketComment.create({
      ticket_id,
      user_id,
      comment,
      is_system: false
    });

    // Obtener información del usuario que comenta
    const commentWithUser = await TicketComment.getByTicketId(ticket_id);
    const latestComment = commentWithUser[commentWithUser.length - 1];

    // Enviar notificación en tiempo real usando el servicio de socket
    const socketService = require('../services/socketService');
    socketService.sendTicketComment(ticket_id, latestComment);
    
    // Enviar notificación a todos los usuarios conectados
    socketService.sendNotificationToRole('soporte', {
      title: `Nuevo comentario en ticket #${ticket_id}`,
      message: `${req.user.name} comentó: "${comment.substring(0, 50)}${comment.length > 50 ? '...' : ''}"`,
      type: 'ticket_comment',
      data: {
        ticket_id: ticket_id,
        ticket_title: ticket.title,
        commenter_name: req.user.name,
        commenter_role: req.user.role
      }
    });

    // Enviar notificación por email si no es el creador del ticket
    if (ticket.user_id !== user_id) {
      try {
        // Solo intentar enviar email si las credenciales SMTP están configuradas
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
          await sendNotification({
            to: ticket.user_email || 'soporte@crmgeofal.com',
            subject: `Nuevo comentario en ticket #${ticket_id}`,
            template: 'ticket_comment',
            data: {
              ticket_id,
              ticket_title: ticket.title,
              comment: comment,
              commenter_name: req.user.name,
              commenter_role: req.user.role
            }
          });
        } else {
          console.log('⚠️ SMTP no configurado, saltando notificación por email');
        }
      } catch (emailError) {
        console.error('Error enviando notificación por email:', emailError);
        // No fallar la operación por un error de email
      }
    }

    res.status(201).json({
      success: true,
      message: 'Comentario agregado exitosamente',
      comment: latestComment
    });

  } catch (error) {
    console.error('❌ Error creando comentario:', error);
    console.error('❌ Stack trace:', error.stack);
    console.error('❌ Error message:', error.message);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Obtener comentarios de un ticket
exports.getByTicket = async (req, res) => {
  try {
    const { ticket_id } = req.params;
    const user_id = req.user.id;

    // Verificar que el ticket existe
    const ticket = await Ticket.getById(ticket_id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    // Obtener comentarios
    const comments = await TicketComment.getByTicketId(ticket_id);

    // Marcar como leídos
    await TicketComment.markAsRead(ticket_id, user_id);

    res.json({
      success: true,
      comments: comments
    });

  } catch (error) {
    console.error('Error obteniendo comentarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener comentarios recientes
exports.getRecent = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const comments = await TicketComment.getRecent(parseInt(limit));

    res.json({
      success: true,
      comments: comments
    });

  } catch (error) {
    console.error('Error obteniendo comentarios recientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener comentarios no leídos
exports.getUnread = async (req, res) => {
  try {
    const user_id = req.user.id;
    const unreadComments = await TicketComment.getUnreadByUser(user_id);

    res.json({
      success: true,
      unread_count: unreadComments.length,
      comments: unreadComments
    });

  } catch (error) {
    console.error('Error obteniendo comentarios no leídos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Marcar comentarios como leídos
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
    console.error('Error marcando comentarios como leídos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
