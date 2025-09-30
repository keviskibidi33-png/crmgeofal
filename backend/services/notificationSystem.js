const db = require('../config/db');

class NotificationSystem {
  constructor() {
    this.notifications = new Map();
  }

  // Crear notificación
  async createNotification(userId, type, title, message, data = {}) {
    try {
      const query = `
        INSERT INTO notifications (user_id, type, title, message, data, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING *
      `;
      
      const result = await db.query(query, [userId, type, title, message, JSON.stringify(data)]);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Notificar cambio de estado de envío
  async notifyShipmentStatusChange(shipmentId, newStatus, changedBy) {
    try {
      // Obtener detalles del envío
      const shipmentQuery = `
        SELECT 
          s.*,
          p.name as project_name,
          c.name as company_name,
          u.name as vendedor_name
        FROM shipments s
        LEFT JOIN projects p ON s.project_id = p.id
        LEFT JOIN companies c ON p.company_id = c.id
        LEFT JOIN users u ON s.sent_by = u.id
        WHERE s.id = $1
      `;
      
      const shipmentResult = await db.query(shipmentQuery, [shipmentId]);
      
      if (shipmentResult.rows.length === 0) return;
      
      const shipment = shipmentResult.rows[0];
      
      // Determinar a quién notificar
      const notifyUsers = [];
      
      if (newStatus === 'recibido') {
        // Notificar al vendedor que fue recibido
        notifyUsers.push(shipment.sent_by);
      } else if (newStatus === 'en_proceso') {
        // Notificar al vendedor que está en proceso
        notifyUsers.push(shipment.sent_by);
      } else if (newStatus === 'completado') {
        // Notificar al vendedor y jefa comercial que está completado
        notifyUsers.push(shipment.sent_by);
        
        // Obtener jefa comercial
        const jefaQuery = 'SELECT id FROM users WHERE role = $1';
        const jefaResult = await db.query(jefaQuery, ['jefa_comercial']);
        if (jefaResult.rows.length > 0) {
          notifyUsers.push(jefaResult.rows[0].id);
        }
      }
      
      // Crear notificaciones
      for (const userId of notifyUsers) {
        if (userId && userId !== changedBy) {
          await this.createNotification(
            userId,
            'shipment_status_change',
            `Envío ${newStatus}`,
            `El envío del proyecto "${shipment.project_name}" ha sido marcado como ${newStatus}`,
            {
              shipment_id: shipmentId,
              project_name: shipment.project_name,
              company_name: shipment.company_name,
              new_status: newStatus
            }
          );
        }
      }
    } catch (error) {
      console.error('Error notifying shipment status change:', error);
    }
  }

  // Notificar nueva factura
  async notifyNewInvoice(projectId, invoiceNumber, createdBy) {
    try {
      // Obtener detalles del proyecto
      const projectQuery = `
        SELECT 
          p.*,
          c.name as company_name,
          u.name as created_by_name
        FROM projects p
        LEFT JOIN companies c ON p.company_id = c.id
        LEFT JOIN users u ON p.created_by = u.id
        WHERE p.id = $1
      `;
      
      const projectResult = await db.query(projectQuery, [projectId]);
      
      if (projectResult.rows.length === 0) return;
      
      const project = projectResult.rows[0];
      
      // Notificar al vendedor del proyecto
      await this.createNotification(
        project.created_by,
        'new_invoice',
        'Nueva Factura',
        `Se ha adjuntado la factura ${invoiceNumber} al proyecto "${project.name}"`,
        {
          project_id: projectId,
          project_name: project.name,
          company_name: project.company_name,
          invoice_number: invoiceNumber
        }
      );
      
      // Notificar a jefa comercial
      const jefaQuery = 'SELECT id FROM users WHERE role = $1';
      const jefaResult = await db.query(jefaQuery, ['jefa_comercial']);
      if (jefaResult.rows.length > 0) {
        await this.createNotification(
          jefaResult.rows[0].id,
          'new_invoice',
          'Nueva Factura',
          `Se ha adjuntado la factura ${invoiceNumber} al proyecto "${project.name}"`,
          {
            project_id: projectId,
            project_name: project.name,
            company_name: project.company_name,
            invoice_number: invoiceNumber
          }
        );
      }
    } catch (error) {
      console.error('Error notifying new invoice:', error);
    }
  }

  // Notificar nueva evidencia de laboratorio
  async notifyNewEvidence(projectId, uploadedBy) {
    try {
      // Obtener detalles del proyecto
      const projectQuery = `
        SELECT 
          p.*,
          c.name as company_name,
          u.name as created_by_name
        FROM projects p
        LEFT JOIN companies c ON p.company_id = c.id
        LEFT JOIN users u ON p.created_by = u.id
        WHERE p.id = $1
      `;
      
      const projectResult = await db.query(projectQuery, [projectId]);
      
      if (projectResult.rows.length === 0) return;
      
      const project = projectResult.rows[0];
      
      // Notificar al vendedor del proyecto
      await this.createNotification(
        project.created_by,
        'new_evidence',
        'Nueva Evidencia',
        `Se ha subido nueva evidencia para el proyecto "${project.name}"`,
        {
          project_id: projectId,
          project_name: project.name,
          company_name: project.company_name
        }
      );
    } catch (error) {
      console.error('Error notifying new evidence:', error);
    }
  }

  // Notificar nueva plantilla
  async notifyNewTemplate(templateId, createdBy) {
    try {
      // Obtener detalles de la plantilla
      const templateQuery = `
        SELECT 
          t.*,
          c.name as client_name
        FROM templates t
        LEFT JOIN companies c ON t.client_id = c.id
        WHERE t.id = $1
      `;
      
      const templateResult = await db.query(templateQuery, [templateId]);
      
      if (templateResult.rows.length === 0) return;
      
      const template = templateResult.rows[0];
      
      // Notificar a jefa comercial
      const jefaQuery = 'SELECT id FROM users WHERE role = $1';
      const jefaResult = await db.query(jefaQuery, ['jefa_comercial']);
      if (jefaResult.rows.length > 0) {
        await this.createNotification(
          jefaResult.rows[0].id,
          'new_template',
          'Nueva Plantilla',
          `Se ha creado una nueva plantilla "${template.name}" para ${template.client_name}`,
          {
            template_id: templateId,
            template_name: template.name,
            client_name: template.client_name
          }
        );
      }
    } catch (error) {
      console.error('Error notifying new template:', error);
    }
  }

  // Obtener notificaciones del usuario
  async getUserNotifications(userId, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT 
          n.*,
          u.name as created_by_name
        FROM notifications n
        LEFT JOIN users u ON n.user_id = u.id
        WHERE n.user_id = $1
        ORDER BY n.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      
      const result = await db.query(query, [userId, limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  // Marcar notificación como leída
  async markNotificationAsRead(notificationId, userId) {
    try {
      const query = `
        UPDATE notifications 
        SET read_at = NOW()
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `;
      
      const result = await db.query(query, [notificationId, userId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Marcar todas las notificaciones como leídas
  async markAllNotificationsAsRead(userId) {
    try {
      const query = `
        UPDATE notifications 
        SET read_at = NOW()
        WHERE user_id = $1 AND read_at IS NULL
        RETURNING *
      `;
      
      const result = await db.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Obtener contador de notificaciones no leídas
  async getUnreadCount(userId) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM notifications
        WHERE user_id = $1 AND read_at IS NULL
      `;
      
      const result = await db.query(query, [userId]);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }
}

module.exports = new NotificationSystem();