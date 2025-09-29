const express = require('express');
const router = express.Router();
const paymentProofController = require('../controllers/paymentProofController');
const auth = require('../middlewares/auth');

// Aplicar autenticación a todas las rutas
router.use(auth());

// Rutas de comprobantes de pago
router.post('/upload', paymentProofController.uploadPaymentProof, paymentProofController.createPaymentProof);
router.post('/approve', paymentProofController.approvePaymentProof);
router.post('/reject', paymentProofController.rejectPaymentProof);
router.get('/pending', paymentProofController.getPendingProofs);
router.get('/approved', paymentProofController.getApprovedProofs);
router.get('/quote/:quoteId', paymentProofController.getProofsByQuote);
router.get('/my-submissions', paymentProofController.getMySubmissions);
router.get('/stats', paymentProofController.getPaymentStats);
router.get('/download/:proofId', paymentProofController.downloadProof);
router.get('/download-file', paymentProofController.downloadFile);
router.get('/archived', paymentProofController.getArchivedProofs);
router.put('/:proofId/archive', paymentProofController.archivePaymentProof);
router.put('/:proofId/unarchive', paymentProofController.unarchivePaymentProof);
router.get('/:proofId', paymentProofController.getProofById);

module.exports = router;
