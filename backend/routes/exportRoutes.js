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

module.exports = router;
