const express = require('express');
const router = express.Router();
const auditQuoteController = require('../controllers/auditQuoteController');
const auth = require('../middlewares/auth');

// Solo jefes y sistemas pueden ver auditoría
router.get('/', auth(['admin','sistemas','jefa_comercial','jefe_laboratorio']), auditQuoteController.getAll);

module.exports = router;
