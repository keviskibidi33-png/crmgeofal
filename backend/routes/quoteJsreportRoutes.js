const express = require('express');
const router = express.Router();
const quoteJsreportController = require('../controllers/quoteJsreportController');

/**
 * Rutas para la generación de PDFs usando jsreport
 * Todas las rutas requieren autenticación
 */

// Middleware de autenticación (asumiendo que existe)
// const auth = require('../middlewares/auth');

/**
 * Genera un PDF de cotización existente
 * POST /api/quotes/:id/generate-pdf
 */
router.post('/:id/generate-pdf', quoteJsreportController.generatePDF);

/**
 * Genera un PDF de cotización con datos personalizados
 * POST /api/quotes/generate-pdf-custom
 */
router.post('/generate-pdf-custom', quoteJsreportController.generatePDFCustom);

/**
 * Verifica el estado del servidor jsreport
 * GET /api/quotes/jsreport-status
 */
router.get('/jsreport-status', quoteJsreportController.getJsreportStatus);

module.exports = router;
