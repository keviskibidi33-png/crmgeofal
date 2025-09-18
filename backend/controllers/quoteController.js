const Quote = require('../models/quote');

exports.getAllByProject = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { rows, total } = await Quote.getAllByProject(req.params.project_id, req.user, { page, limit });
    res.json({ data: rows, total });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener cotizaciones' });
  }
};

exports.create = async (req, res) => {
  try {
    const { project_id, document_url, engineer_name, notes } = req.body;
    const quote = await Quote.create({ project_id, document_url, engineer_name, notes });
    res.status(201).json(quote);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear cotización' });
  }
};

exports.update = async (req, res) => {
  try {
    const { document_url, engineer_name, notes } = req.body;
    const quote = await Quote.update(req.params.id, { document_url, engineer_name, notes }, req.user);
    if (!quote) return res.status(403).json({ error: 'No autorizado o cotización no encontrada' });
    res.json(quote);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar cotización' });
  }
};

exports.delete = async (req, res) => {
  try {
    await Quote.delete(req.params.id, req.user);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar cotización' });
  }
};
