const pool = require('../config/db');

// Devuelve empresas (clientes) que no tienen proyectos en los últimos 3 meses
const Recuperados = {
  async getRecuperados({ months = 3, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    // Empresas que NO tienen proyectos en los últimos X meses
    const data = await pool.query(`
      SELECT c.*
      FROM companies c
      LEFT JOIN projects p ON p.company_id = c.id AND p.created_at > NOW() - INTERVAL '${months} months'
      WHERE p.id IS NULL
      ORDER BY c.id DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    const total = await pool.query(`
      SELECT COUNT(*)
      FROM companies c
      LEFT JOIN projects p ON p.company_id = c.id AND p.created_at > NOW() - INTERVAL '${months} months'
      WHERE p.id IS NULL
    `);
    return { rows: data.rows, total: parseInt(total.rows[0].count) };
  }
};

module.exports = Recuperados;
