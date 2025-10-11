const pool = require('../config/db');

const TicketComment = {
  // Crear un nuevo comentario
  async create({ ticket_id, user_id, comment, is_system = false }) {
    const query = `
      INSERT INTO ticket_comments (ticket_id, user_id, comment, is_system, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `;
    const result = await pool.query(query, [ticket_id, user_id, comment, is_system]);
    return result.rows[0];
  },

  // Obtener comentarios de un ticket
  async getByTicketId(ticket_id) {
    const query = `
      SELECT 
        tc.*,
        u.name as user_name,
        u.apellido as user_apellido,
        u.email as user_email,
        u.role as user_role
      FROM ticket_comments tc
      LEFT JOIN users u ON tc.user_id = u.id
      WHERE tc.ticket_id = $1
      ORDER BY tc.created_at ASC
    `;
    const result = await pool.query(query, [ticket_id]);
    return result.rows;
  },

  // Obtener comentarios recientes (últimos 10)
  async getRecent(limit = 10) {
    const query = `
      SELECT 
        tc.*,
        u.name as user_name,
        u.apellido as user_apellido,
        u.email as user_email,
        u.role as user_role,
        t.title as ticket_title
      FROM ticket_comments tc
      LEFT JOIN users u ON tc.user_id = u.id
      LEFT JOIN tickets t ON tc.ticket_id = t.id
      ORDER BY tc.created_at DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  },

  // Marcar comentarios como leídos
  async markAsRead(ticket_id, user_id) {
    const query = `
      UPDATE ticket_comments 
      SET is_read = true 
      WHERE ticket_id = $1 AND user_id != $2 AND is_read = false
    `;
    await pool.query(query, [ticket_id, user_id]);
  },

  // Obtener comentarios no leídos para un usuario
  async getUnreadByUser(user_id) {
    const query = `
      SELECT 
        tc.*,
        u.name as user_name,
        u.apellido as user_apellido,
        t.title as ticket_title
      FROM ticket_comments tc
      LEFT JOIN users u ON tc.user_id = u.id
      LEFT JOIN tickets t ON tc.ticket_id = t.id
      WHERE tc.user_id != $1 AND tc.is_read = false
      ORDER BY tc.created_at DESC
    `;
    const result = await pool.query(query, [user_id]);
    return result.rows;
  }
};

module.exports = TicketComment;
