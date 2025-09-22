const Notification = require('../models/notification');

class NotificationService {
  // Crear notificación cuando se asigna una cotización
  static async notifyQuoteAssigned(quoteId, assignedToUserId, assignedByUserId) {
    try {
      const notification = await Notification.create({
        userId: assignedToUserId,
        type: 'quote_assigned',
        title: 'Nueva cotización asignada',
        message: `Se te ha asignado una nueva cotización para procesar`,
        data: { quoteId, assignedByUserId },
        priority: 'normal'
      });
      return notification;
    } catch (error) {
      console.error('Error creating quote assigned notification:', error);
      throw error;
    }
  }

  // Crear notificación cuando se completa una cotización
  static async notifyQuoteCompleted(quoteId, completedByUserId, assignedToUserId) {
    try {
      const notification = await Notification.create({
        userId: assignedToUserId,
        type: 'quote_completed',
        title: 'Cotización completada',
        message: `La cotización ha sido completada y está lista para revisión`,
        data: { quoteId, completedByUserId },
        priority: 'high'
      });
      return notification;
    } catch (error) {
      console.error('Error creating quote completed notification:', error);
      throw error;
    }
  }

  // Crear notificación cuando se asigna un proyecto
  static async notifyProjectAssigned(projectId, assignedToUserId, assignedByUserId) {
    try {
      const notification = await Notification.create({
        userId: assignedToUserId,
        type: 'project_assigned',
        title: 'Nuevo proyecto asignado',
        message: `Se te ha asignado un nuevo proyecto para trabajar`,
        data: { projectId, assignedByUserId },
        priority: 'normal'
      });
      return notification;
    } catch (error) {
      console.error('Error creating project assigned notification:', error);
      throw error;
    }
  }

  // Crear notificación cuando se completa un proyecto
  static async notifyProjectCompleted(projectId, completedByUserId, assignedToUserId) {
    try {
      const notification = await Notification.create({
        userId: assignedToUserId,
        type: 'project_completed',
        title: 'Proyecto completado',
        message: `El proyecto ha sido completado exitosamente`,
        data: { projectId, completedByUserId },
        priority: 'high'
      });
      return notification;
    } catch (error) {
      console.error('Error creating project completed notification:', error);
      throw error;
    }
  }

  // Crear notificación cuando se crea un ticket
  static async notifyTicketCreated(ticketId, createdByUserId, assignedToUserId) {
    try {
      const notification = await Notification.create({
        userId: assignedToUserId,
        type: 'ticket_created',
        title: 'Nuevo ticket de soporte',
        message: `Se ha creado un nuevo ticket que requiere tu atención`,
        data: { ticketId, createdByUserId },
        priority: 'normal'
      });
      return notification;
    } catch (error) {
      console.error('Error creating ticket created notification:', error);
      throw error;
    }
  }

  // Crear notificación cuando se resuelve un ticket
  static async notifyTicketResolved(ticketId, resolvedByUserId, createdByUserId) {
    try {
      const notification = await Notification.create({
        userId: createdByUserId,
        type: 'ticket_resolved',
        title: 'Ticket resuelto',
        message: `Tu ticket de soporte ha sido resuelto`,
        data: { ticketId, resolvedByUserId },
        priority: 'normal'
      });
      return notification;
    } catch (error) {
      console.error('Error creating ticket resolved notification:', error);
      throw error;
    }
  }

  // Crear notificación cuando se sube una evidencia
  static async notifyEvidenceUploaded(evidenceId, uploadedByUserId, assignedToUserId) {
    try {
      const notification = await Notification.create({
        userId: assignedToUserId,
        type: 'evidence_uploaded',
        title: 'Nueva evidencia subida',
        message: `Se ha subido una nueva evidencia que requiere revisión`,
        data: { evidenceId, uploadedByUserId },
        priority: 'normal'
      });
      return notification;
    } catch (error) {
      console.error('Error creating evidence uploaded notification:', error);
      throw error;
    }
  }

  // Crear notificación cuando se aprueba una evidencia
  static async notifyEvidenceApproved(evidenceId, approvedByUserId, uploadedByUserId) {
    try {
      const notification = await Notification.create({
        userId: uploadedByUserId,
        type: 'evidence_approved',
        title: 'Evidencia aprobada',
        message: `Tu evidencia ha sido aprobada`,
        data: { evidenceId, approvedByUserId },
        priority: 'normal'
      });
      return notification;
    } catch (error) {
      console.error('Error creating evidence approved notification:', error);
      throw error;
    }
  }

  // Crear notificación cuando se rechaza una evidencia
  static async notifyEvidenceRejected(evidenceId, rejectedByUserId, uploadedByUserId, reason) {
    try {
      const notification = await Notification.create({
        userId: uploadedByUserId,
        type: 'evidence_rejected',
        title: 'Evidencia rechazada',
        message: `Tu evidencia ha sido rechazada. Razón: ${reason}`,
        data: { evidenceId, rejectedByUserId, reason },
        priority: 'high'
      });
      return notification;
    } catch (error) {
      console.error('Error creating evidence rejected notification:', error);
      throw error;
    }
  }

  // Crear notificación para todos los usuarios de un rol específico
  static async notifyRole(role, type, title, message, data = null, priority = 'normal') {
    try {
      const notifications = await Notification.createForRole(role, {
        type,
        title,
        message,
        data,
        priority
      });
      return notifications;
    } catch (error) {
      console.error('Error creating role notification:', error);
      throw error;
    }
  }

  // Crear notificación de mantenimiento del sistema
  static async notifySystemMaintenance(message, scheduledTime = null) {
    try {
      const notifications = await Notification.createForRole('admin', {
        type: 'system_maintenance',
        title: 'Mantenimiento del sistema',
        message: scheduledTime ? 
          `Mantenimiento programado para ${scheduledTime}. ${message}` : 
          message,
        data: { scheduledTime },
        priority: 'urgent'
      });
      return notifications;
    } catch (error) {
      console.error('Error creating system maintenance notification:', error);
      throw error;
    }
  }

  // Crear notificación de actualización del sistema
  static async notifySystemUpdate(version, changes = []) {
    try {
      const message = `Sistema actualizado a la versión ${version}. ${changes.length > 0 ? 'Cambios: ' + changes.join(', ') : ''}`;
      const notifications = await Notification.createForRole('admin', {
        type: 'system_update',
        title: 'Actualización del sistema',
        message,
        data: { version, changes },
        priority: 'normal'
      });
      return notifications;
    } catch (error) {
      console.error('Error creating system update notification:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;