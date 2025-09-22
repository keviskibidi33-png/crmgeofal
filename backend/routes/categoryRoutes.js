const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middlewares/auth');

// Rutas para categorías de proyectos
router.get('/', auth(), categoryController.getAll);
router.get('/:id', auth(), categoryController.getById);
router.post('/', auth(['admin', 'jefa_comercial']), categoryController.create);
router.put('/:id', auth(['admin', 'jefa_comercial']), categoryController.update);
router.delete('/:id', auth(['admin', 'jefa_comercial']), categoryController.delete);

module.exports = router;