// routes/exportRoutes.js
const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const auth = require('../middlewares/auth');
const fs = require('fs');
const path = require('path');

// Asegura que exista la carpeta tmp para archivos temporales
const tmpDir = path.join(__dirname, '../tmp');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

// Exportar a Excel
router.get('/excel', auth(['admin','jefa_comercial','jefe_laboratorio']), exportController.exportExcel);
// Exportar a PDF
router.get('/pdf', auth(['admin','jefa_comercial','jefe_laboratorio']), exportController.exportPDF);
// Historial de exportaciones
router.get('/history', auth(['admin','gerencia','sistemas','soporte','jefa_comercial','jefe_laboratorio']), exportController.history);
// Actualizar estado de exportación
router.put('/:id/status', auth(['admin','jefa_comercial','jefe_laboratorio']), exportController.updateStatus);
// Obtener exportaciones por cliente
router.get('/client/:client_id', auth(['admin','gerencia','sistemas','soporte','jefa_comercial','jefe_laboratorio']), exportController.getByClient);
// Obtener exportaciones por proyecto
router.get('/project/:project_id', auth(['admin','gerencia','sistemas','soporte','jefa_comercial','jefe_laboratorio']), exportController.getByProject);

module.exports = router;
