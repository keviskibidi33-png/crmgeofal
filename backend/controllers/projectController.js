const Project = require('../models/project');

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const company_id = req.query.company_id || '';
    const project_type = req.query.project_type || '';
    const priority = req.query.priority || '';
    
    console.log('🔍 getAll - Parámetros recibidos:', { page, limit, search, status, company_id, project_type, priority });
    
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const user = req.user;
    
    const { rows, total } = await Project.getAllByUser(user, { 
      page, 
      limit, 
      search, 
      status, 
      company_id,
      project_type,
      priority
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
    console.log('🔍 updateCategories - ID recibido:', req.params.id);
    console.log('🔍 updateCategories - Body recibido:', req.body);
    console.log('🔍 updateCategories - User:', req.user);
    
    const { requiere_laboratorio, requiere_ingenieria, requiere_consultoria, requiere_capacitacion, requiere_auditoria } = req.body;
    const project = await Project.updateCategories(req.params.id, {
      requiere_laboratorio,
      requiere_ingenieria,
      requiere_consultoria,
      requiere_capacitacion,
      requiere_auditoria
    });
    
    if (!project) {
      console.log('❌ updateCategories - Proyecto no encontrado');
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    console.log('✅ updateCategories - Proyecto actualizado:', project);

    // Auditoría
    try {
      if (req.user && req.user.id) {
        await Audit.log({
          user_id: req.user.id,
          action: 'actualizar_categorias',
          entity: 'project',
          entity_id: project.id,
          details: { requiere_laboratorio, requiere_ingenieria, requiere_consultoria, requiere_capacitacion, requiere_auditoria }
        });
        console.log('✅ updateCategories - Auditoría registrada');
      } else {
        console.log('⚠️ updateCategories - No hay usuario para auditoría');
      }
    } catch (auditError) {
      console.error('❌ updateCategories - Error en auditoría:', auditError);
      // No fallar por error de auditoría
    }

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
    const { 
      company_id, 
      name, 
      location, 
      vendedor_id, 
      laboratorio_id, 
      requiere_laboratorio, 
      requiere_ingenieria, 
      requiere_consultoria,
      requiere_capacitacion,
      requiere_auditoria,
      contact_name, 
      contact_phone, 
      contact_email,
      queries,
      priority,
      marked,
    } = req.body;
    
    const project = await Project.create({ 
      company_id, 
      name, 
      location, 
      vendedor_id, 
      laboratorio_id, 
      requiere_laboratorio: requiere_laboratorio || false, 
      requiere_ingenieria: requiere_ingenieria || false,
      requiere_consultoria: requiere_consultoria || false,
      requiere_capacitacion: requiere_capacitacion || false,
      requiere_auditoria: requiere_auditoria || false,
      contact_name,
      contact_phone,
      contact_email,
      queries: queries || '',
      priority: priority || 'normal',
      marked: marked || false,
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
    const { 
      name, 
      location, 
      vendedor_id, 
      laboratorio_id, 
      requiere_laboratorio, 
      requiere_ingenieria, 
      requiere_consultoria,
      requiere_capacitacion,
      requiere_auditoria,
      contact_name, 
      contact_phone, 
      contact_email,
      queries,
      queries_history,
      priority,
      marked,
      status,
      laboratorio_status,
      ingenieria_status,
    } = req.body;
    
    const project = await Project.update(req.params.id, { 
      name, 
      location, 
      vendedor_id, 
      laboratorio_id, 
      requiere_laboratorio, 
      requiere_ingenieria, 
      requiere_consultoria,
      requiere_capacitacion,
      requiere_auditoria,
      contact_name, 
      contact_phone, 
      contact_email,
      queries,
      queries_history,
      priority,
      marked,
      status,
      laboratorio_status,
      ingenieria_status,
    }, req.user);
    
    if (!project) return res.status(403).json({ error: 'No autorizado o proyecto no encontrado' });
    
    // Auditoría
    await Audit.log({
      user_id: req.user.id,
      action: 'actualizar',
      entity: 'project',
      entity_id: req.params.id,
      details: JSON.stringify({ 
        name, 
        location, 
        contact_name, 
        contact_phone, 
        contact_email,
        queries,
        priority,
        marked
      })
    });
    
    res.json(project);
  } catch (err) {
    console.error('Error updating project:', err);
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

exports.getExistingServices = async (req, res) => {
  try {
    console.log('🔍 getExistingServices - Obteniendo servicios existentes...');
    const services = await Project.getExistingServices();
    console.log('✅ getExistingServices - Servicios obtenidos:', services.length);
    res.json(services);
  } catch (err) {
    console.error('❌ getExistingServices - Error:', err);
    res.status(500).json({ error: 'Error al obtener servicios existentes: ' + err.message });
  }
};

// Endpoint específico para módulo de facturación
exports.getProjectsForInvoicing = async (req, res) => {
  try {
    console.log('💰 getProjectsForInvoicing - Usuario:', req.user?.role);
    
    // Verificar que sea personal de facturación
    if (req.user?.role !== 'facturacion' && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado: Solo personal de facturación puede acceder' });
    }
    
    // Datos de prueba para proyectos pendientes de facturación
    const projects = [
      {
        id: 1,
        name: "Análisis Geotécnico Proyecto Antamina",
        company_name: "Minera Antamina",
        status: "completado",
        invoice_status: "pendiente",
        total_amount: 45000,
        completion_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        project_type: "Estudio Geotécnico",
        priority: "high"
      },
      {
        id: 2,
        name: "Monitoreo Ambiental Cajamarca",
        company_name: "Minera Yanacocha",
        status: "completado",
        invoice_status: "pendiente",
        total_amount: 32000,
        completion_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        project_type: "Análisis Ambiental",
        priority: "normal"
      },
      {
        id: 3,
        name: "Análisis de Suelos Zona Norte",
        company_name: "Constructora del Norte",
        status: "completado",
        invoice_status: "facturado",
        total_amount: 28000,
        completion_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        project_type: "Análisis de Suelos",
        priority: "normal",
        invoice_number: "FAC-2025-001",
        invoice_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 4,
        name: "Estudio Sísmico Infraestructura",
        company_name: "Estudios Ambientales Sur",
        status: "completado",
        invoice_status: "pagado",
        total_amount: 55000,
        completion_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        project_type: "Estudio Sísmico",
        priority: "high",
        invoice_number: "FAC-2025-002",
        invoice_date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        payment_date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    console.log('✅ getProjectsForInvoicing - Proyectos obtenidos:', projects.length);
    res.json(projects);
  } catch (err) {
    console.error('❌ getProjectsForInvoicing - Error:', err);
    res.status(500).json({ error: 'Error al obtener proyectos para facturación: ' + err.message });
  }
};