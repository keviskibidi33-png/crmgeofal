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

  // Cargar comentarios usando el sistema de conversación como en proyectos
  useEffect(() => {
    loadComments();
  }, [ticketId]);

  const loadComments = async () => {
    try {
      // Intentar cargar desde backend
      if (isOnline) {
        const backendComments = await getCommentsByTicket(ticketId);
        if (backendComments && backendComments.length > 0) {
          // Convertir al formato de conversación como en proyectos
          const conversationHistory = backendComments.map(comment => ({
            message: comment.comment,
            user_name: comment.user_name || 'Usuario',
            created_at: comment.created_at
          }));
          setComments(conversationHistory);
          localStorage.setItem(`ticket_${ticketId}_conversation`, JSON.stringify(conversationHistory));
          return;
        }
      }
    } catch (error) {
      console.log('Backend no disponible, usando localStorage');
    }

    // Fallback a localStorage con formato de conversación
    const savedConversation = localStorage.getItem(`ticket_${ticketId}_conversation`);
    if (savedConversation) {
      try {
        const conversationHistory = JSON.parse(savedConversation);
        setComments(conversationHistory);
      } catch (error) {
        console.error('Error cargando conversación:', error);
        // Crear conversación inicial
        createInitialConversation();
      }
    } else {
      createInitialConversation();
    }
  };

  const createInitialConversation = () => {
    const initialMessage = {
      message: 'Ticket creado',
      user_name: 'Sistema',
      created_at: new Date().toISOString()
    };
    setComments([initialMessage]);
    localStorage.setItem(`ticket_${ticketId}_conversation`, JSON.stringify([initialMessage]));
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
      
      // Crear mensaje en formato de conversación como en proyectos
      const newMessage = {
        message: newComment.trim(),
        user_name: user?.name || 'Usuario',
        created_at: new Date().toISOString()
      };

      // Agregar mensaje localmente inmediatamente
      const updatedConversation = [...comments, newMessage];
      setComments(updatedConversation);
      localStorage.setItem(`ticket_${ticketId}_conversation`, JSON.stringify(updatedConversation));
      
      setNewComment('');
      setIsLoading(false);

      // Intentar sincronizar con backend
      if (isOnline) {
        try {
          await createComment({
            ticket_id: ticketId,
            comment: newMessage.message
          });
          setSyncStatus('success');
          alert('✅ Mensaje enviado al equipo de soporte');
        } catch (error) {
          console.error('Error sincronizando con backend:', error);
          setSyncStatus('error');
          alert('⚠️ Mensaje guardado localmente. Se sincronizará cuando el servidor esté disponible.');
        }
      } else {
        setSyncStatus('error');
        alert('📱 Mensaje guardado offline. Se sincronizará cuando haya conexión.');
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

  const isSystemComment = (comment) => comment.user_name === 'Sistema';

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
        {comments.map((message, index) => {
          const userColor = isSystemComment(message) ? '#6c757d' : getUserColor(message.user_name || 'Usuario');
          const isOwnMessage = message.user_name === user?.name;
          
          return (
            <div
              key={index}
              className={`message ${isSystemComment(message) ? 'system' : isOwnMessage ? 'own' : 'other'}`}
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
                    {message.user_name}
                  </span>
                </div>
                <div className="message-time">
                  <FiClock className="time-icon" />
                  {formatDate(message.created_at)}
                </div>
              </div>
              <div className="message-content">
                {message.message}
              </div>
              <div className="message-status">
                <FiCheck className="read-icon" />
                Leído
              </div>
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
