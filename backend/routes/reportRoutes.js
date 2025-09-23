const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middlewares/auth');

// Estadísticas generales del sistema
router.get('/stats', authMiddleware(['admin', 'jefa_comercial', 'gerencia', 'jefe_laboratorio', 'usuario_laboratorio']), reportController.getSystemStats);

// Reportes específicos
router.get('/ventas-por-vendedor', authMiddleware(['admin', 'jefa_comercial', 'gerencia', 'jefe_laboratorio', 'usuario_laboratorio']), reportController.getVentasPorVendedor);
router.get('/proyectos-por-estado', authMiddleware(['admin', 'jefa_comercial', 'gerencia', 'jefe_laboratorio', 'usuario_laboratorio']), reportController.getProyectosPorEstado);
router.get('/cotizaciones', authMiddleware(['admin', 'jefa_comercial', 'gerencia', 'jefe_laboratorio', 'usuario_laboratorio']), reportController.getCotizacionesPorPeriodo);
router.get('/clientes-activos', authMiddleware(['admin', 'jefa_comercial', 'gerencia', 'jefe_laboratorio', 'usuario_laboratorio']), reportController.getClientesActivos);

// Datos para filtros
router.get('/vendedores', authMiddleware(['admin', 'jefa_comercial', 'gerencia', 'jefe_laboratorio', 'usuario_laboratorio']), reportController.getVendedores);

// Dashboard top 10 vendedores
router.get('/dashboard-top10', authMiddleware(['admin', 'jefa_comercial', 'gerencia', 'jefe_laboratorio', 'usuario_laboratorio']), reportController.getDashboardTop10);

// Metas mensuales
router.get('/monthly-goal', authMiddleware(['admin', 'jefa_comercial', 'gerencia', 'jefe_laboratorio', 'usuario_laboratorio']), reportController.getMonthlyGoal);
router.post('/monthly-goal', authMiddleware(['admin', 'jefa_comercial', 'gerencia']), reportController.setMonthlyGoal);

module.exports = router;