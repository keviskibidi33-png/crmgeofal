// models/user.js
const pool = require('../config/db');
const bcrypt = require('bcryptjs');


const User = {
  async getAll({ page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const data = await pool.query('SELECT id, name, email, role, notification_enabled FROM users ORDER BY id DESC LIMIT $1 OFFSET $2', [limit, offset]);
    const total = await pool.query('SELECT COUNT(*) FROM users');
    return { rows: data.rows, total: parseInt(total.rows[0].count) };
  },
  async create({ name, email, password, role, notification_enabled = true }) {
    const password_hash = await bcrypt.hash(password, 10);
    const res = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, notification_enabled) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, notification_enabled',
      [name, email, password_hash, role, notification_enabled]
    );
    return res.rows[0];
  },
  async setNotificationEnabled(userId, enabled) {
    const res = await pool.query(
      'UPDATE users SET notification_enabled = $1 WHERE id = $2 RETURNING id, name, email, role, notification_enabled',
      [enabled, userId]
    );
    return res.rows[0];
  },
  async getById(id) {
    const res = await pool.query('SELECT id, name, email, role, notification_enabled FROM users WHERE id = $1', [id]);
    return res.rows[0];
  },
};

module.exports = User;
