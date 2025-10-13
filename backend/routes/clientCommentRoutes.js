const express = require('express');
const router = express.Router();
const clientCommentController = require('../controllers/clientCommentController');
const authMiddleware = require('../middlewares/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware());

// Rutas para comentarios de clientes
router.post('/', clientCommentController.createComment);
router.get('/company/:companyId', clientCommentController.getComments);
router.put('/:commentId', clientCommentController.updateComment);
router.delete('/:commentId', clientCommentController.deleteComment);
router.post('/company/:companyId/mark-read', clientCommentController.markAsRead);
router.get('/unread', clientCommentController.getUnread);
router.get('/recent', clientCommentController.getRecent);
router.get('/stats', clientCommentController.getStats);

module.exports = router;
