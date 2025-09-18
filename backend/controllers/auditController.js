const Audit = require('../models/audit');

exports.getAll = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const { rows, total } = await Audit.getAll({ page, limit });
    res.json({ data: rows, total });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener auditoría' });
  }
};
