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

exports.updateStatus = async (req, res) => {
  try {
    const { status, laboratorio_status, ingenieria_status, status_notes } = req.body;
    const project = await Project.updateStatus(req.params.id, {
      status,
      laboratorio_status,
      ingenieria_status,
      status_notes
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    // Auditoría
    await Audit.log({
      user_id: req.user.id,
      action: 'actualizar_estado',
      entity: 'project',
      entity_id: project.id,
      details: { status, laboratorio_status, ingenieria_status }
    });

    res.json(project);
  } catch (err) {
    console.error('Error updating project status:', err);
    res.status(500).json({ error: 'Error al actualizar estado del proyecto' });
  }
};

exports.updateCategories = async (req, res) => {
  try {
    const { requiere_laboratorio, requiere_ingenieria, requiere_consultoria, requiere_capacitacion, requiere_auditoria } = req.body;
    const project = await Project.updateCategories(req.params.id, {
      requiere_laboratorio,
      requiere_ingenieria,
      requiere_consultoria,
      requiere_capacitacion,
      requiere_auditoria
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    // Auditoría
    await Audit.log({
      user_id: req.user.id,
      action: 'actualizar_categorias',
      entity: 'project',
      entity_id: project.id,
      details: { requiere_laboratorio, requiere_ingenieria, requiere_consultoria, requiere_capacitacion, requiere_auditoria }
    });

    res.json(project);
  } catch (err) {
    console.error('Error updating project categories:', err);
    res.status(500).json({ error: 'Error al actualizar categorías del proyecto' });
  }
};

exports.updateQueries = async (req, res) => {
  try {
    const { queries } = req.body;
    const project = await Project.updateQueries(req.params.id, { queries });
    
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    // Auditoría
    await Audit.log({
      user_id: req.user.id,
      action: 'actualizar_consultas',
      entity: 'project',
      entity_id: project.id,
      details: { queries: queries?.substring(0, 100) + '...' }
    });

    res.json(project);
  } catch (err) {
    console.error('Error updating project queries:', err);
    res.status(500).json({ error: 'Error al actualizar consultas del proyecto' });
  }
};

exports.updateMark = async (req, res) => {
  try {
    const { marked, priority } = req.body;
    const project = await Project.updateMark(req.params.id, { marked, priority });
    
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    // Auditoría
    await Audit.log({
      user_id: req.user.id,
      action: 'marcar_proyecto',
      entity: 'project',
      entity_id: project.id,
      details: { marked, priority }
    });

    res.json(project);
  } catch (err) {
    console.error('Error updating project mark:', err);
    res.status(500).json({ error: 'Error al marcar proyecto' });
  }
};

exports.create = async (req, res) => {
  try {
    const { company_id, name, location, vendedor_id, laboratorio_id, requiere_laboratorio, requiere_ingenieria, contact_name, contact_phone, contact_email } = req.body;
    const project = await Project.create({ 
      company_id, 
      name, 
      location, 
      vendedor_id, 
      laboratorio_id, 
      requiere_laboratorio: requiere_laboratorio || false, 
      requiere_ingenieria: requiere_ingenieria || false,
      contact_name,
      contact_phone,
      contact_email
    });
    // Auditoría
    await Audit.log({
      user_id: req.user.id,
      action: 'crear',
      entity: 'project',
      entity_id: project.id,
      details: JSON.stringify({ company_id, name, location, vendedor_id, laboratorio_id, requiere_laboratorio, requiere_ingenieria })
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
