const pool = require('../config/db');

const Notification = {
  // Crear una nueva notificación
  async create({ userId, type, title, message, data = null, priority = 'normal' }) {
    const query = `
      INSERT INTO notifications (user_id, type, title, message, data, priority, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;
    const values = [userId, type, title, message, JSON.stringify(data), priority];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Obtener notificaciones de un usuario
  async getByUserId(userId, { limit = 10, offset = 0, unreadOnly = false } = {}) {
    let query = `
      SELECT n.*, u.name as user_name, u.email as user_email
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
      WHERE n.user_id = $1
    `;
    const values = [userId];
    let paramIndex = 2;

    if (unreadOnly) {
      query += ` AND n.read_at IS NULL`;
    }

    query += ` ORDER BY n.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
  },

  // Contar notificaciones no leídas
  async countUnread(userId) {
    const query = `
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = $1 AND read_at IS NULL
    `;
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  },

  // Marcar notificación como leída
  async markAsRead(notificationId, userId) {
    const query = `
      UPDATE notifications
      SET read_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [notificationId, userId]);
    return result.rows[0];
  },

  // Marcar todas las notificaciones como leídas
  async markAllAsRead(userId) {
    const query = `
      UPDATE notifications
      SET read_at = NOW()
      WHERE user_id = $1 AND read_at IS NULL
      RETURNING COUNT(*) as count
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  },

  // Obtener notificaciones por tipo y rol
  async getByTypeAndRole(type, role, { limit = 10, offset = 0 } = {}) {
    const query = `
      SELECT n.*, u.name as user_name, u.email as user_email
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
      WHERE n.type = $1 AND u.role = $2
      ORDER BY n.created_at DESC
      LIMIT $3 OFFSET $4
    `;
    const result = await pool.query(query, [type, role, limit, offset]);
    return result.rows;
  },

  // Crear notificaciones masivas por rol
  async createForRole(role, { type, title, message, data = null, priority = 'normal' }) {
    const query = `
      INSERT INTO notifications (user_id, type, title, message, data, priority, created_at)
      SELECT id, $1, $2, $3, $4, $5, NOW()
      FROM users
      WHERE role = $6
      RETURNING *
    `;
    const values = [type, title, message, JSON.stringify(data), priority, role];
    const result = await pool.query(query, values);
    return result.rows;
  },

  // Eliminar notificaciones antiguas (más de 30 días)
  async cleanupOld() {
    const query = `
      DELETE FROM notifications
      WHERE created_at < NOW() - INTERVAL '30 days'
      RETURNING COUNT(*) as count
    `;
    const result = await pool.query(query);
    return result.rows[0];
  }
};

module.exports = Notification;
