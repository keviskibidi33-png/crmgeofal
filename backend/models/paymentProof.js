const pool = require('../config/db');

const PaymentProof = {
  // Estados del comprobante de pago
  STATUS: {
    PENDING: 'pending',           // Pendiente de revisión
    APPROVED: 'approved',         // Aprobado por facturación
    REJECTED: 'rejected',         // Rechazado por facturación
    VERIFIED: 'verified'          // Verificado y procesado
  },

  // Crear comprobante de pago
  async createPaymentProof(quoteId, userId, proofData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const result = await client.query(`
        INSERT INTO payment_proofs (
          quote_id, 
          uploaded_by, 
          file_path, 
          file_name, 
          file_type, 
          file_size,
          description,
          amount_paid,
          payment_date,
          payment_method,
          quote_file_path,
          quote_file_name,
          status,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
        RETURNING *
      `, [
        quoteId,
        userId,
        proofData.file_path,
        proofData.file_name,
        proofData.file_type,
        proofData.file_size,
        proofData.description,
        proofData.amount_paid,
        proofData.payment_date,
        proofData.payment_method,
        proofData.quote_file_path || null,
        proofData.quote_file_name || null,
        this.STATUS.PENDING
      ]);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Aprobar comprobante de pago
  async approvePaymentProof(proofId, approvedBy, approvalData = {}) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Actualizar comprobante
      const proofResult = await client.query(`
        UPDATE payment_proofs 
        SET 
          status = $1,
          approved_by = $2,
          approved_at = NOW(),
          approval_notes = $3,
          updated_at = NOW()
        WHERE id = $4
        RETURNING *
      `, [this.STATUS.APPROVED, approvedBy, approvalData.notes, proofId]);

      // Obtener quote_id para actualizar la cotización
      const quoteResult = await client.query(`
        SELECT quote_id FROM payment_proofs WHERE id = $1
      `, [proofId]);

      if (quoteResult.rows.length > 0) {
        // Actualizar estado de la cotización a "Pagada"
        await client.query(`
          UPDATE quotes 
          SET status = 'Pagada', updated_at = NOW()
          WHERE id = $1
        `, [quoteResult.rows[0].quote_id]);
      }

      await client.query('COMMIT');
      return proofResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Rechazar comprobante de pago
  async rejectPaymentProof(proofId, rejectedBy, rejectionReason) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const result = await client.query(`
        UPDATE payment_proofs 
        SET 
          status = $1,
          approved_by = $2,
          approved_at = NOW(),
          rejection_reason = $3,
          updated_at = NOW()
        WHERE id = $4
        RETURNING *
      `, [this.STATUS.REJECTED, rejectedBy, rejectionReason, proofId]);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Obtener comprobantes pendientes (para facturación)
  async getPendingProofs(userRole) {
    if (userRole !== 'facturacion' && userRole !== 'admin') {
      throw new Error('Acceso denegado: Solo facturación y administradores pueden ver comprobantes pendientes');
    }
    
    const result = await pool.query(`
      SELECT 
        pp.*,
        q.quote_number,
        q.total_amount,
        q.project_id,
        p.name as project_name,
        c.name as company_name,
        c.ruc as company_ruc,
        u.name as uploaded_by_name,
        u.email as uploaded_by_email
      FROM payment_proofs pp
      JOIN quotes q ON pp.quote_id = q.id
      LEFT JOIN projects p ON q.project_id = p.id
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN users u ON pp.uploaded_by = u.id
      WHERE pp.status = $1
      ORDER BY pp.created_at DESC
    `, [this.STATUS.PENDING]);
    
    return result.rows;
  },

  // Obtener comprobantes aprobados (para métricas)
  async getApprovedProofs(userRole, filters = {}) {
    if (userRole !== 'jefa_comercial' && userRole !== 'admin') {
      throw new Error('Acceso denegado: Solo Jefe Comercial y administradores pueden ver métricas de pagos');
    }
    
    let whereClause = 'WHERE pp.status = $1 AND (pp.archived IS NULL OR pp.archived = FALSE)';
    let params = [this.STATUS.APPROVED];
    let paramCount = 1;
    
    // Filtros de fecha
    if (filters.date_from) {
      paramCount++;
      whereClause += ` AND pp.approved_at >= $${paramCount}`;
      params.push(filters.date_from);
    }
    
    if (filters.date_to) {
      paramCount++;
      whereClause += ` AND pp.approved_at <= $${paramCount}`;
      params.push(filters.date_to);
    }
    
    const result = await pool.query(`
      SELECT 
        pp.*,
        q.quote_number,
        q.total_amount,
        q.project_id,
        p.name as project_name,
        c.name as company_name,
        c.ruc as company_ruc,
        u.name as uploaded_by_name,
        approver.name as approved_by_name,
        pp.approved_at
      FROM payment_proofs pp
      JOIN quotes q ON pp.quote_id = q.id
      LEFT JOIN projects p ON q.project_id = p.id
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN users u ON pp.uploaded_by = u.id
      LEFT JOIN users approver ON pp.approved_by = approver.id
      ${whereClause}
      ORDER BY pp.approved_at DESC
    `, params);
    
    return result.rows;
  },

  // Obtener estadísticas de pagos
  async getPaymentStats(userRole, filters = {}) {
    let whereClause = '';
    let params = [];
    let paramCount = 0;
    
    // Filtros de fecha
    if (filters.date_from) {
      paramCount++;
      whereClause += ` AND pp.created_at >= $${paramCount}`;
      params.push(filters.date_from);
    }
    
    if (filters.date_to) {
      paramCount++;
      whereClause += ` AND pp.created_at <= $${paramCount}`;
      params.push(filters.date_to);
    }
    
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_proofs,
        COUNT(CASE WHEN pp.status = $1 THEN 1 END) as pending,
        COUNT(CASE WHEN pp.status = $2 THEN 1 END) as approved,
        COUNT(CASE WHEN pp.status = $3 THEN 1 END) as rejected,
        SUM(CASE WHEN pp.status = $2 THEN pp.amount_paid ELSE 0 END) as total_amount_approved,
        ROUND(
          COUNT(CASE WHEN pp.status = $2 THEN 1 END) * 100.0 / 
          NULLIF(COUNT(CASE WHEN pp.status IN ($2, $3) THEN 1 END), 0), 2
        ) as approval_rate
      FROM payment_proofs pp
      WHERE 1=1 ${whereClause}
    `, [this.STATUS.PENDING, this.STATUS.APPROVED, this.STATUS.REJECTED, ...params]);
    
    return result.rows[0];
  },

  // Obtener comprobantes por cotización
  async getProofsByQuote(quoteId) {
    const result = await pool.query(`
      SELECT 
        pp.*,
        u.name as uploaded_by_name,
        approver.name as approved_by_name
      FROM payment_proofs pp
      LEFT JOIN users u ON pp.uploaded_by = u.id
      LEFT JOIN users approver ON pp.approved_by = approver.id
      WHERE pp.quote_id = $1
      ORDER BY pp.created_at DESC
    `, [quoteId]);
    
    return result.rows;
  },

  // Archivar comprobante
  async archivePaymentProof(proofId, archivedBy) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const result = await client.query(`
        UPDATE payment_proofs 
        SET 
          archived = TRUE,
          archived_at = NOW(),
          archived_by = $1,
          updated_at = NOW()
        WHERE id = $2 AND status = $3 AND (archived IS NULL OR archived = FALSE)
        RETURNING *
      `, [archivedBy, proofId, this.STATUS.APPROVED]);
      
      if (result.rows.length === 0) {
        throw new Error('Comprobante no encontrado, no está aprobado o ya está archivado');
      }
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Desarchivar comprobante
  async unarchivePaymentProof(proofId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const result = await client.query(`
        UPDATE payment_proofs 
        SET 
          archived = FALSE,
          archived_at = NULL,
          archived_by = NULL,
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `, [proofId]);
      
      if (result.rows.length === 0) {
        throw new Error('Comprobante no encontrado');
      }
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Obtener comprobantes archivados
  async getArchivedProofs(filters = {}) {
    let whereClause = 'WHERE pp.archived = TRUE';
    let params = [];
    let paramCount = 0;
    
    // Filtros de fecha
    if (filters.date_from) {
      paramCount++;
      whereClause += ` AND pp.archived_at >= $${paramCount}`;
      params.push(filters.date_from);
    }
    
    if (filters.date_to) {
      paramCount++;
      whereClause += ` AND pp.archived_at <= $${paramCount}`;
      params.push(filters.date_to);
    }
    
    // Filtro por usuario que archivó
    if (filters.archived_by) {
      paramCount++;
      whereClause += ` AND pp.archived_by = $${paramCount}`;
      params.push(filters.archived_by);
    }
    
    const result = await pool.query(`
      SELECT 
        pp.*,
        q.quote_number,
        q.total_amount,
        q.project_id,
        p.name as project_name,
        c.name as company_name,
        c.ruc as company_ruc,
        u.name as uploaded_by_name,
        u.email as uploaded_by_email,
        archiver.name as archived_by_name
      FROM payment_proofs pp
      JOIN quotes q ON pp.quote_id = q.id
      LEFT JOIN projects p ON q.project_id = p.id
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN users u ON pp.uploaded_by = u.id
      LEFT JOIN users archiver ON pp.archived_by = archiver.id
      ${whereClause}
      ORDER BY pp.archived_at DESC
    `, params);
    
    return result.rows;
  }
};

module.exports = PaymentProof;
