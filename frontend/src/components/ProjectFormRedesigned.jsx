import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Alert, Badge, ProgressBar } from 'react-bootstrap';
import { 
  FiUser, FiMapPin, FiMail, FiPhone, FiMessageSquare, FiSettings, 
  FiCheck, FiX, FiPlus, FiEdit, FiTrash2, FiDollarSign, FiClock,
  FiHome, FiTool, FiBookOpen, FiShield, FiCheckCircle
} from 'react-icons/fi';
import ProjectServiceForm from './ProjectServiceForm';

export default function ProjectFormRedesigned({ 
  data = {}, 
  onSubmit, 
  loading = false,
  onCancel 
}) {
  const [formData, setFormData] = useState({
    company_id: '',
    name: '',
    location: '',
    vendedor_id: '',
    laboratorio_id: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    queries: '',
    priority: 'normal',
    marked: false,
    // Servicios seleccionados
    selectedServices: [],
    serviceType: 'laboratorio'
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [errors, setErrors] = useState({});

  const totalSteps = 4;

  useEffect(() => {
    if (data) {
      setFormData(prev => ({
        ...prev,
        ...data,
        selectedServices: data.selectedServices || [],
        serviceType: data.serviceType || 'laboratorio'
      }));
    }
  }, [data]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleServicesChange = (services) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: services
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.company_id) newErrors.company_id = 'Selecciona un cliente';
        if (!formData.name) newErrors.name = 'Nombre del proyecto es requerido';
        if (!formData.location) newErrors.location = 'Ubicación es requerida';
        break;
      case 2:
        if (!formData.contact_name) newErrors.contact_name = 'Persona de contacto es requerida';
        if (!formData.contact_phone) newErrors.contact_phone = 'Teléfono es requerido';
        break;
      case 3:
        if (formData.selectedServices.length === 0) {
          newErrors.services = 'Debes seleccionar al menos un servicio';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      onSubmit(formData);
    }
  };

  const getStepIcon = (step) => {
    switch (step) {
      case 1: return <FiUser />;
      case 2: return <FiMessageSquare />;
      case 3: return <FiSettings />;
      case 4: return <FiCheckCircle />;
      default: return <FiUser />;
    }
  };

  const getStepTitle = (step) => {
    switch (step) {
      case 1: return 'Información Básica';
      case 2: return 'Contacto';
      case 3: return 'Servicios';
      case 4: return 'Resumen';
      default: return 'Paso';
    }
  };

  const renderStep1 = () => (
    <div className="step-content">
      <h5 className="mb-4">
        <FiUser className="me-2" />
        Información Básica del Proyecto
      </h5>
      
      <Row className="g-3">
        <Col md={12}>
          <Form.Group>
            <Form.Label className="fw-bold">Cliente/Empresa *</Form.Label>
            <Form.Select
              value={formData.company_id}
              onChange={(e) => handleInputChange('company_id', e.target.value)}
              isInvalid={!!errors.company_id}
            >
              <option value="">Selecciona un cliente</option>
              {/* Aquí se cargarían los clientes */}
            </Form.Select>
            {errors.company_id && (
              <Form.Control.Feedback type="invalid">
                {errors.company_id}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
        
        <Col md={12}>
          <Form.Group>
            <Form.Label className="fw-bold">Nombre del Proyecto *</Form.Label>
            <Form.Control
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ingresa el nombre del proyecto"
              isInvalid={!!errors.name}
            />
            {errors.name && (
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
        
        <Col md={12}>
          <Form.Group>
            <Form.Label className="fw-bold">Ubicación *</Form.Label>
            <Form.Control
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Ingresa la ubicación del proyecto"
              isInvalid={!!errors.location}
            />
            {errors.location && (
              <Form.Control.Feedback type="invalid">
                {errors.location}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
      </Row>
    </div>
  );

  const renderStep2 = () => (
    <div className="step-content">
      <h5 className="mb-4">
        <FiMessageSquare className="me-2" />
        Información de Contacto
      </h5>
      
      <Row className="g-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label className="fw-bold">Persona de Contacto *</Form.Label>
            <Form.Control
              type="text"
              value={formData.contact_name}
              onChange={(e) => handleInputChange('contact_name', e.target.value)}
              placeholder="Nombre completo"
              isInvalid={!!errors.contact_name}
            />
            {errors.contact_name && (
              <Form.Control.Feedback type="invalid">
                {errors.contact_name}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group>
            <Form.Label className="fw-bold">Teléfono *</Form.Label>
            <Form.Control
              type="tel"
              value={formData.contact_phone}
              onChange={(e) => handleInputChange('contact_phone', e.target.value)}
              placeholder="Número de teléfono"
              isInvalid={!!errors.contact_phone}
            />
            {errors.contact_phone && (
              <Form.Control.Feedback type="invalid">
                {errors.contact_phone}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
        
        <Col md={12}>
          <Form.Group>
            <Form.Label className="fw-bold">Email</Form.Label>
            <Form.Control
              type="email"
              value={formData.contact_email}
              onChange={(e) => handleInputChange('contact_email', e.target.value)}
              placeholder="Email para comunicación"
            />
          </Form.Group>
        </Col>
        
        <Col md={12}>
          <Form.Group>
            <Form.Label className="fw-bold">Consultas/Notas</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={formData.queries}
              onChange={(e) => handleInputChange('queries', e.target.value)}
              placeholder="Consultas, notas o comentarios adicionales"
            />
          </Form.Group>
        </Col>
      </Row>
    </div>
  );

  const renderStep3 = () => (
    <div className="step-content">
      <h5 className="mb-4">
        <FiSettings className="me-2" />
        Selección de Servicios
      </h5>
      
      <Alert variant="info" className="mb-4">
        <div className="d-flex align-items-center">
          <FiTool className="me-2" />
          <div>
            <strong>Selecciona los servicios que requiere este proyecto</strong>
            <br />
            <small>Puedes elegir entre servicios de Laboratorio o Ingeniería</small>
          </div>
        </div>
      </Alert>
      
      <div className="mb-4">
        <Button 
          variant="outline-primary" 
          onClick={() => setShowServiceForm(true)}
          className="w-100 py-3"
          size="lg"
        >
          <FiSettings className="me-2" />
          {formData.selectedServices.length > 0 
            ? `Configurar Servicios (${formData.selectedServices.length} seleccionados)` 
            : 'Seleccionar Servicios del Proyecto'
          }
        </Button>
        {errors.services && (
          <Alert variant="danger" className="mt-2">
            {errors.services}
          </Alert>
        )}
      </div>
      
      {formData.selectedServices.length > 0 && (
        <Card className="border-success">
          <Card.Header className="bg-success text-white">
            <h6 className="mb-0">
              <FiCheckCircle className="me-2" />
              Servicios Seleccionados ({formData.selectedServices.length})
            </h6>
          </Card.Header>
          <Card.Body>
            {formData.selectedServices.map((service, index) => (
              <div key={index} className="mb-3 p-3 border rounded bg-light">
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
                    <div className="fw-bold text-success h5 mb-1">
                      S/ {service.total.toFixed(2)}
                    </div>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => {
                        const newServices = formData.selectedServices.filter((_, i) => i !== index);
                        handleServicesChange(newServices);
                      }}
                    >
                      <FiX size={12} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="mt-3 pt-3 border-top">
              <Row>
                <Col md={6}>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <strong>S/ {formData.selectedServices.reduce((sum, service) => sum + service.total, 0).toFixed(2)}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>IGV (18%):</span>
                    <span>S/ {(formData.selectedServices.reduce((sum, service) => sum + service.total, 0) * 0.18).toFixed(2)}</span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex justify-content-between fw-bold text-success h5">
                    <span>Total:</span>
                    <span>S/ {(formData.selectedServices.reduce((sum, service) => sum + service.total, 0) * 1.18).toFixed(2)}</span>
                  </div>
                </Col>
              </Row>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="step-content">
      <h5 className="mb-4">
        <FiCheckCircle className="me-2" />
        Resumen del Proyecto
      </h5>
      
      <Row className="g-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Información Básica</h6>
            </Card.Header>
            <Card.Body>
              <div className="mb-2">
                <strong>Proyecto:</strong> {formData.name}
              </div>
              <div className="mb-2">
                <strong>Ubicación:</strong> {formData.location}
              </div>
              <div className="mb-2">
                <strong>Contacto:</strong> {formData.contact_name}
              </div>
              <div className="mb-2">
                <strong>Teléfono:</strong> {formData.contact_phone}
              </div>
              {formData.contact_email && (
                <div className="mb-2">
                  <strong>Email:</strong> {formData.contact_email}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Servicios Seleccionados</h6>
            </Card.Header>
            <Card.Body>
              {formData.selectedServices.length > 0 ? (
                <div>
                  <div className="mb-2">
                    <strong>Total de Servicios:</strong> {formData.selectedServices.length}
                  </div>
                  <div className="mb-2">
                    <strong>Total de Subservicios:</strong> {formData.selectedServices.reduce((sum, service) => sum + service.subservices.length, 0)}
                  </div>
                  <div className="mb-2">
                    <strong>Subtotal:</strong> S/ {formData.selectedServices.reduce((sum, service) => sum + service.total, 0).toFixed(2)}
                  </div>
                  <div className="mb-2">
                    <strong>IGV (18%):</strong> S/ {(formData.selectedServices.reduce((sum, service) => sum + service.total, 0) * 0.18).toFixed(2)}
                  </div>
                  <div className="fw-bold text-success h5">
                    <strong>Total:</strong> S/ {(formData.selectedServices.reduce((sum, service) => sum + service.total, 0) * 1.18).toFixed(2)}
                  </div>
                </div>
              ) : (
                <div className="text-muted">
                  <FiX className="me-1" />
                  No hay servicios seleccionados
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {formData.queries && (
        <Card className="mt-4">
          <Card.Header>
            <h6 className="mb-0">Consultas/Notas</h6>
          </Card.Header>
          <Card.Body>
            <p className="mb-0">{formData.queries}</p>
          </Card.Body>
        </Card>
      )}
    </div>
  );

  return (
    <div className="project-form-redesigned">
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0">Progreso del Formulario</h6>
          <span className="text-muted">{currentStep} de {totalSteps}</span>
        </div>
        <ProgressBar 
          now={(currentStep / totalSteps) * 100} 
          variant="primary"
          style={{ height: '8px' }}
        />
      </div>
      
      {/* Step Navigation */}
      <div className="mb-4">
        <Row className="g-2">
          {Array.from({ length: totalSteps }, (_, index) => {
            const step = index + 1;
            const isActive = step === currentStep;
            const isCompleted = step < currentStep;
            
            return (
              <Col key={step} md={3}>
                <div 
                  className={`step-indicator text-center p-3 rounded ${isActive ? 'bg-primary text-white' : isCompleted ? 'bg-success text-white' : 'bg-light'}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setCurrentStep(step)}
                >
                  <div className="mb-2">
                    {getStepIcon(step)}
                  </div>
                  <div className="small fw-bold">
                    {getStepTitle(step)}
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      </div>
      
      {/* Step Content */}
      <Card className="mb-4">
        <Card.Body>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </Card.Body>
      </Card>
      
      {/* Navigation Buttons */}
      <div className="d-flex justify-content-between">
        <Button 
          variant="outline-secondary" 
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <FiX className="me-1" />
          Anterior
        </Button>
        
        <div>
          {currentStep < totalSteps ? (
            <Button 
              variant="primary" 
              onClick={handleNext}
              className="me-2"
            >
              Siguiente
              <FiPlus className="ms-1" />
            </Button>
          ) : (
            <Button 
              variant="success" 
              onClick={handleSubmit}
              disabled={loading}
              className="me-2"
            >
              {loading ? 'Creando...' : 'Crear Proyecto'}
              <FiCheckCircle className="ms-1" />
            </Button>
          )}
          
          <Button 
            variant="outline-danger" 
            onClick={onCancel}
          >
            Cancelar
          </Button>
        </div>
      </div>
      
      {/* Modal de Servicios */}
      {showServiceForm && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1050,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="modal-content bg-white rounded shadow-lg" style={{
            width: '90%',
            maxWidth: '1200px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div className="modal-header p-4 border-bottom">
              <h5 className="mb-0">Seleccionar Servicios del Proyecto</h5>
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => setShowServiceForm(false)}
              >
                <FiX />
              </Button>
            </div>
            <div className="modal-body p-4">
              <ProjectServiceForm
                selectedServices={formData.selectedServices}
                onServicesChange={handleServicesChange}
                serviceType={formData.serviceType}
              />
            </div>
            <div className="modal-footer p-4 border-top">
              <Button 
                variant="success" 
                onClick={() => setShowServiceForm(false)}
              >
                <FiCheck className="me-1" />
                Confirmar Selección
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
