const express = require('express');
const router = express.Router();
const projectServiceController = require('../controllers/projectServiceController');
const auth = require('../middlewares/auth');

router.get('/project/:project_id', auth(), projectServiceController.getAllByProject);
router.post('/', auth(['jefa_comercial','jefe_laboratorio','vendedor_comercial','usuario_laboratorio','admin']), projectServiceController.create);

module.exports = router;
