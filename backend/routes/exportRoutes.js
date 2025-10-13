const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const authMiddleware = require('../middlewares/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Rutas para exportación
router.post('/clients/csv', exportController.exportClientsCSV);
router.post('/clients/json', exportController.exportClientsJSON);
router.post('/clients/stats', exportController.getExportStats);

module.exports = router;