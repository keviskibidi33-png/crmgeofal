import React, { useState } from 'react';
import { Card, Form, Row, Col, Button, Alert } from 'react-bootstrap';
import { FiCheck, FiX, FiSettings, FiHome } from 'react-icons/fi';
import ServiceSelection from './ServiceSelection';

export default function ProjectServiceForm({ 
  onServicesChange, 
  selectedServices = [],
  serviceType = 'laboratorio'
}) {
  const [selectedType, setSelectedType] = useState(serviceType);

  const handleTypeChange = (type) => {
    setSelectedType(type);
    // Limpiar servicios seleccionados al cambiar tipo
    onServicesChange([]);
  };

  const handleServicesChange = (services) => {
    onServicesChange(services);
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <h6 className="mb-0">
          <FiSettings className="me-2" />
          Configuración de Servicios del Proyecto
        </h6>
      </Card.Header>
      <Card.Body>
        {/* Selección de tipo de servicio */}
        <Row className="mb-4">
          <Col md={12}>
            <Form.Label className="fw-bold">Tipo de Servicio:</Form.Label>
            <div className="d-flex gap-3">
              <Form.Check
                type="radio"
                id="laboratorio"
                name="serviceType"
                label="Laboratorio"
                checked={selectedType === 'laboratorio'}
                onChange={() => handleTypeChange('laboratorio')}
                className="d-flex align-items-center"
              />
              <Form.Check
                type="radio"
                id="ingenieria"
                name="serviceType"
                label="Ingeniería"
                checked={selectedType === 'ingenieria'}
                onChange={() => handleTypeChange('ingenieria')}
                className="d-flex align-items-center"
              />
            </div>
          </Col>
        </Row>

        {/* Información del tipo seleccionado */}
        {selectedType && (
          <Alert variant="info" className="mb-4">
            <div className="d-flex align-items-center">
              {selectedType === 'laboratorio' ? (
                <>
                  <FiHome className="me-2" />
                  <div>
                    <strong>Laboratorio:</strong> Selecciona ensayos y sus subservicios específicos.
                    <br />
                    <small className="text-muted">
                      Podrás elegir entre diferentes tipos de ensayos (ENSAYO ESTÁNDAR, ENSAYOS ESPECIALES, etc.) 
                      y sus subservicios correspondientes.
                    </small>
                  </div>
                </>
              ) : (
                <>
                  <FiSettings className="me-2" />
                  <div>
                    <strong>Ingeniería:</strong> Selecciona servicios de ingeniería y sus componentes.
                    <br />
                    <small className="text-muted">
                      Podrás elegir entre diferentes servicios de ingeniería y sus componentes específicos.
                    </small>
                  </div>
                </>
              )}
            </div>
          </Alert>
        )}

        {/* Componente de selección de servicios */}
        {selectedType && (
          <ServiceSelection
            selectedServices={selectedServices}
            onServicesChange={handleServicesChange}
            serviceType={selectedType}
          />
        )}

        {/* Resumen de servicios seleccionados */}
        {selectedServices.length > 0 && (
          <Card className="border-success">
            <Card.Header>
              <h6 className="mb-0 text-success">
                <FiCheck className="me-2" />
                Resumen de Servicios Seleccionados
              </h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="mb-2">
                    <strong>Total de Servicios:</strong> {selectedServices.length}
                  </div>
                  <div className="mb-2">
                    <strong>Total de Subservicios:</strong> {selectedServices.reduce((sum, service) => sum + service.subservices.length, 0)}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-2">
                    <strong>Subtotal:</strong> S/ {selectedServices.reduce((sum, service) => sum + service.total, 0).toFixed(2)}
                  </div>
                  <div className="mb-2">
                    <strong>IGV (18%):</strong> S/ {(selectedServices.reduce((sum, service) => sum + service.total, 0) * 0.18).toFixed(2)}
                  </div>
                  <div className="fw-bold text-success">
                    <strong>Total:</strong> S/ {(selectedServices.reduce((sum, service) => sum + service.total, 0) * 1.18).toFixed(2)}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}
      </Card.Body>
    </Card>
  );
}
