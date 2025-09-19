const Lead = require('../models/lead');
const { sendNotification, leadCreatedTemplate } = require('../services/notificationService');

exports.getAll = async (req, res) => {
  try {
    const { page, limit, status, type } = req.query;
    const { rows, total } = await Lead.getAll({ page, limit, status, type });
    res.json({ data: rows, total });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener leads' });
  }
};

exports.getById = async (req, res) => {
  try {
    const lead = await Lead.getById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead no encontrado' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener lead' });
  }
};

const { validationResult } = require('express-validator');

const Audit = require('../models/audit');

exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { company_id, name, email, phone, status, type, assigned_to } = req.body;
    const lead = await Lead.create({ company_id, name, email, phone, status, type, assigned_to });
    // Auditoría
    await Audit.log({
      user_id: req.user.id,
      action: 'crear',
      entity: 'lead',
      entity_id: lead.id,
      details: JSON.stringify({ company_id, name, email, phone, status, type, assigned_to })
    });
    // Notificar por correo solo si el usuario tiene notificaciones activadas
    try {
      const User = require('../models/user');
      let notify = true;
      // Si hay usuario asignado, verificar su preferencia
      if (assigned_to) {
        const assignedUser = await User.getById(assigned_to);
        notify = assignedUser && assignedUser.notification_enabled;
        if (notify && assignedUser.email) {
          const template = leadCreatedTemplate({ lead, user: assignedUser });
          await sendNotification({
            to: assignedUser.email,
            subject: template.subject,
            text: template.text,
            html: template.html,
          });
        }
      } else if (email) {
        // Si no hay usuario asignado, notificar al email proporcionado
        const template = leadCreatedTemplate({ lead, user: req.user });
        await sendNotification({
          to: email,
          subject: template.subject,
          text: template.text,
          html: template.html,
        });
      }
    } catch (mailErr) {
      // Loguear error pero no afectar la respuesta principal
      console.error('Error enviando notificación de lead:', mailErr);
    }
    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear lead' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const lead = await Lead.updateStatus(req.params.id, status);
    // Auditoría
    await Audit.log({
      user_id: req.user.id,
      action: 'actualizar',
      entity: 'lead',
      entity_id: req.params.id,
      details: JSON.stringify({ status })
    });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar estado del lead' });
  }
};
