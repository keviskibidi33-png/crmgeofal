const Invoice = require('../models/invoice');
const { sendNotification, invoiceCreatedTemplate } = require('../services/notificationService');

exports.getAll = async (req, res) => {
  try {
    const { page, limit, payment_status } = req.query;
    const { rows, total } = await Invoice.getAll({ page, limit, payment_status });
    res.json({ data: rows, total });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener facturas' });
  }
};

exports.getById = async (req, res) => {
  try {
    const invoice = await Invoice.getById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Factura no encontrada' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener factura' });
  }
};

const Audit = require('../models/audit');

exports.create = async (req, res) => {
  try {
    const { project_id, quote_number, received_at, payment_due, payment_status, amount } = req.body;
    const created_by = req.user.id;
    const invoice = await Invoice.create({ project_id, quote_number, received_at, payment_due, payment_status, amount, created_by });
    // Auditoría
    await Audit.log({
      user_id: req.user.id,
      action: 'crear',
      entity: 'invoice',
      entity_id: invoice.id,
      details: JSON.stringify({ project_id, quote_number, received_at, payment_due, payment_status, amount })
    });
    // Notificar por correo al usuario creador
    try {
      const template = invoiceCreatedTemplate({ invoice, user: req.user });
      if (req.user && req.user.email) {
        await sendNotification({
          to: req.user.email,
          subject: template.subject,
          text: template.text,
          html: template.html,
        });
      }
    } catch (mailErr) {
      console.error('Error enviando notificación de factura:', mailErr);
    }
    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear factura' });
  }
};
exports.updateStatus = async (req, res) => {
  try {
    const { payment_status } = req.body;
    const invoice = await Invoice.updateStatus(req.params.id, payment_status);
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar estado de factura' });
  }
};
