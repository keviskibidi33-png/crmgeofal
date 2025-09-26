
const Quote = require('../models/quote');
const AuditQuote = require('../models/auditQuote');

exports.getAll = async (req, res) => {
  try {
    const { project_id, company_id, status, page, limit, date_from, date_to } = req.query;
    const result = await Quote.getAll({ project_id, company_id, status, page, limit, date_from, date_to });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener cotizaciones' });
  }
};

exports.getById = async (req, res) => {
  try {
    const quote = await Quote.getById(req.params.id);
    if (!quote) return res.status(404).json({ error: 'Cotización no encontrada' });
    res.json(quote);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener cotización' });
  }
};

exports.create = async (req, res) => {
  try {
    console.log('🔍 Quote.create - Datos recibidos:', JSON.stringify(req.body, null, 2));
    console.log('🔍 Quote.create - Usuario:', req.user);
    
    const data = req.body || {};
    // basic validation: require at least project_id or client info
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Datos de cotización requeridos' });
    }
    
    // Validar que project_id existe y es válido
    if (!data.project_id) {
      return res.status(400).json({ error: 'project_id es requerido' });
    }
    
    // Verificar que el proyecto existe
    const pool = require('../config/db');
    const projectCheck = await pool.query('SELECT id FROM projects WHERE id = $1', [data.project_id]);
    if (projectCheck.rows.length === 0) {
      return res.status(400).json({ error: `Proyecto con ID ${data.project_id} no existe` });
    }
    
    // set created_by when user present (tests may call without token)
    if (req.user && req.user.id) data.created_by = req.user.id;
    
    // Validar y limpiar campos JSON
    if (data.meta && typeof data.meta === 'string') {
      try {
        data.meta = JSON.parse(data.meta);
      } catch (error) {
        console.error('Error parsing meta JSON:', error);
        console.error('Original meta string:', data.meta);
        data.meta = { error: 'Invalid JSON format', original: data.meta };
      }
    }
    
    if (data.reference_type && typeof data.reference_type === 'string') {
      try {
        data.reference_type = JSON.parse(data.reference_type);
      } catch (error) {
        console.error('Error parsing reference_type JSON:', error);
        console.error('Original reference_type string:', data.reference_type);
        data.reference_type = null;
      }
    }
    
    console.log('🔍 Quote.create - Datos procesados:', JSON.stringify(data, null, 2));
    console.log('🔍 Quote.create - Meta después de procesar:', data.meta);
    console.log('🔍 Quote.create - Reference Type después de procesar:', data.reference_type);
    
    const quote = await Quote.create(data);
    console.log('✅ Quote.create - Cotización creada:', quote);
    
    await AuditQuote.log({
      user_id: req.user?.id || null,
      action: 'crear',
      entity: 'quote',
      entity_id: quote.id,
      details: JSON.stringify(data)
    });
    res.status(201).json(quote);
  } catch (err) {
    console.error('❌ Quote.create - Error:', err);
    res.status(500).json({ error: 'Error al crear cotización: ' + err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = req.body;
    const quote = await Quote.update(req.params.id, data);
    await AuditQuote.log({
      user_id: req.user.id,
      action: 'editar',
      entity: 'quote',
      entity_id: req.params.id,
      details: JSON.stringify(data)
    });
    res.json(quote);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar cotización' });
  }
};

exports.delete = async (req, res) => {
  try {
    await Quote.delete(req.params.id);
    await AuditQuote.log({
      user_id: req.user.id,
      action: 'eliminar',
      entity: 'quote',
      entity_id: req.params.id,
      details: ''
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar cotización' });
  }
};
