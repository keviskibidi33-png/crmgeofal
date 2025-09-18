const express = require('express');
const router = express.Router();
const subserviceController = require('../controllers/subserviceController');
const auth = require('../middlewares/auth');

router.get('/service/:service_id', auth(), subserviceController.getAllByService);
router.post('/', auth(['jefa_comercial','jefe_laboratorio','admin']), subserviceController.create);

module.exports = router;
