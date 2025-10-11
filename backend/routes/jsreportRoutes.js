const express = require('express');
const router = express.Router();
const jsreportController = require('../controllers/jsreportController');
const auth = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/rolePermissions');

/**
 * Rutas para jsreport - Generación de PDFs
 */

// Middleware de autenticación para todas las rutas
router.use(auth);

/**
 * @route   GET /api/jsreport/status
 * @desc    Obtener estado del servidor jsreport
 * @access  Private (Admin, Manager, User)
 */
router.get('/status', 
    checkPermission('jsreport', 'read'),
    jsreportController.obtenerEstadoServidor
);

/**
 * @route   POST /api/jsreport/generate/:id
 * @desc    Generar PDF de cotización por ID
 * @access  Private (Admin, Manager, User)
 * @params  id - ID de la cotización
 * @query   saveToDisk - true/false (default: true)
 */
router.post('/generate/:id',
    checkPermission('jsreport', 'create'),
    jsreportController.generarPDFPorId
);

/**
 * @route   POST /api/jsreport/generate
 * @desc    Generar PDF de cotización desde datos directos
 * @access  Private (Admin, Manager, User)
 * @query   saveToDisk - true/false (default: true)
 * @body    Datos de la cotización en formato jsreport
 */
router.post('/generate',
    checkPermission('jsreport', 'create'),
    jsreportController.generarPDFDirecto
);

/**
 * @route   POST /api/jsreport/test/:nombrePlantilla
 * @desc    Probar plantilla específica
 * @access  Private (Admin, Manager)
 * @params  nombrePlantilla - Nombre de la plantilla a probar
 * @body    Datos de prueba (opcional)
 */
router.post('/test/:nombrePlantilla',
    checkPermission('jsreport', 'update'),
    jsreportController.probarPlantilla
);

/**
 * @route   GET /api/jsreport/download/:fileName
 * @desc    Descargar PDF generado
 * @access  Private (Admin, Manager, User)
 * @params  fileName - Nombre del archivo PDF
 */
router.get('/download/:fileName',
    checkPermission('jsreport', 'read'),
    jsreportController.descargarPDF
);

/**
 * @route   GET /api/jsreport/templates
 * @desc    Obtener lista de plantillas disponibles
 * @access  Private (Admin, Manager)
 */
router.get('/templates',
    checkPermission('jsreport', 'read'),
    async (req, res) => {
        try {
            const jsreportService = require('../services/jsreportService');
            const plantillas = await jsreportService.obtenerPlantillas();
            
            res.json({
                success: true,
                data: plantillas
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error obteniendo plantillas',
                error: error.message
            });
        }
    }
);

/**
 * @route   POST /api/jsreport/health-check
 * @desc    Verificar salud del servidor jsreport
 * @access  Private (Admin, Manager)
 */
router.post('/health-check',
    checkPermission('jsreport', 'read'),
    async (req, res) => {
        try {
            const jsreportService = require('../services/jsreportService');
            const isHealthy = await jsreportService.checkServerHealth();
            
            res.json({
                success: true,
                data: {
                    healthy: isHealthy,
                    timestamp: new Date().toISOString(),
                    baseURL: jsreportService.baseURL
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error en health check',
                error: error.message
            });
        }
    }
);

module.exports = router;
