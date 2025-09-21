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

exports.create = async (req, res) => {
  try {
    const { name, area } = req.body;
    const service = await Service.create({ name, area });
    res.status(201).json(service);
  } catch (err) {
    if (err && err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un servicio con ese nombre en el área seleccionada' });
    }
    res.status(500).json({ error: 'Error al crear servicio' });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, area } = req.body;
    const service = await Service.update(req.params.id, { name, area });
    if (!service) return res.status(404).json({ error: 'Servicio no encontrado' });
    res.json(service);
  } catch (err) {
    if (err && err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un servicio con ese nombre en el área seleccionada' });
    }
    res.status(500).json({ error: 'Error al actualizar servicio' });
  }
};

exports.remove = async (req, res) => {
  try {
    const ok = await Service.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Servicio no encontrado' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar servicio' });
  }
};
