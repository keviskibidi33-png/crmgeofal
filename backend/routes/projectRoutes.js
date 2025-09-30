const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middlewares/auth');

// Acceso según rol y asignación
router.get('/', auth(), projectController.getAll);
router.get('/stats', auth(), projectController.getStats);
router.get('/services', auth(), projectController.getExistingServices);
router.get('/for-invoicing', auth(['facturacion', 'admin']), projectController.getProjectsForInvoicing);
router.get('/:id', auth(), projectController.getById);
router.post('/', auth(['jefa_comercial','vendedor_comercial','admin']), projectController.create);
router.put('/:id', auth(['jefa_comercial','vendedor_comercial','admin']), projectController.update);
router.patch('/:id', auth(['jefa_comercial','vendedor_comercial','admin']), projectController.update);
router.put('/:id/status', auth(['jefa_comercial','vendedor_comercial','admin']), projectController.updateStatus);
router.put('/:id/categories', auth(['jefa_comercial','vendedor_comercial','admin']), projectController.updateCategories);
router.put('/:id/queries', auth(['jefa_comercial','vendedor_comercial','admin']), projectController.updateQueries);
router.put('/:id/mark', auth(['jefa_comercial','vendedor_comercial','admin']), projectController.updateMark);
router.delete('/:id', auth(['jefa_comercial','admin']), projectController.delete);

module.exports = router;
