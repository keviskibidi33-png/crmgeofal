const QuoteItem = require('../models/quoteItem');
const AuditQuote = require('../models/auditQuote');

exports.getAllByQuote = async (req, res) => {
  try {
    const items = await QuoteItem.getAllByQuote(req.params.quote_id);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener ítems de cotización' });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await QuoteItem.getById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Ítem no encontrado' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener ítem' });
  }
};

exports.create = async (req, res) => {
  try {
    const data = req.body;
    const item = await QuoteItem.create(data);
    await AuditQuote.log({
      user_id: req.user?.id || null,
      action: 'crear',
      entity: 'quote_item',
      entity_id: item.id,
      details: JSON.stringify(data)
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear ítem' });
  }
};

exports.update = async (req, res) => {
  try {
    const data = req.body;
    const item = await QuoteItem.update(req.params.id, data);
    await AuditQuote.log({
      user_id: req.user?.id || null,
      action: 'editar',
      entity: 'quote_item',
      entity_id: req.params.id,
      details: JSON.stringify(data)
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar ítem' });
  }
};

exports.delete = async (req, res) => {
  try {
    await QuoteItem.delete(req.params.id);
    await AuditQuote.log({
      user_id: req.user?.id || null,
      action: 'eliminar',
      entity: 'quote_item',
      entity_id: req.params.id,
      details: ''
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar ítem' });
  }
};
