const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middlewares/auth');

// Rutas protegidas - solo usuarios autenticados
router.get('/', auth(), notificationController.getNotifications);
router.get('/stats', auth(), notificationController.getStats);
router.put('/:id/read', auth(), notificationController.markAsRead);
router.put('/mark-all-read', auth(), notificationController.markAllAsRead);

// Rutas administrativas - solo admin
router.post('/create', auth(['admin']), notificationController.createNotification);
router.post('/create-for-role', auth(['admin']), notificationController.createForRole);

module.exports = router;
