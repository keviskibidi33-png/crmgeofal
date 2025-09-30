import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { FiUser, FiFileText, FiCheck, FiArrowRight, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { createQuote } from '../services/quotes';
import { getOrCreateCompany, listCompanies } from '../services/companies';
import { createProject } from '../services/projects';

const CotizacionInteligenteSimplificada = () => {
  const { user } = useAuth();
  
  // Estados del flujo
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Datos del formulario
  const [formData, setFormData] = useState({
    // Paso 1: Cliente
    client: {
      company_name: '',
      ruc: '',
      contact_name: '',
      contact_phone: '',
      contact_email: '',
      project_location: ''
    },
    // Paso 2: Proyecto
    project: {
      name: '',
      description: '',
      location: ''
    },
    // Paso 3: Cotización
    quote: {
      request_date: new Date().toISOString().split('T')[0],
      issue_date: new Date().toISOString().split('T')[0],
      commercial_name: user?.name || '',
      commercial_phone: user?.phone || '',
      payment_terms: 'adelantado',
      reference: '',
      delivery_days: 4
    },
    // Paso 4: Servicios
    services: [
      { code: '', description: '', norm: '', unit_price: 0, quantity: 1 }
    ]
  });

  // Búsqueda de clientes
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [clientSearch, setClientSearch] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // Cargar clientes existentes
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const clientList = await listCompanies();
      setClients(clientList);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  // Filtrar clientes
  useEffect(() => {
    if (clientSearch.length > 2) {
      const filtered = clients.filter(client => 
        client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        client.ruc.includes(clientSearch)
      );
      setFilteredClients(filtered);
      setShowClientDropdown(true);
    } else {
      setFilteredClients([]);
      setShowClientDropdown(false);
    }
  }, [clientSearch, clients]);

  // Seleccionar cliente existente
  const selectClient = (client) => {
    setFormData(prev => ({
      ...prev,
      client: {
        company_name: client.name,
        ruc: client.ruc,
        contact_name: client.contact_name || '',
        contact_phone: client.contact_phone || '',
        contact_email: client.contact_email || '',
        project_location: ''
      }
    }));
    setClientSearch(client.name);
    setShowClientDropdown(false);
  };

  // Agregar/quitar servicios
  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, { code: '', description: '', norm: '', unit_price: 0, quantity: 1 }]
    }));
  };

  const removeService = (index) => {
    if (formData.services.length > 1) {
      setFormData(prev => ({
        ...prev,
        services: prev.services.filter((_, i) => i !== index)
      }));
    }
  };

  const updateService = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      )
    }));
  };

  // Calcular totales
  const calculateTotals = () => {
    const subtotal = formData.services.reduce((sum, service) => 
      sum + (service.unit_price * service.quantity), 0
    );
    const igv = subtotal * 0.18;
    const total = subtotal + igv;
    
    return { subtotal, igv, total };
  };

  // Guardar cotización
  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Validaciones
      if (!formData.client.company_name) {
        throw new Error('El nombre de la empresa es requerido');
      }
      if (!formData.client.ruc) {
        throw new Error('El RUC es requerido');
      }
      if (!formData.project.name) {
        throw new Error('El nombre del proyecto es requerido');
      }
      if (formData.services.some(s => !s.description || s.unit_price <= 0)) {
        throw new Error('Todos los servicios deben tener descripción y precio válido');
      }

      // Crear o obtener empresa
      const company = await getOrCreateCompany({
        name: formData.client.company_name,
        ruc: formData.client.ruc,
        contact_name: formData.client.contact_name,
        contact_phone: formData.client.contact_phone,
        contact_email: formData.client.contact_email
      });

      // Crear proyecto
      const project = await createProject({
        name: formData.project.name,
        description: formData.project.description,
        location: formData.client.project_location,
        company_id: company.id
      });

      // Crear cotización
      const totals = calculateTotals();
      const quote = await createQuote({
        project_id: project.id,
        client_contact: formData.client.contact_name,
        client_email: formData.client.contact_email,
        client_phone: formData.client.contact_phone,
        issue_date: formData.quote.issue_date,
        subtotal: totals.subtotal,
        igv: totals.igv,
        total: totals.total,
        status: 'borrador',
        reference: formData.quote.reference,
        meta: {
          customer: formData.client,
          quote: formData.quote,
          items: formData.services
        }
      });

      setSuccess(`¡Cotización creada exitosamente! ID: ${quote.id}`);
      
      // Resetear formulario
      setFormData({
        client: { company_name: '', ruc: '', contact_name: '', contact_phone: '', contact_email: '', project_location: '' },
        project: { name: '', description: '', location: '' },
        quote: { ...formData.quote, reference: '' },
        services: [{ code: '', description: '', norm: '', unit_price: 0, quantity: 1 }]
      });
      setCurrentStep(1);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>📋 Cotización Inteligente</h2>
          <p className="text-muted">Crea cotizaciones de forma simple y profesional</p>
        </Col>
      </Row>

      {/* Indicador de pasos */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="d-flex align-items-center">
                <div className={`rounded-circle d-flex align-items-center justify-content-center ${
                  currentStep >= step ? 'bg-primary text-white' : 'bg-light text-muted'
                }`} style={{ width: '40px', height: '40px' }}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`mx-2 ${currentStep > step ? 'text-primary' : 'text-muted'}`}>
                    <FiArrowRight />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="d-flex justify-content-between mt-2">
            <small className="text-muted">Cliente</small>
            <small className="text-muted">Proyecto</small>
            <small className="text-muted">Detalles</small>
            <small className="text-muted">Servicios</small>
          </div>
        </Col>
      </Row>

      {/* Paso 1: Cliente */}
      {currentStep === 1 && (
        <Card>
          <Card.Header>
            <h5><FiUser className="me-2" />Paso 1: Información del Cliente</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Buscar Cliente Existente</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Buscar por nombre o RUC..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                  />
                  {showClientDropdown && filteredClients.length > 0 && (
                    <div className="border rounded mt-1" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {filteredClients.map((client) => (
                        <div
                          key={client.id}
                          className="p-2 border-bottom cursor-pointer"
                          onClick={() => selectClient(client)}
                          style={{ cursor: 'pointer' }}
                        >
                          <strong>{client.name}</strong>
                          <br />
                          <small className="text-muted">RUC: {client.ruc}</small>
                        </div>
                      ))}
                    </div>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre de la Empresa *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.client.company_name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      client: { ...prev.client, company_name: e.target.value }
                    }))}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>RUC *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.client.ruc}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      client: { ...prev.client, ruc: e.target.value }
                    }))}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contacto</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.client.contact_name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      client: { ...prev.client, contact_name: e.target.value }
                    }))}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.client.contact_phone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      client: { ...prev.client, contact_phone: e.target.value }
                    }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.client.contact_email}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      client: { ...prev.client, contact_email: e.target.value }
                    }))}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Ubicación del Proyecto</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.client.project_location}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      client: { ...prev.client, project_location: e.target.value }
                    }))}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Paso 2: Proyecto */}
      {currentStep === 2 && (
        <Card>
          <Card.Header>
            <h5><FiFileText className="me-2" />Paso 2: Información del Proyecto</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre del Proyecto *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.project.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      project: { ...prev.project, name: e.target.value }
                    }))}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ubicación</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.client.project_location}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      client: { ...prev.client, project_location: e.target.value }
                    }))}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Descripción del Proyecto</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.project.description}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      project: { ...prev.project, description: e.target.value }
                    }))}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Paso 3: Detalles de Cotización */}
      {currentStep === 3 && (
        <Card>
          <Card.Header>
            <h5><FiFileText className="me-2" />Paso 3: Detalles de la Cotización</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha de Solicitud</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.quote.request_date}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      quote: { ...prev.quote, request_date: e.target.value }
                    }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha de Emisión</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.quote.issue_date}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      quote: { ...prev.quote, issue_date: e.target.value }
                    }))}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Asesor Comercial</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.quote.commercial_name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      quote: { ...prev.quote, commercial_name: e.target.value }
                    }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono Comercial</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.quote.commercial_phone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      quote: { ...prev.quote, commercial_phone: e.target.value }
                    }))}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Condiciones de Pago</Form.Label>
                  <Form.Select
                    value={formData.quote.payment_terms}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      quote: { ...prev.quote, payment_terms: e.target.value }
                    }))}
                  >
                    <option value="adelantado">Adelantado</option>
                    <option value="30_dias">30 días</option>
                    <option value="60_dias">60 días</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Días de Entrega</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.quote.delivery_days}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      quote: { ...prev.quote, delivery_days: parseInt(e.target.value) }
                    }))}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Referencia</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.quote.reference}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      quote: { ...prev.quote, reference: e.target.value }
                    }))}
                    placeholder="Ej: SEGÚN LO SOLICITADO VÍA CORREO ELECTRÓNICO"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Paso 4: Servicios */}
      {currentStep === 4 && (
        <Card>
          <Card.Header>
            <h5><FiFileText className="me-2" />Paso 4: Servicios y Precios</h5>
          </Card.Header>
          <Card.Body>
            {formData.services.map((service, index) => (
              <Card key={index} className="mb-3">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h6>Servicio {index + 1}</h6>
                  {formData.services.length > 1 && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeService(index)}
                    >
                      <FiTrash2 />
                    </Button>
                  )}
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Código</Form.Label>
                        <Form.Control
                          type="text"
                          value={service.code}
                          onChange={(e) => updateService(index, 'code', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Descripción *</Form.Label>
                        <Form.Control
                          type="text"
                          value={service.description}
                          onChange={(e) => updateService(index, 'description', e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Norma</Form.Label>
                        <Form.Control
                          type="text"
                          value={service.norm}
                          onChange={(e) => updateService(index, 'norm', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Precio Unitario (S/) *</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          value={service.unit_price}
                          onChange={(e) => updateService(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Cantidad *</Form.Label>
                        <Form.Control
                          type="number"
                          value={service.quantity}
                          onChange={(e) => updateService(index, 'quantity', parseInt(e.target.value) || 1)}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Subtotal (S/)</Form.Label>
                        <Form.Control
                          type="text"
                          value={(service.unit_price * service.quantity).toFixed(2)}
                          readOnly
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}

            <Button variant="outline-primary" onClick={addService}>
              <FiPlus className="me-2" />Agregar Servicio
            </Button>

            {/* Resumen de totales */}
            <Card className="mt-4">
              <Card.Header>
                <h6>Resumen de Totales</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <strong>Subtotal:</strong> S/ {totals.subtotal.toFixed(2)}
                  </Col>
                  <Col md={4}>
                    <strong>IGV (18%):</strong> S/ {totals.igv.toFixed(2)}
                  </Col>
                  <Col md={4}>
                    <strong>Total:</strong> S/ {totals.total.toFixed(2)}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Card.Body>
        </Card>
      )}

      {/* Mensajes de error y éxito */}
      {error && (
        <Alert variant="danger" className="mt-3">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="mt-3">
          {success}
        </Alert>
      )}

      {/* Botones de navegación */}
      <Row className="mt-4">
        <Col>
          <div className="d-flex justify-content-between">
            <Button
              variant="outline-secondary"
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
            >
              Anterior
            </Button>
            
            {currentStep < 4 ? (
              <Button
                variant="primary"
                onClick={() => setCurrentStep(prev => prev + 1)}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                variant="success"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <FiCheck className="me-2" />
                    Crear Cotización
                  </>
                )}
              </Button>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default CotizacionInteligenteSimplificada;
