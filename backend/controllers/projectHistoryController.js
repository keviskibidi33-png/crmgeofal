const ProjectHistory = require('../models/projectHistory');

exports.getByProject = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { rows, total } = await ProjectHistory.getByProject(req.params.project_id, req.user, { page, limit });
    res.json({ data: rows, total });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener historial' });
  }
};

exports.add = async (req, res) => {
  try {
    const { project_id, action, notes } = req.body;
    const entry = await ProjectHistory.add({ project_id, action, performed_by: req.user.id, notes });
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: 'Error al agregar historial' });
  }
};
