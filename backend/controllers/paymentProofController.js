const PaymentProof = require('../models/paymentProof');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const notificationSystem = require('../services/notificationSystem');

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/payment-proofs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `payment-proof-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB límite
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen, PDF o documentos'));
    }
  }
});

// Middleware para subida de archivos
exports.uploadPaymentProof = upload.fields([
  { name: 'payment_proof', maxCount: 1 },
  { name: 'quote_file', maxCount: 1 }
]);

// Crear comprobante de pago
exports.createPaymentProof = async (req, res) => {
  try {
    if (!req.files || !req.files.payment_proof) {
      return res.status(400).json({ error: 'Archivo de comprobante requerido' });
    }

    const { quote_id, description, amount_paid, payment_date, payment_method, client_name, client_email, client_phone, client_address, project_id } = req.body;
    const userId = req.user.id;

    // Verificar que la cotización existe
    const pool = require('../config/db');
    const quoteCheck = await pool.query('SELECT id FROM quotes WHERE id = $1', [quote_id]);
    if (quoteCheck.rows.length === 0) {
      return res.status(400).json({ error: `Cotización con ID ${quote_id} no existe` });
    }

    const proofData = {
      file_path: req.files.payment_proof[0].path,
      file_name: req.files.payment_proof[0].originalname,
      file_type: req.files.payment_proof[0].mimetype,
      file_size: req.files.payment_proof[0].size,
      description,
      amount_paid: parseFloat(amount_paid),
      payment_date,
      payment_method,
      client_name,
      client_email,
      client_phone,
      client_address,
      project_id
    };

    // Guardar archivo de cotización si existe
    if (req.files.quote_file && req.files.quote_file[0]) {
      proofData.quote_file_path = req.files.quote_file[0].path;
      proofData.quote_file_name = req.files.quote_file[0].originalname;
    }


    const proof = await PaymentProof.createPaymentProof(quote_id, userId, proofData);

    // Notificar a facturación
    await notificationSystem.notifyNewPaymentProof(proof.id);

    res.json({
      success: true,
      message: 'Comprobante de pago subido exitosamente',
      data: proof
    });
  } catch (error) {
    console.error('Error creating payment proof:', error);
    res.status(500).json({ error: error.message });
  }
};

// Aprobar comprobante de pago
exports.approvePaymentProof = async (req, res) => {
  try {
    const { proofId, notes } = req.body;
    const userId = req.user.id;

    const proof = await PaymentProof.approvePaymentProof(proofId, userId, { notes });

    // Notificar aprobación
    await notificationSystem.notifyPaymentProofApproved(proof.id);

    res.json({
      success: true,
      message: 'Comprobante de pago aprobado exitosamente',
      data: proof
    });
  } catch (error) {
    console.error('Error approving payment proof:', error);
    res.status(500).json({ error: error.message });
  }
};

// Rechazar comprobante de pago
exports.rejectPaymentProof = async (req, res) => {
  try {
    const { proofId, reason } = req.body;
    const userId = req.user.id;

    const proof = await PaymentProof.rejectPaymentProof(proofId, userId, reason);

    // Notificar rechazo
    await notificationSystem.notifyPaymentProofRejected(proof.id, reason);

    res.json({
      success: true,
      message: 'Comprobante de pago rechazado',
      data: proof
    });
  } catch (error) {
    console.error('Error rejecting payment proof:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener comprobantes pendientes
exports.getPendingProofs = async (req, res) => {
  try {
    console.log('🔍 getPendingProofs - Iniciando...');
    const userRole = req.user.role;
    const proofs = await PaymentProof.getPendingProofs(userRole);
    console.log('🔍 getPendingProofs - Comprobantes encontrados:', proofs.length);
    
    res.json(proofs);
  } catch (error) {
    console.error('❌ Error getting pending proofs:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener comprobantes aprobados
exports.getApprovedProofs = async (req, res) => {
  try {
    console.log('📊 getApprovedProofs - Iniciando...');
    const userRole = req.user.role;
    const filters = req.query;
    const proofs = await PaymentProof.getApprovedProofs(userRole, filters);
    console.log('📊 getApprovedProofs - Comprobantes encontrados:', proofs.length);
    
    res.json(proofs);
  } catch (error) {
    console.error('❌ Error getting approved proofs:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener comprobantes por cotización
exports.getProofsByQuote = async (req, res) => {
  try {
    const { quoteId } = req.params;
    const proofs = await PaymentProof.getProofsByQuote(quoteId);
    
    res.json({
      success: true,
      data: proofs
    });
  } catch (error) {
    console.error('❌ Error getting proofs by quote:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener mis envíos (para vendedores)
exports.getMySubmissions = async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = require('../config/db');
    
    const result = await pool.query(`
      SELECT 
        pp.*,
        q.quote_number,
        q.total_amount,
        q.project_id,
        p.name as project_name,
        c.name as company_name,
        c.ruc as company_ruc
      FROM payment_proofs pp
      JOIN quotes q ON pp.quote_id = q.id
      LEFT JOIN projects p ON q.project_id = p.id
      LEFT JOIN companies c ON p.company_id = c.id
      WHERE pp.uploaded_by = $1
      ORDER BY pp.created_at DESC
    `, [userId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error getting my submissions:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener estadísticas de pagos
exports.getPaymentStats = async (req, res) => {
  try {
    const userRole = req.user.role;
    const filters = req.query;
    
    const stats = await PaymentProof.getPaymentStats(userRole, filters);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error getting payment stats:', error);
    res.status(500).json({ error: error.message });
  }
};

// Descargar archivo de comprobante
exports.downloadProof = async (req, res) => {
  try {
    const { proofId } = req.params;
    
    const pool = require('../config/db');
    const result = await pool.query(`
      SELECT file_path, file_name, file_type 
      FROM payment_proofs 
      WHERE id = $1
    `, [proofId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Comprobante no encontrado' });
    }
    
    const proof = result.rows[0];
    
    if (!fs.existsSync(proof.file_path)) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    res.download(proof.file_path, proof.file_name);
  } catch (error) {
    console.error('❌ Error downloading proof:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener comprobante por ID
exports.getProofById = async (req, res) => {
  try {
    const { proofId } = req.params;
    
    const pool = require('../config/db');
    const result = await pool.query(`
      SELECT pp.*, q.quote_number, q.client_contact as client_name, q.total, q.created_at as quote_created_at,
             p.name as company_name, u.name as user_name
      FROM payment_proofs pp
      LEFT JOIN quotes q ON pp.quote_id = q.id
      LEFT JOIN projects p ON q.project_id = p.id
      LEFT JOIN users u ON pp.uploaded_by = u.id
      WHERE pp.id = $1
    `, [proofId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Comprobante no encontrado' });
    }
    
    const proof = result.rows[0];
    
    console.log('🔍 getProofById - Datos del comprobante:', {
      id: proof.id,
      payment_proof_path: proof.payment_proof_path,
      quote_file_path: proof.quote_file_path,
      file_path: proof.file_path,
      file_name: proof.file_name
    });
    
    // Parsear archivos del proyecto si existen
    if (proof.project_files) {
      try {
        proof.project_files = JSON.parse(proof.project_files);
      } catch (e) {
        proof.project_files = [];
      }
    } else {
      proof.project_files = [];
    }
    
    res.json({ data: proof });
  } catch (error) {
    console.error('❌ Error getting proof by ID:', error);
    res.status(500).json({ error: error.message });
  }
};

// Descargar archivo específico
exports.downloadFile = async (req, res) => {
  try {
    const { path: filePath, type } = req.query;
    
    console.log('🔍 downloadFile - Parámetros recibidos:', { filePath, type });
    
    if (!filePath) {
      return res.status(400).json({ error: 'Ruta del archivo requerida' });
    }
    
    // Decodificar la ruta URL-encoded
    const decodedPath = decodeURIComponent(filePath);
    const fullPath = path.resolve(decodedPath);
    
    console.log('🔍 downloadFile - Ruta decodificada:', decodedPath);
    console.log('🔍 downloadFile - Ruta completa:', fullPath);
    console.log('🔍 downloadFile - ¿Existe el archivo?', fs.existsSync(fullPath));
    
    if (!fs.existsSync(fullPath)) {
      console.log('❌ Archivo no encontrado:', fullPath);
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    const fileName = path.basename(fullPath);
    console.log('✅ Descargando archivo:', fileName);
    res.download(fullPath, fileName);
  } catch (error) {
    console.error('❌ Error downloading file:', error);
    res.status(500).json({ error: error.message });
  }
};

// Archivar comprobante
exports.archivePaymentProof = async (req, res) => {
  try {
    const { proofId } = req.params;
    const userId = req.user.id;
    
    const proof = await PaymentProof.archivePaymentProof(proofId, userId);
    
    res.json({
      success: true,
      message: 'Comprobante archivado exitosamente',
      data: proof
    });
  } catch (error) {
    console.error('❌ Error archiving payment proof:', error);
    res.status(500).json({ error: error.message });
  }
};

// Desarchivar comprobante
exports.unarchivePaymentProof = async (req, res) => {
  try {
    const { proofId } = req.params;
    
    const proof = await PaymentProof.unarchivePaymentProof(proofId);
    
    res.json({
      success: true,
      message: 'Comprobante desarchivado exitosamente',
      data: proof
    });
  } catch (error) {
    console.error('❌ Error unarchiving payment proof:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener comprobantes archivados
exports.getArchivedProofs = async (req, res) => {
  try {
    const filters = req.query;
    const proofs = await PaymentProof.getArchivedProofs(filters);
    
    res.json(proofs);
  } catch (error) {
    console.error('❌ Error getting archived proofs:', error);
    res.status(500).json({ error: error.message });
  }
};

