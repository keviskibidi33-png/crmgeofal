const Ticket = require('../models/ticket');
const TicketHistory = require('../models/ticketHistory');

exports.getAll = async (req, res) => {
  try {
    const { page, limit, status, priority } = req.query;
    const { rows, total } = await Ticket.getAll({ page, limit, status, priority });
    res.json({ data: rows, total });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener tickets' });
  }
};
const { sendNotification, ticketCreatedTemplate } = require('../services/notificationService');

const Audit = require('../models/audit');

exports.getById = async (req, res) => {
  try {
    const ticket = await Ticket.getById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener ticket' });
  }
};
exports.create = async (req, res) => {
  try {
    const { title, description, priority } = req.body;
    const attachment_url = req.file ? `/uploads/${req.file.filename}` : null;
    const ticket = await Ticket.create({
      user_id: req.user.id,
      title,
      description,
      priority,
      attachment_url
    });
    // Auditoría: creación de ticket
    await Audit.log({
      user_id: req.user.id,
      action: 'crear',
      entity: 'ticket',
      entity_id: ticket.id,
      details: JSON.stringify({ title, description, priority, attachment_url })
    });
    await TicketHistory.add({ ticket_id: ticket.id, action: 'creado', performed_by: req.user.id, notes: null });
    // Notificar por correo (puedes obtener el email del usuario si lo deseas)
    try {
      const template = ticketCreatedTemplate({ ticket, user: req.user });
      // Aquí podrías definir a quién notificar, por ejemplo, a un correo de soporte
      if (req.user && req.user.email) {
        await sendNotification({
          to: req.user.email,
          subject: template.subject,
          text: template.text,
          html: template.html,
        });
      }
    } catch (mailErr) {
      console.error('Error enviando notificación de ticket:', mailErr);
    }
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear ticket' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.updateStatus(req.params.id, status);
    // Auditoría: cambio de estado
    await Audit.log({
      user_id: req.user.id,
      action: 'cambiar_estado',
      entity: 'ticket',
      entity_id: ticket.id,
      details: JSON.stringify({ nuevo_estado: status })
    });
    await TicketHistory.add({ ticket_id: ticket.id, action: `cambio a ${status}`, performed_by: req.user.id, notes: null });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar estado del ticket' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const { rows, total } = await TicketHistory.getByTicket(req.params.ticket_id, { page, limit });
    res.json({ data: rows, total });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener historial del ticket' });
  }
};

exports.getGlobalHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, q = '', action = '', range = '30' } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conds = [];
    if (q) { params.push(`%${q.toLowerCase()}%`); conds.push('(CAST(ticket_id AS TEXT) ILIKE $' + params.length + ' OR CAST(performed_by AS TEXT) ILIKE $' + params.length + ')'); }
    if (action) { params.push(action); conds.push('action = $' + params.length); }
    if (range && range !== 'all') { const days = Number(range)||30; params.push(days); conds.push(`performed_at >= NOW() - ($${params.length}::int || ' days')::interval`); }
    const where = conds.length ? ('WHERE ' + conds.join(' AND ')) : '';
    const pool = require('../config/db');
    const data = await pool.query(
      `SELECT th.*, u.name as user_name FROM ticket_history th
       LEFT JOIN users u ON u.id = th.performed_by
       ${where} ORDER BY th.id DESC LIMIT $${params.length+1} OFFSET $${params.length+2}`,
      [...params, limit, offset]
    );
    const total = await pool.query(`SELECT COUNT(*) FROM ticket_history th ${where}`, params);
    res.json({ data: data.rows, total: parseInt(total.rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener historial global de tickets' });
  }
};

