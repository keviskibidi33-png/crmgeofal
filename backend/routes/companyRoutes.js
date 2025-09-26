const express = require('express');
const router = express.Router();
const { 
  listCompanies, 
  getCompanyStats, 
  getCompanyFilterOptions, 
  searchCompanies 
} = require('../controllers/companyController');

// Ruta para listar empresas con paginación y filtros
router.get('/', listCompanies);

// Ruta para obtener estadísticas de empresas
router.get('/stats', getCompanyStats);

// Ruta para obtener opciones de filtros
router.get('/filter-options', getCompanyFilterOptions);

// Ruta para búsqueda de empresas/personas
router.get('/search', searchCompanies);

module.exports = router;