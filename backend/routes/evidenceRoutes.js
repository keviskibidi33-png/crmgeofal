const express = require('express');
const router = express.Router();
const evidenceController = require('../controllers/evidenceController');
const auth = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');

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

// Listar evidencias
router.get('/', auth(), evidenceController.getAll);
// Subir evidencia
router.post('/', auth(), upload.single('file'), evidenceController.create);

module.exports = router;
