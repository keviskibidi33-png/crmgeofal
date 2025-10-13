import React, { useState, useEffect, useRef } from 'react';
import { FiMessageSquare, FiSend, FiUser, FiClock, FiCheck } from 'react-icons/fi';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import clientCommentsService from '../services/clientComments';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import './ClientChat.css';

const ClientChat = ({ companyId }) => {
  const [newComment, setNewComment] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const socket = useSocket();

  // Obtener comentarios del cliente
  const { data: commentsData, isLoading, error } = useQuery(
    ['client-comments', companyId],
    () => clientCommentsService.getCommentsByCompany(companyId),
    {
      refetchInterval: false, // Deshabilitar refetch automático
      refetchOnWindowFocus: false, // No refetch al cambiar de ventana
      enabled: !!companyId, // Solo ejecutar si companyId existe
      retry: 1, // Solo reintentar una vez en caso de error
      staleTime: 5 * 60 * 1000, // Cache por 5 minutos
      onError: (error) => {
        console.error('Error cargando comentarios:', error);
      }
    }
  );

  const comments = commentsData?.comments || [];

  // Efecto para marcar comentarios como leídos (solo una vez)
  useEffect(() => {
    if (commentsData && commentsData.comments && commentsData.comments.length > 0 && companyId) {
      clientCommentsService.markCommentsAsRead(companyId).catch(console.error);
    }
  }, [commentsData, companyId]);

  // Mutación para crear comentario
  const createCommentMutation = useMutation(
    ({ companyId, comment }) => clientCommentsService.createComment(companyId, comment),
    {
      onSuccess: () => {
        setNewComment('');
        queryClient.invalidateQueries(['client-comments', companyId]);
        // Comentario enviado silenciosamente
      },
      onError: (error) => {
        console.error('Error creando comentario:', error);
        // Error manejado silenciosamente, solo en consola
      }
    }
  );

  // Scroll automático al final
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  // WebSocket para comentarios en tiempo real
  useEffect(() => {
    if (socket && socket.on) {
      const handleNewComment = (data) => {
        if (data.company_id === companyId) {
          queryClient.invalidateQueries(['client-comments', companyId]);
        }
      };

      socket.on('new_client_comment', handleNewComment);

      return () => {
        socket.off('new_client_comment', handleNewComment);
      };
    }
  }, [socket, companyId, queryClient]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim() && !createCommentMutation.isLoading) {
      createCommentMutation.mutate({ companyId, comment: newComment.trim() });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${Math.floor(diffInHours)} horas`;
    } else if (diffInHours < 48) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getInitials = (name, apellido) => {
    const firstInitial = name ? name.charAt(0).toUpperCase() : 'U';
    const lastInitial = apellido ? apellido.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return '#dc3545';
      case 'comercial':
        return '#28a745';
      case 'vendedor':
        return '#007bff';
      case 'soporte':
        return '#ffc107';
      default:
        return '#6c757d';
    }
  };

  if (isLoading) {
    return (
      <div className="client-chat-container">
        <div className="chat-header">
          <FiMessageSquare className="chat-icon" />
          <h3>Comentarios del Cliente</h3>
        </div>
        <div className="chat-loading">
          <div className="spinner"></div>
          <p>Cargando comentarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="client-chat-container">
        <div className="chat-header">
          <FiMessageSquare className="chat-icon" />
          <h3>Comentarios del Cliente</h3>
        </div>
        <div className="chat-error">
          <p>❌ Error al cargar comentarios</p>
          <small>Por favor, intenta nuevamente</small>
        </div>
      </div>
    );
  }

  return (
    <div className="client-chat-container">
      <div className="chat-header">
        <FiMessageSquare className="chat-icon" />
        <h3>Comentarios del Cliente</h3>
        <span className="comment-count">{comments.length} comentarios</span>
      </div>

      <div className="chat-messages">
        {comments.length === 0 ? (
          <div className="no-comments">
            <FiMessageSquare className="no-comments-icon" />
            <p>No hay comentarios aún</p>
            <small>Sé el primero en comentar sobre este cliente</small>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`message ${comment.user_id === user.id ? 'own-message' : 'other-message'}`}
            >
              <div className="message-avatar">
                {comment.user_name ? (
                  <div
                    className="avatar-circle"
                    style={{ backgroundColor: getRoleColor(comment.user_role) }}
                  >
                    {getInitials(comment.user_name, comment.user_apellido)}
                  </div>
                ) : (
                  <FiUser className="avatar-icon" />
                )}
              </div>
              
              <div className="message-content">
                <div className="message-header">
                  <span className="user-name">
                    {comment.user_name && comment.user_apellido
                      ? `${comment.user_name} ${comment.user_apellido}`
                      : comment.user_name || 'Usuario'}
                  </span>
                  <span className="user-role" style={{ color: getRoleColor(comment.user_role) }}>
                    {comment.user_role}
                  </span>
                  <span className="message-time">
                    <FiClock className="time-icon" />
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                
                <div className="message-text">
                  {comment.comment}
                </div>
                
                {comment.is_system && (
                  <div className="system-message-badge">
                    <FiCheck className="system-icon" />
                    Mensaje del sistema
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe un comentario sobre este cliente..."
            className="comment-input"
            rows="2"
            disabled={createCommentMutation.isLoading}
          />
          <button
            type="submit"
            className="send-button"
            disabled={!newComment.trim() || createCommentMutation.isLoading}
          >
            <FiSend className="send-icon" />
          </button>
        </div>
        {createCommentMutation.isLoading && (
          <div className="sending-indicator">
            <div className="spinner small"></div>
            <span>Enviando...</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default ClientChat;
