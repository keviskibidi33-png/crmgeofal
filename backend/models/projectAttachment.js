const pool = require('../config/db');

const ProjectAttachment = {
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
  async delete(id, user_id) {
    // Solo el usuario que subió o ventas puede borrar
    const res = await pool.query('DELETE FROM project_attachments WHERE id = $1 AND uploaded_by = $2 RETURNING *', [id, user_id]);
    return res.rows[0];
  }
};

module.exports = ProjectAttachment;
