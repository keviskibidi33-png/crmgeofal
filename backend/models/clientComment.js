const pool = require('../config/db');

const ClientComment = {
  /**
   * Crear un nuevo comentario
   */
  async create({ company_id, user_id, comment, is_system = false }) {
    try {
      console.log('💬 ClientComment.create - Creando comentario...');
      
      const result = await pool.query(
        `INSERT INTO client_comments (company_id, user_id, comment, is_system, created_at) 
         VALUES ($1, $2, $3, $4, NOW()) 
         RETURNING *`,
        [company_id, user_id, comment, is_system]
      );
      
      console.log('✅ ClientComment.create - Comentario creado:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ ClientComment.create - Error:', error);
      throw error;
    }
  },

  /**
   * Obtener todos los comentarios de un cliente
   */
  async getByCompanyId(company_id) {
    try {
      const result = await pool.query(`
        SELECT 
          cc.*,
          u.name as user_name,
          u.apellido as user_apellido,
          u.email as user_email,
          u.role as user_role
        FROM client_comments cc
        LEFT JOIN users u ON cc.user_id = u.id
        WHERE cc.company_id = $1
        ORDER BY cc.created_at ASC
      `, [company_id]);
      
      return result.rows;
    } catch (error) {
      console.error('Error obteniendo comentarios del cliente:', error);
      throw error;
    }
  },

  /**
   * Actualizar un comentario
   */
  async update(commentId, userId, comment) {
    try {
      console.log('💬 ClientComment.update - Actualizando comentario:', commentId);
      
      const result = await pool.query(
        `UPDATE client_comments 
         SET comment = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND user_id = $3
         RETURNING *`,
        [comment, commentId, userId]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Comentario no encontrado o no tienes permisos para editarlo');
      }
      
      console.log('✅ ClientComment.update - Comentario actualizado:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ ClientComment.update - Error:', error);
      throw error;
    }
  },

  /**
   * Eliminar un comentario
   */
  async delete(commentId, userId) {
    try {
      console.log('💬 ClientComment.delete - Eliminando comentario:', commentId);
      
      const result = await pool.query(
        `DELETE FROM client_comments 
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [commentId, userId]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Comentario no encontrado o no tienes permisos para eliminarlo');
      }
      
      console.log('✅ ClientComment.delete - Comentario eliminado');
      return result.rows[0];
    } catch (error) {
      console.error('❌ ClientComment.delete - Error:', error);
      throw error;
    }
  },

  /**
   * Obtener comentarios recientes (últimos 10)
   */
  async getRecent(limit = 10) {
    try {
      console.log('💬 ClientComment.getRecent - Obteniendo comentarios recientes...');
      
      const result = await pool.query(`
        SELECT 
          cc.*,
          u.name as user_name,
          u.apellido as user_apellido,
          u.email as user_email,
          u.role as user_role,
          c.name as company_name
        FROM client_comments cc
        LEFT JOIN users u ON cc.user_id = u.id
        LEFT JOIN companies c ON cc.company_id = c.id
        ORDER BY cc.created_at DESC
        LIMIT $1
      `, [limit]);
      
      console.log('✅ ClientComment.getRecent - Comentarios recientes obtenidos:', result.rows.length);
      return result.rows;
    } catch (error) {
      console.error('❌ ClientComment.getRecent - Error:', error);
      throw error;
    }
  },

  /**
   * Marcar comentarios como leídos
   */
  async markAsRead(company_id, user_id) {
    try {
      console.log('💬 ClientComment.markAsRead - Marcando comentarios como leídos...');
      
      const result = await pool.query(
        `UPDATE client_comments 
         SET is_read = true 
         WHERE company_id = $1 AND user_id != $2 AND is_read = false
         RETURNING *`,
        [company_id, user_id]
      );
      
      console.log('✅ ClientComment.markAsRead - Comentarios marcados como leídos:', result.rows.length);
      return result.rows;
    } catch (error) {
      console.error('❌ ClientComment.markAsRead - Error:', error);
      throw error;
    }
  },

  /**
   * Obtener comentarios no leídos para un usuario
   */
  async getUnreadByUser(user_id) {
    try {
      console.log('💬 ClientComment.getUnreadByUser - Obteniendo comentarios no leídos...');
      
      const result = await pool.query(`
        SELECT 
          cc.*,
          u.name as user_name,
          u.apellido as user_apellido,
          c.name as company_name
        FROM client_comments cc
        LEFT JOIN users u ON cc.user_id = u.id
        LEFT JOIN companies c ON cc.company_id = c.id
        WHERE cc.user_id != $1 AND cc.is_read = false
        ORDER BY cc.created_at DESC
      `, [user_id]);
      
      console.log('✅ ClientComment.getUnreadByUser - Comentarios no leídos obtenidos:', result.rows.length);
      return result.rows;
    } catch (error) {
      console.error('❌ ClientComment.getUnreadByUser - Error:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de comentarios
   */
  async getStats() {
    try {
      console.log('💬 ClientComment.getStats - Obteniendo estadísticas...');
      
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_comments,
          COUNT(DISTINCT company_id) as clients_with_comments,
          COUNT(DISTINCT user_id) as users_with_comments
        FROM client_comments
      `);
      
      console.log('✅ ClientComment.getStats - Estadísticas obtenidas:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ ClientComment.getStats - Error:', error);
      throw error;
    }
  }
};

module.exports = ClientComment;
