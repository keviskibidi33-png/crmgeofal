const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const auth = require('../middlewares/auth');

// Rutas para servicios
router.get('/', auth(['admin', 'jefe_laboratorio', 'usuario_laboratorio', 'laboratorio']), serviceController.getAll);
router.get('/:id', auth(['admin', 'jefe_laboratorio', 'usuario_laboratorio', 'laboratorio']), serviceController.getById);
router.get('/:id/subservices', auth(['admin', 'jefe_laboratorio', 'usuario_laboratorio', 'laboratorio']), serviceController.getSubservices);
router.post('/', auth(['admin', 'jefe_laboratorio']), serviceController.create);
router.put('/:id', auth(['admin', 'jefe_laboratorio']), serviceController.update);
router.delete('/:id', auth(['admin', 'jefe_laboratorio']), serviceController.delete);
router.get('/stats/overview', auth(['admin', 'jefe_laboratorio']), serviceController.getStats);

module.exports = router;