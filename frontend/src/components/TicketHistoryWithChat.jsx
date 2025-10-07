import React, { useState } from 'react';
import { Modal, Card, Badge, Row, Col, Button, Form, Tabs, Tab } from 'react-bootstrap';
import { 
  FiClock, FiUser, FiMessageSquare, FiCheckCircle, FiX, 
  FiEdit, FiFlag, FiTag, FiCalendar, FiEye 
} from 'react-icons/fi';
import TicketChatHybrid from './TicketChatHybrid';
import { useAuth } from '../contexts/AuthContext';
import './TicketHistory.css';

const TicketHistoryWithChat = ({ show, onHide, ticket, onUpdateStatus }) => {
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
      'urgente': 'danger'
    };
    return colors[priority] || 'secondary';
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      'baja': 'Baja',
      'media': 'Media',
      'alta': 'Alta',
      'urgente': 'Urgente'
    };
    return labels[priority] || priority;
  };

  const handleStatusUpdate = () => {
    if (onUpdateStatus && newStatus !== ticket.status) {
      onUpdateStatus(ticket.id, newStatus);
    }
  };

  if (!ticket) return null;

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="xl" 
      className="ticket-history-modal"
    >
      <Modal.Header closeButton className="ticket-history-header">
        <div className="ticket-header-content">
          <Modal.Title className="mb-0">
            Historial del Ticket #{ticket.id}
          </Modal.Title>
          <small className="text-muted">
            {ticket.title}
          </small>
        </div>
      </Modal.Header>

      <Modal.Body className="ticket-history-body">
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="ticket-tabs"
        >
          <Tab eventKey="details" title="Detalles">
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
                        <Badge bg="info">{ticket.module || 'No especificado'}</Badge>
                      </div>
                      <div className="detail-row">
                        <strong>Categoría:</strong>
                        <Badge bg="secondary">{ticket.category || 'No especificado'}</Badge>
                      </div>
                      <div className="detail-row">
                        <strong>Tipo:</strong>
                        <Badge bg="light" text="dark">{ticket.type || 'No especificado'}</Badge>
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
                          <strong>Tiempo estimado:</strong>
                          <span>{ticket.estimated_time}</span>
                        </div>
                      )}
                      {ticket.tags && (
                        <div className="detail-row">
                          <strong>Etiquetas:</strong>
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
                          <strong>Notas adicionales:</strong>
                          <span>{ticket.additional_notes}</span>
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Control del Ticket */}
              <Col md={4}>
                <Card className="ticket-control-card">
                  <Card.Header className="ticket-control-header">
                    <h5 className="mb-0">
                      <FiEdit className="me-2" />
                      Control del Ticket
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="ticket-control-section">
                      <div className="status-section">
                        <h6>Estado Actual</h6>
                        <Badge bg={getStatusColor(ticket.status)} className="status-badge">
                          {getStatusLabel(ticket.status)}
                        </Badge>
                      </div>

                      <Form className="status-update-form">
                        <Form.Group className="mb-3">
                          <Form.Label>Cambiar Estado</Form.Label>
                          <Form.Select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="status-select"
                          >
                            <option value="abierto">Abierto</option>
                            <option value="en_progreso">En Progreso</option>
                            <option value="resuelto">Resuelto</option>
                            <option value="cerrado">Cerrado</option>
                            <option value="cancelado">Cancelado</option>
                          </Form.Select>
                        </Form.Group>
                        <Button 
                          variant="success" 
                          className="update-status-btn"
                          onClick={handleStatusUpdate}
                          disabled={newStatus === ticket.status}
                        >
                          <FiCheckCircle className="me-1" />
                          Actualizar Estado
                        </Button>
                      </Form>
                    </div>
                  </Card.Body>
                </Card>

                <Card className="ticket-time-card mt-3">
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
                        <span>{new Date(ticket.created_at).toLocaleString('es-ES')}</span>
                      </div>
                      <div className="time-item">
                        <strong>Última Actualización:</strong>
                        <span>{new Date(ticket.updated_at).toLocaleString('es-ES')}</span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>

          <Tab eventKey="chat" title="Conversación">
            <TicketChatHybrid 
              ticketId={ticket.id}
            />
          </Tab>
        </Tabs>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          <FiX className="me-1" />
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TicketHistoryWithChat;
