
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');

// Aplicar autenticación a todas las rutas
router.use(auth());

router.get('/', userController.getAllUsers);
router.get('/stats', userController.getUserStats);
router.get('/areas', userController.getAreas);
router.post('/', userController.createUser);
// Activar/desactivar notificaciones por usuario
router.patch('/:id/notification', userController.setNotificationEnabled);
// Editar usuario
router.put('/:id', userController.updateUser);
router.patch('/:id', userController.updateUser);
// Eliminar usuario
router.delete('/:id', userController.deleteUser);

module.exports = router;
