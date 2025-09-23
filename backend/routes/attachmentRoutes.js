const express = require('express');
const router = express.Router();
const attachmentController = require('../controllers/attachmentController');
const auth = require('../middlewares/auth');

// Rutas para adjuntos de proyectos
router.get('/all', auth(), attachmentController.getAllAttachments);
router.get('/:projectId/attachments', auth(), attachmentController.getByProject);
router.get('/:projectId/attachments/stats', auth(), attachmentController.getStats);
router.post('/:projectId/attachments', auth(), attachmentController.uploadMiddleware, attachmentController.upload);
router.get('/:id', auth(), attachmentController.getById);
router.put('/:id', auth(), attachmentController.uploadMiddleware, attachmentController.update);
router.delete('/:id', auth(), attachmentController.delete);
router.get('/:id/download', auth(), attachmentController.download);
router.get('/:id/view', auth(), attachmentController.view);

// Rutas para gestión de almacenamiento
router.get('/storage/stats', auth(), attachmentController.getStorageStats);
router.post('/storage/create-folders', auth(), attachmentController.createAnticipatoryFolders);
router.post('/storage/compress', auth(), attachmentController.compressOldFolders);

module.exports = router;
