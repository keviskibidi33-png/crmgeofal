import React, { useState, useEffect, useRef } from 'react';
import { FiMessageSquare, FiSend, FiUser, FiClock, FiCheck } from 'react-icons/fi';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { createComment, getCommentsByTicket, markCommentsAsRead } from '../services/ticketComments';
import { useAuth } from '../contexts/AuthContext';
import './TicketChat.css';

const TicketChatSimple = ({ ticketId }) => {
  const [newComment, setNewComment] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Obtener comentarios del ticket
  const { data: commentsData, isLoading } = useQuery(
    ['ticket-comments', ticketId],
    () => getCommentsByTicket(ticketId),
    {
      refetchInterval: 10000, // Refrescar cada 10 segundos
      onSuccess: () => {
        // Marcar como leídos cuando se cargan
        markCommentsAsRead(ticketId);
      }
    }
  );

  const comments = commentsData?.comments || [];

  // Mutación para crear comentario
  const createCommentMutation = useMutation(createComment, {
    onSuccess: () => {
      setNewComment('');
      queryClient.invalidateQueries(['ticket-comments', ticketId]);
      alert('✅ Comentario agregado exitosamente');
    },
    onError: (error) => {
      console.error('Error creando comentario:', error);
      alert('❌ Error al enviar comentario');
    }
  });

  // Scroll automático al final
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim() && !createCommentMutation.isLoading) {
      createCommentMutation.mutate({ ticketId, comment: newComment.trim() });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isSystemComment = (comment) => comment.is_system || comment.user_name === 'Sistema';

  if (isLoading) {
    return (
      <div className="ticket-chat-loading">
        <div className="spinner"></div>
        <p>Cargando comentarios...</p>
      </div>
    );
  }

  return (
    <div className="ticket-chat">
      <div className="ticket-chat-header">
        <FiMessageSquare className="chat-icon" />
        <h4>Conversación del Ticket</h4>
        <span className="comment-count">{comments.length} comentarios</span>
      </div>

      <div className="ticket-chat-messages">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className={`message ${isSystemComment(comment) ? 'system' : comment.user_id === user?.id ? 'own' : 'other'}`}
          >
            <div className="message-header">
              <div className="message-user">
                <FiUser className="user-icon" />
                <span className="user-name">
                  {isSystemComment(comment) ? 'Sistema' : `${comment.user_name} ${comment.user_apellido}`}
                </span>
                {comment.user_role && (
                  <span className="user-role">({comment.user_role})</span>
                )}
              </div>
              <div className="message-time">
                <FiClock className="time-icon" />
                {formatDate(comment.created_at)}
              </div>
            </div>
            <div className="message-content">
              {comment.comment}
            </div>
            {comment.is_read && (
              <div className="message-status">
                <FiCheck className="read-icon" />
                Leído
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="ticket-chat-input" onSubmit={handleSubmit}>
        <div className="input-group">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe tu comentario aquí..."
            className="comment-input"
            rows={3}
            disabled={createCommentMutation.isLoading}
          />
          <button
            type="submit"
            className="send-button"
            disabled={!newComment.trim() || createCommentMutation.isLoading}
          >
            {createCommentMutation.isLoading ? (
              <div className="spinner-small"></div>
            ) : (
              <FiSend className="send-icon" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TicketChatSimple;
