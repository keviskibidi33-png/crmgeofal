const pool = require('../config/db');
const notificationSystem = require('../services/notificationSystem');

// Aprobar cotización (vendedor autónomo)
exports.approveQuote = async (req, res) => {
  try {
    const { quoteId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Verificar que el usuario puede aprobar esta cotización
    const quoteCheck = await pool.query(`
      SELECT id, status, created_by 
      FROM quotes 
      WHERE id = $1
    `, [quoteId]);

    if (quoteCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }

    const quote = quoteCheck.rows[0];

    // Verificar permisos: vendedor puede aprobar sus propias cotizaciones
    if (userRole === 'vendedor_comercial' && quote.created_by !== userId) {
      return res.status(403).json({ error: 'Solo puedes aprobar tus propias cotizaciones' });
    }

    // Verificar que la cotización está en estado borrador
    if (quote.status !== 'borrador') {
      return res.status(400).json({ 
        error: `La cotización ya está en estado '${quote.status}'. Solo se pueden aprobar cotizaciones en borrador.` 
      });
    }

    // Actualizar estado a aprobada
    const result = await pool.query(`
      UPDATE quotes 
      SET 
        status = 'aprobada',
        updated_at = NOW(),
        approved_by = $1,
        approved_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [userId, quoteId]);

    // Registrar en auditoría
    await pool.query(`
      INSERT INTO audit_quotes (user_id, action, entity, entity_id, details)
      VALUES ($1, 'aprobar', 'quote', $2, 'Cotización aprobada por vendedor autónomo')
    `, [userId, quoteId]);

    // Enviar notificaciones
    await notificationSystem.notifyQuoteApproved(quoteId, userId);

    res.json({
      success: true,
      message: 'Cotización aprobada exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error approving quote:', error);
    res.status(500).json({ error: 'Error aprobando cotización: ' + error.message });
  }
};

// Revertir cotización a borrador (solo si está aprobada y no facturada)
exports.revertToDraft = async (req, res) => {
  try {
    const { quoteId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Verificar que el usuario puede revertir esta cotización
    const quoteCheck = await pool.query(`
      SELECT id, status, created_by 
      FROM quotes 
      WHERE id = $1
    `, [quoteId]);

    if (quoteCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }

    const quote = quoteCheck.rows[0];

    // Verificar permisos: vendedor puede revertir sus propias cotizaciones
    if (userRole === 'vendedor_comercial' && quote.created_by !== userId) {
      return res.status(403).json({ error: 'Solo puedes revertir tus propias cotizaciones' });
    }

    // Verificar que la cotización está aprobada (no facturada)
    if (quote.status !== 'aprobada') {
      return res.status(400).json({ 
        error: `No se puede revertir una cotización en estado '${quote.status}'. Solo se pueden revertir cotizaciones aprobadas.` 
      });
    }

    // Actualizar estado a borrador
    const result = await pool.query(`
      UPDATE quotes 
      SET 
        status = 'borrador',
        updated_at = NOW(),
        approved_by = NULL,
        approved_at = NULL
      WHERE id = $2
      RETURNING *
    `, [userId, quoteId]);

    // Registrar en auditoría
    await pool.query(`
      INSERT INTO audit_quotes (user_id, action, entity, entity_id, details)
      VALUES ($1, 'revertir', 'quote', $2, 'Cotización revertida a borrador por vendedor autónomo')
    `, [userId, quoteId]);

    res.json({
      success: true,
      message: 'Cotización revertida a borrador exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error reverting quote:', error);
    res.status(500).json({ error: 'Error revirtiendo cotización: ' + error.message });
  }
};

// Marcar como facturada (solo facturación)
exports.markAsInvoiced = async (req, res) => {
  try {
    const { quoteId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Solo facturación puede marcar como facturada
    if (userRole !== 'facturacion' && userRole !== 'admin') {
      return res.status(403).json({ error: 'Solo el personal de facturación puede marcar cotizaciones como facturadas' });
    }

    // Verificar que la cotización existe y está aprobada
    const quoteCheck = await pool.query(`
      SELECT id, status 
      FROM quotes 
      WHERE id = $1
    `, [quoteId]);

    if (quoteCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }

    const quote = quoteCheck.rows[0];

    if (quote.status !== 'aprobada') {
      return res.status(400).json({ 
        error: `Solo se pueden facturar cotizaciones aprobadas. Estado actual: '${quote.status}'` 
      });
    }

    // Actualizar estado a facturada
    const result = await pool.query(`
      UPDATE quotes 
      SET 
        status = 'facturada',
        updated_at = NOW(),
        invoiced_by = $1,
        invoiced_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [userId, quoteId]);

    // Registrar en auditoría
    await pool.query(`
      INSERT INTO audit_quotes (user_id, action, entity, entity_id, details)
      VALUES ($1, 'facturar', 'quote', $2, 'Cotización marcada como facturada')
    `, [userId, quoteId]);

    // Enviar notificaciones
    await notificationSystem.notifyQuoteInvoiced(quoteId, userId);

    res.json({
      success: true,
      message: 'Cotización marcada como facturada exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error marking quote as invoiced:', error);
    res.status(500).json({ error: 'Error marcando cotización como facturada: ' + error.message });
  }
};

// Obtener cotizaciones del vendedor (con filtros por estado)
exports.getMyQuotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;
    
    let whereClause = 'WHERE q.created_by = $1';
    let params = [userId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      whereClause += ` AND q.status = $${paramCount}`;
      params.push(status);
    }

    const offset = (page - 1) * limit;
    paramCount++;
    const limitParam = `$${paramCount}`;
    paramCount++;
    const offsetParam = `$${paramCount}`;
    params.push(limit, offset);

    const query = `
      SELECT 
        q.*,
        p.name as project_name,
        c.name as company_name,
        c.ruc as company_ruc,
        u.name as created_by_name,
        u.role as created_by_role
      FROM quotes q
      LEFT JOIN projects p ON q.project_id = p.id
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN users u ON q.created_by = u.id
      ${whereClause}
      ORDER BY q.created_at DESC
      LIMIT ${limitParam} OFFSET ${offsetParam}
    `;

    const result = await pool.query(query, params);
    
    // Contar total para paginación
    const countQuery = `
      SELECT COUNT(*) as total
      FROM quotes q
      LEFT JOIN projects p ON q.project_id = p.id
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN users u ON q.created_by = u.id
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, params.slice(0, -2));
    
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting my quotes:', error);
    res.status(500).json({ error: 'Error obteniendo mis cotizaciones: ' + error.message });
  }
};
