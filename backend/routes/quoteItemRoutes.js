const express = require('express');
const router = express.Router();
const quoteItemController = require('../controllers/quoteItemController');
const auth = require('../middlewares/auth');

// Listar ítems de una cotización
router.get('/quote/:quote_id', auth(), quoteItemController.getAllByQuote);
// Obtener ítem por id
router.get('/:id', auth(), quoteItemController.getById);
// Crear ítem
router.post('/', auth(['jefa_comercial','vendedor_comercial','admin']), quoteItemController.create);
// Editar ítem
router.put('/:id', auth(['jefa_comercial','vendedor_comercial','admin']), quoteItemController.update);
// Eliminar ítem
router.delete('/:id', auth(['jefa_comercial','admin']), quoteItemController.delete);

module.exports = router;
