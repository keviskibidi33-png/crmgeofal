import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Container, Row, Col, Card, Badge, Button, Alert, Spinner, Modal } from 'react-bootstrap';
import { FiBell, FiCheck, FiX, FiEye, FiTrash2 } from 'react-icons/fi';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '../services/notifications';
import { useAuth } from '../contexts/AuthContext';

const Notificaciones = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Obtener todas las notificaciones
  const { data: notifications, isLoading, error } = useQuery(
    ['notifications-all', user?.id],
    () => getNotifications({ limit: 50, unreadOnly: false }),
    {
      enabled: !!user,
      refetchInterval: 30000, // Refrescar cada 30 segundos
    }
  );

  // Mutación para marcar como leída
  const markAsReadMutation = useMutation(markNotificationAsRead, {
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications-all']);
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['notificationStats']);
    }
  });

  // Mutación para marcar todas como leídas
  const markAllAsReadMutation = useMutation(markAllNotificationsAsRead, {
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications-all']);
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['notificationStats']);
    }
  });

  // Mutación para eliminar notificación
  const deleteMutation = useMutation(deleteNotification, {
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications-all']);
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['notificationStats']);
    }
  });

  const handleMarkAsRead = (notificationId) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDelete = (notificationId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta notificación?')) {
      deleteMutation.mutate(notificationId);
    }
  };

  const handleViewNotification = (notification) => {
    setSelectedNotification(notification);
    setShowModal(true);
    
    // Marcar como leída si no lo está
    if (!notification.read_at) {
      handleMarkAsRead(notification.id);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      payment_proof_uploaded: '💰',
      payment_proof_approved: '✅',
      payment_proof_rejected: '❌',
      quote_created: '📄',
      quote_approved: '✅',
      quote_rejected: '❌',
      project_created: '🏗️',
      project_updated: '🔄',
      ticket_created: '🎫',
      ticket_updated: '🔄',
      system_update: '🆕'
    };
    return icons[type] || '🔔';
  };

  const getNotificationColor = (type) => {
    const colors = {
      payment_proof_uploaded: 'primary',
      payment_proof_approved: 'success',
      payment_proof_rejected: 'danger',
      quote_created: 'info',
      quote_approved: 'success',
      quote_rejected: 'danger',
      project_created: 'primary',
      project_updated: 'info',
      ticket_created: 'warning',
      ticket_updated: 'info',
      system_update: 'secondary'
    };
    return colors[type] || 'secondary';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours} h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-2">Cargando notificaciones...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          Error al cargar las notificaciones: {error.message}
        </Alert>
      </Container>
    );
  }

  const unreadCount = notifications?.filter(n => !n.read_at).length || 0;

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">
              <FiBell className="me-2" />
              Notificaciones
            </h2>
            <div className="d-flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsReadMutation.isLoading}
                >
                  <FiCheck className="me-1" />
                  Marcar todas como leídas
                </Button>
              )}
            </div>
          </div>

          {notifications?.length === 0 ? (
            <Card>
              <Card.Body className="text-center py-5">
                <FiBell size={48} className="text-muted mb-3" />
                <h5 className="text-muted">No hay notificaciones</h5>
                <p className="text-muted">Cuando recibas notificaciones, aparecerán aquí.</p>
              </Card.Body>
            </Card>
          ) : (
            <div className="notification-list">
              {notifications?.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`mb-3 ${!notification.read_at ? 'border-primary' : ''}`}
                >
                  <Card.Body>
                    <div className="d-flex align-items-start">
                      <div className="me-3">
                        <span className="fs-4">{getNotificationIcon(notification.type)}</span>
                      </div>
                      
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h6 className="mb-1">
                              {notification.title}
                              {!notification.read_at && (
                                <Badge bg="primary" className="ms-2">Nueva</Badge>
                              )}
                            </h6>
                            <p className="text-muted mb-2">{notification.message}</p>
                          </div>
                          
                          <div className="text-end">
                            <small className="text-muted">
                              {formatDate(notification.created_at)}
                            </small>
                          </div>
                        </div>
                        
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleViewNotification(notification)}
                          >
                            <FiEye className="me-1" />
                            Ver detalles
                          </Button>
                          
                          {!notification.read_at && (
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              disabled={markAsReadMutation.isLoading}
                            >
                              <FiCheck className="me-1" />
                              Marcar como leída
                            </Button>
                          )}
                          
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(notification.id)}
                            disabled={deleteMutation.isLoading}
                          >
                            <FiTrash2 className="me-1" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Col>
      </Row>

      {/* Modal para ver detalles de la notificación */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedNotification && getNotificationIcon(selectedNotification.type)} 
            {selectedNotification?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNotification && (
            <div>
              <p><strong>Mensaje:</strong></p>
              <p className="mb-3">{selectedNotification.message}</p>
              
              {selectedNotification.data && (
                <div>
                  <p><strong>Datos adicionales:</strong></p>
                  <pre className="bg-light p-3 rounded">
                    {JSON.stringify(selectedNotification.data, null, 2)}
                  </pre>
                </div>
              )}
              
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Tipo:</strong> {selectedNotification.type}</p>
                  <p><strong>Prioridad:</strong> {selectedNotification.priority}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Fecha:</strong> {new Date(selectedNotification.created_at).toLocaleString('es-ES')}</p>
                  <p><strong>Estado:</strong> {selectedNotification.read_at ? 'Leída' : 'No leída'}</p>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Notificaciones;
