const Service = require('../models/service');

exports.getAll = async (req, res) => {
  try {
    const { area, q, page, limit } = req.query;
    const { rows, total } = await Service.getAll({ area, q, page, limit });
    res.json({ data: rows, total });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener servicios' });
  }
};

