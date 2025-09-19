const express = require('express');
const router = express.Router();
const projectWhatsappNoticeController = require('../controllers/projectWhatsappNoticeController');
const auth = require('../middlewares/auth');

// Ventas, jefes, gerencia y admin pueden ver avisos
router.get('/project/:project_id', auth(['vendedor_comercial','jefa_comercial','jefe_comercial','gerencia','admin']), projectWhatsappNoticeController.getAllByProject);
// Solo ventas y jefes pueden registrar avisos
router.post('/', auth(['vendedor_comercial','jefa_comercial','jefe_comercial']), projectWhatsappNoticeController.create);

module.exports = router;
