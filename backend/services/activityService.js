const Activity = require('../models/activity');

class ActivityService {
  // Crear actividad cuando se crea una cotización
  static async logQuoteCreated(quoteId, userId, quoteData) {
    try {
      const activity = await Activity.create({
        userId,
        type: 'quote_created',
        title: 'Nueva cotización creada',
        description: `Cotización #${quoteData.code || quoteId} para ${quoteData.client_name || 'Cliente'}`,
        entityType: 'quote',
        entityId: quoteId,
        metadata: {
          quoteCode: quoteData.code,
          clientName: quoteData.client_name,
          amount: quoteData.total_amount
        }
      });
      return activity;
    } catch (error) {
      console.error('Error creating quote created activity:', error);
      throw error;
    }
  }

  // Crear actividad cuando se asigna una cotización
  static async logQuoteAssigned(quoteId, assignedToUserId, assignedByUserId, quoteData) {
    try {
      const activity = await Activity.create({
        userId: assignedToUserId,
        type: 'quote_assigned',
        title: 'Cotización asignada',
        description: `Cotización #${quoteData.code || quoteId} asignada para procesar`,
        entityType: 'quote',
        entityId: quoteId,
        metadata: {
          quoteCode: quoteData.code,
          assignedBy: assignedByUserId,
          clientName: quoteData.client_name
        }
      });
      return activity;
    } catch (error) {
      console.error('Error creating quote assigned activity:', error);
      throw error;
    }
  }

  // Crear actividad cuando se completa una cotización
  static async logQuoteCompleted(quoteId, completedByUserId, quoteData) {
    try {
      const activity = await Activity.create({
        userId: completedByUserId,
        type: 'quote_completed',
        title: 'Cotización completada',
        description: `Cotización #${quoteData.code || quoteId} completada exitosamente`,
        entityType: 'quote',
        entityId: quoteId,
        metadata: {
          quoteCode: quoteData.code,
          clientName: quoteData.client_name,
          amount: quoteData.total_amount
        }
      });
      return activity;
    } catch (error) {
      console.error('Error creating quote completed activity:', error);
      throw error;
    }
  }

  // Crear actividad cuando se crea un proyecto
  static async logProjectCreated(projectId, userId, projectData) {
    try {
      const activity = await Activity.create({
        userId,
        type: 'project_created',
        title: 'Nuevo proyecto creado',
        description: `Proyecto "${projectData.name || 'Sin nombre'}" creado para ${projectData.client_name || 'Cliente'}`,
        entityType: 'project',
        entityId: projectId,
        metadata: {
          projectName: projectData.name,
          clientName: projectData.client_name,
          status: projectData.status
        }
      });
      return activity;
    } catch (error) {
      console.error('Error creating project created activity:', error);
      throw error;
    }
  }

  // Crear actividad cuando se completa un proyecto
  static async logProjectCompleted(projectId, completedByUserId, projectData) {
    try {
      const activity = await Activity.create({
        userId: completedByUserId,
        type: 'project_completed',
        title: 'Proyecto completado',
        description: `Proyecto "${projectData.name || 'Sin nombre'}" completado exitosamente`,
        entityType: 'project',
        entityId: projectId,
        metadata: {
          projectName: projectData.name,
          clientName: projectData.client_name,
          completionDate: new Date().toISOString()
        }
      });
      return activity;
    } catch (error) {
      console.error('Error creating project completed activity:', error);
      throw error;
    }
  }

  // Crear actividad cuando se crea un ticket
  static async logTicketCreated(ticketId, userId, ticketData) {
    try {
      const activity = await Activity.create({
        userId,
        type: 'ticket_created',
        title: 'Nuevo ticket de soporte',
        description: `Ticket #${ticketData.code || ticketId}: ${ticketData.subject || 'Sin asunto'}`,
        entityType: 'ticket',
        entityId: ticketId,
        metadata: {
          ticketCode: ticketData.code,
          subject: ticketData.subject,
          priority: ticketData.priority,
          status: ticketData.status
        }
      });
      return activity;
    } catch (error) {
      console.error('Error creating ticket created activity:', error);
      throw error;
    }
  }

  // Crear actividad cuando se resuelve un ticket
  static async logTicketResolved(ticketId, resolvedByUserId, ticketData) {
    try {
      const activity = await Activity.create({
        userId: resolvedByUserId,
        type: 'ticket_resolved',
        title: 'Ticket resuelto',
        description: `Ticket #${ticketData.code || ticketId} resuelto exitosamente`,
        entityType: 'ticket',
        entityId: ticketId,
        metadata: {
          ticketCode: ticketData.code,
          subject: ticketData.subject,
          resolutionDate: new Date().toISOString()
        }
      });
      return activity;
    } catch (error) {
      console.error('Error creating ticket resolved activity:', error);
      throw error;
    }
  }

  // Crear actividad cuando se sube una evidencia
  static async logEvidenceUploaded(evidenceId, uploadedByUserId, evidenceData) {
    try {
      const activity = await Activity.create({
        userId: uploadedByUserId,
        type: 'evidence_uploaded',
        title: 'Nueva evidencia subida',
        description: `Evidencia "${evidenceData.name || 'Sin nombre'}" subida para proyecto`,
        entityType: 'evidence',
        entityId: evidenceId,
        metadata: {
          evidenceName: evidenceData.name,
          projectId: evidenceData.project_id,
          fileSize: evidenceData.file_size
        }
      });
      return activity;
    } catch (error) {
      console.error('Error creating evidence uploaded activity:', error);
      throw error;
    }
  }

  // Crear actividad cuando se registra un usuario
  static async logUserRegistered(userId, userData) {
    try {
      const activity = await Activity.create({
        userId,
        type: 'user_registered',
        title: 'Usuario registrado',
        description: `Nuevo usuario "${userData.name || userData.email}" agregado al sistema`,
        entityType: 'user',
        entityId: userId,
        metadata: {
          userName: userData.name,
          userEmail: userData.email,
          userRole: userData.role
        }
      });
      return activity;
    } catch (error) {
      console.error('Error creating user registered activity:', error);
      throw error;
    }
  }

  // Crear actividad cuando se crea un cliente
  static async logClientCreated(clientId, userId, clientData) {
    try {
      const activity = await Activity.create({
        userId,
        type: 'client_created',
        title: 'Nuevo cliente creado',
        description: `Cliente "${clientData.name || 'Sin nombre'}" agregado al sistema`,
        entityType: 'client',
        entityId: clientId,
        metadata: {
          clientName: clientData.name,
          clientRuc: clientData.ruc,
          clientEmail: clientData.email
        }
      });
      return activity;
    } catch (error) {
      console.error('Error creating client created activity:', error);
      throw error;
    }
  }

  // Crear actividad genérica
  static async logActivity(userId, type, title, description, entityType = null, entityId = null, metadata = null) {
    try {
      const activity = await Activity.create({
        userId,
        type,
        title,
        description,
        entityType,
        entityId,
        metadata
      });
      return activity;
    } catch (error) {
      console.error('Error creating generic activity:', error);
      throw error;
    }
  }
}

module.exports = ActivityService;
