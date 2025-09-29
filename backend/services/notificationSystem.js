const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/db');

class NotificationSystem {
  constructor() {
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

  // Notificar nueva cotización para aprobación
  async notifyNewQuoteForApproval(quoteId, userId) {
    try {
      // Obtener datos de la cotización
      const quoteData = await this.getQuoteData(quoteId);
      if (!quoteData) return;

      // Obtener usuarios de facturación
      const facturacionUsers = await this.getFacturacionUsers();
      
      for (const user of facturacionUsers) {
        // Crear notificación en base de datos
        await this.createDatabaseNotification({
          recipient_id: user.id,
          type: 'quote_approval_request',
          title: 'Nueva Cotización para Aprobación',
          message: `Cotización ${quoteData.quote_number} de ${quoteData.company_name} requiere aprobación`,
          data: {
            quote_id: quoteId,
            quote_number: quoteData.quote_number,
            company_name: quoteData.company_name,
            total_amount: quoteData.total_amount,
            requested_by: quoteData.created_by_name
          },
          priority: 'high'
        });

        // Enviar email
        await this.sendEmailNotification(user.email, {
          subject: `Nueva Cotización para Aprobación - ${quoteData.quote_number}`,
          template: 'quote_approval_request',
          data: quoteData
        });
      }

      console.log(`✅ Notificaciones enviadas para cotización ${quoteData.quote_number}`);
    } catch (error) {
      console.error('❌ Error notificando nueva cotización:', error);
    }
  }

  // Notificar cotización aprobada
  async notifyQuoteApproved(quoteId, approvedBy) {
    try {
      const quoteData = await this.getQuoteData(quoteId);
      if (!quoteData) return;

      // Notificar al solicitante
      await this.createDatabaseNotification({
        recipient_id: quoteData.created_by,
        type: 'quote_approved',
        title: 'Cotización Aprobada',
        message: `Tu cotización ${quoteData.quote_number} ha sido aprobada`,
        data: {
          quote_id: quoteId,
          quote_number: quoteData.quote_number,
          approved_by: approvedBy
        },
        priority: 'normal'
      });

      // Notificar a Jefe Comercial
      const jefeComercialUsers = await this.getJefeComercialUsers();
      for (const user of jefeComercialUsers) {
        await this.createDatabaseNotification({
          recipient_id: user.id,
          type: 'quote_approved',
          title: 'Cotización Aprobada',
          message: `Cotización ${quoteData.quote_number} ha sido aprobada`,
          data: {
            quote_id: quoteId,
            quote_number: quoteData.quote_number,
            company_name: quoteData.company_name,
            total_amount: quoteData.total_amount
          },
          priority: 'normal'
        });
      }

      console.log(`✅ Notificaciones de aprobación enviadas para ${quoteData.quote_number}`);
    } catch (error) {
      console.error('❌ Error notificando aprobación:', error);
    }
  }

  // Notificar cotización rechazada
  async notifyQuoteRejected(quoteId, rejectedBy, reason) {
    try {
      const quoteData = await this.getQuoteData(quoteId);
      if (!quoteData) return;

      await this.createDatabaseNotification({
        recipient_id: quoteData.created_by,
        type: 'quote_rejected',
        title: 'Cotización Rechazada',
        message: `Tu cotización ${quoteData.quote_number} ha sido rechazada. Motivo: ${reason}`,
        data: {
          quote_id: quoteId,
          quote_number: quoteData.quote_number,
          rejected_by: rejectedBy,
          rejection_reason: reason
        },
        priority: 'high'
      });

      console.log(`✅ Notificación de rechazo enviada para ${quoteData.quote_number}`);
    } catch (error) {
      console.error('❌ Error notificando rechazo:', error);
    }
  }

  // Enviar documento de cotización por email
  async sendQuoteDocument(quoteId, recipientEmail, recipientName) {
    try {
      const quoteData = await this.getQuoteData(quoteId);
      if (!quoteData) return;

      // Generar PDF de la cotización
      const pdfPath = await this.generateQuotePDF(quoteId);
      
      if (!pdfPath) {
        throw new Error('No se pudo generar el PDF de la cotización');
      }

      // Enviar email con documento adjunto
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to: recipientEmail,
        subject: `Cotización ${quoteData.quote_number} - ${quoteData.company_name}`,
        html: this.getQuoteEmailTemplate(quoteData, recipientName),
        attachments: [
          {
            filename: `Cotizacion_${quoteData.quote_number}.pdf`,
            path: pdfPath,
            contentType: 'application/pdf'
          }
        ]
      });

      console.log(`✅ Documento de cotización enviado a ${recipientEmail}`);
    } catch (error) {
      console.error('❌ Error enviando documento:', error);
    }
  }

  // Enviar recordatorio de pago
  async sendPaymentReminder(quoteId, recipientEmail, recipientName) {
    try {
      const quoteData = await this.getQuoteData(quoteId);
      if (!quoteData) return;

      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to: recipientEmail,
        subject: `Recordatorio de Pago - Cotización ${quoteData.quote_number}`,
        html: this.getPaymentReminderTemplate(quoteData, recipientName)
      });

      console.log(`✅ Recordatorio de pago enviado a ${recipientEmail}`);
    } catch (error) {
      console.error('❌ Error enviando recordatorio:', error);
    }
  }

  // Notificar nuevo comprobante de pago
  async notifyNewPaymentProof(proofId) {
    try {
      const proofData = await this.getPaymentProofData(proofId);
      if (!proofData) return;

      // Obtener usuarios de facturación
      const facturacionUsers = await this.getFacturacionUsers();
      
      for (const user of facturacionUsers) {
        // Crear notificación en base de datos
        await this.createDatabaseNotification({
          recipient_id: user.id,
          type: 'payment_proof_uploaded',
          title: 'Nuevo Comprobante de Pago',
          message: `Comprobante de pago para cotización ${proofData.quote_number} requiere revisión`,
          data: {
            proof_id: proofId,
            quote_number: proofData.quote_number,
            company_name: proofData.company_name,
            amount_paid: proofData.amount_paid,
            uploaded_by: proofData.uploaded_by_name
          },
          priority: 'high'
        });

        // Enviar email
        await this.sendEmailNotification(user.email, {
          subject: `Nuevo Comprobante de Pago - ${proofData.quote_number}`,
          template: 'payment_proof_uploaded',
          data: proofData
        });
      }

      console.log(`✅ Notificaciones enviadas para comprobante ${proofData.quote_number}`);
    } catch (error) {
      console.error('❌ Error notificando nuevo comprobante:', error);
    }
  }

  // Notificar comprobante aprobado
  async notifyPaymentProofApproved(proofId) {
    try {
      const proofData = await this.getPaymentProofData(proofId);
      if (!proofData) return;

      // Notificar al usuario que subió el comprobante
      await this.createDatabaseNotification({
        recipient_id: proofData.uploaded_by,
        type: 'payment_proof_approved',
        title: 'Comprobante de Pago Aprobado',
        message: `Tu comprobante de pago para cotización ${proofData.quote_number} ha sido aprobado`,
        data: {
          proof_id: proofId,
          quote_number: proofData.quote_number,
          amount_paid: proofData.amount_paid
        },
        priority: 'normal'
      });

      // Notificar a Jefe Comercial
      const jefeComercialUsers = await this.getJefeComercialUsers();
      for (const user of jefeComercialUsers) {
        await this.createDatabaseNotification({
          recipient_id: user.id,
          type: 'payment_proof_approved',
          title: 'Comprobante de Pago Aprobado',
          message: `Comprobante de pago para cotización ${proofData.quote_number} ha sido aprobado`,
          data: {
            proof_id: proofId,
            quote_number: proofData.quote_number,
            company_name: proofData.company_name,
            amount_paid: proofData.amount_paid
          },
          priority: 'normal'
        });
      }

      console.log(`✅ Notificaciones de aprobación enviadas para comprobante ${proofData.quote_number}`);
    } catch (error) {
      console.error('❌ Error notificando aprobación de comprobante:', error);
    }
  }

  // Notificar comprobante rechazado
  async notifyPaymentProofRejected(proofId, reason) {
    try {
      const proofData = await this.getPaymentProofData(proofId);
      if (!proofData) return;

      // Notificar al usuario que subió el comprobante
      await this.createDatabaseNotification({
        recipient_id: proofData.uploaded_by,
        type: 'payment_proof_rejected',
        title: 'Comprobante de Pago Rechazado',
        message: `Tu comprobante de pago para cotización ${proofData.quote_number} ha sido rechazado. Motivo: ${reason}`,
        data: {
          proof_id: proofId,
          quote_number: proofData.quote_number,
          rejection_reason: reason
        },
        priority: 'high'
      });

      // Notificar a Jefe Comercial
      const jefeComercialUsers = await this.getJefeComercialUsers();
      for (const user of jefeComercialUsers) {
        await this.createDatabaseNotification({
          recipient_id: user.id,
          type: 'payment_proof_rejected',
          title: 'Comprobante de Pago Rechazado',
          message: `Comprobante de pago para cotización ${proofData.quote_number} ha sido rechazado. Motivo: ${reason}`,
          data: {
            proof_id: proofId,
            quote_number: proofData.quote_number,
            company_name: proofData.company_name,
            rejection_reason: reason
          },
          priority: 'high'
        });
      }

      console.log(`✅ Notificaciones de rechazo enviadas para comprobante ${proofData.quote_number}`);
    } catch (error) {
      console.error('❌ Error notificando rechazo de comprobante:', error);
    }
  }

  // Obtener datos completos de la cotización
  async getQuoteData(quoteId) {
    const result = await pool.query(`
      SELECT 
        q.*,
        p.name as project_name,
        c.name as company_name,
        c.ruc as company_ruc,
        c.email as company_email,
        u.name as created_by_name,
        u.email as created_by_email
      FROM quotes q
      LEFT JOIN projects p ON q.project_id = p.id
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN users u ON q.created_by = u.id
      WHERE q.id = $1
    `, [quoteId]);

    return result.rows[0];
  }

  // Obtener datos completos del comprobante de pago
  async getPaymentProofData(proofId) {
    const result = await pool.query(`
      SELECT 
        pp.*,
        q.quote_number,
        q.total_amount,
        q.project_id,
        p.name as project_name,
        c.name as company_name,
        c.ruc as company_ruc,
        u.name as uploaded_by_name,
        u.email as uploaded_by_email
      FROM payment_proofs pp
      JOIN quotes q ON pp.quote_id = q.id
      LEFT JOIN projects p ON q.project_id = p.id
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN users u ON pp.uploaded_by = u.id
      WHERE pp.id = $1
    `, [proofId]);

    return result.rows[0];
  }

  // Obtener usuarios de facturación
  async getFacturacionUsers() {
    const result = await pool.query(`
      SELECT id, name, email, role
      FROM users 
      WHERE role = 'facturacion' OR role = 'admin'
    `);
    return result.rows;
  }

  // Obtener usuarios de Jefe Comercial
  async getJefeComercialUsers() {
    const result = await pool.query(`
      SELECT id, name, email, role
      FROM users 
      WHERE role = 'jefa_comercial' OR role = 'admin'
    `);
    return result.rows;
  }

  // Crear notificación en base de datos
  async createDatabaseNotification(notificationData) {
    const result = await pool.query(`
      INSERT INTO notifications (recipient_id, type, title, message, data, priority, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `, [
      notificationData.recipient_id,
      notificationData.type,
      notificationData.title,
      notificationData.message,
      JSON.stringify(notificationData.data),
      notificationData.priority
    ]);

    return result.rows[0];
  }

  // Enviar notificación por email
  async sendEmailNotification(recipientEmail, emailData) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to: recipientEmail,
        subject: emailData.subject,
        html: this.getEmailTemplate(emailData.template, emailData.data)
      });
    } catch (error) {
      console.error('❌ Error enviando email:', error);
    }
  }

  // Generar PDF de la cotización
  async generateQuotePDF(quoteId) {
    try {
      // Aquí se integraría con el sistema de generación de PDFs existente
      // Por ahora retornamos null para evitar errores
      return null;
    } catch (error) {
      console.error('❌ Error generando PDF:', error);
      return null;
    }
  }

  // Template para email de cotización
  getQuoteEmailTemplate(quoteData, recipientName) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Cotización ${quoteData.quote_number}</h2>
        <p>Estimado/a ${recipientName},</p>
        <p>Adjunto encontrará la cotización solicitada:</p>
        <ul>
          <li><strong>Número:</strong> ${quoteData.quote_number}</li>
          <li><strong>Empresa:</strong> ${quoteData.company_name}</li>
          <li><strong>Proyecto:</strong> ${quoteData.project_name}</li>
          <li><strong>Monto Total:</strong> $${quoteData.total_amount}</li>
          <li><strong>Fecha:</strong> ${new Date(quoteData.issue_date).toLocaleDateString()}</li>
        </ul>
        <p>Por favor, revise los términos y condiciones adjuntos.</p>
        <p>Saludos cordiales,<br>Equipo GeoFal</p>
      </div>
    `;
  }

  // Template para recordatorio de pago
  getPaymentReminderTemplate(quoteData, recipientName) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Recordatorio de Pago - Cotización ${quoteData.quote_number}</h2>
        <p>Estimado/a ${recipientName},</p>
        <p>Le recordamos que la cotización ${quoteData.quote_number} por un monto de $${quoteData.total_amount} está pendiente de pago.</p>
        <p><strong>Detalles del pago:</strong></p>
        <ul>
          <li>Monto: $${quoteData.total_amount}</li>
          <li>Términos de pago: ${quoteData.payment_terms || '30 días'}</li>
          <li>Fecha de vencimiento: ${new Date(quoteData.issue_date).toLocaleDateString()}</li>
        </ul>
        <p>Por favor, proceda con el pago según los términos acordados.</p>
        <p>Saludos cordiales,<br>Equipo GeoFal</p>
      </div>
    `;
  }

  // Template genérico para emails
  getEmailTemplate(template, data) {
    switch (template) {
      case 'quote_approval_request':
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Nueva Cotización para Aprobación</h2>
            <p>Se ha solicitado la aprobación de una nueva cotización:</p>
            <ul>
              <li><strong>Número:</strong> ${data.quote_number}</li>
              <li><strong>Empresa:</strong> ${data.company_name}</li>
              <li><strong>Monto:</strong> $${data.total_amount}</li>
              <li><strong>Solicitado por:</strong> ${data.created_by_name}</li>
            </ul>
            <p>Por favor, revise y apruebe la cotización en el sistema.</p>
          </div>
        `;
      default:
        return '<p>Notificación del sistema</p>';
    }
  }
}

module.exports = new NotificationSystem();
