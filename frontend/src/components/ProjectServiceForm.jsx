import React from 'react';
import { Card, Alert } from 'react-bootstrap';
import { FiSettings, FiHome, FiCheck } from 'react-icons/fi';
import ServiceSelection from './ServiceSelection';

export default function ProjectServiceForm({ 
  onServicesChange, 
  selectedServices = []
}) {
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
        {/* Información sobre la selección */}
        <Alert variant="info" className="mb-4">
          <FiHome className="me-2" />
          <div>
            <strong>Servicios:</strong> Selecciona los servicios que necesitas para este proyecto.
            <br />
            <small className="text-muted">
              Puedes elegir entre diferentes tipos de servicios (Laboratorio, Ingeniería, etc.) 
              y sus subservicios correspondientes. Máximo 5 servicios.
            </small>
          </div>
        </Alert>

        {/* Componente de selección de servicios */}
        <ServiceSelection
          selectedServices={selectedServices}
          onServicesChange={handleServicesChange}
        />

        {/* Resumen de servicios seleccionados */}
        {selectedServices.length > 0 && (
          <Card className="border-success mt-4">
            <Card.Header>
              <h6 className="mb-0 text-success">
                <FiCheck className="me-2" />
                Resumen de Servicios Seleccionados
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-2">
                    <strong>Total de Servicios:</strong> {selectedServices.length}
                  </div>
                  <div className="mb-2">
                    <strong>Total de Subservicios:</strong> {selectedServices.reduce((sum, service) => sum + service.subservices.length, 0)}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-2">
                    <strong>Subtotal:</strong> S/ {selectedServices.reduce((sum, service) => sum + service.total, 0).toFixed(2)}
                  </div>
                  <div className="mb-2">
                    <strong>IGV (18%):</strong> S/ {(selectedServices.reduce((sum, service) => sum + service.total, 0) * 0.18).toFixed(2)}
                  </div>
                  <div className="fw-bold text-success">
                    <strong>Total:</strong> S/ {(selectedServices.reduce((sum, service) => sum + service.total, 0) * 1.18).toFixed(2)}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        )}
      </Card.Body>
    </Card>
  );
}