const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middlewares/auth');

// Ruta para obtener estadísticas del dashboard
router.get('/stats', auth(), dashboardController.getDashboardStats);

module.exports = router;
