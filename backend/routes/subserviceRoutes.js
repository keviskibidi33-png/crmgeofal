const express = require('express');
const router = express.Router();
const subserviceController = require('../controllers/subserviceController');
const auth = require('../middlewares/auth');

// Búsqueda inteligente para autocompletado (público para cotizaciones)
router.get('/search', subserviceController.search);

// Obtener todos los subservicios (público para el módulo de servicios)
router.get('/', subserviceController.getAll);

// Obtener subservicio por ID
router.get('/:id', auth(['admin', 'jefe_laboratorio', 'jefa_comercial']), subserviceController.getById);

// Obtener subservicio por código
router.get('/codigo/:codigo', auth(['admin', 'jefe_laboratorio', 'jefa_comercial']), subserviceController.getByCodigo);

// Crear subservicio
router.post('/', auth(['admin', 'jefe_laboratorio']), subserviceController.create);

// Actualizar subservicio
router.put('/:id', auth(['admin', 'jefe_laboratorio']), subserviceController.update);

// Eliminar subservicio (soft delete)
router.delete('/:id', auth(['admin', 'jefe_laboratorio']), subserviceController.remove);

// Eliminar permanentemente
router.delete('/:id/permanent', auth(['admin']), subserviceController.delete);

module.exports = router;