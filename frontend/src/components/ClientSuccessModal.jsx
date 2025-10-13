import React from 'react';
import { Modal, Button, Row, Col, Badge } from 'react-bootstrap';
import { FiCheckCircle, FiUser, FiMail, FiPhone, FiMapPin, FiHome, FiX } from 'react-icons/fi';
import './ClientSuccessModal.css';

const ClientSuccessModal = ({ show, onHide, clientData, isEdit = false }) => {
  const title = isEdit ? "✅ Cliente Actualizado" : "✅ Cliente Creado";
  const message = isEdit ? "El cliente ha sido actualizado exitosamente" : "El cliente ha sido creado exitosamente";
  
  if (!clientData) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type) => {
    return type === 'empresa' ? <FiHome size={20} /> : <FiUser size={20} />;
  };

  const getTypeLabel = (type) => {
    return type === 'empresa' ? 'Empresa' : 'Persona Natural';
  };

  const getTypeVariant = (type) => {
    return type === 'empresa' ? 'primary' : 'info';
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered 
      className="client-success-modal"
      backdrop="static"
      size="lg"
    >
      <Modal.Header closeButton className="success-header">
        <Modal.Title className="success-title">
          <FiCheckCircle className="me-2" />
          {title}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="success-modal-body">
        <div className="success-content">
          <div className="success-icon">
            <FiCheckCircle />
          </div>
          
          <div className="success-text">
            <h4 className="success-message">{message}</h4>
            
            {clientData && (
              <div className="client-success-details">
                <Row className="g-3">
                  {/* Información Principal */}
                  <Col md={12}>
                    <div className="client-main-info">
                      <div className="client-name-section">
                        <h5 className="client-name">
                          {getTypeIcon(clientData.type)}
                          <span className="ms-2">{clientData.name}</span>
                        </h5>
                        <Badge bg={getTypeVariant(clientData.type)} className="client-type-badge">
                          {getTypeLabel(clientData.type)}
                        </Badge>
                      </div>
                      
                      {clientData.contact_name && (
                        <p className="client-contact">
                          <FiUser className="me-2" />
                          <strong>Contacto:</strong> {clientData.contact_name}
                        </p>
                      )}
                    </div>
                  </Col>

                  {/* Información de Contacto */}
                  <Col md={6}>
                    <div className="info-section">
                      <h6 className="info-section-title">
                        <FiMail className="me-2" />
                        Información de Contacto
                      </h6>
                      <div className="info-items">
                        {clientData.email && (
                          <div className="info-item">
                            <strong>Email:</strong> {clientData.email}
                          </div>
                        )}
                        {clientData.phone && (
                          <div className="info-item">
                            <strong>Teléfono:</strong> {clientData.phone}
                          </div>
                        )}
                        {clientData.address && (
                          <div className="info-item">
                            <strong>Dirección:</strong> {clientData.address}
                          </div>
                        )}
                        {clientData.city && (
                          <div className="info-item">
                            <strong>Ciudad:</strong> {clientData.city}
                          </div>
                        )}
                      </div>
                    </div>
                  </Col>

                  {/* Información de Identificación */}
                  <Col md={6}>
                    <div className="info-section">
                      <h6 className="info-section-title">
                        <FiHome className="me-2" />
                        Información de Identificación
                      </h6>
                      <div className="info-items">
                        {clientData.ruc && (
                          <div className="info-item">
                            <strong>RUC:</strong> {clientData.ruc}
                          </div>
                        )}
                        {clientData.dni && (
                          <div className="info-item">
                            <strong>DNI:</strong> {clientData.dni}
                          </div>
                        )}
                        {clientData.sector && (
                          <div className="info-item">
                            <strong>Sector:</strong> {clientData.sector}
                          </div>
                        )}
                        {clientData.priority && (
                          <div className="info-item">
                            <strong>Prioridad:</strong> 
                            <Badge bg="warning" className="ms-2">
                              {clientData.priority.toUpperCase()}
                            </Badge>
                          </div>
                        )}
                        {clientData.status && (
                          <div className="info-item">
                            <strong>Estado:</strong> 
                            <Badge bg="secondary" className="ms-2">
                              {clientData.status}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </Col>

                  {/* Actividad y Servicios */}
                  {(clientData.actividad || clientData.servicios) && (
                    <Col md={12}>
                      <div className="info-section">
                        <h6 className="info-section-title">
                          <FiHome className="me-2" />
                          Actividad y Servicios
                        </h6>
                        <div className="info-items">
                          {clientData.actividad && (
                            <div className="info-item">
                              <strong>Actividad:</strong> {clientData.actividad}
                            </div>
                          )}
                          {clientData.servicios && (
                            <div className="info-item">
                              <strong>Servicios:</strong> {clientData.servicios}
                            </div>
                          )}
                        </div>
                      </div>
                    </Col>
                  )}

                  {/* Información del Sistema */}
                  <Col md={12}>
                    <div className="info-section system-info">
                      <h6 className="info-section-title">
                        <FiCheckCircle className="me-2" />
                        Información del Sistema
                      </h6>
                      <div className="info-items">
                        <div className="info-item">
                          <strong>ID del Cliente:</strong> #{clientData.id}
                        </div>
                        <div className="info-item">
                          <strong>Fecha de {isEdit ? 'Actualización' : 'Creación'}:</strong> {formatDate(clientData.updated_at || clientData.created_at)}
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            )}
          </div>
        </div>
      </Modal.Body>
      
      <Modal.Footer className="success-footer">
        <Button 
          variant="primary" 
          onClick={onHide}
          className="success-button"
        >
          <FiCheckCircle className="me-2" />
          Continuar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ClientSuccessModal;
