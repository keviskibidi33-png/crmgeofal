const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');
const auth = require('../middlewares/auth');


// Listar todas las cotizaciones o por proyecto
router.get('/', auth(), quoteController.getAll);
// Obtener cotización por id
router.get('/:id', auth(), quoteController.getById);
// Crear cotización
router.post('/', auth(['jefa_comercial','vendedor_comercial','admin']), quoteController.create);
// Editar cotización
router.put('/:id', auth(['jefa_comercial','vendedor_comercial','admin']), quoteController.update);
// Eliminar cotización
router.delete('/:id', auth(['jefa_comercial','admin']), quoteController.delete);

module.exports = router;
