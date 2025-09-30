const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const shipmentController = require('../controllers/shipmentController');
const auth = require('../middlewares/auth');

// Configurar multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/shipments/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB límite
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  }
});

// Aplicar middleware de autenticación a todas las rutas
router.use(auth());

// Rutas de envíos
router.get('/commercial', shipmentController.getShipmentsForCommercial);
router.get('/laboratory', shipmentController.getShipmentsForLaboratory);
router.post('/', shipmentController.createShipment);
router.get('/:id', shipmentController.getShipmentDetails);
router.post('/:id/status', upload.array('files', 5), shipmentController.updateShipmentStatus);

module.exports = router;
