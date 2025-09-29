const QuoteApproval = require('../models/quoteApproval');

// Crear solicitud de aprobación
exports.createApprovalRequest = async (req, res) => {
  try {
    const { quote_id, request_data } = req.body;
    const userId = req.user.id;
    
    const approval = await QuoteApproval.createApprovalRequest(quote_id, userId, request_data);
    
    res.json({
      success: true,
      message: 'Solicitud de aprobación creada',
      data: approval
    });
  } catch (error) {
    console.error('Error creating approval request:', error);
    res.status(500).json({ error: error.message });
  }
};

// Aprobar cotización
exports.approveQuote = async (req, res) => {
  try {
    const { approvalId } = req.body;
    const userId = req.user.id;
    
    const approval = await QuoteApproval.approveQuote(approvalId, userId);
    
    res.json({
      success: true,
      message: 'Cotización aprobada exitosamente',
      data: approval
    });
  } catch (error) {
    console.error('Error approving quote:', error);
    res.status(500).json({ error: error.message });
  }
};

// Rechazar cotización
exports.rejectQuote = async (req, res) => {
  try {
    const { approvalId, reason } = req.body;
    const userId = req.user.id;
    
    const approval = await QuoteApproval.rejectQuote(approvalId, userId, reason);
    
    res.json({
      success: true,
      message: 'Cotización rechazada',
      data: approval
    });
  } catch (error) {
    console.error('Error rejecting quote:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener solicitudes pendientes
exports.getPendingApprovals = async (req, res) => {
  try {
    console.log('🔔 getPendingApprovals - Iniciando...');
    const userRole = req.user.role;
    const approvals = await QuoteApproval.getPendingApprovals(userRole);
    console.log('🔔 getPendingApprovals - Aprobaciones encontradas:', approvals.length);
    
    res.json(approvals);
  } catch (error) {
    console.error('❌ Error getting pending approvals:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener cotizaciones aprobadas
exports.getApprovedQuotes = async (req, res) => {
  try {
    console.log('📊 getApprovedQuotes - Iniciando...');
    const userRole = req.user.role;
    const filters = req.query;
    const quotes = await QuoteApproval.getApprovedQuotes(userRole, filters);
    console.log('📊 getApprovedQuotes - Cotizaciones encontradas:', quotes.length);
    
    res.json(quotes);
  } catch (error) {
    console.error('❌ Error getting approved quotes:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener historial de aprobaciones
exports.getApprovalHistory = async (req, res) => {
  try {
    const { quote_id } = req.params;
    const history = await QuoteApproval.getApprovalHistory(quote_id);
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('❌ Error getting approval history:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener estadísticas de aprobaciones
exports.getApprovalStats = async (req, res) => {
  try {
    const userRole = req.user.role;
    const filters = req.query;
    
    const stats = await QuoteApproval.getApprovalStats(userRole, filters);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error getting approval stats:', error);
    res.status(500).json({ error: error.message });
  }
};