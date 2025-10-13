import React, { useState } from 'react';
import { Modal, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { FiSave, FiX, FiUser, FiMail, FiPhone, FiMapPin, FiHome, FiActivity, FiPlus } from 'react-icons/fi';
import { createCompany } from '../services/companies';
import { listUsers } from '../services/users';

const ClientCreateModal = ({ show, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    ruc: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    sector: '',
    priority: 'normal',
    status: 'prospeccion',
    assigned_user_id: null,
    actividad: '',
    servicios: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const queryClient = useQueryClient();

  // Obtener lista de usuarios para asignación
  const { data: usersData, isLoading: isLoadingUsers } = useQuery(
    ['users'],
    () => listUsers(),
    {
      enabled: show
    }
  );

  const users = usersData?.users || [];

  // Mutación para crear cliente
  const createClientMutation = useMutation(
    (data) => createCompany(data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['commercial-clients']);
        queryClient.invalidateQueries(['commercial-clients-with-totals']);
        if (onSuccess) {
          onSuccess(data);
        }
        handleClose();
      },
      onError: (error) => {
        console.error('Error creando cliente:', error);
        alert('❌ Error al crear cliente');
      }
    }
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del cliente es requerido';
    }
    
    if (!formData.contact_name.trim()) {
      newErrors.contact_name = 'El nombre de contacto es requerido';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createClientMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Error en submit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      ruc: '',
      contact_name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      sector: '',
      status: 'prospeccion',
      assigned_user_id: null,
      actividad: '',
      servicios: ''
    });
    setErrors({});
    onHide();
  };

  const statusOptions = [
    { value: 'prospeccion', label: 'Prospección' },
    { value: 'interesado', label: 'Interesado' },
    { value: 'pendiente_cotizacion', label: 'Pendiente Cotización' },
    { value: 'cotizacion_enviada', label: 'Cotización Enviada' },
    { value: 'negociacion', label: 'Negociación' },
    { value: 'ganado', label: 'Ganado' },
    { value: 'perdido', label: 'Perdido' }
  ];

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <FiPlus className="me-2" />
          Crear Nuevo Cliente
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {Object.keys(errors).length > 0 && (
            <Alert variant="danger">
              <strong>Por favor corrige los siguientes errores:</strong>
              <ul className="mb-0 mt-2">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}
          
          <Row className="g-3">
            {/* Información Básica */}
            <Col md={12}>
              <h6 className="text-primary mb-3">
                <FiHome className="me-2" />
                Información Básica
              </h6>
            </Col>
            
            <Col md={6}>
              <Form.Group>
                <Form.Label>Nombre del Cliente *</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  isInvalid={!!errors.name}
                  placeholder="Nombre de la empresa"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group>
                <Form.Label>RUC</Form.Label>
                <Form.Control
                  type="text"
                  name="ruc"
                  value={formData.ruc}
                  onChange={handleInputChange}
                  placeholder="RUC de la empresa"
                />
              </Form.Group>
            </Col>
            
            {/* Información de Contacto */}
            <Col md={12}>
              <h6 className="text-primary mb-3 mt-4">
                <FiUser className="me-2" />
                Información de Contacto
              </h6>
            </Col>
            
            <Col md={6}>
              <Form.Group>
                <Form.Label>Nombre de Contacto *</Form.Label>
                <Form.Control
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleInputChange}
                  isInvalid={!!errors.contact_name}
                  placeholder="Nombre del contacto principal"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.contact_name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  isInvalid={!!errors.email}
                  placeholder="email@empresa.com"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group>
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+51 999 999 999"
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group>
                <Form.Label>Ciudad</Form.Label>
                <Form.Control
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Ciudad"
                />
              </Form.Group>
            </Col>
            
            <Col md={12}>
              <Form.Group>
                <Form.Label>Dirección</Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Dirección completa"
                />
              </Form.Group>
            </Col>
            
            {/* Información Comercial */}
            <Col md={12}>
              <h6 className="text-primary mb-3 mt-4">
                <FiActivity className="me-2" />
                Información Comercial
              </h6>
            </Col>
            
            <Col md={6}>
              <Form.Group>
                <Form.Label>Estado</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group>
                <Form.Label>Asignado a</Form.Label>
                <Form.Select
                  name="assigned_user_id"
                  value={formData.assigned_user_id || ''}
                  onChange={handleInputChange}
                  disabled={isLoadingUsers}
                >
                  <option value="">Sin asignar</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group>
                <Form.Label>Sector</Form.Label>
                <Form.Control
                  type="text"
                  name="sector"
                  value={formData.sector}
                  onChange={handleInputChange}
                  placeholder="Sector de la empresa"
                />
                <Form.Text className="text-muted">
                  Ejemplo: Laboratorio, Construcción, Minería, etc.
                </Form.Text>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group>
                <Form.Label>Prioridad</Form.Label>
                <Form.Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="urgent">URGENTE</option>
                  <option value="high">ALTA</option>
                  <option value="normal">NORMAL</option>
                  <option value="low">BAJA</option>
                </Form.Select>
                <Form.Text className="text-muted">
                  Nivel de prioridad del cliente
                </Form.Text>
              </Form.Group>
            </Col>
            
            {/* Actividad y Servicios */}
            <Col md={12}>
              <h6 className="text-primary mb-3 mt-4">
                <FiActivity className="me-2" />
                Actividad y Servicios
              </h6>
            </Col>
            
            <Col md={12}>
              <Form.Group>
                <Form.Label>Actividad Principal</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="actividad"
                  value={formData.actividad}
                  onChange={handleInputChange}
                  placeholder="Describe la actividad principal de la empresa"
                />
                <Form.Text className="text-muted">
                  Describe brevemente a qué se dedica la empresa
                </Form.Text>
              </Form.Group>
            </Col>
            
            <Col md={12}>
              <Form.Group>
                <Form.Label>Servicios</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="servicios"
                  value={formData.servicios}
                  onChange={handleInputChange}
                  placeholder="Describe los servicios que ofrece o requiere la empresa"
                />
                <Form.Text className="text-muted">
                  Lista los servicios que ofrece o que necesita la empresa
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            <FiX className="me-1" />
            Cancelar
          </Button>
          <Button 
            variant="success" 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="me-1" />
                Creando...
              </>
            ) : (
              <>
                <FiSave className="me-1" />
                Crear Cliente
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ClientCreateModal;
