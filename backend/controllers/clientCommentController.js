const ClientComment = require('../models/clientComment');
const socketService = require('../services/socketService');

class ClientCommentController {
  
  /**
   * Crear un nuevo comentario
   */
  async createComment(req, res) {
    try {
      console.log('🔍 Creando comentario de cliente:', req.body);
      console.log('👤 Usuario:', req.user);
      
      const { company_id, comment } = req.body;
      const user_id = req.user.id;
      
      console.log('🔍 Datos extraídos:', { company_id, comment, user_id });

      if (!company_id || !comment) {
        return res.status(400).json({
          success: false,
          message: 'Company ID y comentario son requeridos'
        });
      }

      // Crear el comentario
      const newComment = await ClientComment.create({
        company_id,
        user_id,
        comment,
        is_system: false
      });

      console.log('✅ Comentario creado:', newComment);

      // Enviar notificación en tiempo real
      socketService.sendClientComment(company_id, newComment);
      
      // Enviar notificación a roles comerciales
      socketService.sendClientCommentToRoles(['admin', 'jefa_comercial'], {
        title: `Nuevo comentario en cliente`,
        message: `${req.user.name} comentó: "${comment.substring(0, 50)}${comment.length > 50 ? '...' : ''}"`,
        type: 'client_comment',
        data: {
          company_id: company_id,
          commenter_name: req.user.name,
          commenter_role: req.user.role,
          comment_id: newComment.id
        }
      });

      res.status(201).json({
        success: true,
        message: 'Comentario agregado exitosamente',
        comment: newComment
      });

    } catch (error) {
      console.error('❌ Error creando comentario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener comentarios de un cliente
   */
  async getComments(req, res) {
    try {
      const { companyId } = req.params;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Company ID es requerido'
        });
      }

      const comments = await ClientComment.getByCompanyId(companyId);

      res.json({
        success: true,
        comments: comments
      });

    } catch (error) {
      console.error('Error obteniendo comentarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Actualizar un comentario
   */
  async updateComment(req, res) {
    try {
      const { commentId } = req.params;
      const { comment } = req.body;
      const userId = req.user.id;

      if (!comment) {
        return res.status(400).json({
          success: false,
          message: 'Comentario es requerido'
        });
      }

      const updatedComment = await ClientComment.update(commentId, userId, comment);

      res.json({
        success: true,
        message: 'Comentario actualizado exitosamente',
        data: updatedComment
      });

    } catch (error) {
      console.error('❌ Error actualizando comentario:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Eliminar un comentario
   */
  async deleteComment(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.user.id;

      await ClientComment.delete(commentId, userId);

      res.json({
        success: true,
        message: 'Comentario eliminado exitosamente'
      });

    } catch (error) {
      console.error('❌ Error eliminando comentario:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Marcar comentarios como leídos
   */
  async markAsRead(req, res) {
    try {
      const { companyId } = req.params;
      const userId = req.user.id;

      await ClientComment.markAsRead(companyId, userId);

      res.json({
        success: true,
        message: 'Comentarios marcados como leídos'
      });

    } catch (error) {
      console.error('❌ Error marcando comentarios como leídos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener comentarios no leídos
   */
  async getUnread(req, res) {
    try {
      const userId = req.user.id;
      const unreadComments = await ClientComment.getUnreadByUser(userId);

      res.json({
        success: true,
        comments: unreadComments
      });

    } catch (error) {
      console.error('❌ Error obteniendo comentarios no leídos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener comentarios recientes
   */
  async getRecent(req, res) {
    try {
      const { limit = 10 } = req.query;
      const recentComments = await ClientComment.getRecent(parseInt(limit));

      res.json({
        success: true,
        comments: recentComments
      });

    } catch (error) {
      console.error('❌ Error obteniendo comentarios recientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener estadísticas de comentarios
   */
  async getStats(req, res) {
    try {
      const stats = await ClientComment.getStats();

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = new ClientCommentController();
