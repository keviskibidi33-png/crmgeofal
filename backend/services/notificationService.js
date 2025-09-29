const nodemailer = require('nodemailer');

class NotificationService {
  constructor() {
    this.pool = require('../config/db');
    this.setupEmailTransporter();
  }

  setupEmailTransporter() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Crear notificación en base de datos
  async createNotification(data) {
    const {
      type, title, message, recipient_id, sender_id,
      related_entity_type, related_entity_id, priority = 'medium',
      channels = ['database']
    } = data;

    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO notifications (
          type, title, message, recipient_id, sender_id,
          related_entity_type, related_entity_id, priority,
          channels, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        RETURNING *
      `, [
        type, title, message, recipient_id, sender_id,
        related_entity_type, related_entity_id, priority,
        JSON.stringify(channels), 'pending'
      ]);

      const notification = result.rows[0];
      await this.sendByChannels(notification, channels);
      return notification;
    } finally {
      client.release();
    }
  }

  // Enviar por canales configurados
  async sendByChannels(notification, channels) {
    for (const channel of channels) {
      try {
        switch (channel) {
          case 'email':
            await this.sendEmail(notification);
            break;
          case 'websocket':
            await this.sendWebSocket(notification);
            break;
        }
    } catch (error) {
        console.error(`Error enviando notificación por ${channel}:`, error);
      }
    }
  }

  // Enviar email
  async sendEmail(notification) {
    if (!this.transporter) return;

    const recipient = await this.pool.query(`
      SELECT name, email FROM users WHERE id = $1
    `, [notification.recipient_id]);

    if (recipient.rows.length === 0) return;

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@crmgeofal.com',
      to: recipient.rows[0].email,
      subject: `[CRM GeoFal] ${notification.title}`,
      html: this.generateEmailTemplate(notification, recipient.rows[0])
    };

    await this.transporter.sendMail(mailOptions);
    
    await this.pool.query(`
      UPDATE notifications 
      SET email_sent = true, email_sent_at = NOW()
      WHERE id = $1
    `, [notification.id]);
  }

  // Enviar por WebSocket
  async sendWebSocket(notification) {
    const io = require('./socketService').getIO();
    if (io) {
      io.to(`user_${notification.recipient_id}`).emit('notification', {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        created_at: notification.created_at
      });
    }
    
    await this.pool.query(`
      UPDATE notifications 
      SET websocket_sent = true, websocket_sent_at = NOW()
      WHERE id = $1
    `, [notification.id]);
  }

  // Generar template de email
  generateEmailTemplate(notification, recipient) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${notification.title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CRM GeoFal</h1>
            <h2>${notification.title}</h2>
          </div>
          <div class="content">
            <p>Hola ${recipient.name},</p>
            <p>${notification.message}</p>
            <p>Fecha: ${new Date(notification.created_at).toLocaleString('es-PE')}</p>
          </div>
          <div class="footer">
            <p>Este es un mensaje automático del sistema CRM GeoFal</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Notificaciones específicas del sistema de cotizaciones
  async notifyQuoteStatusChange(quoteId, newStatus, userId) {
    const quote = await this.pool.query(`
      SELECT q.*, u.name as created_by_name
      FROM quotes q
      JOIN users u ON q.created_by = u.id
      WHERE q.id = $1
    `, [quoteId]);

    if (quote.rows.length === 0) return;

    const quoteData = quote.rows[0];
    let title, message, recipientId;

    switch (newStatus) {
      case 'sent':
        title = 'Cotización Enviada para Aprobación';
        message = `La cotización ${quoteData.quote_number} ha sido enviada para aprobación.`;
        recipientId = await this.getFacturacionUserId();
        break;
      case 'approved':
        title = 'Cotización Aprobada';
        message = `La cotización ${quoteData.quote_number} ha sido aprobada.`;
        recipientId = quoteData.created_by;
        break;
      case 'rejected':
        title = 'Cotización Rechazada';
        message = `La cotización ${quoteData.quote_number} ha sido rechazada.`;
        recipientId = quoteData.created_by;
        break;
      default:
        return;
    }

    await this.createNotification({
      type: 'quote_status_change',
        title,
        message,
      recipient_id: recipientId,
      sender_id: userId,
      related_entity_type: 'quote',
      related_entity_id: quoteId,
      priority: newStatus === 'approved' ? 'high' : 'medium',
      channels: ['database', 'email', 'websocket']
    });
  }

  // Obtener usuario de facturación
  async getFacturacionUserId() {
    const result = await this.pool.query(`
      SELECT id FROM users WHERE role = 'facturacion' LIMIT 1
    `);
    return result.rows[0]?.id;
  }

  // Obtener notificaciones del usuario
  async getUserNotifications(userId, filters = {}) {
    let whereClause = 'WHERE recipient_id = $1';
    let params = [userId];
    let paramCount = 1;

    if (filters.status) {
      paramCount++;
      whereClause += ` AND status = $${paramCount}`;
      params.push(filters.status);
    }

    if (filters.unread_only) {
      whereClause += ` AND read_at IS NULL`;
    }

    const result = await this.pool.query(`
      SELECT 
        n.*,
        sender.name as sender_name
      FROM notifications n
      LEFT JOIN users sender ON n.sender_id = sender.id
      ${whereClause}
      ORDER BY n.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `, [...params, filters.limit || 20, filters.offset || 0]);

    return result.rows;
  }

  // Marcar notificación como leída
  async markAsRead(notificationId, userId) {
    await this.pool.query(`
      UPDATE notifications 
      SET read_at = NOW(), status = 'read'
      WHERE id = $1 AND recipient_id = $2
    `, [notificationId, userId]);
  }
}

module.exports = new NotificationService();