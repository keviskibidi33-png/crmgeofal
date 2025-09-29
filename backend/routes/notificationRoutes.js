const express = require('express');
const router = express.Router();
const notificationSystem = require('../services/notificationSystem');
const auth = require('../middlewares/auth');

// Aplicar autenticación a todas las rutas
router.use(auth());

// Notificar cotización aprobada
router.post('/quote-approved', async (req, res) => {
  try {
    const { approvalId } = req.body;
    const userId = req.user.id;
    
    await notificationSystem.notifyQuoteApproved(approvalId, userId);
    
    res.json({
      success: true,
      message: 'Notificación de aprobación enviada'
    });
  } catch (error) {
    console.error('Error sending approval notification:', error);
    res.status(500).json({ error: error.message });
  }
});

// Notificar cotización rechazada
router.post('/quote-rejected', async (req, res) => {
  try {
    const { approvalId, reason } = req.body;
    const userId = req.user.id;
    
    await notificationSystem.notifyQuoteRejected(approvalId, userId, reason);
    
    res.json({
      success: true,
      message: 'Notificación de rechazo enviada'
    });
  } catch (error) {
    console.error('Error sending rejection notification:', error);
    res.status(500).json({ error: error.message });
  }
});

// Enviar documento de cotización
router.post('/send-quote-document', async (req, res) => {
  try {
    const { quoteId, recipientEmail, recipientName } = req.body;
    
    await notificationSystem.sendQuoteDocument(quoteId, recipientEmail, recipientName);
    
    res.json({
      success: true,
      message: 'Documento de cotización enviado exitosamente'
    });
  } catch (error) {
    console.error('Error sending quote document:', error);
    res.status(500).json({ error: error.message });
  }
});

// Enviar recordatorio de pago
router.post('/send-payment-reminder', async (req, res) => {
  try {
    const { quoteId, recipientEmail, recipientName } = req.body;
    
    await notificationSystem.sendPaymentReminder(quoteId, recipientEmail, recipientName);
    
    res.json({
      success: true,
      message: 'Recordatorio de pago enviado exitosamente'
    });
  } catch (error) {
    console.error('Error sending payment reminder:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener notificaciones del usuario (ruta principal)
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, offset = 0, unreadOnly = false } = req.query;
    
    const pool = require('../config/db');
    const result = await pool.query(`
      SELECT n.*, u.name as sender_name
      FROM notifications n
      LEFT JOIN users u ON n.sender_id = u.id
      WHERE n.recipient_id = $1
      ${unreadOnly === 'true' ? 'AND n.read_at IS NULL' : ''}
      ORDER BY n.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting user notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener notificaciones del usuario (ruta alternativa)
router.get('/user-notifications', async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, offset = 0, unreadOnly = false } = req.query;
    
    const pool = require('../config/db');
    const result = await pool.query(`
      SELECT n.*, u.name as sender_name
      FROM notifications n
      LEFT JOIN users u ON n.sender_id = u.id
      WHERE n.recipient_id = $1
      ${unreadOnly === 'true' ? 'AND n.read_at IS NULL' : ''}
      ORDER BY n.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting user notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

// Marcar notificación como leída (ruta alternativa)
router.put('/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    const pool = require('../config/db');
    const result = await pool.query(`
      UPDATE notifications
      SET read_at = NOW()
      WHERE id = $1 AND recipient_id = $2
      RETURNING *
    `, [notificationId, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }
    
    res.json({
      success: true,
      message: 'Notificación marcada como leída'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: error.message });
  }
});

// Marcar notificación como leída
router.put('/mark-as-read/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    const pool = require('../config/db');
    const result = await pool.query(`
      UPDATE notifications
      SET read_at = NOW()
      WHERE id = $1 AND recipient_id = $2
      RETURNING *
    `, [notificationId, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }
    
    res.json({
      success: true,
      message: 'Notificación marcada como leída'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: error.message });
  }
});

// Marcar todas las notificaciones como leídas
router.put('/mark-all-read', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const pool = require('../config/db');
    const result = await pool.query(`
      UPDATE notifications
      SET read_at = NOW()
      WHERE recipient_id = $1 AND read_at IS NULL
      RETURNING id
    `, [userId]);
    
    res.json({
      success: true,
      message: `${result.rows.length} notificaciones marcadas como leídas`
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener estadísticas de notificaciones
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const pool = require('../config/db');
    
    // Contar notificaciones no leídas
    const unreadResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM notifications
      WHERE recipient_id = $1 AND read_at IS NULL
    `, [userId]);
    
    // Contar total de notificaciones
    const totalResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM notifications
      WHERE recipient_id = $1
    `, [userId]);
    
    res.json({
      unreadCount: parseInt(unreadResult.rows[0].count),
      totalCount: parseInt(totalResult.rows[0].count)
    });
  } catch (error) {
    console.error('Error getting notification stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Contar notificaciones no leídas
router.get('/unread-count', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const pool = require('../config/db');
    const result = await pool.query(`
      SELECT COUNT(*) as count
      FROM notifications
      WHERE recipient_id = $1 AND read_at IS NULL
    `, [userId]);
    
    res.json({
      unreadCount: parseInt(result.rows[0].count)
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: error.message });
  }
});

// Eliminar notificación
router.delete('/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    const pool = require('../config/db');
    const result = await pool.query(`
      DELETE FROM notifications
      WHERE id = $1 AND recipient_id = $2
      RETURNING *
    `, [notificationId, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }
    
    res.json({
      success: true,
      message: 'Notificación eliminada'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;