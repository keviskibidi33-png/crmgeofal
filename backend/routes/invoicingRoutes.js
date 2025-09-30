const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const invoicingController = require('../controllers/invoicingController');
const auth = require('../middlewares/auth');

// Configurar multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/invoices/');
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
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo PDF, DOC, DOCX'));
    }
  }
});

// Aplicar middleware de autenticación a todas las rutas
router.use(auth());

// Rutas de facturación
router.get('/projects', invoicingController.getProjectsForInvoicing);
router.post('/upload-invoice', upload.single('invoice_file'), invoicingController.uploadInvoiceToProject);
router.get('/projects/:id/invoices', invoicingController.getProjectInvoices);
router.get('/stats', invoicingController.getInvoicingStats);

module.exports = router;
