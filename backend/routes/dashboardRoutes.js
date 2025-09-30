const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middlewares/auth');

// Ruta para obtener estadísticas del dashboard
router.get('/stats', auth(), dashboardController.getDashboardStats);

// Ruta temporal sin autenticación para pruebas
router.get('/stats-test', dashboardController.getDashboardStats);

// Ruta temporal para el frontend (sin autenticación)
router.get('/stats-frontend', dashboardController.getDashboardStats);

module.exports = router;
