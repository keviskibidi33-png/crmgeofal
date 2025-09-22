const express = require('express');
const router = express.Router();
const recuperadosController = require('../controllers/recuperadosController');
const auth = require('../middlewares/auth');

// Solo usuarios autenticados pueden acceder
router.get('/', auth(['admin','jefa_comercial','vendedor_comercial']), recuperadosController.getRecuperados);

module.exports = router;
