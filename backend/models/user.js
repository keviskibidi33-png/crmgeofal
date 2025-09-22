const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  async updateUser(id, { name, apellido, email, role, area, notification_enabled }) {
    // Solo actualiza los campos enviados
    let fields = [];
    let params = [];
  if (name !== undefined) { fields.push('name = $' + (params.length+1)); params.push(name); }
  if (apellido !== undefined) { fields.push('apellido = $' + (params.length+1)); params.push(apellido); }
    if (email !== undefined) { fields.push('email = $' + (params.length+1)); params.push(email); }
    if (role !== undefined) { fields.push('role = $' + (params.length+1)); params.push(role); }
    if (area !== undefined) { fields.push('area = $' + (params.length+1)); params.push(area); }
    if (notification_enabled !== undefined) { fields.push('notification_enabled = $' + (params.length+1)); params.push(notification_enabled); }
    if (!fields.length) return null;
    params.push(id);
    const res = await pool.query(
  `UPDATE users SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING id, name, apellido, email, role, area, notification_enabled`,
      params
    );
    return res.rows[0];
  },
  async deleteUser(id) {
    const res = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    return res.rows[0];
  },
  async resetPassword(id, password) {
    const password_hash = await bcrypt.hash(password, 10);
    const res = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id',
      [password_hash, id]
    );
    return res.rows[0];
  },
  async getAll({ page = 1, limit = 20, search = '', area = '', role = '' }) {
    const offset = (page - 1) * limit;
    let where = [];
    let params = [];
    if (search) {
      params.push(`%${search}%`);
      where.push(`LOWER(name) LIKE LOWER($${params.length})`);
    }
    if (area) {
      params.push(area);
      where.push(`area = $${params.length}`);
    }
    if (role) {
      params.push(role);
      where.push(`role = $${params.length}`);
    }
    let whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    params.push(limit, offset);
    const data = await pool.query(
  `SELECT id, name, apellido, email, role, area, created_at FROM users ${whereClause} ORDER BY id DESC LIMIT $${params.length-1} OFFSET $${params.length}`,
      params
    );
    // Agregar campo activo (true por defecto)
    data.rows.forEach(u => u.active = true);
    // Total
    let totalParams = params.slice(0, params.length-2);
    const total = await pool.query(
      `SELECT COUNT(*) FROM users ${whereClause}`,
      totalParams
    );
    return { rows: data.rows, total: parseInt(total.rows[0].count) };
  },

  async getAreas() {
  const res = await pool.query("SELECT DISTINCT area FROM users WHERE area IS NOT NULL AND area <> ''");
  return res.rows.map(r => r.area);
  },
  async create({ name, apellido, email, password, role, area, notification_enabled = true }) {
    const password_hash = await bcrypt.hash(password, 10);
    const res = await pool.query(
      'INSERT INTO users (name, apellido, email, password_hash, role, area, notification_enabled) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, apellido, email, role, area, notification_enabled',
      [name, apellido, email, password_hash, role, area, notification_enabled]
    );
    return res.rows[0];
  },
  async setNotificationEnabled(userId, enabled) {
    const res = await pool.query(
      'UPDATE users SET notification_enabled = $1 WHERE id = $2 RETURNING id, name, apellido, email, role, notification_enabled',
      [enabled, userId]
    );
    return res.rows[0];
  },
  async getById(id) {
    const res = await pool.query('SELECT id, name, apellido, email, role, notification_enabled FROM users WHERE id = $1', [id]);
    return res.rows[0];
  },
};

module.exports = User;
