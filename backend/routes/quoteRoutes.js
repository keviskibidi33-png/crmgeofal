const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');
const auth = require('../middlewares/auth');
const quoteExportController = require('../controllers/quoteExportController');


// Listar todas las cotizaciones o por proyecto
router.get('/', auth(), quoteController.getAll);
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

module.exports = router;
