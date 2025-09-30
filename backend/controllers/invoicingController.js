const db = require('../config/db');

// Obtener proyectos para facturación
const getProjectsForInvoicing = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.*,
        c.name as company_name,
        u.name as created_by_name,
        COUNT(q.id) as total_quotes,
        SUM(CASE WHEN q.status = 'aprobada' THEN 1 ELSE 0 END) as approved_quotes,
        SUM(CASE WHEN q.status = 'facturada' THEN 1 ELSE 0 END) as invoiced_quotes,
        SUM(CASE WHEN q.status = 'aprobada' THEN q.total ELSE 0 END) as total_amount
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
    console.error('Error fetching projects for invoicing:', error);
    res.status(500).json({ error: 'Error al obtener proyectos' });
  }
};

// Subir factura al proyecto
const uploadInvoiceToProject = async (req, res) => {
  try {
    const { project_id, invoice_number, invoice_date, invoice_amount, notes } = req.body;
    const userId = req.user.id;
    
    // Obtener archivo de factura si se subió
    const invoiceFile = req.file ? {
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      type: req.file.mimetype
    } : null;
    
    // Crear registro de factura
    const invoiceQuery = `
      INSERT INTO project_invoices (project_id, invoice_number, invoice_date, invoice_amount, notes, invoice_file, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const invoiceResult = await db.query(invoiceQuery, [
      project_id, 
      invoice_number, 
      invoice_date, 
      invoice_amount, 
      notes, 
      JSON.stringify(invoiceFile), 
      userId
    ]);
    
    // Marcar cotizaciones del proyecto como facturadas
    const updateQuotesQuery = `
      UPDATE quotes 
      SET status = 'facturada', updated_at = NOW()
      WHERE project_id = $1 AND status = 'aprobada'
    `;
    
    await db.query(updateQuotesQuery, [project_id]);
    
    // Marcar proyecto como completado
    const updateProjectQuery = `
      UPDATE projects 
      SET status = 'completado', completed_at = NOW()
      WHERE id = $1
    `;
    
    await db.query(updateProjectQuery, [project_id]);
    
    res.status(201).json(invoiceResult.rows[0]);
  } catch (error) {
    console.error('Error uploading invoice:', error);
    res.status(500).json({ error: 'Error al subir factura' });
  }
};

// Obtener facturas del proyecto
const getProjectInvoices = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        pi.*,
        u.name as created_by_name
      FROM project_invoices pi
      LEFT JOIN users u ON pi.created_by = u.id
      WHERE pi.project_id = $1
      ORDER BY pi.created_at DESC
    `;
    
    const result = await db.query(query, [id]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching project invoices:', error);
    res.status(500).json({ error: 'Error al obtener facturas' });
  }
};

// Obtener estadísticas de facturación
const getInvoicingStats = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(DISTINCT p.id) as total_projects,
        COUNT(DISTINCT CASE WHEN p.status = 'completado' THEN p.id END) as completed_projects,
        COUNT(DISTINCT pi.id) as total_invoices,
        SUM(pi.invoice_amount) as total_invoiced_amount,
        AVG(pi.invoice_amount) as average_invoice_amount
      FROM projects p
      LEFT JOIN project_invoices pi ON p.id = pi.project_id
      WHERE p.status IN ('activo', 'completado')
    `;
    
    const result = await db.query(query);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching invoicing stats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

module.exports = {
  getProjectsForInvoicing,
  uploadInvoiceToProject,
  getProjectInvoices,
  getInvoicingStats
};
