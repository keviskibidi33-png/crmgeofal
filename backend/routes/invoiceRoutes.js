const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const auth = require('../middlewares/auth');

// Listar facturas (jefa_comercial, admin, facturacion)
router.get('/', auth(['jefa_comercial','admin','facturacion']), invoiceController.getAll);
// Ver factura por id
router.get('/:id', auth(['jefa_comercial','admin','facturacion']), invoiceController.getById);
// Crear factura
router.post('/', auth(['jefa_comercial','admin','facturacion']), invoiceController.create);
// Cambiar estado de pago
router.put('/:id/status', auth(['jefa_comercial','admin','facturacion']), invoiceController.updateStatus);

module.exports = router;
