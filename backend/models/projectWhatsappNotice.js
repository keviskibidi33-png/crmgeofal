const pool = require('../config/db');

const ProjectWhatsappNotice = {
  async getAllByProject(project_id) {
    const res = await pool.query('SELECT * FROM project_whatsapp_notices WHERE project_id = $1 ORDER BY sent_at DESC', [project_id]);
    return res.rows;
  },
  async create({ project_id, sent_by, sent_to, message }) {
    const res = await pool.query(
      `INSERT INTO project_whatsapp_notices (project_id, sent_by, sent_to, message)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [project_id, sent_by, sent_to, message]
    );
    return res.rows[0];
  }
};

module.exports = ProjectWhatsappNotice;
