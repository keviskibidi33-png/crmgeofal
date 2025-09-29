const pool = require('../config/db');

const QuoteApproval = {
  // Estados del sistema de aprobaciones
  STATUS: {
    DRAFT: 'draft',           // Borrador
    SENT: 'sent',            // Enviada
    IN_REVIEW: 'in_review',   // En revisión
    APPROVED: 'approved',     // Aprobada
    REJECTED: 'rejected',     // Rechazada
    CANCELLED: 'cancelled'    // Cancelada
  },

  // Crear solicitud de aprobación
  async createApprovalRequest(quoteId, userId, data = {}) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Crear solicitud de aprobación
      const approvalResult = await client.query(`
        INSERT INTO quote_approvals (
          quote_id, 
          requested_by, 
          status, 
          request_data,
          created_at
        ) VALUES ($1, $2, $3, $4, NOW())
        RETURNING *
      `, [quoteId, userId, this.STATUS.SENT, JSON.stringify(data)]);
      
      // Actualizar estado de la cotización
      await client.query(`
        UPDATE quotes 
        SET status = $1, updated_at = NOW()
        WHERE id = $2
      `, [this.STATUS.IN_REVIEW, quoteId]);
      
      await client.query('COMMIT');
      return approvalResult.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Aprobar cotización (solo facturación)
  async approveQuote(approvalId, approvedBy, approvalData = {}) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Actualizar solicitud de aprobación
      const approvalResult = await client.query(`
        UPDATE quote_approvals 
        SET 
          status = $1,
          approved_by = $2,
          approved_at = NOW(),
          approval_data = $3,
          updated_at = NOW()
        WHERE id = $4
        RETURNING *
      `, [this.STATUS.APPROVED, approvedBy, JSON.stringify(approvalData), approvalId]);
      
      // Obtener quote_id para actualizar la cotización
      const quoteResult = await client.query(`
        SELECT quote_id FROM quote_approvals WHERE id = $1
      `, [approvalId]);
      
      if (quoteResult.rows.length > 0) {
        // Actualizar estado de la cotización
        await client.query(`
          UPDATE quotes 
          SET status = $1, updated_at = NOW()
          WHERE id = $2
        `, [this.STATUS.APPROVED, quoteResult.rows[0].quote_id]);
      }
      
      await client.query('COMMIT');
      return approvalResult.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Rechazar cotización (solo facturación)
  async rejectQuote(approvalId, rejectedBy, rejectionReason) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Actualizar solicitud de aprobación
      const approvalResult = await client.query(`
        UPDATE quote_approvals 
        SET 
          status = $1,
          approved_by = $2,
          approved_at = NOW(),
          rejection_reason = $3,
          updated_at = NOW()
        WHERE id = $4
        RETURNING *
      `, [this.STATUS.REJECTED, rejectedBy, rejectionReason, approvalId]);
      
      // Obtener quote_id para actualizar la cotización
      const quoteResult = await client.query(`
        SELECT quote_id FROM quote_approvals WHERE id = $1
        `, [approvalId]);
      
      if (quoteResult.rows.length > 0) {
        // Actualizar estado de la cotización
        await client.query(`
          UPDATE quotes 
          SET status = $1, updated_at = NOW()
          WHERE id = $2
        `, [this.STATUS.REJECTED, quoteResult.rows[0].quote_id]);
      }
      
      await client.query('COMMIT');
      return approvalResult.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Obtener solicitudes pendientes (facturación y admin)
  async getPendingApprovals(userRole) {
    if (userRole !== 'facturacion' && userRole !== 'admin') {
      throw new Error('Acceso denegado: Solo facturación y administradores pueden ver solicitudes pendientes');
    }
    
    const result = await pool.query(`
      SELECT 
        qa.*,
        q.quote_number,
        q.total_amount,
        q.project_id,
        p.name as project_name,
        c.name as company_name,
        u.name as requested_by_name,
        u.role as requested_by_role
      FROM quote_approvals qa
      JOIN quotes q ON qa.quote_id = q.id
      LEFT JOIN projects p ON q.project_id = p.id
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN users u ON qa.requested_by = u.id
      WHERE qa.status = $1
      ORDER BY qa.created_at DESC
    `, [this.STATUS.IN_REVIEW]);
    
    return result.rows;
  },

  // Obtener cotizaciones aprobadas (para Jefe Comercial y admin)
  async getApprovedQuotes(userRole, filters = {}) {
    if (userRole !== 'jefe_comercial' && userRole !== 'admin') {
      throw new Error('Acceso denegado: Solo Jefe Comercial y administradores pueden ver métricas de aprobadas');
    }
    
    let whereClause = 'WHERE qa.status = $1';
    let params = [this.STATUS.APPROVED];
    let paramCount = 1;
    
    // Filtros de fecha
    if (filters.date_from) {
      paramCount++;
      whereClause += ` AND qa.approved_at >= $${paramCount}`;
      params.push(filters.date_from);
    }
    
    if (filters.date_to) {
      paramCount++;
      whereClause += ` AND qa.approved_at <= $${paramCount}`;
      params.push(filters.date_to);
    }
    
    const result = await pool.query(`
      SELECT 
        qa.*,
        q.quote_number,
        q.total_amount,
        q.subtotal,
        q.igv,
        q.project_id,
        p.name as project_name,
        c.name as company_name,
        c.ruc as company_ruc,
        u.name as requested_by_name,
        approver.name as approved_by_name,
        qa.approved_at
      FROM quote_approvals qa
      JOIN quotes q ON qa.quote_id = q.id
      LEFT JOIN projects p ON q.project_id = p.id
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN users u ON qa.requested_by = u.id
      LEFT JOIN users approver ON qa.approved_by = approver.id
      ${whereClause}
      ORDER BY qa.approved_at DESC
    `, params);
    
    return result.rows;
  },

  // Obtener historial de aprobaciones
  async getApprovalHistory(quoteId) {
    const result = await pool.query(`
      SELECT 
        qa.*,
        u.name as requested_by_name,
        approver.name as approved_by_name,
        q.quote_number
      FROM quote_approvals qa
      LEFT JOIN users u ON qa.requested_by = u.id
      LEFT JOIN users approver ON qa.approved_by = approver.id
      LEFT JOIN quotes q ON qa.quote_id = q.id
      WHERE qa.quote_id = $1
      ORDER BY qa.created_at DESC
    `, [quoteId]);
    
    return result.rows;
  },

  // Obtener cotizaciones aprobadas para Jefe Comercial (método específico)
  async getApprovedQuotesForJefeComercial() {
    const result = await pool.query(`
      SELECT 
        qa.*,
        q.quote_number,
        q.total_amount,
        q.subtotal as subtotal_amount,
        q.igv as igv_amount,
        q.project_id,
        p.name as project_name,
        c.name as company_name,
        c.ruc as company_ruc,
        u.name as requested_by_name,
        approver.name as approved_by_name,
        qa.approved_at
      FROM quote_approvals qa
      JOIN quotes q ON qa.quote_id = q.id
      LEFT JOIN projects p ON q.project_id = p.id
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN users u ON qa.requested_by = u.id
      LEFT JOIN users approver ON qa.approved_by = approver.id
      WHERE qa.status = $1
      ORDER BY qa.approved_at DESC
    `, [this.STATUS.APPROVED]);
    
    return result.rows;
  },

  // Obtener estadísticas de aprobaciones
  async getApprovalStats(userRole, filters = {}) {
    let whereClause = '';
    let params = [];
    let paramCount = 0;
    
    // Filtros de fecha
    if (filters.date_from) {
      paramCount++;
      whereClause += ` AND qa.created_at >= $${paramCount}`;
      params.push(filters.date_from);
    }
    
    if (filters.date_to) {
      paramCount++;
      whereClause += ` AND qa.created_at <= $${paramCount}`;
      params.push(filters.date_to);
    }
    
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_requests,
        COUNT(CASE WHEN qa.status = $1 THEN 1 END) as pending,
        COUNT(CASE WHEN qa.status = $2 THEN 1 END) as approved,
        COUNT(CASE WHEN qa.status = $3 THEN 1 END) as rejected,
        ROUND(
          COUNT(CASE WHEN qa.status = $2 THEN 1 END) * 100.0 / 
          NULLIF(COUNT(CASE WHEN qa.status IN ($2, $3) THEN 1 END), 0), 2
        ) as approval_rate
      FROM quote_approvals qa
      WHERE 1=1 ${whereClause}
    `, [this.STATUS.IN_REVIEW, this.STATUS.APPROVED, this.STATUS.REJECTED, ...params]);
    
    return result.rows[0];
  }
};

module.exports = QuoteApproval;
