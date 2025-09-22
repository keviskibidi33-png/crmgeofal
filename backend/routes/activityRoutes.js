const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const auth = require('../middlewares/auth');

// Rutas protegidas - solo usuarios autenticados
router.get('/recent', auth(), activityController.getRecentActivities);
router.get('/user', auth(), activityController.getUserActivities);
router.get('/stats', auth(), activityController.getActivityStats);
router.get('/type/:type', auth(), activityController.getActivitiesByType);
router.get('/entity/:entityType/:entityId', auth(), activityController.getActivitiesByEntity);

// Ruta administrativa - solo admin
router.post('/create', auth(['admin']), activityController.createActivity);

module.exports = router;
