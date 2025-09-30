const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const auth = require('../middlewares/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(auth());

// Rutas de plantillas
router.get('/client', templateController.getTemplatesByUser);
router.post('/', templateController.createTemplate);
router.get('/:id', templateController.getTemplateById);
router.put('/:id', templateController.updateTemplate);
router.delete('/:id', templateController.deleteTemplate);

module.exports = router;
