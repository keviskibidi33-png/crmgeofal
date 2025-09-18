const pool = require('../config/db');

const ProjectService = {
  async getAllByProject(project_id, { page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const data = await pool.query('SELECT * FROM project_services WHERE project_id = $1 ORDER BY id DESC LIMIT $2 OFFSET $3', [project_id, limit, offset]);
    const total = await pool.query('SELECT COUNT(*) FROM project_services WHERE project_id = $1', [project_id]);
    return { rows: data.rows, total: parseInt(total.rows[0].count) };
  },
  async create({ project_id, subservice_id, quantity, provided_by }) {
    const res = await pool.query('INSERT INTO project_services (project_id, subservice_id, quantity, provided_by) VALUES ($1, $2, $3, $4) RETURNING *', [project_id, subservice_id, quantity, provided_by]);
    return res.rows[0];
  }
};

module.exports = ProjectService;
