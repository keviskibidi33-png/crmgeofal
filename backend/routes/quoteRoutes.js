const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');
const auth = require('../middlewares/auth');

// Acceso según rol y asignación
router.get('/project/:project_id', auth(), quoteController.getAllByProject);
router.post('/', auth(['jefa_comercial','vendedor_comercial','jefe_laboratorio','usuario_laboratorio']), quoteController.create);
router.put('/:id', auth(['jefe_laboratorio','usuario_laboratorio']), quoteController.update);
router.delete('/:id', auth(['jefe_laboratorio']), quoteController.delete);

module.exports = router;
