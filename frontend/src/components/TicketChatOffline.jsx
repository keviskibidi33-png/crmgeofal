import React, { useState, useEffect, useRef } from 'react';
import { FiMessageSquare, FiSend, FiUser, FiClock, FiCheck } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import './TicketChat.css';

const TicketChatOffline = ({ ticketId }) => {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  // Cargar comentarios desde localStorage
  useEffect(() => {
    const savedComments = localStorage.getItem(`ticket_${ticketId}_comments`);
    if (savedComments) {
      try {
        setComments(JSON.parse(savedComments));
      } catch (error) {
        console.error('Error cargando comentarios:', error);
      }
    } else {
      // Comentario inicial del sistema
      const initialComment = {
        id: Date.now(),
        ticket_id: ticketId,
        user_id: 'system',
        user_name: 'Sistema',
        user_apellido: '',
        user_role: 'system',
        comment: 'Ticket creado',
        is_system: true,
        is_read: true,
        created_at: new Date().toISOString()
      };
      setComments([initialComment]);
      localStorage.setItem(`ticket_${ticketId}_comments`, JSON.stringify([initialComment]));
    }
  }, [ticketId]);

  // Scroll automático al final
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim() && !isLoading) {
      setIsLoading(true);
      
      // Crear nuevo comentario
      const newCommentObj = {
        id: Date.now(),
        ticket_id: ticketId,
        user_id: user?.id || 'unknown',
        user_name: user?.name || 'Usuario',
        user_apellido: user?.apellido || '',
        user_role: user?.role || 'user',
        comment: newComment.trim(),
        is_system: false,
        is_read: true,
        created_at: new Date().toISOString()
      };

      // Agregar comentario
      const updatedComments = [...comments, newCommentObj];
      setComments(updatedComments);
      localStorage.setItem(`ticket_${ticketId}_comments`, JSON.stringify(updatedComments));
      
      setNewComment('');
      setIsLoading(false);
      
      // Mostrar notificación de éxito
      alert('✅ Comentario agregado exitosamente');
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
                {comment.user_role && comment.user_role !== 'system' && (
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
            disabled={isLoading}
          />
          <button
            type="submit"
            className="send-button"
            disabled={!newComment.trim() || isLoading}
          >
            {isLoading ? (
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

export default TicketChatOffline;
