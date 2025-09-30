const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middlewares/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(auth());

// Dashboard general
router.get('/stats', dashboardController.getDashboardStats);

// Dashboard para Jefa Comercial
router.get('/jefa-comercial', dashboardController.getSalesDashboard);

// Dashboard para Vendedor Comercial
router.get('/vendedor-comercial', dashboardController.getSalesDashboard);

// Dashboard para Laboratorio (Jefe y Usuario)
router.get('/laboratorio', dashboardController.getLabDashboard);

// Dashboard para Facturación
router.get('/facturacion', dashboardController.getBillingDashboard);

// Dashboard para Soporte
router.get('/soporte', dashboardController.getSupportDashboard);

// Dashboard para Gerencia
router.get('/gerencia', dashboardController.getManagementDashboard);

module.exports = router;
