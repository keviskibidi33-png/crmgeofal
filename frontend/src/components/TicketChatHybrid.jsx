import React, { useState, useEffect, useRef } from 'react';
import { FiMessageSquare, FiSend, FiUser, FiClock, FiCheck, FiWifi, FiWifiOff } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { createComment, getCommentsByTicket } from '../services/ticketComments';
import './TicketChat.css';

const TicketChatHybrid = ({ ticketId }) => {
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

  // Sistema de conversación con sincronización en tiempo real
  useEffect(() => {
    loadComments();
    
    // Polling para actualizar comentarios cada 5 segundos
    const interval = setInterval(() => {
      if (isOnline) {
        loadComments();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [ticketId, isOnline]);

  const loadComments = async () => {
    try {
      // Cargar desde backend únicamente (como TicketChatVendedor)
      const backendComments = await getCommentsByTicket(ticketId);
      console.log('🔍 [HYBRID] Comentarios del backend:', backendComments);
      
      if (backendComments && backendComments.length > 0) {
        setComments(backendComments);
        console.log('✅ [HYBRID] Comentarios cargados desde backend:', backendComments.length);
      } else {
        // Si no hay comentarios, mostrar array vacío
        setComments([]);
        console.log('📝 [HYBRID] No hay comentarios en el backend');
      }
    } catch (error) {
      console.error('❌ [HYBRID] Error cargando comentarios del backend:', error);
      // En caso de error, mostrar array vacío
      setComments([]);
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
      
      const messageText = newComment.trim();
      setNewComment(''); // Limpiar inmediatamente

      try {
        // Enviar al backend primero
        const response = await createComment({
          ticket_id: ticketId,
          comment: messageText
        });
        
        console.log('✅ [HYBRID] Mensaje enviado al backend:', response);
        
        // Recargar comentarios desde el backend para sincronizar
        await loadComments();
        
        setSyncStatus('success');
        console.log('✅ [HYBRID] Mensaje sincronizado correctamente');
        
      } catch (error) {
        console.error('❌ [HYBRID] Error enviando mensaje al backend:', error);
        setSyncStatus('error');
        // No mostrar modal, solo cambiar el estado visual
      }

      setIsLoading(false);
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

  // Función para obtener color consistente por usuario
  const getUserColor = (userName) => {
    const colors = ['#3b82f6', '#ef4444']; // Azul y Rojo
    const hash = userName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing': return <div className="spinner-small"></div>;
      case 'success': return <FiCheck className="text-success" />;
      case 'error': return <FiWifiOff className="text-warning" />;
      default: return isOnline ? <FiWifi className="text-success" /> : <FiWifiOff className="text-danger" />;
    }
  };

  return (
    <div className="ticket-chat">
      <div className="ticket-chat-header">
        <FiMessageSquare className="chat-icon" />
        <h4>Conversación del Ticket</h4>
        <div className="header-info">
          <span className="comment-count">{comments.length} comentarios</span>
          <div className="connection-status">
            {getSyncStatusIcon()}
            <span className="status-text">
              {isOnline ? 'En línea' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      <div className="ticket-chat-messages">
        {comments.map((comment) => {
          const userColor = isSystemComment(comment) ? '#6c757d' : getUserColor(comment.user_name || 'Usuario');
          const isOwnMessage = comment.user_id === user?.id;
          
          return (
            <div
              key={comment.id}
              className={`message ${isSystemComment(comment) ? 'system' : isOwnMessage ? 'own' : 'other'}`}
            >
              <div className="message-header">
                <div className="message-user">
                  <div 
                    className="user-color-bar"
                    style={{ 
                      width: '4px', 
                      height: '20px', 
                      backgroundColor: userColor,
                      borderRadius: '2px',
                      marginRight: '8px'
                    }}
                  />
                  <FiUser className="user-icon" style={{ color: userColor }} />
                  <span className="user-name" style={{ color: userColor }}>
                    {isSystemComment(comment) ? 'Sistema' : `${comment.user_name} ${comment.user_apellido || ''}`}
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
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form className="ticket-chat-input" onSubmit={handleSubmit}>
        <div className="input-group">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={isOnline ? "Escribe tu comentario aquí..." : "Escribe tu comentario (se guardará offline)..."}
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
          {syncStatus === 'success' && <span className="text-success">✅ Sincronizado</span>}
          {syncStatus === 'error' && <span className="text-warning">⚠️ Guardado offline</span>}
        </div>
      </form>
    </div>
  );
};

export default TicketChatHybrid;
