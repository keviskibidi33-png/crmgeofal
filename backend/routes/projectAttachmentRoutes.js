const express = require('express');
const router = express.Router();
const projectAttachmentController = require('../controllers/projectAttachmentController');
const auth = require('../middlewares/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Ventas, jefes, gerencia y admin pueden ver adjuntos
router.get('/project/:project_id', auth(['vendedor_comercial','jefa_comercial','jefe_comercial','gerencia','admin']), projectAttachmentController.getAllByProject);
// Solo ventas y jefes pueden adjuntar
router.post('/', auth(['vendedor_comercial','jefa_comercial','jefe_comercial']), upload.single('file'), projectAttachmentController.create);
// Solo ventas y jefes pueden eliminar, admin puede todo
router.delete('/:id', auth(['vendedor_comercial','jefa_comercial','jefe_comercial','admin']), projectAttachmentController.delete);

module.exports = router;
