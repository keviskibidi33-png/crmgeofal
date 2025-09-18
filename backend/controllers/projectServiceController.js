const ProjectService = require('../models/projectService');

exports.getAllByProject = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const { rows, total } = await ProjectService.getAllByProject(req.params.project_id, { page, limit });
    res.json({ data: rows, total });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener servicios del proyecto' });
  }
};

exports.create = async (req, res) => {
  try {
    const { project_id, subservice_id, quantity } = req.body;
    const provided_by = req.user.id;
    const projectService = await ProjectService.create({ project_id, subservice_id, quantity, provided_by });
    res.status(201).json(projectService);
  } catch (err) {
    res.status(500).json({ error: 'Error al asociar servicio al proyecto' });
  }
};
