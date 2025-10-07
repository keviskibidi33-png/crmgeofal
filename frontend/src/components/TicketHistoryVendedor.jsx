import React, { useState } from 'react';
import { Modal, Card, Badge, Row, Col, Button, Form, Tabs, Tab } from 'react-bootstrap';
import { 
  FiClock, FiUser, FiMessageSquare, FiCheckCircle, FiX, 
  FiEdit, FiFlag, FiTag, FiCalendar, FiEye, FiFileText,
  FiDownload, FiUpload, FiPhone, FiMail, FiMapPin
} from 'react-icons/fi';
import TicketChatVendedor from './TicketChatVendedor';
import { useAuth } from '../contexts/AuthContext';
import './TicketHistoryVendedor.css';

const TicketHistoryVendedor = ({ show, onHide, ticket, onUpdateStatus }) => {
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();
  
  // Los vendedores no pueden cambiar el estado, solo los admins y soporte
  const canEditStatus = user?.role === 'admin' || user?.role === 'soporte';
  
  // Debug: mostrar el rol del usuario
  console.log('🔍 Usuario actual:', user);
  console.log('🔍 Rol:', user?.role);
  console.log('🔍 Puede editar estado:', canEditStatus);
  console.log('🔍 Es vendedor:', user?.role === 'vendedor_comercial');

  if (!ticket) return null;

  const getStatusBadge = (status) => {
    const variants = {
      abierto: { bg: 'warning', text: 'Abierto' },
      en_progreso: { bg: 'info', text: 'En Progreso' },
      cerrado: { bg: 'success', text: 'Cerrado' },
      cancelado: { bg: 'danger', text: 'Cancelado' }
    };
    return variants[status] || { bg: 'secondary', text: status };
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      baja: { bg: 'success', text: 'Baja' },
      media: { bg: 'warning', text: 'Media' },
      alta: { bg: 'danger', text: 'Alta' },
      urgente: { bg: 'dark', text: 'Urgente' }
    };
    return variants[priority] || { bg: 'secondary', text: priority };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusChange = (newStatus) => {
    if (onUpdateStatus) {
      onUpdateStatus(ticket.id, newStatus);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton className="modal-header-vendedor">
        <Modal.Title>
          <FiMessageSquare className="me-2" />
          Historial del Ticket #{ticket.id}
        </Modal.Title>
        <small className="text-light ms-2">{ticket.title}</small>
      </Modal.Header>
      
      <Modal.Body className="modal-body-vendedor">
        <Tabs defaultActiveKey="details" className="ticket-tabs">
          {/* Pestaña de Detalles */}
          <Tab eventKey="details" title="Detalles">
            <Row>
              {/* Información principal */}
              <Col md={8}>
                <Card className="mb-4">
                  <Card.Header>
                    <h6 className="mb-0">
                      <FiFileText className="me-2" />
                      Información del Ticket
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <div className="info-item">
                          <strong>Título:</strong>
                          <p className="mb-2">{ticket.title}</p>
                        </div>
                        <div className="info-item">
                          <strong>Descripción:</strong>
                          <p className="mb-2">{ticket.description}</p>
                        </div>
                        <div className="info-item">
                          <strong>Cliente:</strong>
                          <p className="mb-2">{ticket.client_name || 'No especificado'}</p>
                        </div>
                        {ticket.project_name && (
                          <div className="info-item">
                            <strong>Proyecto:</strong>
                            <p className="mb-2">{ticket.project_name}</p>
                          </div>
                        )}
                      </Col>
                      <Col md={6}>
                        <div className="info-item">
                          <strong>Estado:</strong>
                          <div className="mb-2">
                            <Badge bg={getStatusBadge(ticket.status).bg}>
                              {getStatusBadge(ticket.status).text}
                            </Badge>
                          </div>
                        </div>
                        <div className="info-item">
                          <strong>Prioridad:</strong>
                          <div className="mb-2">
                            <Badge bg={getPriorityBadge(ticket.priority).bg}>
                              {getPriorityBadge(ticket.priority).text}
                            </Badge>
                          </div>
                        </div>
                        <div className="info-item">
                          <strong>Módulo:</strong>
                          <p className="mb-2">{ticket.module || 'No especificado'}</p>
                        </div>
                        <div className="info-item">
                          <strong>Creado:</strong>
                          <p className="mb-2">
                            <FiCalendar className="me-1" />
                            {formatDate(ticket.created_at)}
                          </p>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Información adicional */}
                {(ticket.category || ticket.type || ticket.tags || ticket.additional_notes) && (
                  <Card className="mb-4">
                    <Card.Header>
                      <h6 className="mb-0">
                        <FiTag className="me-2" />
                        Información Adicional
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        {ticket.category && (
                          <Col md={6}>
                            <div className="info-item">
                              <strong>Categoría:</strong>
                              <p className="mb-2">{ticket.category}</p>
                            </div>
                          </Col>
                        )}
                        {ticket.type && (
                          <Col md={6}>
                            <div className="info-item">
                              <strong>Tipo:</strong>
                              <p className="mb-2">{ticket.type}</p>
                            </div>
                          </Col>
                        )}
                        {ticket.tags && (
                          <Col md={6}>
                            <div className="info-item">
                              <strong>Tags:</strong>
                              <p className="mb-2">{ticket.tags}</p>
                            </div>
                          </Col>
                        )}
                        {ticket.estimated_time && (
                          <Col md={6}>
                            <div className="info-item">
                              <strong>Tiempo Estimado:</strong>
                              <p className="mb-2">{ticket.estimated_time}</p>
                            </div>
                          </Col>
                        )}
                        {ticket.additional_notes && (
                          <Col md={12}>
                            <div className="info-item">
                              <strong>Notas Adicionales:</strong>
                              <p className="mb-2">{ticket.additional_notes}</p>
                            </div>
                          </Col>
                        )}
                      </Row>
                    </Card.Body>
                  </Card>
                )}
              </Col>

              {/* Panel lateral */}
              <Col md={4}>
                {/* Estado del ticket */}
                <Card className="mb-4">
                  <Card.Header>
                    <h6 className="mb-0">
                      <FiFlag className="me-2" />
                      {canEditStatus ? 'Control de Estado' : 'Estado del Ticket'}
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="status-controls">
                      {canEditStatus ? (
                        // Solo admins y soporte pueden editar
                        <Form.Select
                          value={ticket.status}
                          onChange={(e) => handleStatusChange(e.target.value)}
                          className="mb-3"
                        >
                          <option value="abierto">Abierto</option>
                          <option value="en_progreso">En Progreso</option>
                          <option value="cerrado">Cerrado</option>
                          <option value="cancelado">Cancelado</option>
                        </Form.Select>
                      ) : (
                        // Vendedores solo pueden ver
                        <div className="mb-3">
                          <label className="form-label">Estado Actual:</label>
                          <div className="d-flex align-items-center">
                            <Badge 
                              bg={getStatusBadge(ticket.status).bg} 
                              className="me-2"
                            >
                              {getStatusBadge(ticket.status).text}
                            </Badge>
                          </div>
                        </div>
                      )}
                      
                      <div className="status-info">
                        <small className="text-muted">
                          <FiClock className="me-1" />
                          Última actualización: {formatDate(ticket.updated_at || ticket.created_at)}
                        </small>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                {/* Información del creador */}
                <Card className="mb-4">
                  <Card.Header>
                    <h6 className="mb-0">
                      <FiUser className="me-2" />
                      Información del Creador
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="creator-info">
                      <p className="mb-1">
                        <strong>Vendedor:</strong> {user?.name} {user?.apellido}
                      </p>
                      <p className="mb-1">
                        <strong>Email:</strong> {user?.email}
                      </p>
                      <p className="mb-1">
                        <strong>Rol:</strong> {user?.role}
                      </p>
                    </div>
                  </Card.Body>
                </Card>

                {/* Archivos adjuntos */}
                {ticket.attachment_url && (
                  <Card className="mb-4">
                    <Card.Header>
                      <h6 className="mb-0">
                        <FiUpload className="me-2" />
                        Archivo Adjunto
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <div className="attachment-info">
                        <p className="mb-2">
                          <FiFileText className="me-2" />
                          Archivo adjunto disponible
                        </p>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          href={ticket.attachment_url}
                          target="_blank"
                        >
                          <FiDownload className="me-1" />
                          Descargar
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                )}
              </Col>
            </Row>
          </Tab>

          {/* Pestaña de Conversación */}
          <Tab eventKey="chat" title="Conversación">
            <TicketChatVendedor 
              ticketId={ticket.id}
            />
          </Tab>
        </Tabs>
      </Modal.Body>

      <Modal.Footer className="modal-footer-vendedor">
        <Button variant="secondary" onClick={onHide}>
          <FiX className="me-2" />
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TicketHistoryVendedor;
