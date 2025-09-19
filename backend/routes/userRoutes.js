// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
// Activar/desactivar notificaciones por usuario
router.patch('/:id/notification', userController.setNotificationEnabled);

module.exports = router;
