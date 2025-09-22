const pool = require('../config/db');

const Activity = {
  // Crear una nueva actividad
  async create({ userId, type, title, description, entityType, entityId, metadata = null }) {
    const query = `
      INSERT INTO activities (user_id, type, title, description, entity_type, entity_id, metadata, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `;
    const values = [userId, type, title, description, entityType, entityId, JSON.stringify(metadata)];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Obtener actividades recientes
  async getRecent({ limit = 10, offset = 0, userId = null, entityType = null, allowedTypes = null } = {}) {
    let query = `
      SELECT a.*, u.name as user_name, u.email as user_email
      FROM activities a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (userId) {
      query += ` AND a.user_id = $${paramIndex}`;
      values.push(userId);
      paramIndex++;
    }

    if (entityType) {
      query += ` AND a.entity_type = $${paramIndex}`;
      values.push(entityType);
      paramIndex++;
    }

    if (allowedTypes && allowedTypes.length > 0) {
      const placeholders = allowedTypes.map((_, index) => `$${paramIndex + index}`).join(',');
      query += ` AND a.type IN (${placeholders})`;
      values.push(...allowedTypes);
      paramIndex += allowedTypes.length;
    }

    query += ` ORDER BY a.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
  },

  // Obtener actividades por tipo
  async getByType(type, { limit = 10, offset = 0 } = {}) {
    const query = `
      SELECT a.*, u.name as user_name, u.email as user_email
      FROM activities a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.type = $1
      ORDER BY a.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [type, limit, offset]);
    return result.rows;
  },

  // Obtener actividades por entidad (proyecto, cotización, etc.)
  async getByEntity(entityType, entityId, { limit = 10, offset = 0 } = {}) {
    const query = `
      SELECT a.*, u.name as user_name, u.email as user_email
      FROM activities a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.entity_type = $1 AND a.entity_id = $2
      ORDER BY a.created_at DESC
      LIMIT $3 OFFSET $4
    `;
    const result = await pool.query(query, [entityType, entityId, limit, offset]);
    return result.rows;
  },

  // Obtener estadísticas de actividades
  async getStats({ userId = null, days = 7 } = {}) {
    let query = `
      SELECT 
        COUNT(*) as total_activities,
        COUNT(DISTINCT user_id) as active_users,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 day' THEN 1 END) as today_activities,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as week_activities
      FROM activities
      WHERE created_at > NOW() - INTERVAL '${days} days'
    `;
    const values = [];

    if (userId) {
      query += ` AND user_id = $1`;
      values.push(userId);
    }

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Obtener actividades por usuario
  async getByUser(userId, { limit = 10, offset = 0 } = {}) {
    const query = `
      SELECT a.*, u.name as user_name, u.email as user_email
      FROM activities a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.user_id = $1
      ORDER BY a.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  },

  // Eliminar actividades antiguas (más de 90 días)
  async cleanupOld() {
    const query = `
      DELETE FROM activities
      WHERE created_at < NOW() - INTERVAL '90 days'
      RETURNING COUNT(*) as count
    `;
    const result = await pool.query(query);
    return result.rows[0];
  }
};

module.exports = Activity;
