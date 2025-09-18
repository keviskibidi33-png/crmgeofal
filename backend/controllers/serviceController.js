const Service = require('../models/service');

exports.getAll = async (req, res) => {
  try {
    const { area, page, limit } = req.query;
    const { rows, total } = await Service.getAll({ area, page, limit });
    res.json({ data: rows, total });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener servicios' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, area } = req.body;
    const service = await Service.create({ name, area });
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear servicio' });
  }
};
