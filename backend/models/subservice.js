const pool = require('../config/db');

const Subservice = {
  async getAllByService(service_id, { page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const data = await pool.query('SELECT * FROM subservices WHERE service_id = $1 ORDER BY id DESC LIMIT $2 OFFSET $3', [service_id, limit, offset]);
    const total = await pool.query('SELECT COUNT(*) FROM subservices WHERE service_id = $1', [service_id]);
    return { rows: data.rows, total: parseInt(total.rows[0].count) };
  },
  async create({ service_id, name }) {
    const res = await pool.query('INSERT INTO subservices (service_id, name) VALUES ($1, $2) RETURNING *', [service_id, name]);
    return res.rows[0];
  }
};

module.exports = Subservice;
