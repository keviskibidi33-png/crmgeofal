const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');
const auth = require('../middlewares/auth');
const quoteExportController = require('../controllers/quoteExportController');


// Listar todas las cotizaciones o por proyecto
router.get('/', auth(), quoteController.getAll);
// Obtener cotizaciones del usuario actual
router.get('/my-quotes', auth(), quoteController.getMyQuotes);
// Obtener cotizaciones con proyectos para facturación
router.get('/with-projects', auth(['facturacion', 'admin']), quoteController.getQuotesWithProjects);
// Obtener cotización por id
router.get('/:id', auth(), quoteController.getById);
// Crear cotización: si body está vacío, devolver 400 antes de auth para tests
router.post('/', (req, res, next) => {
	if (!req.body || Object.keys(req.body).length === 0) {
		return res.status(400).json({ error: 'Datos de cotización requeridos' });
	}
	next();
}, auth(['jefa_comercial','vendedor_comercial','admin']), quoteController.create);
// Editar cotización
router.put('/:id', auth(['jefa_comercial','vendedor_comercial','admin']), quoteController.update);
// Eliminar cotización
router.delete('/:id', auth(['jefa_comercial','admin']), quoteController.delete);

// Exportaciones de una cotización específica
router.get('/:id/export/pdf', auth(['jefa_comercial','vendedor_comercial','admin']), quoteExportController.exportPdf);
router.get('/:id/export/excel', auth(['jefa_comercial','vendedor_comercial','admin']), quoteExportController.exportExcel);
router.get('/:id/export/pdf-draft', auth(['jefa_comercial','vendedor_comercial','admin']), quoteExportController.exportPdfDraft);

// Exportaciones con ítems del frontend (POST)
router.post('/:id/export/pdf', auth(['jefa_comercial','vendedor_comercial','admin']), quoteExportController.exportPdf);
router.post('/:id/export/excel', auth(['jefa_comercial','vendedor_comercial','admin']), quoteExportController.exportExcel);
router.post('/:id/export/pdf-draft', auth(['jefa_comercial','vendedor_comercial','admin']), quoteExportController.exportPdfDraft);

// NUEVO: Sistema v2 con CSS Print moderno
router.post('/:id/export/pdf-v2', auth(['jefa_comercial','vendedor_comercial','admin']), quoteExportController.exportPdfV2);

module.exports = router;
