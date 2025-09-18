// services/notificationService.js
const transporter = require('../config/mailer');

/**
 * Envía un correo de notificación genérico
 * @param {Object} options
 * @param {string} options.to - Email destino
 * @param {string} options.subject - Asunto
 * @param {string} options.text - Texto plano
 * @param {string} [options.html] - HTML opcional
 * @returns {Promise}
 */
async function sendNotification({ to, subject, text, html }) {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'notificaciones@crmgeofal.com',
    to,
    subject,
    text,
    html,
  };
  return transporter.sendMail(mailOptions);
}

// Ejemplo de plantilla para notificar creación de lead
function leadCreatedTemplate({ lead, user }) {
  return {
    subject: `Nuevo lead creado: ${lead.name}`,
    text: `Se ha creado un nuevo lead para la empresa ${lead.company_id}.
Nombre: ${lead.name}
Email: ${lead.email}
Asignado a: ${lead.assigned_to}`,
    html: `<h2>Nuevo lead creado</h2><p>Empresa: ${lead.company_id}</p><p>Nombre: ${lead.name}</p><p>Email: ${lead.email}</p><p>Asignado a: ${lead.assigned_to}</p>`
  };
}

// Plantilla para notificar creación de ticket
function ticketCreatedTemplate({ ticket, user }) {
  return {
    subject: `Nuevo ticket creado: ${ticket.title}`,
    text: `Se ha creado un nuevo ticket.
Título: ${ticket.title}
Prioridad: ${ticket.priority}
Usuario: ${user ? user.name : ticket.user_id}`,
    html: `<h2>Nuevo ticket creado</h2><p>Título: ${ticket.title}</p><p>Prioridad: ${ticket.priority}</p><p>Usuario: ${user ? user.name : ticket.user_id}</p>`
  };
}

// Plantilla para notificar creación de factura
function invoiceCreatedTemplate({ invoice, user }) {
  return {
    subject: `Nueva factura creada: ${invoice.quote_number}`,
    text: `Se ha creado una nueva factura.
Proyecto: ${invoice.project_id}
Monto: ${invoice.amount}
Estado: ${invoice.payment_status}`,
    html: `<h2>Nueva factura creada</h2><p>Proyecto: ${invoice.project_id}</p><p>Monto: ${invoice.amount}</p><p>Estado: ${invoice.payment_status}</p>`
  };
}

module.exports = {
  sendNotification,
  leadCreatedTemplate,
  ticketCreatedTemplate,
  invoiceCreatedTemplate,
};
