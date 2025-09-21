const Subservice = require('../models/subservice');

exports.getAllByService = async (req, res) => {
  try {
    const { page, limit, q } = req.query;
    const { rows, total } = await Subservice.getAllByService(req.params.service_id, { q, page, limit });
    res.json({ data: rows, total });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener subservicios' });
  }
};

exports.create = async (req, res) => {
  try {
    const { service_id, name } = req.body;
    const subservice = await Subservice.create({ service_id, name });
    res.status(201).json(subservice);
  } catch (err) {
    if (err && err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un subservicio con ese nombre para el servicio seleccionado' });
    }
    res.status(500).json({ error: 'Error al crear subservicio' });
  }
};

exports.update = async (req, res) => {
  try {
    const { name } = req.body;
    const subservice = await Subservice.update(req.params.id, { name });
    if (!subservice) return res.status(404).json({ error: 'Subservicio no encontrado' });
    res.json(subservice);
  } catch (err) {
    if (err && err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un subservicio con ese nombre para el servicio seleccionado' });
    }
    res.status(500).json({ error: 'Error al actualizar subservicio' });
  }
};

exports.remove = async (req, res) => {
  try {
    const ok = await Subservice.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Subservicio no encontrado' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar subservicio' });
  }
};
