const Project = require('../models/project');

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const company_id = req.query.company_id || '';
    const project_type = req.query.project_type || '';
    
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { rows, total } = await Project.getAllByUser(req.user, { 
      page, 
      limit, 
      search, 
      status, 
      company_id,
      project_type
    });
    res.json({ data: rows, total });
  } catch (err) {
    console.error('Error getting projects:', err);
    res.status(500).json({ error: 'Error al obtener proyectos' });
  }
};

exports.getById = async (req, res) => {
  try {
    const project = await Project.getById(req.params.id, req.user);
    if (!project) return res.status(403).json({ error: 'No autorizado o proyecto no encontrado' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener proyecto' });
  }
};

const Audit = require('../models/audit');

exports.create = async (req, res) => {
  try {
    const { company_id, name, location, vendedor_id, laboratorio_id } = req.body;
    const project = await Project.create({ company_id, name, location, vendedor_id, laboratorio_id });
    // Auditoría
    await Audit.log({
      user_id: req.user.id,
      action: 'crear',
      entity: 'project',
      entity_id: project.id,
      details: JSON.stringify({ company_id, name, location, vendedor_id, laboratorio_id })
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear proyecto' });
  }
};
exports.update = async (req, res) => {
  try {
    const { name, location } = req.body;
    const project = await Project.update(req.params.id, { name, location }, req.user);
    if (!project) return res.status(403).json({ error: 'No autorizado o proyecto no encontrado' });
    // Auditoría
    await Audit.log({
      user_id: req.user.id,
      action: 'actualizar',
      entity: 'project',
      entity_id: req.params.id,
      details: JSON.stringify({ name, location })
    });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar proyecto' });
  }
};

exports.delete = async (req, res) => {
  try {
    const ok = await Project.delete(req.params.id, req.user);
    if (!ok) return res.status(403).json({ error: 'No autorizado' });
    // Auditoría
    await Audit.log({
      user_id: req.user.id,
      action: 'eliminar',
      entity: 'project',
      entity_id: req.params.id,
      details: null
    });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar proyecto' });
  }
};

exports.getStats = async (req, res) => {
  try {
    console.log('📊 getProjectStats - Obteniendo estadísticas de proyectos...');
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    const stats = await Project.getStats(req.user);
    console.log('✅ getProjectStats - Estadísticas obtenidas:', stats);
    res.json(stats);
  } catch (err) {
    console.error('❌ getProjectStats - Error:', err);
    res.status(500).json({ error: 'Error getting project stats: ' + err.message });
  }
};
