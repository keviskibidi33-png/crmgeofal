
const pool = require('../config/db');

// Estados de cotizaciones actualizados
const QUOTE_STATUS = {
  NUEVO: 'nuevo',
  COTIZACION_ENVIADA: 'cotizacion_enviada', 
  PENDIENTE_COTIZACION: 'pendiente_cotizacion',
  EN_NEGOCIACION: 'en_negociacion',
  SEGUIMIENTO: 'seguimiento',
  GANADO: 'ganado',
  PERDIDO: 'perdido'
};

const Quote = {
  // Exponer los estados para uso en otros módulos
  STATUS: QUOTE_STATUS,
  async getAll({ project_id, company_id, status, page = 1, limit = 20, date_from, date_to }) {
    let where = [];
    let params = [];
    if (project_id) { where.push('q.project_id = $' + (params.length + 1)); params.push(project_id); }
    if (company_id) { where.push('p.company_id = $' + (params.length + 1)); params.push(company_id); }
    if (status) { where.push('q.status = $' + (params.length + 1)); params.push(status); }
    if (date_from) { where.push('q.issue_date >= $' + (params.length + 1)); params.push(date_from); }
    if (date_to) { where.push('q.issue_date <= $' + (params.length + 1)); params.push(date_to); }
    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const offset = (page - 1) * limit;
    
    const select = `
      SELECT 
        q.*,
        q.quote_number,
        p.name as project_name,
        p.location as project_location,
        c.name as company_name,
        c.ruc as company_ruc,
        u.name as created_by_name,
        u.role as created_by_role
      FROM quotes q 
      LEFT JOIN projects p ON p.id = q.project_id 
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN users u ON q.created_by = u.id
      ${whereClause} 
      ORDER BY q.created_at DESC 
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    const count = `SELECT COUNT(*) FROM quotes q LEFT JOIN projects p ON p.id = q.project_id ${whereClause}`;
    const data = await pool.query(select, [...params, limit, offset]);
    const total = await pool.query(count, params);
    return { quotes: data.rows, total: parseInt(total.rows[0].count) };
  },
  async getById(id) {
    const res = await pool.query(`
      SELECT 
        q.*,
        q.quote_number,
        p.name as project_name,
        p.location as project_location,
        c.name as company_name,
        c.ruc as company_ruc,
        u.name as created_by_name,
        u.role as created_by_role
      FROM quotes q 
      LEFT JOIN projects p ON p.id = q.project_id 
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN users u ON q.created_by = u.id
      WHERE q.id = $1
    `, [id]);
    return res.rows[0];
  },
  async create({ 
    project_id, variant_id, created_by, client_contact, client_email, client_phone, 
    client_company, client_ruc, project_name, project_location, request_date,
    issue_date, subtotal = 0, igv = 0, total, status, reference = null, 
    reference_type = null, meta = null, category_main, quote_code 
  }) {
    // Convertir objetos a JSON strings si es necesario
    const metaJson = meta ? (typeof meta === 'string' ? meta : JSON.stringify(meta)) : null;
    const referenceTypeJson = reference_type ? (typeof reference_type === 'string' ? reference_type : JSON.stringify(reference_type)) : null;
    
    const values = [
      project_id, variant_id, created_by, client_contact, client_email, client_phone,
      client_company, client_ruc, project_name, project_location, request_date,
      issue_date, subtotal, igv, total, status, reference, referenceTypeJson, 
      metaJson, category_main, quote_code
    ];
    
    const res = await pool.query(
      `INSERT INTO quotes (
        project_id, variant_id, created_by, client_contact, client_email, client_phone,
        client_company, client_ruc, project_name, project_location, request_date,
        issue_date, subtotal, igv, total, status, reference, reference_type, meta,
        category_main, quote_code
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22) RETURNING *`,
      values
    );
    return res.rows[0];
  },
  async update(id, { 
    client_contact, client_email, client_phone, client_company, client_ruc, 
    project_name, project_location, request_date, issue_date, subtotal = 0, 
    igv = 0, total, status, reference = null, reference_type = null, 
    meta = null, category_main, quote_code 
  }) {
    const res = await pool.query(
      `UPDATE quotes SET 
        client_contact=$1, client_email=$2, client_phone=$3, client_company=$4, 
        client_ruc=$5, project_name=$6, project_location=$7, request_date=$8,
        issue_date=$9, subtotal=$10, igv=$11, total=$12, status=$13, 
        reference=$14, reference_type=$15, meta=$16, category_main=$17, 
        quote_code=$18, updated_at=NOW() 
      WHERE id=$19 RETURNING *`,
      [
        client_contact, client_email, client_phone, client_company, client_ruc,
        project_name, project_location, request_date, issue_date, subtotal, 
        igv, total, status, reference, reference_type, meta, category_main, 
        quote_code, id
      ]
    );
    return res.rows[0];
  },
  async delete(id) {
    await pool.query('DELETE FROM quotes WHERE id = $1', [id]);
    return true;
  },
  
  // Actualizar estado de cotización
  async updateStatus(id, status) {
    // Validar que el estado sea válido
    const validStatuses = Object.values(QUOTE_STATUS);
    if (!validStatuses.includes(status)) {
      throw new Error(`Estado inválido: ${status}. Estados válidos: ${validStatuses.join(', ')}`);
    }
    
    const res = await pool.query(
      'UPDATE quotes SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    return res.rows[0];
  },
  
  // Obtener todos los estados disponibles
  getAvailableStatuses() {
    return Object.values(QUOTE_STATUS);
  }
};

module.exports = Quote;
