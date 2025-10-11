import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert, Spinner, Badge } from 'react-bootstrap';
import { 
  FiMessageSquare, FiUser, FiCalendar, FiFlag, FiLayers, 
  FiTag, FiClock, FiFileText, FiX, FiCheckCircle 
} from 'react-icons/fi';

const MODULES = [
  { value: 'sistema', label: 'Sistema' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'laboratorio', label: 'Laboratorio' },
  { value: 'facturacion', label: 'Facturación' },
  { value: 'soporte', label: 'Soporte' },
  { value: 'gerencia', label: 'Gerencia' }
];

const CATEGORIES = [
  { value: 'tecnico', label: 'Técnico' },
  { value: 'funcional', label: 'Funcional' },
  { value: 'usuario', label: 'Usuario' },
  { value: 'sistema', label: 'Sistema' },
  { value: 'reporte', label: 'Reporte' },
  { value: 'integracion', label: 'Integración' }
];

const TYPES = [
  { value: 'bug', label: 'Bug/Error' },
  { value: 'mejora', label: 'Mejora' },
  { value: 'consulta', label: 'Consulta' },
  { value: 'solicitud', label: 'Solicitud' },
  { value: 'incidente', label: 'Incidente' }
];

const PRIORITIES = [
  { value: 'baja', label: 'Baja', color: 'success' },
  { value: 'media', label: 'Media', color: 'warning' },
  { value: 'alta', label: 'Alta', color: 'danger' },
  { value: 'critica', label: 'Crítica', color: 'dark' }
];

const TicketFormModern = ({ show, onHide, data, onSubmit, loading, isEditing }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'media',
    module: 'sistema',
    category: 'tecnico',
    type: 'solicitud',
    assigned_to: '',
    estimated_time: '',
    tags: '',
    additional_notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || '',
        description: data.description || '',
        priority: data.priority || 'media',
        module: data.module || 'sistema',
        category: data.category || 'tecnico',
        type: data.type || 'solicitud',
        assigned_to: data.assigned_to || '',
        estimated_time: data.estimated_time || '',
        tags: data.tags || '',
        additional_notes: data.additional_notes || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'media',
        module: 'sistema',
        category: 'tecnico',
        type: 'solicitud',
        assigned_to: '',
        estimated_time: '',
        tags: '',
        additional_notes: ''
      });
    }
    setErrors({});
  }, [data, show]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }
    
    if (!formData.module) {
      newErrors.module = 'El módulo es requerido';
    }
    
    if (!formData.category) {
      newErrors.category = 'La categoría es requerida';
    }
    
    if (!formData.type) {
      newErrors.type = 'El tipo es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered className="ticket-modal-modern">
      <Modal.Header closeButton className="ticket-modal-header">
        <div className="d-flex align-items-center">
          <FiMessageSquare className="me-2 text-primary" size={24} />
          <div>
            <Modal.Title className="mb-0">
              {isEditing ? 'Editar Ticket' : 'Nuevo Ticket'}
            </Modal.Title>
            <small className="text-muted">
              {isEditing ? 'Modifica la información del ticket' : 'Crea un nuevo ticket de soporte'}
            </small>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="ticket-modal-body">
        <form onSubmit={handleSubmit} className="ticket-form-modern">
          {/* Información del Ticket */}
          <div className="ticket-form-section">
            <div className="ticket-form-section-title">
              <FiMessageSquare className="ticket-form-icon" />
              Información del Ticket
            </div>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="ticket-form-label">
                    <FiMessageSquare className="me-2" />
                    Título del Ticket *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Describe brevemente el problema o solicitud"
                    isInvalid={!!errors.title}
                    className="ticket-form-input"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.title}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="ticket-form-label">
                    <FiFileText className="me-2" />
                    Descripción Detallada *
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Proporciona todos los detalles necesarios para resolver el ticket"
                    isInvalid={!!errors.description}
                    className="ticket-form-textarea"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.description}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* Clasificación del Ticket */}
          <div className="ticket-form-section">
            <div className="ticket-form-section-title">
              <FiLayers className="ticket-form-icon" />
              Clasificación del Ticket
            </div>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="ticket-form-label">
                    <FiLayers className="me-2" />
                    Módulo *
                  </Form.Label>
                  <Form.Select
                    value={formData.module}
                    onChange={(e) => handleChange('module', e.target.value)}
                    isInvalid={!!errors.module}
                    className="ticket-form-select"
                  >
                    {MODULES.map(module => (
                      <option key={module.value} value={module.value}>
                        {module.label}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.module}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="ticket-form-label">
                    <FiTag className="me-2" />
                    Categoría *
                  </Form.Label>
                  <Form.Select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    isInvalid={!!errors.category}
                    className="ticket-form-select"
                  >
                    {CATEGORIES.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.category}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="ticket-form-label">
                    <FiFlag className="me-2" />
                    Tipo *
                  </Form.Label>
                  <Form.Select
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    isInvalid={!!errors.type}
                    className="ticket-form-select"
                  >
                    {TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.type}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="ticket-form-label">
                    <FiFlag className="me-2" />
                    Prioridad
                  </Form.Label>
                  <Form.Select
                    value={formData.priority}
                    onChange={(e) => handleChange('priority', e.target.value)}
                    className="ticket-form-select"
                  >
                    {PRIORITIES.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="ticket-form-label">
                    <FiUser className="me-2" />
                    Asignado a
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.assigned_to}
                    onChange={(e) => handleChange('assigned_to', e.target.value)}
                    placeholder="Nombre del responsable"
                    className="ticket-form-input"
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* Metadatos Adicionales */}
          <div className="ticket-form-section">
            <div className="ticket-form-section-title">
              <FiTag className="ticket-form-icon" />
              Metadatos Adicionales
            </div>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="ticket-form-label">
                    <FiClock className="me-2" />
                    Tiempo Estimado
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.estimated_time}
                    onChange={(e) => handleChange('estimated_time', e.target.value)}
                    placeholder="Ej: 2 horas, 1 día"
                    className="ticket-form-input"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="ticket-form-label">
                    <FiTag className="me-2" />
                    Tags
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.tags}
                    onChange={(e) => handleChange('tags', e.target.value)}
                    placeholder="urgente, bug, frontend"
                    className="ticket-form-input"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="ticket-form-label">
                    <FiFileText className="me-2" />
                    Notas Adicionales
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.additional_notes}
                    onChange={(e) => handleChange('additional_notes', e.target.value)}
                    placeholder="Información adicional, contexto, o comentarios especiales"
                    className="ticket-form-textarea"
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>
        </form>
      </Modal.Body>

      <Modal.Footer className="ticket-modal-footer">
        <Button variant="outline-secondary" onClick={onHide} disabled={loading}>
          <FiX className="me-2" />
          Cancelar
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit} 
          disabled={loading}
          className="ticket-form-submit-btn"
        >
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" />
              {isEditing ? 'Actualizando...' : 'Creando...'}
            </>
          ) : (
            <>
              <FiCheckCircle className="me-2" />
              {isEditing ? 'Actualizar Ticket' : 'Crear Ticket'}
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TicketFormModern;
