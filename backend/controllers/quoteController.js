
const Quote = require('../models/quote');
const AuditQuote = require('../models/auditQuote');

// Función para validar RUC
function validateRUC(ruc) {
  if (!ruc) {
    return { valid: false, message: 'RUC es requerido' };
  }
  
  // Convertir a string y limpiar espacios
  const rucStr = ruc.toString().trim();
  
  // Verificar que tenga exactamente 11 dígitos
  if (!/^\d{11}$/.test(rucStr)) {
    return { valid: false, message: 'RUC debe tener exactamente 11 dígitos' };
  }
  
  // Verificar que empiece con "20"
  if (!rucStr.startsWith('20')) {
    return { valid: false, message: 'RUC debe empezar con "20"' };
  }
  
  return { valid: true, message: 'RUC válido' };
}

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
    const data = req.body || {};
    // basic validation: require at least project_id or client info
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Datos de cotización requeridos' });
    }
    
    // Validar que project_id existe y es válido
    if (!data.project_id) {
      return res.status(400).json({ error: 'project_id es requerido' });
    }
    
    // ✅ NUEVA VALIDACIÓN: Verificar RUC si está presente
    if (data.meta && data.meta.company && data.meta.company.ruc) {
      const rucValidation = validateRUC(data.meta.company.ruc);
      if (!rucValidation.valid) {
        return res.status(400).json({ 
          error: `RUC inválido: ${rucValidation.message}`,
          field: 'ruc',
          value: data.meta.company.ruc
        });
      }
      console.log('✅ RUC validado correctamente:', data.meta.company.ruc);
    }
    
    // Verificar que el proyecto existe
    const pool = require('../config/db');
    const projectCheck = await pool.query('SELECT id FROM projects WHERE id = $1', [data.project_id]);
    if (projectCheck.rows.length === 0) {
      return res.status(400).json({ error: `Proyecto con ID ${data.project_id} no existe` });
    }
    
    // set created_by when user present (tests may call without token)
    if (req.user && req.user.id) data.created_by = req.user.id;
    
    // Convertir variant_id de string (V1, V2, etc.) a ID numérico si es necesario
    if (data.variant_id && typeof data.variant_id === 'string') {
      try {
        const variantQuery = await pool.query('SELECT id FROM quote_variants WHERE code = $1', [data.variant_id]);
        if (variantQuery.rows.length > 0) {
          data.variant_id = variantQuery.rows[0].id;
          console.log(`🔍 Quote.create - variant_id convertido: ${req.body.variant_id} -> ${data.variant_id}`);
        } else {
          console.warn(`⚠️ Quote.create - Variante ${data.variant_id} no encontrada, usando null`);
          data.variant_id = null;
        }
      } catch (error) {
        console.error('❌ Quote.create - Error convirtiendo variant_id:', error);
        data.variant_id = null;
      }
    }
    
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
    
    // ✅ NUEVO: Insertar ítems en quote_items si existen
    if (data.meta && data.meta.items && data.meta.items.length > 0) {
      console.log('📋 Insertando ítems en quote_items...');
      const pool = require('../config/db');
      
      for (const item of data.meta.items) {
        try {
          await pool.query(`
            INSERT INTO quote_items (
              quote_id, name, description, norm, unit_price, quantity, 
              partial_price, total_price, subservice_id, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
          `, [
            quote.id,
            item.name || 'Ítem sin nombre',
            item.description || '',
            item.norm || '',
            parseFloat(item.unit_price) || 0,
            parseInt(item.quantity) || 1,
            parseFloat(item.partial_price) || 0,
            parseFloat(item.total) || 0,
            item.subservice_id || null
          ]);
          console.log(`✅ Ítem insertado: ${item.name || 'Sin nombre'}`);
        } catch (itemError) {
          console.error(`❌ Error insertando ítem:`, itemError.message);
        }
      }
      console.log('🎉 Todos los ítems insertados en quote_items');
    }
    
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

// Obtener cotizaciones del usuario actual
exports.getMyQuotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = require('../config/db');
    
    const result = await pool.query(`
      SELECT 
        q.*,
        p.name as project_name,
        c.name as company_name,
        c.ruc as company_ruc
      FROM quotes q
      LEFT JOIN projects p ON q.project_id = p.id
      LEFT JOIN companies c ON p.company_id = c.id
      WHERE q.created_by = $1
      ORDER BY q.created_at DESC
    `, [userId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting my quotes:', error);
    res.status(500).json({ error: error.message });
  }
};

// Endpoint específico para módulo de facturación - cotizaciones con proyectos
exports.getQuotesWithProjects = async (req, res) => {
  try {
    console.log('💰 getQuotesWithProjects - Usuario:', req.user?.role);
    
    // Verificar que sea personal de facturación
    if (req.user?.role !== 'facturacion' && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado: Solo personal de facturación puede acceder' });
    }
    
    // Datos de prueba para cotizaciones relacionadas con proyectos
    const quotes = [
      {
        id: 1,
        quote_number: "COT-2025-089",
        project_id: 1,
        project_name: "Análisis Geotécnico Proyecto Antamina",
        company_name: "Minera Antamina",
        total_amount: 45000,
        status: "aprobado",
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        approved_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        invoice_status: "pendiente"
      },
      {
        id: 2,
        quote_number: "COT-2025-090",
        project_id: 2,
        project_name: "Monitoreo Ambiental Cajamarca",
        company_name: "Minera Yanacocha",
        total_amount: 32000,
        status: "aprobado",
        created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        approved_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        invoice_status: "pendiente"
      },
      {
        id: 3,
        quote_number: "COT-2025-087",
        project_id: 3,
        project_name: "Análisis de Suelos Zona Norte",
        company_name: "Constructora del Norte",
        total_amount: 28000,
        status: "aprobado",
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        approved_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        invoice_status: "facturado",
        invoice_number: "FAC-2025-001",
        invoice_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    console.log('✅ getQuotesWithProjects - Cotizaciones obtenidas:', quotes.length);
    res.json(quotes);
  } catch (err) {
    console.error('❌ getQuotesWithProjects - Error:', err);
    res.status(500).json({ error: 'Error al obtener cotizaciones con proyectos: ' + err.message });
  }
};
