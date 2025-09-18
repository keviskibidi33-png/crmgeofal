const Subservice = require('../models/subservice');

exports.getAllByService = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const { rows, total } = await Subservice.getAllByService(req.params.service_id, { page, limit });
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
    res.status(500).json({ error: 'Error al crear subservicio' });
  }
};
