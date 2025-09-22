const pool = require('../config/db');

const ProjectAttachment = {
  async getAll({ page = 1, limit = 20, q = '' }) {
    const offset = (page - 1) * limit;
    const params = [];
    let where = 'WHERE 1=1';
    if (q) {
        params.push(`%${q.toLowerCase()}%`);
        // Search in description, file_url, or project name
        where += ` AND (LOWER(pa.description) LIKE $${params.length} OR LOWER(pa.file_url) LIKE $${params.length} OR LOWER(p.name) LIKE $${params.length})`;
    }
    
    const dataQuery = `
        SELECT pa.*, p.name as project_name, u.name as uploaded_by_name
        FROM project_attachments pa
        LEFT JOIN projects p ON p.id = pa.project_id
        LEFT JOIN users u ON u.id = pa.uploaded_by
        ${where}
        ORDER BY pa.id DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    const data = await pool.query(dataQuery, [...params, limit, offset]);

    const totalQuery = `
        SELECT COUNT(*)
        FROM project_attachments pa
        LEFT JOIN projects p ON p.id = pa.project_id
        ${where}
    `;
    const total = await pool.query(totalQuery, params);

    return { rows: data.rows, total: parseInt(total.rows[0].count) };
  },

  async getAllByProject(project_id) {
    const res = await pool.query('SELECT * FROM project_attachments WHERE project_id = $1 ORDER BY created_at DESC', [project_id]);
    return res.rows;
  },
  async create({ project_id, uploaded_by, file_url, file_type, description }) {
    const res = await pool.query(
      `INSERT INTO project_attachments (project_id, uploaded_by, file_url, file_type, description)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [project_id, uploaded_by, file_url, file_type, description]
    );
    return res.rows[0];
  },
  async delete(id, user) {
    // Admin can delete any attachment. Otherwise, only the uploader can.
    if (user.role === 'admin') {
      const res = await pool.query('DELETE FROM project_attachments WHERE id = $1 RETURNING *', [id]);
      return res.rows[0];
    }
    const res = await pool.query('DELETE FROM project_attachments WHERE id = $1 AND uploaded_by = $2 RETURNING *', [id, user.id]);
    return res.rows[0];
  }
};

module.exports = ProjectAttachment;