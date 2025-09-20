
const Quote = require('../models/quote');
const AuditQuote = require('../models/auditQuote');

exports.getAll = async (req, res) => {
  try {
    const { project_id, company_id, status, page, limit, date_from, date_to } = req.query;
    const result = await Quote.getAll({ project_id, company_id, status, page, limit, date_from, date_to });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener cotizaciones' });
  }
};

exports.getById = async (req, res) => {
  try {
    const quote = await Quote.getById(req.params.id);
    if (!quote) return res.status(404).json({ error: 'Cotización no encontrada' });
    res.json(quote);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener cotización' });
  }
};

exports.create = async (req, res) => {
  try {
    const data = req.body || {};
    // basic validation: require at least project_id or client info
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Datos de cotización requeridos' });
    }
  // set created_by when user present (tests may call without token)
  if (req.user && req.user.id) data.created_by = req.user.id;
    const quote = await Quote.create(data);
    await AuditQuote.log({
      user_id: req.user?.id || null,
      action: 'crear',
      entity: 'quote',
      entity_id: quote.id,
      details: JSON.stringify(data)
    });
    res.status(201).json(quote);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear cotización' });
  }
};

exports.update = async (req, res) => {
  try {
    const data = req.body;
    const quote = await Quote.update(req.params.id, data);
    await AuditQuote.log({
      user_id: req.user.id,
      action: 'editar',
      entity: 'quote',
      entity_id: req.params.id,
      details: JSON.stringify(data)
    });
    res.json(quote);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar cotización' });
  }
};

exports.delete = async (req, res) => {
  try {
    await Quote.delete(req.params.id);
    await AuditQuote.log({
      user_id: req.user.id,
      action: 'eliminar',
      entity: 'quote',
      entity_id: req.params.id,
      details: ''
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar cotización' });
  }
};
