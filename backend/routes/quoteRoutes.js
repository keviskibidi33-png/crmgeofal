const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');
const auth = require('../middlewares/auth');
const quoteExportController = require('../controllers/quoteExportController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const quoteEvidencesController = require('../controllers/quoteEvidencesController');


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
// Actualizar estado de cotización
router.patch('/:id/status', auth(['jefa_comercial','vendedor_comercial','admin']), quoteController.updateStatus);
// Eliminar cotización
router.delete('/:id', auth(['jefa_comercial','admin']), quoteController.delete);
// Clonar cotización
router.post('/:id/clone', auth(['jefa_comercial','vendedor_comercial','admin']), quoteController.cloneQuote);

// Exportaciones de una cotización específica
router.get('/:id/export/pdf', auth(['jefa_comercial','vendedor_comercial','admin']), quoteExportController.exportPdf);
router.get('/:id/export/excel', auth(['jefa_comercial','vendedor_comercial','admin']), quoteExportController.exportExcel);
router.get('/:id/export/pdf-draft', auth(['jefa_comercial','vendedor_comercial','admin']), quoteExportController.exportPdfDraft);

// Exportaciones con ítems del frontend (POST)
router.post('/:id/export/pdf', auth(['jefa_comercial','vendedor_comercial','admin']), quoteExportController.exportPdf);
router.post('/:id/export/excel', auth(['jefa_comercial','vendedor_comercial','admin']), quoteExportController.exportExcel);
router.post('/:id/export/pdf-draft', auth(['jefa_comercial','vendedor_comercial','admin']), quoteExportController.exportPdfDraft);

// ===== GESTIÓN DE EVIDENCIAS =====
// Configurar multer para almacenar archivos de evidencias
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const quoteId = req.params.id || req.params.quoteId;
    const uploadPath = path.join(__dirname, '../uploads/evidences', quoteId);
    
    // Crear directorio si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 50);
    
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

// Filtro de archivos permitidos
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg',
    'image/jpg'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se aceptan PDF, Excel (.xlsx) e imágenes (PNG, JPG)'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB máximo
  }
});

// Rutas de evidencias
// POST /api/quotes/:id/evidences - Subir evidencia
router.post(
  '/:id/evidences',
  auth(['jefa_comercial','vendedor_comercial','admin']),
  upload.single('file'),
  (req, res, next) => {
    // Pasar el ID de la cotización al controlador
    req.params.quoteId = req.params.id;
    next();
  },
  quoteEvidencesController.uploadEvidence
);

// GET /api/quotes/:id/evidences - Listar evidencias de una cotización
router.get(
  '/:id/evidences',
  auth(),
  (req, res, next) => {
    req.params.quoteId = req.params.id;
    next();
  },
  quoteEvidencesController.listEvidences
);

// GET /api/quotes/:id/evidences/stats - Estadísticas de evidencias
router.get(
  '/:id/evidences/stats',
  auth(),
  (req, res, next) => {
    req.params.quoteId = req.params.id;
    next();
  },
  quoteEvidencesController.getEvidencesStats
);

// GET /api/quotes/evidences/:evidenceId/download - Descargar evidencia
router.get(
  '/evidences/:evidenceId/download',
  auth(),
  (req, res, next) => {
    req.params.id = req.params.evidenceId;
    next();
  },
  quoteEvidencesController.downloadEvidence
);

// DELETE /api/quotes/evidences/:evidenceId - Eliminar evidencia
router.delete(
  '/evidences/:evidenceId',
  auth(['jefa_comercial','vendedor_comercial','admin']),
  (req, res, next) => {
    req.params.id = req.params.evidenceId;
    next();
  },
  quoteEvidencesController.deleteEvidence
);

// PATCH /api/quotes/evidences/:evidenceId/notes - Actualizar notas
router.patch(
  '/evidences/:evidenceId/notes',
  auth(['jefa_comercial','vendedor_comercial','admin']),
  (req, res, next) => {
    req.params.id = req.params.evidenceId;
    next();
  },
  quoteEvidencesController.updateEvidenceNotes
);

module.exports = router;
