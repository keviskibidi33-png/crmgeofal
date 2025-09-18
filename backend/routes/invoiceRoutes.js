const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const auth = require('../middlewares/auth');

// Listar facturas (solo jefa_comercial, admin)
router.get('/', auth(['jefa_comercial','admin']), invoiceController.getAll);
// Ver factura por id
router.get('/:id', auth(['jefa_comercial','admin']), invoiceController.getById);
// Crear factura
router.post('/', auth(['jefa_comercial','admin']), invoiceController.create);
// Cambiar estado de pago
router.put('/:id/status', auth(['jefa_comercial','admin']), invoiceController.updateStatus);

module.exports = router;
