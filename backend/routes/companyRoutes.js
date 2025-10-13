const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { 
  listCompanies, 
  getCompanyStats, 
  getCompanyFilterOptions, 
  searchCompanies,
  createCompany,
  getCompanyById,
  getOrCreateCompany,
  updateClientStatus,
  updateClientManager,
  getClientHistory,
  deleteCompany
} = require('../controllers/companyController');

// Ruta para listar empresas con paginación y filtros
router.get('/', auth(), listCompanies);

// Ruta para obtener estadísticas de empresas
router.get('/stats', auth(), getCompanyStats);

// Ruta para crear empresa
router.post('/', auth(), createCompany);

// Ruta para obtener opciones de filtros (DEBE ir antes de /:id)
router.get('/filter-options', auth(), getCompanyFilterOptions);

// Ruta para búsqueda de empresas/personas (DEBE ir antes de /:id)
router.get('/search', auth(), searchCompanies);

// Ruta para obtener empresa por ID
router.get('/:id', auth(), getCompanyById);

// Ruta para actualizar empresa
router.put('/:id', auth(['admin', 'vendedor_comercial', 'jefa_comercial']), require('../controllers/companyController').updateCompany);

// Ruta para obtener o crear empresa (para cotizaciones)
router.post('/get-or-create', auth(), getOrCreateCompany);

// Ruta para actualizar estado de cliente
router.patch('/:id/status', auth(['jefa_comercial','vendedor_comercial','admin']), updateClientStatus);

// Ruta para actualizar gestor de cliente
router.patch('/:id/manager', auth(['jefa_comercial','admin']), updateClientManager);

// Ruta para obtener historial de cliente
router.get('/:id/history', auth(), getClientHistory);

// Ruta para eliminar cliente (admin y vendedor_comercial)
router.delete('/:id', auth(['admin', 'vendedor_comercial']), deleteCompany);

module.exports = router;