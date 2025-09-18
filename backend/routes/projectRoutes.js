const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middlewares/auth');

// Acceso según rol y asignación
router.get('/', auth(), projectController.getAll);
router.get('/:id', auth(), projectController.getById);
router.post('/', auth(['jefa_comercial','vendedor_comercial']), projectController.create);
router.put('/:id', auth(['jefa_comercial','vendedor_comercial']), projectController.update);
router.delete('/:id', auth(['jefa_comercial']), projectController.delete);

module.exports = router;
