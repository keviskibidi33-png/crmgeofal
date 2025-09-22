const express = require('express');
const router = express.Router();
const subcategoryController = require('../controllers/subcategoryController');
const auth = require('../middlewares/auth');

// Rutas para subcategorías de proyectos
router.get('/', auth(), subcategoryController.getAll);
router.get('/:id', auth(), subcategoryController.getById);
router.post('/', auth(['admin', 'jefa_comercial']), subcategoryController.create);
router.put('/:id', auth(['admin', 'jefa_comercial']), subcategoryController.update);
router.delete('/:id', auth(['admin', 'jefa_comercial']), subcategoryController.delete);

module.exports = router;