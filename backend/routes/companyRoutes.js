const express = require('express');
const router = express.Router();
const { searchCompanies } = require('../controllers/companyController');

// Ruta para búsqueda de empresas/personas
router.get('/search', searchCompanies);

module.exports = router;