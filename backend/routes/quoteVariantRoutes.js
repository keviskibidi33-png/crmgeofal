const express = require('express');
const router = express.Router();
const quoteVariantController = require('../controllers/quoteVariantController');
const auth = require('../middlewares/auth');

// Listar variantes
router.get('/', auth(), quoteVariantController.getAll);
// Obtener variante por id
router.get('/:id', auth(), quoteVariantController.getById);
// Crear variante
router.post('/', auth(['admin','sistemas']), quoteVariantController.create);
// Editar variante
router.put('/:id', auth(['admin','sistemas']), quoteVariantController.update);
// Eliminar variante
router.delete('/:id', auth(['admin','sistemas']), quoteVariantController.delete);

module.exports = router;
