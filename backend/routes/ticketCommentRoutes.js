const express = require('express');
const router = express.Router();
const ticketCommentController = require('../controllers/ticketCommentController');
const authenticateToken = require('../middlewares/auth');

// Crear comentario - Permitir a todos los usuarios autenticados
router.post('/', authenticateToken(['admin', 'jefa_comercial', 'vendedor', 'soporte']), ticketCommentController.create);

// Obtener comentarios de un ticket - Permitir a todos los usuarios autenticados
router.get('/ticket/:ticket_id', authenticateToken(['admin', 'jefa_comercial', 'vendedor', 'soporte']), ticketCommentController.getByTicket);

// Obtener comentarios recientes - Solo admin y soporte
router.get('/recent', authenticateToken(['admin', 'soporte']), ticketCommentController.getRecent);

// Obtener comentarios no leídos - Solo admin y soporte
router.get('/unread', authenticateToken(['admin', 'soporte']), ticketCommentController.getUnread);

// Marcar comentarios como leídos - Permitir a todos los usuarios autenticados
router.put('/ticket/:ticket_id/read', authenticateToken(['admin', 'jefa_comercial', 'vendedor', 'soporte']), ticketCommentController.markAsRead);

module.exports = router;
