import React, { useState, useEffect, useRef } from 'react';
import { FiMessageSquare, FiSend, FiUser, FiClock, FiCheck, FiWifi, FiWifiOff } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { createComment, getCommentsByTicket } from '../services/ticketComments';
import './TicketChatVendedor.css';

const TicketChatVendedor = ({ ticketId }) => {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  // Detectar estado de conexión
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/health', { 
          method: 'HEAD',
          timeout: 3000 
        });
        setIsOnline(response.ok);
      } catch (error) {
        setIsOnline(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 10000); // Verificar cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  // Cargar comentarios (backend + localStorage)
  useEffect(() => {
    loadComments();
  }, [ticketId]);

  const loadComments = async () => {
    try {
      // Intentar cargar desde backend
      if (isOnline) {
        const backendComments = await getCommentsByTicket(ticketId);
        if (backendComments && backendComments.length > 0) {
          setComments(backendComments);
          // Sincronizar con localStorage
          localStorage.setItem(`ticket_${ticketId}_comments`, JSON.stringify(backendComments));
          return;
        }
      }
    } catch (error) {
      console.log('Backend no disponible, usando localStorage');
    }

    // Fallback a localStorage
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
        comment: 'Ticket creado por vendedor',
        is_system: true,
        is_read: true,
        created_at: new Date().toISOString()
      };
      setComments([initialComment]);
      localStorage.setItem(`ticket_${ticketId}_comments`, JSON.stringify([initialComment]));
    }
  };

  // Scroll automático al final
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newComment.trim() && !isLoading) {
      setIsLoading(true);
      setSyncStatus('syncing');
      
      const newCommentObj = {
        id: Date.now(),
        ticket_id: ticketId,
        user_id: user?.id || 'unknown',
        user_name: user?.name || 'Vendedor',
        user_apellido: user?.apellido || '',
        user_role: user?.role || 'vendedor',
        comment: newComment.trim(),
        is_system: false,
        is_read: true,
        created_at: new Date().toISOString()
      };

      // Agregar comentario localmente inmediatamente
      const updatedComments = [...comments, newCommentObj];
      setComments(updatedComments);
      localStorage.setItem(`ticket_${ticketId}_comments`, JSON.stringify(updatedComments));
      
      setNewComment('');
      setIsLoading(false);

      // Intentar sincronizar con backend
      if (isOnline) {
        try {
          await createComment({
            ticket_id: ticketId,
            comment: newCommentObj.comment
          });
          setSyncStatus('success');
          alert('✅ Comentario enviado al equipo de soporte');
        } catch (error) {
          console.error('Error sincronizando con backend:', error);
          setSyncStatus('error');
          alert('⚠️ Comentario guardado localmente. Se sincronizará cuando el servidor esté disponible.');
        }
      } else {
        setSyncStatus('error');
        alert('📱 Comentario guardado offline. Se sincronizará cuando haya conexión.');
      }

      // Resetear estado después de 3 segundos
      setTimeout(() => setSyncStatus('idle'), 3000);
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

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing': return <div className="spinner-small"></div>;
      case 'success': return <FiCheck className="text-success" />;
      case 'error': return <FiWifiOff className="text-warning" />;
      default: return isOnline ? <FiWifi className="text-success" /> : <FiWifiOff className="text-danger" />;
    }
  };

  return (
    <div className="ticket-chat-vendedor">
      <div className="ticket-chat-header">
        <FiMessageSquare className="chat-icon" />
        <h4>Conversación con Soporte</h4>
        <div className="header-info">
          <span className="comment-count">{comments.length} mensajes</span>
          <div className="connection-status">
            {getSyncStatusIcon()}
            <span className="status-text">
              {isOnline ? 'Conectado' : 'Offline'}
            </span>
          </div>
        </div>
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
            placeholder={isOnline ? "Escribe tu mensaje al equipo de soporte..." : "Escribe tu mensaje (se guardará offline)..."}
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
        <div className="sync-status">
          {syncStatus === 'syncing' && <span>Sincronizando...</span>}
          {syncStatus === 'success' && <span className="text-success">✅ Enviado a soporte</span>}
          {syncStatus === 'error' && <span className="text-warning">⚠️ Guardado offline</span>}
        </div>
      </form>
    </div>
  );
};

export default TicketChatVendedor;
