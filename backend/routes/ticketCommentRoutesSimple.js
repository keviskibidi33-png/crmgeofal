const express = require('express');
const router = express.Router();
const ticketCommentController = require('../controllers/ticketCommentController');
const authenticateToken = require('../middlewares/auth');

// Crear comentario - VERSIÓN SIMPLIFICADA
router.post('/', authenticateToken(['admin', 'jefa_comercial', 'vendedor_comercial', 'soporte']), ticketCommentController.create);

// Obtener comentarios de un ticket - VERSIÓN SIMPLIFICADA
router.get('/ticket/:ticket_id', authenticateToken(['admin', 'jefa_comercial', 'vendedor_comercial', 'soporte']), ticketCommentController.getByTicket);

// Marcar comentarios como leídos - VERSIÓN SIMPLIFICADA
router.put('/ticket/:ticket_id/read', authenticateToken(['admin', 'jefa_comercial', 'vendedor_comercial', 'soporte']), ticketCommentController.markAsRead);

module.exports = router;
