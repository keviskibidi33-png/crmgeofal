const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const auth = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento para adjuntos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Listar tickets (todos para sistemas, propios para usuarios)
router.get('/', auth(), ticketController.getAll);
// Ver ticket por id
router.get('/:id', auth(), ticketController.getById);
// Crear ticket con adjunto
router.post('/', auth(), upload.single('attachment'), ticketController.create);
// Cambiar estado (sistemas, soporte, admin)
router.put('/:id/status', auth(['sistemas','soporte','admin']), ticketController.updateStatus);
// Historial de ticket
router.get('/:ticket_id/history', auth(), ticketController.getHistory);
// Historial global de tickets
router.get('/history/global', auth(['admin','sistemas','soporte','gerencia']), ticketController.getGlobalHistory);

module.exports = router;
