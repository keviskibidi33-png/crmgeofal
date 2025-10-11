const db = require('../config/db');

class QuoteEvidence {
  /**
   * Crear una nueva evidencia
   */
  static async create(data) {
    const {
      quote_id,
      evidence_type,
      file_name,
      file_path,
      file_type,
      file_size,
      uploaded_by,
      notes
    } = data;

    const query = `
      INSERT INTO quote_evidences 
        (quote_id, evidence_type, file_name, file_path, file_type, file_size, uploaded_by, notes)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      quote_id,
      evidence_type,
      file_name,
      file_path,
      file_type,
      file_size || null,
      uploaded_by || null,
      notes || null
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Obtener todas las evidencias de una cotización
   */
  static async findByQuoteId(quoteId) {
    const query = `
      SELECT 
        e.*,
        u.name as uploaded_by_name,
        u.email as uploaded_by_email
      FROM quote_evidences e
      LEFT JOIN users u ON e.uploaded_by = u.id
      WHERE e.quote_id = $1
      ORDER BY e.evidence_type, e.uploaded_at DESC
    `;

    const result = await db.query(query, [quoteId]);
    return result.rows;
  }

  /**
   * Obtener evidencias por tipo
   */
  static async findByQuoteAndType(quoteId, evidenceType) {
    const query = `
      SELECT 
        e.*,
        u.name as uploaded_by_name,
        u.email as uploaded_by_email
      FROM quote_evidences e
      LEFT JOIN users u ON e.uploaded_by = u.id
      WHERE e.quote_id = $1 AND e.evidence_type = $2
      ORDER BY e.uploaded_at DESC
    `;

    const result = await db.query(query, [quoteId, evidenceType]);
    return result.rows;
  }

  /**
   * Obtener una evidencia por ID
   */
  static async findById(id) {
    const query = `
      SELECT 
        e.*,
        u.name as uploaded_by_name,
        u.email as uploaded_by_email
      FROM quote_evidences e
      LEFT JOIN users u ON e.uploaded_by = u.id
      WHERE e.id = $1
    `;

    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Eliminar una evidencia
   */
  static async delete(id) {
    const query = 'DELETE FROM quote_evidences WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Actualizar notas de una evidencia
   */
  static async updateNotes(id, notes) {
    const query = `
      UPDATE quote_evidences 
      SET notes = $1 
      WHERE id = $2 
      RETURNING *
    `;

    const result = await db.query(query, [notes, id]);
    return result.rows[0];
  }

  /**
   * Contar evidencias por cotización
   */
  static async countByQuote(quoteId) {
    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN evidence_type = 'primer_contacto' THEN 1 ELSE 0 END) as primer_contacto,
        SUM(CASE WHEN evidence_type = 'aceptacion' THEN 1 ELSE 0 END) as aceptacion,
        SUM(CASE WHEN evidence_type = 'finalizacion' THEN 1 ELSE 0 END) as finalizacion
      FROM quote_evidences
      WHERE quote_id = $1
    `;

    const result = await db.query(query, [quoteId]);
    return result.rows[0];
  }
}

module.exports = QuoteEvidence;

