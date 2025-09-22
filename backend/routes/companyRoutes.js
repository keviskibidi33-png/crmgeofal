const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const auth = require('../middlewares/auth');

// Solo usuarios autenticados pueden acceder
router.get('/', auth(), companyController.getAll);
router.get('/stats', auth(), companyController.getStats);
router.get('/:id', auth(), companyController.getById);
router.post('/', auth(['jefa_comercial','vendedor_comercial']), companyController.create);
router.put('/:id', auth(['jefa_comercial','vendedor_comercial']), companyController.update);
router.delete('/:id', auth(['jefa_comercial']), companyController.delete);

module.exports = router;
