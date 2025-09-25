const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const auth = require('../middlewares/auth');

// Solo admin, sistemas y jefes pueden ver auditoría
router.get('/', auth(['admin','sistemas','jefa_comercial','jefe_laboratorio']), auditController.getAll);

// Analytics de auditoría
router.get('/analytics', auth(['admin','sistemas','jefa_comercial','jefe_laboratorio']), auditController.getAnalytics);

// Usuarios activos
router.get('/active-users', auth(['admin','sistemas','jefa_comercial','jefe_laboratorio']), auditController.getActiveUsers);

// Limpieza de registros
router.post('/cleanup', auth(['admin','sistemas']), auditController.cleanup);

// Estadísticas de limpieza
router.get('/cleanup-stats', auth(['admin','sistemas','jefa_comercial','jefe_laboratorio']), auditController.getCleanupStats);

// Distribución horaria
router.get('/hourly-distribution', auth(['admin','sistemas','jefa_comercial','jefe_laboratorio']), auditController.getHourlyDistribution);

// Exportación
router.get('/export/:format', auth(['admin','sistemas','jefa_comercial','jefe_laboratorio']), auditController.export);

module.exports = router;
