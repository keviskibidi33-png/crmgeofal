import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Alert, Badge, ProgressBar } from 'react-bootstrap';
import { 
  FiUser, FiMapPin, FiMail, FiPhone, FiMessageSquare, FiSettings, 
  FiCheck, FiX, FiPlus, FiEdit, FiTrash2, FiDollarSign, FiClock,
  FiHome, FiTool, FiBookOpen, FiShield, FiCheckCircle, FiAlertTriangle
} from 'react-icons/fi';
import { searchCompanies } from '../services/companySearch';

export default function ProjectFormRedesigned({ 
  data = {}, 
  onSubmit, 
  loading = false,
  onCancel 
}) {
  const [formData, setFormData] = useState({
    // Tipo de cliente
    clientType: '', // 'empresa' o 'persona_natural'
    client_id: '',
    client_name: '',
    client_info: {},
    
    // Datos del proyecto
    name: '',
    location: '',
    vendedor_id: '',
    laboratorio_id: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    priority: 'normal',
    marked: false,
    
    // Requisitos del proyecto
    requiere_laboratorio: false,
    requiere_ingenieria: false,
    requiere_capacitacion: false
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  
  // Estados para búsqueda inteligente
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [autoDetectedClient, setAutoDetectedClient] = useState(null);

  const totalSteps = 4;

  useEffect(() => {
    if (data) {
      setFormData(prev => ({
        ...prev,
        ...data
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


  // Búsqueda inteligente de clientes
  const handleSearch = async (searchTerm) => {
    console.log('🔍 handleSearch - Iniciando búsqueda:', { searchTerm, clientType: formData.clientType });
    
    if (!searchTerm || searchTerm.length < 2) {
      console.log('🔍 handleSearch - Término muy corto, cancelando búsqueda');
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    if (!formData.clientType) {
      console.log('🔍 handleSearch - No hay tipo de cliente seleccionado');
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      console.log('🔍 handleSearch - Llamando a searchCompanies...');
      const response = await searchCompanies(formData.clientType, searchTerm);
      console.log('🔍 handleSearch - Respuesta recibida:', response);
      
      if (response.success) {
        const results = response.data || [];
        console.log('🔍 handleSearch - Resultados encontrados:', results.length);
        setSearchResults(results);
        setShowSearchResults(true);
        
        // Auto-seleccionar si hay una coincidencia exacta o muy similar
        const exactMatch = results.find(client => {
          const clientName = client.name.toLowerCase().trim();
          const searchName = searchTerm.toLowerCase().trim();
          
          console.log('🔍 Comparando:', { clientName, searchName });
          
          // Coincidencia exacta
          if (clientName === searchName) {
            console.log('✅ Coincidencia exacta encontrada');
            return true;
          }
          
          // Coincidencia sin espacios extra
          if (clientName.replace(/\s+/g, ' ') === searchName.replace(/\s+/g, ' ')) {
            console.log('✅ Coincidencia sin espacios extra encontrada');
            return true;
          }
          
          // Coincidencia sin caracteres especiales
          const cleanClientName = clientName.replace(/[^\w\s]/g, '');
          const cleanSearchName = searchName.replace(/[^\w\s]/g, '');
          if (cleanClientName === cleanSearchName) {
            console.log('✅ Coincidencia sin caracteres especiales encontrada');
            return true;
          }
          
          return false;
        });
        
        if (exactMatch) {
          console.log('🎯 Cliente detectado automáticamente:', exactMatch.name);
          handleSelectClient(exactMatch, true);
        } else {
          console.log('❌ No se encontró coincidencia exacta');
        }
      } else {
        console.log('❌ handleSearch - Respuesta no exitosa:', response);
        setSearchResults([]);
        setShowSearchResults(false);
      }
    } catch (error) {
      console.error('❌ Error en búsqueda:', error);
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Seleccionar cliente
  const handleSelectClient = (client, isAutoDetected = false) => {
    setFormData(prev => ({
      ...prev,
      client_id: client.id,
      client_name: client.name,
      client_info: client
    }));
    setSearchTerm(client.name);
    setShowSearchResults(false);
    
    if (isAutoDetected) {
      // Mostrar mensaje de confirmación
      console.log('✅ Cliente seleccionado automáticamente:', client.name);
      setAutoDetectedClient(client.name);
      // Limpiar el mensaje después de 3 segundos
      setTimeout(() => setAutoDetectedClient(null), 3000);
    }
  };

  // Limpiar selección
  const handleClearClient = () => {
    setFormData(prev => ({
      ...prev,
      client_id: '',
      client_name: '',
      client_info: {}
    }));
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchResults(false);
    setAutoDetectedClient(null);
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.clientType) newErrors.clientType = 'Selecciona el tipo de cliente';
        if (!formData.client_id) newErrors.client_id = 'Debes seleccionar un cliente de la lista de resultados';
        if (!formData.name) newErrors.name = 'Nombre del proyecto es requerido';
        if (!formData.location) newErrors.location = 'Ubicación es requerida';
        break;
      case 2:
        if (!formData.contact_name) newErrors.contact_name = 'Persona de contacto es requerida';
        if (!formData.contact_phone) newErrors.contact_phone = 'Teléfono es requerido';
        break;
      case 3:
        if (!formData.requiere_laboratorio && !formData.requiere_ingenieria && 
            !formData.requiere_capacitacion) {
          newErrors.services = 'Debes seleccionar al menos un tipo de servicio';
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
      case 3: return 'Requisitos del Proyecto';
      case 4: return 'Resumen';
      default: return 'Paso';
    }
  };

  const renderStep1 = () => (
    <div className="step-content">
      <div className="text-center mb-5">
        <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 mb-3" style={{ width: '64px', height: '64px' }}>
          <FiUser size={28} className="text-primary" />
        </div>
        <h3 className="fw-bold text-dark mb-2">Información Básica</h3>
        <p className="text-muted">Completa los datos del cliente y del proyecto</p>
      </div>
      
      <Row className="g-3">
        {/* Selección de tipo de cliente */}
        <Col md={12}>
          <Form.Group>
            <Form.Label className="fw-bold">Tipo de Cliente *</Form.Label>
            <div className="d-flex gap-3">
              <Form.Check
                type="radio"
                id="empresa"
                name="clientType"
                label="Empresa"
                checked={formData.clientType === 'empresa'}
                onChange={() => handleInputChange('clientType', 'empresa')}
                className="d-flex align-items-center"
              />
              <Form.Check
                type="radio"
                id="persona_natural"
                name="clientType"
                label="Persona Natural"
                checked={formData.clientType === 'persona_natural'}
                onChange={() => handleInputChange('clientType', 'persona_natural')}
                className="d-flex align-items-center"
              />
            </div>
            {errors.clientType && (
              <Form.Control.Feedback type="invalid">
                {errors.clientType}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
        
        {/* Búsqueda inteligente */}
        {formData.clientType && (
          <Col md={12}>
            <Form.Group>
              <Form.Label className="fw-bold">
                Buscar {formData.clientType === 'empresa' ? 'Empresa' : 'Persona Natural'} *
              </Form.Label>
              <div className="position-relative">
                <Form.Control
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchTerm(value);
                    handleSearch(value);
                  }}
                  placeholder={`Buscar ${formData.clientType === 'empresa' ? 'empresa' : 'persona natural'}...`}
                  isInvalid={!!errors.client_id}
                  isValid={!!formData.client_id && !errors.client_id}
                />
                {isSearching && (
                  <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Buscando...</span>
                    </div>
                  </div>
                )}
                
                {/* Resultados de búsqueda */}
                {showSearchResults && searchTerm && (
                  <div className="position-absolute w-100 bg-white border rounded shadow-lg" style={{zIndex: 1000, maxHeight: '300px', overflowY: 'auto'}}>
                    {searchResults.length > 0 ? (
                      <>
                        <div className="p-2 bg-light border-bottom">
                          <small className="text-muted">
                            <strong>Haz clic en un cliente para seleccionarlo:</strong>
                          </small>
                        </div>
                        {searchResults.map((result, index) => (
                          <div 
                            key={index}
                            className="p-3 border-bottom cursor-pointer hover-bg-light"
                            onClick={() => handleSelectClient(result)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="fw-bold">{result.name}</div>
                            <div className="text-muted small">
                              {formData.clientType === 'empresa' ? result.ruc : result.dni} • {result.address}
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="p-3 text-center">
                        <div className="text-muted mb-2">No se encontraron resultados</div>
                        <small className="text-warning">
                          Verifica el nombre o crea un nuevo cliente
                        </small>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {errors.client_id && (
                <Form.Control.Feedback type="invalid">
                  {errors.client_id}
                </Form.Control.Feedback>
              )}
              {autoDetectedClient && (
                <div className="mt-2">
                  <Alert variant="success" className="py-2 mb-0">
                    <FiCheckCircle className="me-2" />
                    <strong>Cliente detectado automáticamente:</strong> {autoDetectedClient}
                  </Alert>
                </div>
              )}
            </Form.Group>
          </Col>
        )}
        
        {/* Información del cliente seleccionado */}
        {formData.client_id && (
          <Col md={12}>
            <Card className="border-success">
              <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <FiCheckCircle className="me-2" />
                  Cliente Seleccionado
                </h6>
                <Button 
                  variant="outline-light" 
                  size="sm" 
                  onClick={handleClearClient}
                  className="d-flex align-items-center"
                >
                  <FiX className="me-1" />
                  Cambiar
                </Button>
              </Card.Header>
              <Card.Body>
                <div className="row">
                  <div className="col-md-6">
                    <strong>Nombre:</strong> {formData.client_name}
                  </div>
                  <div className="col-md-6">
                    <strong>{formData.clientType === 'empresa' ? 'RUC' : 'DNI'}:</strong> {formData.client_info.ruc || formData.client_info.dni}
                  </div>
                  <div className="col-md-12 mt-2">
                    <strong>Dirección:</strong> {formData.client_info.address}
                  </div>
                  {formData.client_info.phone && (
                    <div className="col-md-6 mt-2">
                      <strong>Teléfono:</strong> {formData.client_info.phone}
                    </div>
                  )}
                  {formData.client_info.email && (
                    <div className="col-md-6 mt-2">
                      <strong>Email:</strong> {formData.client_info.email}
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
        
        {/* Datos del proyecto */}
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
      <div className="text-center mb-5">
        <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 mb-3" style={{ width: '64px', height: '64px' }}>
          <FiMessageSquare size={28} className="text-success" />
        </div>
        <h3 className="fw-bold text-dark mb-2">Información de Contacto</h3>
        <p className="text-muted">Datos de la persona responsable del proyecto</p>
      </div>
      
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
      </Row>
    </div>
  );

  const renderStep3 = () => (
    <div className="step-content">
      <div className="text-center mb-5">
        <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-warning bg-opacity-10 mb-3" style={{ width: '64px', height: '64px' }}>
          <FiSettings size={28} className="text-warning" />
        </div>
        <h3 className="fw-bold text-dark mb-2">Requisitos del Proyecto</h3>
        <p className="text-muted">Selecciona los tipos de servicios que requiere este proyecto</p>
      </div>
      
      <Alert variant="info" className="mb-4">
        <div className="d-flex align-items-center">
          <FiTool className="me-2" />
          <div>
            <strong>Selecciona los tipos de servicios que requiere este proyecto</strong>
            <br />
            <small>Esto ayudará a determinar qué áreas del laboratorio trabajarán en el proyecto</small>
          </div>
        </div>
      </Alert>
      
      <Row className="g-4">
        <Col md={6}>
          <Card 
            className={`h-100 border-0 shadow-sm service-card ${formData.requiere_laboratorio ? 'selected' : ''}`}
            style={{ 
              borderRadius: '16px',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              border: formData.requiere_laboratorio ? '2px solid #667eea' : '2px solid transparent'
            }}
            onClick={() => handleInputChange('requiere_laboratorio', !formData.requiere_laboratorio)}
          >
            <Card.Body className="text-center p-4">
              <div className="service-icon mb-3">
                <FiTool 
                  size={48} 
                  className={formData.requiere_laboratorio ? 'text-white' : 'text-primary'} 
                />
      </div>
              <h5 className="fw-bold mb-2">Laboratorio</h5>
              <p className="text-muted small mb-4">
                Ensayos de laboratorio, análisis de muestras, pruebas técnicas
              </p>
              <Form.Check
                type="checkbox"
                id="requiere_laboratorio"
                label="Requiere servicios de laboratorio"
                checked={formData.requiere_laboratorio || false}
                onChange={(e) => handleInputChange('requiere_laboratorio', e.target.checked)}
                className="d-flex justify-content-center"
                style={{ pointerEvents: 'none' }}
              />
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card 
            className={`h-100 border-0 shadow-sm service-card ${formData.requiere_ingenieria ? 'selected' : ''}`}
            style={{ 
              borderRadius: '16px',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              border: formData.requiere_ingenieria ? '2px solid #56ab2f' : '2px solid transparent'
            }}
            onClick={() => handleInputChange('requiere_ingenieria', !formData.requiere_ingenieria)}
          >
            <Card.Body className="text-center p-4">
              <div className="service-icon mb-3">
                <FiHome 
                  size={48} 
                  className={formData.requiere_ingenieria ? 'text-white' : 'text-success'} 
                />
                  </div>
              <h5 className="fw-bold mb-2">Ingeniería</h5>
              <p className="text-muted small mb-4">
                Diseño, consultoría técnica, supervisión de obras
              </p>
              <Form.Check
                type="checkbox"
                id="requiere_ingenieria"
                label="Requiere servicios de ingeniería"
                checked={formData.requiere_ingenieria || false}
                onChange={(e) => handleInputChange('requiere_ingenieria', e.target.checked)}
                className="d-flex justify-content-center"
                style={{ pointerEvents: 'none' }}
              />
            </Card.Body>
          </Card>
        </Col>
        
                <Col md={6}>
          <Card 
            className={`h-100 border-0 shadow-sm service-card ${formData.requiere_capacitacion ? 'selected' : ''}`}
            style={{ 
              borderRadius: '16px',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              border: formData.requiere_capacitacion ? '2px solid #3498db' : '2px solid transparent'
            }}
            onClick={() => handleInputChange('requiere_capacitacion', !formData.requiere_capacitacion)}
          >
            <Card.Body className="text-center p-4">
              <div className="service-icon mb-3">
                <FiBookOpen 
                  size={48} 
                  className={formData.requiere_capacitacion ? 'text-white' : 'text-info'} 
                />
                  </div>
              <h5 className="fw-bold mb-2">Capacitación</h5>
              <p className="text-muted small mb-4">
                Entrenamiento, cursos, formación técnica
              </p>
              <Form.Check
                type="checkbox"
                id="requiere_capacitacion"
                label="Requiere servicios de capacitación"
                checked={formData.requiere_capacitacion || false}
                onChange={(e) => handleInputChange('requiere_capacitacion', e.target.checked)}
                className="d-flex justify-content-center"
                style={{ pointerEvents: 'none' }}
              />
          </Card.Body>
        </Card>
        </Col>
      </Row>
      
      {/* Validación de al menos un servicio */}
      {!formData.requiere_laboratorio && !formData.requiere_ingenieria && 
       !formData.requiere_capacitacion && (
        <Alert variant="warning" className="mt-3">
          <FiAlertTriangle className="me-2" />
          Debes seleccionar al menos un tipo de servicio para el proyecto
        </Alert>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="step-content">
      <div className="text-center mb-5">
        <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-info bg-opacity-10 mb-3" style={{ width: '64px', height: '64px' }}>
          <FiCheckCircle size={28} className="text-info" />
        </div>
        <h3 className="fw-bold text-dark mb-2">Resumen del Proyecto</h3>
        <p className="text-muted">Revisa la información antes de crear el proyecto</p>
      </div>
      
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
              <h6 className="mb-0">Requisitos del Proyecto</h6>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Tipos de servicios requeridos:</strong>
                  </div>
              <div className="d-flex flex-column gap-2">
                {formData.requiere_laboratorio && (
                  <div className="d-flex align-items-center">
                    <FiTool className="text-primary me-2" />
                    <span>Laboratorio</span>
                  </div>
                )}
                {formData.requiere_ingenieria && (
                  <div className="d-flex align-items-center">
                    <FiHome className="text-success me-2" />
                    <span>Ingeniería</span>
                  </div>
                )}
                {formData.requiere_capacitacion && (
                  <div className="d-flex align-items-center">
                    <FiBookOpen className="text-info me-2" />
                    <span>Capacitación</span>
                  </div>
                )}
                {!formData.requiere_laboratorio && !formData.requiere_ingenieria && 
                 !formData.requiere_capacitacion && (
                <div className="text-muted">
                  <FiX className="me-1" />
                    No hay requisitos seleccionados
                </div>
              )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
    </div>
  );

  return (
    <div className="project-form-redesigned" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Modern Progress Indicator */}
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0 fw-bold text-dark">Crear Nuevo Proyecto</h4>
          <div className="d-flex align-items-center">
            <span className="text-muted me-2">Paso {currentStep} de {totalSteps}</span>
            <div className="progress" style={{ width: '120px', height: '6px' }}>
              <div 
                className="progress-bar bg-gradient-primary" 
                style={{ 
                  width: `${(currentStep / totalSteps) * 100}%`,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '3px'
                }}
              ></div>
        </div>
          </div>
      </div>
      
        {/* Modern Step Navigation */}
        <div className="step-navigation">
          {Array.from({ length: totalSteps }, (_, index) => {
            const step = index + 1;
            const isActive = step === currentStep;
            const isCompleted = step < currentStep;
            
            return (
                <div 
                key={step} 
                className={`step-item ${isActive ? 'active' : isCompleted ? 'completed' : ''}`}
                  onClick={() => setCurrentStep(step)}
                >
                <div className="step-icon">
                  {isCompleted ? <FiCheckCircle /> : getStepIcon(step)}
                  </div>
                <div className="step-content">
                  <div className="step-title">{getStepTitle(step)}</div>
                  <div className="step-subtitle">
                    {step === 1 && 'Información del cliente y proyecto'}
                    {step === 2 && 'Datos de contacto'}
                    {step === 3 && 'Tipos de servicios requeridos'}
                    {step === 4 && 'Revisar y confirmar'}
                  </div>
                </div>
                {step < totalSteps && <div className="step-connector"></div>}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Modern Content Card */}
      <Card className="border-0 shadow-lg mb-4" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <Card.Body className="p-5">
          <div className="step-content-wrapper">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          </div>
        </Card.Body>
      </Card>
      
      {/* Modern Navigation Buttons */}
      <div className="d-flex justify-content-between align-items-center">
        <Button 
          variant="outline-secondary" 
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="px-4 py-2 rounded-pill"
          style={{ 
            border: '2px solid #e9ecef',
            fontWeight: '500',
            minWidth: '120px'
          }}
        >
          <FiX className="me-2" />
          Anterior
        </Button>
        
        <div className="d-flex gap-3">
          {currentStep < totalSteps ? (
            <Button 
              variant="primary" 
              onClick={handleNext}
              className="px-5 py-2 rounded-pill fw-bold"
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                minWidth: '140px',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
              }}
            >
              Siguiente
              <FiPlus className="ms-2" />
            </Button>
          ) : (
            <Button 
              variant="success" 
              onClick={handleSubmit}
              disabled={loading}
              className="px-5 py-2 rounded-pill fw-bold"
              style={{ 
                background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
                border: 'none',
                minWidth: '160px',
                boxShadow: '0 4px 15px rgba(86, 171, 47, 0.4)'
              }}
            >
              {loading ? (
                <>
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  Creando...
                </>
              ) : (
                <>
                  Crear Proyecto
                  <FiCheckCircle className="ms-2" />
                </>
              )}
            </Button>
          )}
          
          <Button 
            variant="outline-danger" 
            onClick={onCancel}
            className="px-4 py-2 rounded-pill"
            style={{ 
              border: '2px solid #dc3545',
              color: '#dc3545',
              fontWeight: '500',
              minWidth: '120px'
            }}
          >
            Cancelar
          </Button>
        </div>
      </div>
      
      {/* Custom Styles */}
      <style jsx>{`
        .step-navigation {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          margin: 2rem 0;
        }
        
        .step-item {
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          z-index: 2;
        }
        
        .step-item:hover {
          transform: translateY(-2px);
        }
        
        .step-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: bold;
          transition: all 0.3s ease;
          margin-right: 12px;
          background: #f8f9fa;
          color: #6c757d;
          border: 3px solid #e9ecef;
        }
        
        .step-item.active .step-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: #667eea;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        
        .step-item.completed .step-icon {
          background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
          color: white;
          border-color: #56ab2f;
        }
        
        .step-content {
          flex: 1;
        }
        
        .step-title {
          font-weight: 600;
          font-size: 14px;
          color: #495057;
          margin-bottom: 2px;
        }
        
        .step-item.active .step-title {
          color: #667eea;
          font-weight: 700;
        }
        
        .step-item.completed .step-title {
          color: #56ab2f;
        }
        
        .step-subtitle {
          font-size: 12px;
          color: #6c757d;
          line-height: 1.3;
        }
        
        .step-connector {
          position: absolute;
          top: 24px;
          left: 100%;
          width: 100%;
          height: 2px;
          background: #e9ecef;
          z-index: 1;
        }
        
        .step-item.completed + .step-item .step-connector {
          background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
        }
        
        .step-content-wrapper {
          min-height: 400px;
        }
        
        .bg-gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .service-card {
          transition: all 0.3s ease;
        }
        
        .service-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
        }
        
        .service-card.selected {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.2) !important;
        }
        
        .service-card.selected .service-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem auto;
        }
        
        .service-card:not(.selected) .service-icon {
          background: rgba(0,0,0,0.05);
          border-radius: 50%;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem auto;
        }
        
        @media (max-width: 768px) {
          .step-navigation {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .step-item {
            width: 100%;
            margin-bottom: 1rem;
          }
          
          .step-connector {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
