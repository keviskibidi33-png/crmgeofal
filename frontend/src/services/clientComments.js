import apiFetch from './api';

const clientCommentsService = {
  /**
   * Crear un nuevo comentario
   */
  async createComment(companyId, comment) {
    try {
      console.log('💬 Creando comentario para cliente:', companyId);
      const response = await apiFetch('/api/client-comments', {
        method: 'POST',
        body: JSON.stringify({
          company_id: companyId,
          comment: comment
        })
      });
      console.log('✅ Comentario creado:', response);
      return response;
    } catch (error) {
      console.error('❌ Error creando comentario:', error);
      throw error;
    }
  },

  /**
   * Obtener comentarios de un cliente
   */
  async getCommentsByCompany(companyId) {
    try {
      const response = await apiFetch(`/api/client-comments/company/${companyId}`, {
        method: 'GET'
      });
      return response;
    } catch (error) {
      console.error('Error obteniendo comentarios:', error);
      throw error;
    }
  },

  /**
   * Actualizar un comentario
   */
  async updateComment(commentId, comment) {
    try {
      console.log('💬 Actualizando comentario:', commentId);
      const response = await apiFetch(`/api/client-comments/${commentId}`, {
        method: 'PUT',
        body: JSON.stringify({
          comment: comment
        })
      });
      console.log('✅ Comentario actualizado:', response);
      return response;
    } catch (error) {
      console.error('❌ Error actualizando comentario:', error);
      throw error;
    }
  },

  /**
   * Eliminar un comentario
   */
  async deleteComment(commentId) {
    try {
      console.log('💬 Eliminando comentario:', commentId);
      const response = await apiFetch(`/api/client-comments/${commentId}`, {
        method: 'DELETE'
      });
      console.log('✅ Comentario eliminado:', response);
      return response;
    } catch (error) {
      console.error('❌ Error eliminando comentario:', error);
      throw error;
    }
  },

  /**
   * Marcar comentarios como leídos
   */
  async markCommentsAsRead(companyId) {
    try {
      console.log('💬 Marcando comentarios como leídos para cliente:', companyId);
      const response = await apiFetch(`/api/client-comments/company/${companyId}/mark-read`, {
        method: 'POST'
      });
      console.log('✅ Comentarios marcados como leídos:', response);
      return response;
    } catch (error) {
      console.error('❌ Error marcando comentarios como leídos:', error);
      throw error;
    }
  },

  /**
   * Obtener comentarios no leídos
   */
  async getUnreadComments() {
    try {
      console.log('💬 Obteniendo comentarios no leídos');
      const response = await apiFetch('/api/client-comments/unread', {
        method: 'GET'
      });
      console.log('✅ Comentarios no leídos obtenidos:', response);
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo comentarios no leídos:', error);
      throw error;
    }
  },

  /**
   * Obtener comentarios recientes
   */
  async getRecentComments(limit = 10) {
    try {
      console.log('💬 Obteniendo comentarios recientes');
      const response = await apiFetch(`/api/client-comments/recent?limit=${limit}`, {
        method: 'GET'
      });
      console.log('✅ Comentarios recientes obtenidos:', response);
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo comentarios recientes:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de comentarios
   */
  async getCommentsStats() {
    try {
      console.log('💬 Obteniendo estadísticas de comentarios');
      const response = await apiFetch('/api/client-comments/stats', {
        method: 'GET'
      });
      console.log('✅ Estadísticas obtenidas:', response);
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      throw error;
    }
  }
};

export default clientCommentsService;
