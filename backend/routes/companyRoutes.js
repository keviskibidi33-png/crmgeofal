const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { 
  listCompanies, 
  getCompanyStats, 
  getCompanyFilterOptions, 
  searchCompanies,
  createCompany,
  getOrCreateCompany
} = require('../controllers/companyController');

// Ruta para listar empresas con paginación y filtros
router.get('/', auth(), listCompanies);

// Ruta para obtener estadísticas de empresas
router.get('/stats', auth(), getCompanyStats);

// Ruta para crear empresa
router.post('/', auth(), createCompany);

// Ruta para obtener opciones de filtros
router.get('/filter-options', auth(), getCompanyFilterOptions);

// Ruta para búsqueda de empresas/personas
router.get('/search', auth(), searchCompanies);

// Ruta para obtener o crear empresa (para cotizaciones)
router.post('/get-or-create', auth(), getOrCreateCompany);

module.exports = router;