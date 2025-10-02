const express = require('express');
const router = express.Router();
const funnelController = require('../controllers/funnelController');
const auth = require('../middlewares/auth');

// Aplicar autenticación a todas las rutas
router.use(auth());

// Rutas de métricas de embudo
router.get('/distribution', funnelController.getServiceDistribution);
router.get('/category-ranking', funnelController.getCategoryRanking);
router.get('/ensayos-ranking', funnelController.getEnsayosRanking);
router.get('/hierarchical-structure', funnelController.getHierarchicalStructure);
router.get('/categories', funnelController.getConversionByCategory);
router.get('/trends', funnelController.getMonthlyTrends);
router.get('/underutilized', funnelController.getUnderutilizedServices);
router.get('/performance', funnelController.getSalespersonPerformance);
router.get('/summary', funnelController.getExecutiveSummary);
router.get('/by-area', funnelController.getFunnelByArea);
router.get('/approval-metrics', funnelController.getApprovalMetrics);

// ✅ NUEVO: Endpoint para alimentar embudo
router.post('/alimentar-embudo', funnelController.alimentarEmbudo);

module.exports = router;