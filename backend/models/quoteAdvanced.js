const pool = require('../config/db');

const QuoteAdvanced = {
  // Crear borrador con versionado
  async createDraft(userId, data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Crear cotización en estado borrador
      const quoteResult = await client.query(`
        INSERT INTO quotes (
          quote_number, project_id, subtotal, igv, total, 
          status, created_by, reference, payment_terms, 
          acceptance, variant_id, meta
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `, [
        data.quote_number || `BORRADOR_${Date.now()}`,
        data.project_id,
        data.subtotal || 0,
        data.igv || 0,
        data.total || 0,
        'draft',
        userId,
        data.reference || '',
        data.payment_terms || '',
        data.acceptance || false,
        data.variant_id,
        JSON.stringify(data.meta || {})
      ]);
      
      const quote = quoteResult.rows[0];
      
      // Crear versión del borrador
      await client.query(`
        INSERT INTO quote_versions (
          quote_id, version_number, data_snapshot, created_by, created_at
        ) VALUES ($1, $2, $3, $4, NOW())
      `, [
        quote.id,
        1,
        JSON.stringify({
          quote: quote,
          items: data.items || [],
          metadata: data.metadata || {}
        }),
        userId
      ]);
      
      await client.query('COMMIT');
      return quote;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Guardar versión del borrador
  async saveDraftVersion(quoteId, userId, data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Obtener siguiente número de versión
      const versionResult = await client.query(`
        SELECT COALESCE(MAX(version_number), 0) + 1 as next_version
        FROM quote_versions 
        WHERE quote_id = $1
      `, [quoteId]);
      
      const nextVersion = versionResult.rows[0].next_version;
      
      // Actualizar cotización
      await client.query(`
        UPDATE quotes 
        SET 
          subtotal = $1, igv = $2, total = $3,
          reference = $4, payment_terms = $5, acceptance = $6,
          meta = $7, updated_at = NOW()
        WHERE id = $8
      `, [
        data.subtotal, data.igv, data.total,
        data.reference, data.payment_terms, data.acceptance,
        JSON.stringify(data.meta || {}), quoteId
      ]);
      
      // Crear nueva versión
      await client.query(`
        INSERT INTO quote_versions (
          quote_id, version_number, data_snapshot, created_by, created_at
        ) VALUES ($1, $2, $3, $4, NOW())
      `, [
        quoteId,
        nextVersion,
        JSON.stringify({
          quote: data,
          items: data.items || [],
          metadata: data.metadata || {}
        }),
        userId
      ]);
      
      await client.query('COMMIT');
      return { version: nextVersion };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Clonar cotización con modificaciones
  async cloneQuote(originalQuoteId, userId, modifications = {}) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Obtener cotización original
      const originalQuote = await client.query(`
        SELECT * FROM quotes WHERE id = $1
      `, [originalQuoteId]);
      
      if (originalQuote.rows.length === 0) {
        throw new Error('Cotización original no encontrada');
      }
      
      const original = originalQuote.rows[0];
      
      // Crear nueva cotización clonada
      const newQuoteResult = await client.query(`
        INSERT INTO quotes (
          quote_number, project_id, subtotal, igv, total,
          status, created_by, reference, payment_terms,
          acceptance, variant_id, meta, cloned_from
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `, [
        modifications.quote_number || `CLON_${original.quote_number}_${Date.now()}`,
        modifications.project_id || original.project_id,
        modifications.subtotal || original.subtotal,
        modifications.igv || original.igv,
        modifications.total || original.total,
        'draft', // Siempre inicia como borrador
        userId,
        modifications.reference || original.reference,
        modifications.payment_terms || original.payment_terms,
        modifications.acceptance || original.acceptance,
        modifications.variant_id || original.variant_id,
        JSON.stringify({ ...JSON.parse(original.meta || '{}'), ...modifications.meta }),
        originalQuoteId
      ]);
      
      const newQuote = newQuoteResult.rows[0];
      
      // Clonar items de la cotización original
      const originalItems = await client.query(`
        SELECT * FROM quote_items WHERE quote_id = $1
      `, [originalQuoteId]);
      
      for (const item of originalItems.rows) {
        await client.query(`
          INSERT INTO quote_items (
            quote_id, subservice_id, description, norm, 
            unit_price, quantity, total_price
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          newQuote.id,
          item.subservice_id,
          modifications.items?.[item.id]?.description || item.description,
          modifications.items?.[item.id]?.norm || item.norm,
          modifications.items?.[item.id]?.unit_price || item.unit_price,
          modifications.items?.[item.id]?.quantity || item.quantity,
          modifications.items?.[item.id]?.total_price || item.total_price
        ]);
      }
      
      // Crear versión inicial del clon
      await client.query(`
        INSERT INTO quote_versions (
          quote_id, version_number, data_snapshot, created_by, created_at
        ) VALUES ($1, $2, $3, $4, NOW())
      `, [
        newQuote.id,
        1,
        JSON.stringify({
          quote: newQuote,
          items: originalItems.rows,
          metadata: { cloned_from: originalQuoteId, clone_modifications: modifications }
        }),
        userId
      ]);
      
      await client.query('COMMIT');
      return newQuote;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Obtener historial de versiones
  async getVersionHistory(quoteId) {
    const result = await pool.query(`
      SELECT 
        qv.*,
        u.name as created_by_name,
        u.role as created_by_role
      FROM quote_versions qv
      LEFT JOIN users u ON qv.created_by = u.id
      WHERE qv.quote_id = $1
      ORDER BY qv.version_number DESC
    `, [quoteId]);
    
    return result.rows;
  },

  // Restaurar a una versión específica
  async restoreToVersion(quoteId, versionNumber, userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Obtener datos de la versión
      const versionResult = await client.query(`
        SELECT data_snapshot FROM quote_versions 
        WHERE quote_id = $1 AND version_number = $2
      `, [quoteId, versionNumber]);
      
      if (versionResult.rows.length === 0) {
        throw new Error('Versión no encontrada');
      }
      
      const snapshot = JSON.parse(versionResult.rows[0].data_snapshot);
      
      // Actualizar cotización con datos de la versión
      await client.query(`
        UPDATE quotes 
        SET 
          subtotal = $1, igv = $2, total = $3,
          reference = $4, payment_terms = $5, acceptance = $6,
          meta = $7, updated_at = NOW()
        WHERE id = $8
      `, [
        snapshot.quote.subtotal,
        snapshot.quote.igv,
        snapshot.quote.total,
        snapshot.quote.reference,
        snapshot.quote.payment_terms,
        snapshot.quote.acceptance,
        JSON.stringify(snapshot.quote.meta),
        quoteId
      ]);
      
      // Eliminar items actuales
      await client.query(`
        DELETE FROM quote_items WHERE quote_id = $1
      `, [quoteId]);
      
      // Restaurar items de la versión
      for (const item of snapshot.items) {
        await client.query(`
          INSERT INTO quote_items (
            quote_id, subservice_id, description, norm,
            unit_price, quantity, total_price
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          quoteId,
          item.subservice_id,
          item.description,
          item.norm,
          item.unit_price,
          item.quantity,
          item.total_price
        ]);
      }
      
      // Crear nueva versión de restauración
      await client.query(`
        INSERT INTO quote_versions (
          quote_id, version_number, data_snapshot, created_by, created_at,
          is_restoration
        ) VALUES ($1, $2, $3, $4, NOW(), true)
      `, [
        quoteId,
        (await client.query(`
          SELECT COALESCE(MAX(version_number), 0) + 1 as next_version
          FROM quote_versions WHERE quote_id = $1
        `, [quoteId])).rows[0].next_version,
        JSON.stringify({
          restored_from: versionNumber,
          restored_at: new Date().toISOString(),
          restored_by: userId
        }),
        userId
      ]);
      
      await client.query('COMMIT');
      return { restored: true, version: versionNumber };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Obtener cotizaciones con filtros avanzados
  async getAdvancedQuotes(filters = {}, userRole) {
    let whereClause = 'WHERE 1=1';
    let params = [];
    let paramCount = 0;
    
    // Filtros básicos
    if (filters.status) {
      paramCount++;
      whereClause += ` AND q.status = $${paramCount}`;
      params.push(filters.status);
    }
    
    if (filters.project_id) {
      paramCount++;
      whereClause += ` AND q.project_id = $${paramCount}`;
      params.push(filters.project_id);
    }
    
    if (filters.company_id) {
      paramCount++;
      whereClause += ` AND p.company_id = $${paramCount}`;
      params.push(filters.company_id);
    }
    
    // Filtros de fecha
    if (filters.date_from) {
      paramCount++;
      whereClause += ` AND q.created_at >= $${paramCount}`;
      params.push(filters.date_from);
    }
    
    if (filters.date_to) {
      paramCount++;
      whereClause += ` AND q.created_at <= $${paramCount}`;
      params.push(filters.date_to);
    }
    
    // Filtros de monto
    if (filters.min_amount) {
      paramCount++;
      whereClause += ` AND q.total >= $${paramCount}`;
      params.push(filters.min_amount);
    }
    
    if (filters.max_amount) {
      paramCount++;
      whereClause += ` AND q.total <= $${paramCount}`;
      params.push(filters.max_amount);
    }
    
    // Filtros por rol
    if (userRole === 'jefe_comercial') {
      whereClause += ` AND q.status = 'approved'`;
    } else if (userRole === 'facturacion') {
      whereClause += ` AND q.status IN ('in_review', 'approved', 'rejected')`;
    }
    
    const result = await pool.query(`
      SELECT 
        q.*,
        p.name as project_name,
        p.location as project_location,
        c.name as company_name,
        c.ruc as company_ruc,
        u.name as created_by_name,
        u.role as created_by_role,
        qa.status as approval_status,
        qa.approved_at,
        approver.name as approved_by_name
      FROM quotes q
      LEFT JOIN projects p ON q.project_id = p.id
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN users u ON q.created_by = u.id
      LEFT JOIN quote_approvals qa ON q.id = qa.quote_id
      LEFT JOIN users approver ON qa.approved_by = approver.id
      ${whereClause}
      ORDER BY q.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `, [...params, filters.limit || 20, filters.offset || 0]);
    
    return result.rows;
  },

  // Obtener estadísticas de cotizaciones
  async getQuoteStatistics(filters = {}, userRole) {
    let whereClause = 'WHERE 1=1';
    let params = [];
    let paramCount = 0;
    
    // Filtros de fecha
    if (filters.date_from) {
      paramCount++;
      whereClause += ` AND q.created_at >= $${paramCount}`;
      params.push(filters.date_from);
    }
    
    if (filters.date_to) {
      paramCount++;
      whereClause += ` AND q.created_at <= $${paramCount}`;
      params.push(filters.date_to);
    }
    
    // Filtros por rol
    if (userRole === 'jefe_comercial') {
      whereClause += ` AND q.status = 'approved'`;
    }
    
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_quotes,
        COUNT(CASE WHEN q.status = 'draft' THEN 1 END) as draft_count,
        COUNT(CASE WHEN q.status = 'sent' THEN 1 END) as sent_count,
        COUNT(CASE WHEN q.status = 'in_review' THEN 1 END) as in_review_count,
        COUNT(CASE WHEN q.status = 'approved' THEN 1 END) as approved_count,
        COUNT(CASE WHEN q.status = 'rejected' THEN 1 END) as rejected_count,
        SUM(CASE WHEN q.status = 'approved' THEN q.total ELSE 0 END) as approved_revenue,
        AVG(CASE WHEN q.status = 'approved' THEN q.total ELSE NULL END) as avg_approved_value,
        COUNT(DISTINCT p.company_id) as unique_companies
      FROM quotes q
      LEFT JOIN projects p ON q.project_id = p.id
      ${whereClause}
    `, params);
    
    return result.rows[0];
  }
};

module.exports = QuoteAdvanced;
