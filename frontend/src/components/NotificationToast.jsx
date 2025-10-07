import React, { useState, useEffect } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { FiBell, FiMessageSquare, FiUser, FiAlertCircle } from 'react-icons/fi';
import { useSocket } from '../contexts/SocketContext';
import './NotificationToast.css';

const NotificationToast = () => {
  const [notifications, setNotifications] = useState([]);
  const [show, setShow] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    if (socket && socket.on) {
      const handleNotification = (notification) => {
        console.log('🔔 Notificación recibida:', notification);
        
        const newNotification = {
          id: Date.now(),
          ...notification,
          timestamp: new Date()
        };
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // Máximo 5 notificaciones
        setShow(true);
        
        // Auto-hide después de 5 segundos
        setTimeout(() => {
          setShow(false);
        }, 5000);
      };

      socket.on('new_notification', handleNotification);
      
      return () => {
        if (socket && socket.off) {
          socket.off('new_notification', handleNotification);
        }
      };
    }
  }, [socket]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ticket_comment':
        return <FiMessageSquare className="notification-icon" />;
      case 'ticket_created':
        return <FiAlertCircle className="notification-icon" />;
      default:
        return <FiBell className="notification-icon" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'ticket_comment':
        return 'primary';
      case 'ticket_created':
        return 'success';
      default:
        return 'info';
    }
  };

  return (
    <ToastContainer position="top-end" className="notification-container">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          show={show}
          onClose={() => setShow(false)}
          delay={5000}
          autohide
          className={`notification-toast notification-${getNotificationColor(notification.type)}`}
        >
          <Toast.Header>
            <div className="notification-header">
              {getNotificationIcon(notification.type)}
              <strong className="me-auto">{notification.title}</strong>
              <small className="notification-time">
                {notification.timestamp.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </small>
            </div>
          </Toast.Header>
          <Toast.Body>
            <div className="notification-content">
              <p className="notification-message">{notification.message}</p>
              {notification.data && (
                <div className="notification-data">
                  {notification.data.ticket_title && (
                    <small className="text-muted">
                      Ticket: {notification.data.ticket_title}
                    </small>
                  )}
                  {notification.data.commenter_name && (
                    <small className="text-muted d-block">
                      Por: {notification.data.commenter_name}
                    </small>
                  )}
                </div>
              )}
            </div>
          </Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
};

export default NotificationToast;
