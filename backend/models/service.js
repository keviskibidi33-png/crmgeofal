const pool = require('../config/db');

const Service = {
  async getAll({ area, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    let where = area ? 'WHERE area = $1' : '';
    let params = area ? [area, limit, offset] : [limit, offset];
    const data = await pool.query(`SELECT * FROM services ${where} ORDER BY id DESC LIMIT $${where ? 2 : 1} OFFSET $${where ? 3 : 2}`, params);
    const total = await pool.query(`SELECT COUNT(*) FROM services ${where}`, area ? [area] : []);
    return { rows: data.rows, total: parseInt(total.rows[0].count) };
  },
  async create({ name, area }) {
    const res = await pool.query('INSERT INTO services (name, area) VALUES ($1, $2) RETURNING *', [name, area]);
    return res.rows[0];
  }
};

module.exports = Service;
