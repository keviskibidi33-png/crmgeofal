import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { FiCheck, FiX, FiSearch, FiFilter, FiClock, FiDollarSign } from 'react-icons/fi';
import { useQuery } from 'react-query';
import { listServices, listSubservices } from '../services/services';

export default function ServiceSelection({ 
  selectedServices = [], 
  onServicesChange
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEnsayo, setSelectedEnsayo] = useState(null);
  const [selectedSubservices, setSelectedSubservices] = useState([]);

  // Obtener todos los servicios (sin filtro de tipo)
  const { data: servicesData, isLoading: isLoadingServices } = useQuery(
    ['services'],
    () => listServices({}),
    {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
    }
  );

  // Obtener subservicios cuando se selecciona un ensayo
  const { data: subservicesData, isLoading: isLoadingSubservices } = useQuery(
    ['subservices', selectedEnsayo?.id],
    () => selectedEnsayo ? listSubservices({ service_id: selectedEnsayo.id }) : null,
    {
      enabled: !!selectedEnsayo,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );

  const services = servicesData?.data || servicesData?.rows || [];
  const subservices = subservicesData?.data || subservicesData?.rows || [];

  // Filtrar servicios por término de búsqueda
  const filteredServices = services.filter(service =>
    service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manejar selección de ensayo
  const handleEnsayoSelect = (ensayo) => {
    // Verificar si ya está seleccionado
    const isAlreadySelected = selectedServices.some(service => service.ensayo.id === ensayo.id);
    
    if (isAlreadySelected) {
      // Si ya está seleccionado, no hacer nada
      return;
    }
    
    // Verificar límite máximo (5 servicios)
    if (selectedServices.length >= 5) {
      alert('Máximo 5 servicios pueden ser seleccionados');
      return;
    }
    
    setSelectedEnsayo(ensayo);
    setSelectedSubservices([]);
  };

  // Manejar selección de subservicios
  const handleSubserviceToggle = (subservice) => {
    const isSelected = selectedSubservices.some(s => s.id === subservice.id);
    if (isSelected) {
      setSelectedSubservices(prev => prev.filter(s => s.id !== subservice.id));
    } else {
      setSelectedSubservices(prev => [...prev, subservice]);
    }
  };

  // Confirmar selección
  const handleConfirmSelection = () => {
    if (selectedEnsayo && selectedSubservices.length > 0) {
      const newService = {
        ensayo: selectedEnsayo,
        subservices: selectedSubservices,
        total: selectedSubservices.reduce((sum, sub) => sum + (sub.precio || 0), 0)
      };
      
      onServicesChange([...selectedServices, newService]);
      setSelectedEnsayo(null);
      setSelectedSubservices([]);
    }
  };

  // Eliminar servicio seleccionado
  const handleRemoveService = (index) => {
    const newServices = selectedServices.filter((_, i) => i !== index);
    onServicesChange(newServices);
  };

  return (
    <div className="service-selection">
      <Card className="mb-4">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">
              <FiFilter className="me-2" />
              Selección de Servicios
            </h6>
            <div className="d-flex align-items-center gap-2">
              <Badge bg="info">
                {selectedServices.length}/5 seleccionados
              </Badge>
              {selectedServices.length > 0 && (
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => onServicesChange([])}
                >
                  <FiX size={12} className="me-1" />
                  Limpiar
                </Button>
              )}
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          {/* Búsqueda */}
          <div className="mb-3">
            <Form.Control
              type="text"
              placeholder="Buscar servicios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Lista de servicios/ensayos */}
          {isLoadingServices ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Cargando servicios...</p>
            </div>
          ) : (
            <Row className="g-3">
              {filteredServices.map((service) => {
                const isSelected = selectedServices.some(s => s.ensayo.id === service.id);
                const isCurrentlySelected = selectedEnsayo?.id === service.id;
                
                return (
                  <Col md={6} lg={4} key={service.id}>
                    <Card 
                      className={`h-100 cursor-pointer ${
                        isSelected ? 'border-success' : 
                        isCurrentlySelected ? 'border-primary' : ''
                      } ${isSelected ? 'bg-light' : ''}`}
                      onClick={() => handleEnsayoSelect(service)}
                    >
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="mb-1">{service.name}</h6>
                          {isSelected ? (
                            <Badge bg="success">
                              <FiCheck size={14} />
                            </Badge>
                          ) : isCurrentlySelected ? (
                            <Badge bg="primary">
                              <FiCheck size={14} />
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-muted small mb-2">
                          {service.description || 'Sin descripción'}
                        </p>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            <FiClock className="me-1" size={12} />
                            {service.norma || 'N/A'}
                          </small>
                          <Badge bg={service.subservices_count > 0 ? 'info' : 'secondary'}>
                            {service.subservices_count || 0} subservicios
                          </Badge>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}

          {/* Subservicios del ensayo seleccionado */}
          {selectedEnsayo && (
            <Card className="mt-4 border-primary">
              <Card.Header>
                <h6 className="mb-0">
                  Subservicios de: {selectedEnsayo.name}
                </h6>
              </Card.Header>
              <Card.Body>
                {isLoadingSubservices ? (
                  <div className="text-center py-3">
                    <Spinner animation="border" size="sm" variant="primary" />
                    <p className="mt-2 text-muted small">Cargando subservicios...</p>
                  </div>
                ) : subservices.length > 0 ? (
                  <Row className="g-2">
                    {subservices.map((subservice) => {
                      const isSelected = selectedSubservices.some(s => s.id === subservice.id);
                      return (
                        <Col md={6} lg={4} key={subservice.id}>
                          <Card 
                            className={`h-100 cursor-pointer ${isSelected ? 'border-success' : ''}`}
                            onClick={() => handleSubserviceToggle(subservice)}
                          >
                            <Card.Body className="p-3">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <h6 className="mb-1 small">{subservice.codigo}</h6>
                                {isSelected && (
                                  <Badge bg="success">
                                    <FiCheck size={12} />
                                  </Badge>
                                )}
                              </div>
                              <p className="text-muted small mb-2">
                                {subservice.descripcion}
                              </p>
                              <div className="d-flex justify-content-between align-items-center">
                                <small className="text-muted">
                                  {subservice.norma || '-'}
                                </small>
                                <Badge bg={subservice.precio > 0 ? 'success' : 'warning'}>
                                  <FiDollarSign className="me-1" size={10} />
                                  {subservice.precio > 0 ? `S/ ${subservice.precio}` : 'Sujeto a evaluación'}
                                </Badge>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                ) : (
                  <Alert variant="info" className="mb-0">
                    No hay subservicios disponibles para este servicio.
                  </Alert>
                )}

                {/* Botón de confirmación */}
                {selectedSubservices.length > 0 && (
                  <div className="mt-3 text-center">
                    <Button 
                      variant="success" 
                      onClick={handleConfirmSelection}
                      disabled={selectedSubservices.length === 0}
                    >
                      <FiCheck className="me-1" />
                      Agregar {selectedSubservices.length} subservicio(s) seleccionado(s)
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
        </Card.Body>
      </Card>

      {/* Servicios seleccionados */}
      {selectedServices.length > 0 && (
        <Card className="border-success">
          <Card.Header>
            <h6 className="mb-0 text-success">
              <FiCheck className="me-2" />
              Servicios Seleccionados ({selectedServices.length})
            </h6>
          </Card.Header>
          <Card.Body>
            {selectedServices.map((service, index) => (
              <Card key={index} className="mb-3">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">{service.ensayo.name}</h6>
                      <p className="text-muted small mb-2">{service.ensayo.description}</p>
                      <div className="d-flex flex-wrap gap-1">
                        {service.subservices.map((sub, subIndex) => (
                          <Badge key={subIndex} bg="info" className="me-1">
                            {sub.codigo}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-end">
                      <h6 className="text-success mb-1">
                        S/ {service.total.toFixed(2)}
                      </h6>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleRemoveService(index)}
                      >
                        <FiX size={14} />
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
