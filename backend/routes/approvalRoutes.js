const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approvalController');
const auth = require('../middlewares/auth');

// Ruta de prueba sin autenticación
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Ruta de aprobaciones funcionando correctamente',
    timestamp: new Date().toISOString(),
    status: 'OK'
  });
});

// Rutas de aprobaciones con autenticación
router.post('/request', auth(), approvalController.createApprovalRequest);
router.post('/approve', auth(), approvalController.approveQuote);
router.post('/reject', auth(), approvalController.rejectQuote);
router.get('/pending', auth(), approvalController.getPendingApprovals);
router.get('/approved', auth(), approvalController.getApprovedQuotes);
router.get('/history/:quote_id', auth(), approvalController.getApprovalHistory);
router.get('/stats', auth(), approvalController.getApprovalStats);

module.exports = router;
