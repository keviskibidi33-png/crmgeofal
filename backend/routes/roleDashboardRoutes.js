const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const roleDashboardController = require('../controllers/roleDashboardController');
const auth = require('../middlewares/auth');

// Endpoint de prueba sin autenticación
router.get('/gerencia-test', (req, res) => {
  res.json({ message: 'Endpoint de prueba funcionando', timestamp: new Date().toISOString() });
});

// Endpoint de prueba del controlador sin autenticación
router.get('/gerencia-controller-test', roleDashboardController.getGerenciaDashboard);

// Aplicar middleware de autenticación a todas las rutas
router.use(auth());

// Dashboard general
router.get('/stats', dashboardController.getDashboardStats);

// Dashboard para Jefa Comercial
router.get('/jefa-comercial', dashboardController.getSalesDashboard);

// Dashboard para Vendedor Comercial
router.get('/vendedor-comercial', roleDashboardController.getVendedorComercialDashboard);

// Dashboard para Laboratorio (Jefe y Usuario)
router.get('/laboratorio', dashboardController.getLabDashboard);

// Dashboard para Facturación
router.get('/facturacion', dashboardController.getBillingDashboard);

// Dashboard para Soporte
router.get('/soporte', dashboardController.getSupportDashboard);

// Dashboard para Gerencia
router.get('/gerencia', roleDashboardController.getGerenciaDashboard);

module.exports = router;
