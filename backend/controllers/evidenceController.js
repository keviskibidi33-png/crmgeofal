const Evidence = require('../models/evidence');

exports.getAll = async (req, res) => {
  try {
    const { project_id, invoice_id, type, page, limit } = req.query;
    const { rows, total } = await Evidence.getAll({ project_id, invoice_id, type, page, limit });
    res.json({ data: rows, total });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener evidencias' });
  }
};

exports.create = async (req, res) => {
  try {
    const { project_id, invoice_id, type } = req.body;
    const file_url = req.file ? `/uploads/${req.file.filename}` : null;
    const uploaded_by = req.user.id;
    if (!file_url) return res.status(400).json({ error: 'Archivo requerido' });
    const evidence = await Evidence.create({ project_id, invoice_id, type, file_url, uploaded_by });
    res.status(201).json(evidence);
  } catch (err) {
    res.status(500).json({ error: 'Error al subir evidencia' });
  }
};
