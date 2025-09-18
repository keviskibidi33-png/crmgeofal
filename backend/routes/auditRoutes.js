const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const auth = require('../middlewares/auth');

// Solo admin, sistemas y jefes pueden ver auditoría
router.get('/', auth(['admin','sistemas','jefa_comercial','jefe_laboratorio']), auditController.getAll);

module.exports = router;
