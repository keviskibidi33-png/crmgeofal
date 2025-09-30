const db = require('../config/db');

// Obtener proyectos para laboratorio
const getProjectsForLaboratory = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.*,
        c.name as company_name,
        u.name as created_by_name,
        COUNT(q.id) as total_quotes,
        SUM(CASE WHEN q.status = 'aprobada' THEN 1 ELSE 0 END) as approved_quotes,
        SUM(CASE WHEN q.status = 'facturada' THEN 1 ELSE 0 END) as invoiced_quotes,
        SUM(CASE WHEN q.status = 'aprobada' THEN COALESCE(q.total_amount, 0) ELSE 0 END) as total_amount
      FROM projects p
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN quotes q ON p.id = q.project_id
      WHERE p.status = 'activo'
      GROUP BY p.id, c.name, u.name
      ORDER BY p.created_at DESC
    `;
    
    const result = await db.query(query);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching projects for laboratory:', error);
    res.status(500).json({ error: 'Error al obtener proyectos' });
  }
};

// Obtener cotizaciones relacionadas con proyectos
const getQuotesWithProjects = async (req, res) => {
  try {
    const query = `
      SELECT 
        q.*,
        p.name as project_name,
        c.name as company_name,
        u.name as created_by_name
      FROM quotes q
      LEFT JOIN projects p ON q.project_id = p.id
      LEFT JOIN companies c ON q.company_id = c.id
      LEFT JOIN users u ON q.created_by = u.id
      WHERE q.status IN ('aprobada', 'facturada')
      ORDER BY q.created_at DESC
    `;
    
    const result = await db.query(query);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching quotes with projects:', error);
    res.status(500).json({ error: 'Error al obtener cotizaciones' });
  }
};

// Obtener detalles del proyecto
const getProjectDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        p.*,
        c.name as company_name,
        u.name as created_by_name
      FROM projects p
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.id = $1
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    // Obtener cotizaciones del proyecto
    const quotesQuery = `
      SELECT 
        q.*,
        u.name as created_by_name
      FROM quotes q
      LEFT JOIN users u ON q.created_by = u.id
      WHERE q.project_id = $1
      ORDER BY q.created_at DESC
    `;
    
    const quotesResult = await db.query(quotesQuery, [id]);
    
    res.json({
      ...result.rows[0],
      quotes: quotesResult.rows
    });
  } catch (error) {
    console.error('Error fetching project details:', error);
    res.status(500).json({ error: 'Error al obtener detalles del proyecto' });
  }
};

// Subir evidencias del proyecto
const uploadProjectEvidence = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const userId = req.user.id;
    
    // Obtener archivos subidos
    const files = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      path: file.path,
      size: file.size,
      type: file.mimetype
    })) : [];
    
    // Crear registro de evidencia
    const query = `
      INSERT INTO project_evidence (project_id, notes, files, uploaded_by)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await db.query(query, [id, notes, JSON.stringify(files), userId]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error uploading project evidence:', error);
    res.status(500).json({ error: 'Error al subir evidencias' });
  }
};

// Obtener evidencias del proyecto
const getProjectEvidence = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        pe.*,
        u.name as uploaded_by_name
      FROM project_evidence pe
      LEFT JOIN users u ON pe.uploaded_by = u.id
      WHERE pe.project_id = $1
      ORDER BY pe.created_at DESC
    `;
    
    const result = await db.query(query, [id]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching project evidence:', error);
    res.status(500).json({ error: 'Error al obtener evidencias' });
  }
};

module.exports = {
  getProjectsForLaboratory,
  getQuotesWithProjects,
  getProjectDetails,
  uploadProjectEvidence,
  getProjectEvidence
};
