const pool = require('../config/db');

const Draft = {
  async create({ company_id, user_id, content, title, type = 'cotizacion' }) {
    const result = await pool.query(`
      INSERT INTO drafts (company_id, user_id, content, title, type, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [company_id, user_id, JSON.stringify(content), title, type]);
    
    return result.rows[0];
  },

  async getAll({ user_id, type, page = 1, limit = 20, search }) {
    const offset = (page - 1) * limit;
    let whereConditions = ['user_id = $1'];
    let queryParams = [user_id];
    let paramIndex = 2;

    if (type) {
      whereConditions.push(`type = $${paramIndex}`);
      queryParams.push(type);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(title ILIKE $${paramIndex} OR content::text ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Query principal
    const dataQuery = `
      SELECT d.*, c.name as company_name, c.ruc, c.dni
      FROM drafts d
      LEFT JOIN companies c ON d.company_id = c.id
      ${whereClause}
      ORDER BY d.updated_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    queryParams.push(limit, offset);

    // Query de conteo
    const countQuery = `
      SELECT COUNT(*) FROM drafts d
      LEFT JOIN companies c ON d.company_id = c.id
      ${whereClause}
    `;

    const data = await pool.query(dataQuery, queryParams);
    const total = await pool.query(countQuery, queryParams.slice(0, -2));

    return {
      rows: data.rows,
      total: parseInt(total.rows[0].count)
    };
  },

  async getById(id, user_id) {
    const result = await pool.query(`
      SELECT d.*, c.name as company_name, c.ruc, c.dni
      FROM drafts d
      LEFT JOIN companies c ON d.company_id = c.id
      WHERE d.id = $1 AND d.user_id = $2
    `, [id, user_id]);
    
    return result.rows[0];
  },

  async update(id, user_id, { content, title, company_id }) {
    const result = await pool.query(`
      UPDATE drafts 
      SET content = $1, title = $2, company_id = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND user_id = $5
      RETURNING *
    `, [JSON.stringify(content), title, company_id, id, user_id]);
    
    return result.rows[0];
  },

  async delete(id, user_id) {
    const result = await pool.query(`
      DELETE FROM drafts 
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `, [id, user_id]);
    
    return result.rows[0];
  },

  async getStats(user_id) {
    const totalResult = await pool.query(`
      SELECT COUNT(*) as total FROM drafts WHERE user_id = $1
    `, [user_id]);
    
    const byTypeResult = await pool.query(`
      SELECT type, COUNT(*) as count 
      FROM drafts 
      WHERE user_id = $1 
      GROUP BY type
    `, [user_id]);
    
    const recentResult = await pool.query(`
      SELECT COUNT(*) as recent 
      FROM drafts 
      WHERE user_id = $1 AND updated_at >= CURRENT_DATE - INTERVAL '7 days'
    `, [user_id]);

    return {
      total: parseInt(totalResult.rows[0].total),
      byType: byTypeResult.rows,
      recent: parseInt(recentResult.rows[0].recent)
    };
  }
};

module.exports = Draft;
