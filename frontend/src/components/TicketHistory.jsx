import React, { useState } from 'react';
import { Modal, Card, Badge, Row, Col, Button, Form, Alert, Tabs, Tab } from 'react-bootstrap';
import { 
  FiClock, FiUser, FiMessageSquare, FiCheckCircle, FiX, 
  FiEdit, FiFlag, FiTag, FiCalendar, FiEye 
} from 'react-icons/fi';
import TicketChat from './TicketChat';
import { useAuth } from '../contexts/AuthContext';

const TicketHistory = ({ show, onHide, ticket, onUpdateStatus }) => {
  const [newComment, setNewComment] = useState('');
  const [newStatus, setNewStatus] = useState(ticket?.status || 'abierto');
  const [activeTab, setActiveTab] = useState('details');
  const { user } = useAuth();

  const getStatusColor = (status) => {
    const colors = {
      'abierto': 'warning',
      'en_progreso': 'info',
      'resuelto': 'success',
      'cerrado': 'secondary',
      'cancelado': 'danger'
    };
    return colors[status] || 'secondary';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'abierto': 'Abierto',
      'en_progreso': 'En Progreso',
      'resuelto': 'Resuelto',
      'cerrado': 'Cerrado',
      'cancelado': 'Cancelado'
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'baja': 'success',
      'media': 'warning',
      'alta': 'danger',
      'critica': 'dark'
    };
    return colors[priority] || 'secondary';
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      'baja': 'Baja',
      'media': 'Media',
      'alta': 'Alta',
      'critica': 'Crítica'
    };
    return labels[priority] || priority;
  };

  const handleStatusUpdate = () => {
    if (onUpdateStatus) {
      onUpdateStatus(ticket.id, newStatus);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      // Aquí se implementaría la lógica para agregar comentarios
      console.log('Agregar comentario:', newComment);
      setNewComment('');
    }
  };

  if (!ticket) return null;

  return (
    <Modal show={show} onHide={onHide} size="xl" centered className="ticket-history-modal">
      <Modal.Header closeButton className="ticket-history-header">
        <div className="d-flex align-items-center">
          <FiMessageSquare className="me-2 text-primary" size={24} />
          <div>
            <Modal.Title className="mb-0">
              Historial del Ticket #{ticket.id}
            </Modal.Title>
            <small className="text-muted">
              {ticket.title}
            </small>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="ticket-history-body">
        <Row>
          {/* Información del Ticket */}
          <Col md={8}>
            <Card className="ticket-info-card">
              <Card.Header className="ticket-info-header">
                <h5 className="mb-0">
                  <FiMessageSquare className="me-2" />
                  Información del Ticket
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="ticket-details">
                  <div className="detail-row">
                    <strong>Título:</strong>
                    <span>{ticket.title}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Descripción:</strong>
                    <span>{ticket.description}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Módulo:</strong>
                    <Badge bg="info">{ticket.module}</Badge>
                  </div>
                  <div className="detail-row">
                    <strong>Categoría:</strong>
                    <Badge bg="secondary">{ticket.category}</Badge>
                  </div>
                  <div className="detail-row">
                    <strong>Tipo:</strong>
                    <Badge bg="light" text="dark">{ticket.type}</Badge>
                  </div>
                  <div className="detail-row">
                    <strong>Prioridad:</strong>
                    <Badge bg={getPriorityColor(ticket.priority)}>
                      {getPriorityLabel(ticket.priority)}
                    </Badge>
                  </div>
                  {ticket.assigned_to && (
                    <div className="detail-row">
                      <strong>Asignado a:</strong>
                      <span>{ticket.assigned_to}</span>
                    </div>
                  )}
                  {ticket.estimated_time && (
                    <div className="detail-row">
                      <strong>Tiempo Estimado:</strong>
                      <span>{ticket.estimated_time}</span>
                    </div>
                  )}
                  {ticket.tags && (
                    <div className="detail-row">
                      <strong>Tags:</strong>
                      <div className="tags-container">
                        {ticket.tags.split(',').map((tag, index) => (
                          <Badge key={index} bg="outline-secondary" className="me-1">
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {ticket.additional_notes && (
                    <div className="detail-row">
                      <strong>Notas Adicionales:</strong>
                      <span>{ticket.additional_notes}</span>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>

            {/* Comentarios */}
            <Card className="mt-3">
              <Card.Header className="ticket-comments-header">
                <h5 className="mb-0">
                  <FiMessageSquare className="me-2" />
                  Comentarios
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="comments-section">
                  {/* Comentarios existentes */}
                  <div className="comment-item">
                    <div className="comment-header">
                      <div className="comment-author">
                        <FiUser className="me-1" />
                        Sistema
                      </div>
                      <div className="comment-date">
                        <FiCalendar className="me-1" />
                        {new Date(ticket.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="comment-content">
                      Ticket creado
                    </div>
                  </div>

                  {/* Formulario para nuevo comentario */}
                  <div className="new-comment-section">
                    <Form.Group>
                      <Form.Label>Agregar Comentario</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Escribe tu comentario aquí..."
                        className="comment-textarea"
                      />
                    </Form.Group>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="mt-2"
                    >
                      <FiMessageSquare className="me-1" />
                      Agregar Comentario
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Panel de Control */}
          <Col md={4}>
            <Card className="ticket-control-card">
              <Card.Header className="ticket-control-header">
                <h5 className="mb-0">
                  <FiEdit className="me-2" />
                  Control del Ticket
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="control-section">
                  <div className="status-control">
                    <Form.Label>Estado Actual</Form.Label>
                    <div className="current-status mb-3">
                      <Badge bg={getStatusColor(ticket.status)} size="lg">
                        {getStatusLabel(ticket.status)}
                      </Badge>
                    </div>
                    
                    <Form.Label>Cambiar Estado</Form.Label>
                    <Form.Select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="mb-3"
                    >
                      <option value="abierto">Abierto</option>
                      <option value="en_progreso">En Progreso</option>
                      <option value="resuelto">Resuelto</option>
                      <option value="cerrado">Cerrado</option>
                      <option value="cancelado">Cancelado</option>
                    </Form.Select>
                    
                    <Button 
                      variant="primary" 
                      onClick={handleStatusUpdate}
                      disabled={newStatus === ticket.status}
                      className="w-100"
                    >
                      <FiCheckCircle className="me-1" />
                      Actualizar Estado
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Información de Tiempo */}
            <Card className="mt-3">
              <Card.Header className="ticket-time-header">
                <h5 className="mb-0">
                  <FiClock className="me-2" />
                  Información de Tiempo
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="time-info">
                  <div className="time-item">
                    <strong>Creado:</strong>
                    <span>{new Date(ticket.created_at).toLocaleString()}</span>
                  </div>
                  {ticket.updated_at && (
                    <div className="time-item">
                      <strong>Última Actualización:</strong>
                      <span>{new Date(ticket.updated_at).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer className="ticket-history-footer">
        <Button variant="outline-secondary" onClick={onHide}>
          <FiX className="me-2" />
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TicketHistory;
