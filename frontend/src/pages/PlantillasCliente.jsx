import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Spinner, Alert, Table, Modal } from 'react-bootstrap';
import { FiUser, FiFileText, FiEdit, FiCopy, FiTrash2, FiEye, FiPlus, FiSearch, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import ConfirmModal from '../components/common/ConfirmModal';
import api from '../services/api';

const PlantillasCliente = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    client: '',
    search: ''
  });

  // Modal para crear/editar plantilla
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [deletingTemplate, setDeletingTemplate] = useState(null);
  const [templateData, setTemplateData] = useState({
    name: '',
    client_id: '',
    description: '',
    services: [
      { code: '', description: '', norm: '', unit_price: 0, quantity: 1 }
    ]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener plantillas del usuario
      const templatesData = await api('/api/templates/client');
      setTemplates(templatesData || []);

      // Obtener clientes
      const clientsData = await api('/api/companies');
      setClients(clientsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error al cargar los datos: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    if (filters.client && template.client_id !== filters.client) return false;
    if (filters.search && !template.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const openTemplateModal = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setTemplateData({
        name: template.name,
        client_id: template.client_id,
        description: template.description,
        services: template.services || [{ code: '', description: '', norm: '', unit_price: 0, quantity: 1 }]
      });
    } else {
      setEditingTemplate(null);
      setTemplateData({
        name: '',
        client_id: '',
        description: '',
        services: [{ code: '', description: '', norm: '', unit_price: 0, quantity: 1 }]
      });
    }
    setShowTemplateModal(true);
  };

  const handleSaveTemplate = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = editingTemplate 
        ? `/api/templates/${editingTemplate.id}` 
        : '/api/templates';
      
      const method = editingTemplate ? 'PUT' : 'POST';

      await api(url, {
        method,
        body: templateData
      });

      setShowTemplateModal(false);
      setEditingTemplate(null);
      setTemplateData({
        name: '',
        client_id: '',
        description: '',
        services: [{ code: '', description: '', norm: '', unit_price: 0, quantity: 1 }]
      });

      await fetchData();

    } catch (error) {
      setError('Error al guardar plantilla: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = (template) => {
    setDeletingTemplate(template);
  };

  const confirmDeleteTemplate = async () => {
    try {
      await api(`/api/templates/${deletingTemplate.id}`, { method: 'DELETE' });
      await fetchData();
      setDeletingTemplate(null);
    } catch (error) {
      setError('Error al eliminar plantilla: ' + (error.message || 'Error desconocido'));
      setDeletingTemplate(null);
    }
  };

  const handleCopyTemplate = async (template) => {
    try {
      setLoading(true);
      setError(null);

      const newTemplate = {
        ...template,
        name: `${template.name} (Copia)`,
        id: undefined
      };

      await api('/api/templates', {
        method: 'POST',
        body: newTemplate
      });

      await fetchData();

    } catch (error) {
      setError('Error al copiar plantilla: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = (template) => {
    // Navegar a cotización inteligente con datos de la plantilla
    const templateData = encodeURIComponent(JSON.stringify(template));
    window.location.href = `/cotizaciones/inteligente?template=${templateData}`;
  };

  const addService = () => {
    setTemplateData(prev => ({
      ...prev,
      services: [...prev.services, { code: '', description: '', norm: '', unit_price: 0, quantity: 1 }]
    }));
  };

  const removeService = (index) => {
    if (templateData.services.length > 1) {
      setTemplateData(prev => ({
        ...prev,
        services: prev.services.filter((_, i) => i !== index)
      }));
    }
  };

  const updateService = (index, field, value) => {
    setTemplateData(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      )
    }));
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-2">Cargando plantillas...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>📋 Plantillas por Cliente</h2>
          <p className="text-muted">Guarda y reutiliza cotizaciones por cliente</p>
        </Col>
        <Col md="auto">
          <Button variant="primary" onClick={() => openTemplateModal()}>
            <FiPlus className="me-2" />
            Nueva Plantilla
          </Button>
        </Col>
      </Row>

      {/* Filtros */}
      <Row className="mb-4">
        <Col md={4}>
          <Form.Select
            value={filters.client}
            onChange={(e) => setFilters(prev => ({ ...prev, client: e.target.value }))}
          >
            <option value="">Todos los clientes</option>
            {Array.isArray(clients) && clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Buscar plantilla..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </Col>
        <Col md={4}>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" onClick={fetchData}>
              <FiRefreshCw className="me-2" />
              Actualizar
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => setFilters({ client: '', search: '' })}
            >
              Limpiar
            </Button>
          </div>
        </Col>
      </Row>

      {/* Lista de plantillas */}
      <Row>
        {filteredTemplates.length === 0 ? (
          <Col>
            <Card>
              <Card.Body className="text-center py-5">
                <FiFileText size={48} className="text-muted mb-3" />
                <h5>No hay plantillas</h5>
                <p className="text-muted">
                  {Object.values(filters).some(f => f) 
                    ? 'No se encontraron plantillas con los filtros aplicados'
                    : 'No tienes plantillas guardadas'
                  }
                </p>
                <Button variant="primary" onClick={() => openTemplateModal()}>
                  <FiPlus className="me-2" />
                  Crear Primera Plantilla
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          filteredTemplates.map((template) => (
            <Col key={template.id} md={6} lg={4} className="mb-3">
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <strong>{template.name}</strong>
                  <Badge bg="info">{template.client_name}</Badge>
                </Card.Header>
                <Card.Body>
                  <div className="mb-2">
                    <strong>Cliente:</strong> {template.client_name || 'N/A'}
                  </div>
                  <div className="mb-2">
                    <strong>Descripción:</strong> {template.description || 'Sin descripción'}
                  </div>
                  <div className="mb-2">
                    <strong>Servicios:</strong> {template.services?.length || 0}
                  </div>
                  <div className="mb-2">
                    <strong>Creada:</strong> {new Date(template.created_at).toLocaleDateString()}
                  </div>
                  
                  <div className="d-flex gap-2 mt-3">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleUseTemplate(template)}
                    >
                      <FiCopy className="me-1" />
                      Usar
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => openTemplateModal(template)}
                    >
                      <FiEdit className="me-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => handleCopyTemplate(template)}
                    >
                      <FiCopy className="me-1" />
                      Copiar
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template)}
                    >
                      <FiTrash2 className="me-1" />
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Modal para crear/editar plantilla */}
      <Modal show={showTemplateModal} onHide={() => setShowTemplateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre de la Plantilla *</Form.Label>
                <Form.Control
                  type="text"
                  value={templateData.name}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Cliente *</Form.Label>
                <Form.Select
                  value={templateData.client_id}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, client_id: e.target.value }))}
                  required
                >
                  <option value="">Seleccionar cliente</option>
                  {Array.isArray(clients) && clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={templateData.description}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, description: e.target.value }))}
                />
              </Form.Group>
            </Col>
          </Row>

          <h6>Servicios de la Plantilla:</h6>
          {templateData.services.map((service, index) => (
            <Card key={index} className="mb-3">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h6>Servicio {index + 1}</h6>
                {templateData.services.length > 1 && (
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTemplateModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleSaveTemplate} disabled={loading}>
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Guardando...
              </>
            ) : (
              <>
                <FiFileText className="me-2" />
                {editingTemplate ? 'Actualizar' : 'Crear'} Plantilla
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmación para eliminar plantilla */}
      <ConfirmModal
        show={!!deletingTemplate}
        onHide={() => setDeletingTemplate(null)}
        onConfirm={confirmDeleteTemplate}
        title="Eliminar Plantilla"
        message={`¿Estás seguro de que quieres eliminar la plantilla "${deletingTemplate?.name}"?`}
        confirmText="Eliminar"
        variant="danger"
        alertMessage="Esta acción eliminará permanentemente la plantilla y no se puede deshacer."
        alertVariant="warning"
      />
    </Container>
  );
};

export default PlantillasCliente;
