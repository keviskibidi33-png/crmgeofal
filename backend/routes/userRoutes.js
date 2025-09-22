
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getAllUsers);
router.get('/stats', userController.getUserStats);
router.get('/areas', userController.getAreas);
router.post('/', userController.createUser);
// Activar/desactivar notificaciones por usuario
router.patch('/:id/notification', userController.setNotificationEnabled);
// Editar usuario
router.patch('/:id', userController.updateUser);
// Restablecer contraseña
router.post('/:id/reset-password', userController.resetPassword);
// Eliminar usuario
router.delete('/:id', userController.deleteUser);

module.exports = router;
