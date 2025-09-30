const express = require('express');
const router = express.Router();
const quoteApprovalController = require('../controllers/quoteApprovalController');
const auth = require('../middlewares/auth');

// Aplicar autenticación a todas las rutas
router.use(auth());

// Aprobar cotización (vendedor autónomo)
router.post('/:quoteId/approve', quoteApprovalController.approveQuote);

// Revertir cotización a borrador (vendedor autónomo)
router.post('/:quoteId/revert', quoteApprovalController.revertToDraft);

// Marcar como facturada (solo facturación)
router.post('/:quoteId/invoice', quoteApprovalController.markAsInvoiced);

// Obtener mis cotizaciones (con filtros)
router.get('/my-quotes', quoteApprovalController.getMyQuotes);

module.exports = router;
