const pool = require('../config/db');

const ProjectHistory = {
  async getByProject(project_id, user, { page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const data = await pool.query('SELECT * FROM project_history WHERE project_id = $1 ORDER BY id DESC LIMIT $2 OFFSET $3', [project_id, limit, offset]);
    const total = await pool.query('SELECT COUNT(*) FROM project_history WHERE project_id = $1', [project_id]);
    return { rows: data.rows, total: parseInt(total.rows[0].count) };
  },
  async add({ project_id, action, performed_by, notes }) {
    const res = await pool.query(
      'INSERT INTO project_history (project_id, action, performed_by, notes) VALUES ($1, $2, $3, $4) RETURNING *',
      [project_id, action, performed_by, notes]
    );
    return res.rows[0];
  }
};

module.exports = ProjectHistory;
