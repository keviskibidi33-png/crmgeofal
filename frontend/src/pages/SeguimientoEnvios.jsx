import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form, Spinner, Alert, Table, Modal } from 'react-bootstrap';
import { FiEye, FiFileText, FiUser, FiCalendar, FiDollarSign, FiTrendingUp, FiRefreshCw, FiSend, FiCheck, FiClock, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const SeguimientoEnvios = () => {
  const { user } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    client: '',
    vendedor: ''
  });

  // Modal para marcar envío
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [statusData, setStatusData] = useState({
    status: '',
    notes: '',
    files: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener envíos según el rol del usuario
      const endpoint = user.role === 'usuario_laboratorio' 
        ? '/api/shipments/laboratory' 
        : '/api/shipments/commercial';
      
      const shipmentsData = await api(endpoint);
      setShipments(shipmentsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error al cargar los datos: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'enviado': { variant: 'primary', text: 'Enviado', icon: FiSend },
      'recibido': { variant: 'success', text: 'Recibido', icon: FiCheck },
      'en_proceso': { variant: 'warning', text: 'En Proceso', icon: FiClock },
      'completado': { variant: 'info', text: 'Completado', icon: FiCheck },
      'pendiente': { variant: 'secondary', text: 'Pendiente', icon: FiAlertCircle }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status, icon: FiAlertCircle };
    return (
      <Badge bg={config.variant}>
        <config.icon className="me-1" />
        {config.text}
      </Badge>
    );
  };

  const getStatusActions = (shipment) => {
    const actions = [];
    
    if (user.role === 'vendedor_comercial' || user.role === 'jefa_comercial') {
      if (shipment.status === 'enviado') {
        actions.push(
          <Button
            key="mark-received"
            variant="success"
            size="sm"
            onClick={() => openStatusModal(shipment, 'recibido')}
          >
            <FiCheck className="me-1" />
            Marcar Recibido
          </Button>
        );
      }
    }
    
    if (user.role === 'usuario_laboratorio') {
      if (shipment.status === 'recibido') {
        actions.push(
          <Button
            key="mark-processing"
            variant="warning"
            size="sm"
            onClick={() => openStatusModal(shipment, 'en_proceso')}
          >
            <FiClock className="me-1" />
            Marcar En Proceso
          </Button>
        );
      }
      
      if (shipment.status === 'en_proceso') {
        actions.push(
          <Button
            key="mark-completed"
            variant="info"
            size="sm"
            onClick={() => openStatusModal(shipment, 'completado')}
          >
            <FiCheck className="me-1" />
            Marcar Completado
          </Button>
        );
      }
    }
    
    actions.push(
      <Button
        key="view-details"
        variant="outline-primary"
        size="sm"
        onClick={() => {
          // Navegar a detalles del envío
          window.location.href = `/envios/${shipment.id}`;
        }}
      >
        <FiEye className="me-1" />
        Ver Detalles
      </Button>
    );
    
    return actions;
  };

  const openStatusModal = (shipment, newStatus) => {
    setSelectedShipment(shipment);
    setStatusData({
      status: newStatus,
      notes: '',
      files: []
    });
    setShowStatusModal(true);
  };

  const handleStatusUpdate = async () => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('status', statusData.status);
      formData.append('notes', statusData.notes);
      
      if (statusData.files.length > 0) {
        statusData.files.forEach(file => {
          formData.append('files', file);
        });
      }

      await api(`/api/shipments/${selectedShipment.id}/status`, {
        method: 'POST',
        body: formData
      });

      setShowStatusModal(false);
      setSelectedShipment(null);
      setStatusData({
        status: '',
        notes: '',
        files: []
      });

      await fetchData();

    } catch (error) {
      setError('Error al actualizar estado: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const filteredShipments = shipments.filter(shipment => {
    if (filters.status && shipment.status !== filters.status) return false;
    if (filters.client && !shipment.client_name?.toLowerCase().includes(filters.client.toLowerCase())) return false;
    if (filters.vendedor && !shipment.vendedor_name?.toLowerCase().includes(filters.vendedor.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-2">Cargando envíos...</p>
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
          <h2>📦 Seguimiento de Envíos</h2>
          <p className="text-muted">Seguimiento de envíos entre comercial y laboratorio</p>
        </Col>
        <Col md="auto">
          <Button variant="outline-secondary" onClick={fetchData}>
            <FiRefreshCw className="me-2" />
            Actualizar
          </Button>
        </Col>
      </Row>

      {/* Filtros */}
      <Row className="mb-4">
        <Col md={3}>
          <Form.Select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="">Todos los estados</option>
            <option value="enviado">Enviado</option>
            <option value="recibido">Recibido</option>
            <option value="en_proceso">En Proceso</option>
            <option value="completado">Completado</option>
            <option value="pendiente">Pendiente</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Control
            type="text"
            placeholder="Filtrar por cliente..."
            value={filters.client}
            onChange={(e) => setFilters(prev => ({ ...prev, client: e.target.value }))}
          />
        </Col>
        <Col md={3}>
          <Form.Control
            type="text"
            placeholder="Filtrar por vendedor..."
            value={filters.vendedor}
            onChange={(e) => setFilters(prev => ({ ...prev, vendedor: e.target.value }))}
          />
        </Col>
        <Col md={3}>
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              onClick={() => setFilters({ status: '', client: '', vendedor: '' })}
            >
              Limpiar
            </Button>
          </div>
        </Col>
      </Row>

      {/* Resumen de métricas */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FiFileText size={24} className="text-primary mb-2" />
              <h4>{shipments.length}</h4>
              <small className="text-muted">Total Envíos</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FiSend size={24} className="text-primary mb-2" />
              <h4>{shipments.filter(s => s.status === 'enviado').length}</h4>
              <small className="text-muted">Enviados</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FiClock size={24} className="text-warning mb-2" />
              <h4>{shipments.filter(s => s.status === 'en_proceso').length}</h4>
              <small className="text-muted">En Proceso</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FiCheck size={24} className="text-success mb-2" />
              <h4>{shipments.filter(s => s.status === 'completado').length}</h4>
              <small className="text-muted">Completados</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Lista de envíos */}
      <Row>
        {filteredShipments.length === 0 ? (
          <Col>
            <Card>
              <Card.Body className="text-center py-5">
                <FiFileText size={48} className="text-muted mb-3" />
                <h5>No hay envíos</h5>
                <p className="text-muted">
                  {Object.values(filters).some(f => f) 
                    ? 'No se encontraron envíos con los filtros aplicados'
                    : 'No hay envíos registrados'
                  }
                </p>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          filteredShipments.map((shipment) => (
            <Col key={shipment.id} md={6} lg={4} className="mb-3">
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <strong>{shipment.project_name}</strong>
                  {getStatusBadge(shipment.status)}
                </Card.Header>
                <Card.Body>
                  <div className="mb-2">
                    <strong>Cliente:</strong> {shipment.client_name || 'N/A'}
                  </div>
                  <div className="mb-2">
                    <strong>Vendedor:</strong> {shipment.vendedor_name || 'N/A'}
                  </div>
                  <div className="mb-2">
                    <strong>Proyecto:</strong> {shipment.project_name || 'N/A'}
                  </div>
                  <div className="mb-2">
                    <strong>Descripción:</strong> {shipment.description || 'Sin descripción'}
                  </div>
                  
                  <hr />
                  
                  <div className="mb-2">
                    <strong>Fecha de Envío:</strong> {new Date(shipment.sent_at).toLocaleDateString()}
                  </div>
                  <div className="mb-2">
                    <strong>Última Actualización:</strong> {new Date(shipment.updated_at).toLocaleDateString()}
                  </div>

                  {shipment.notes && (
                    <div className="mb-2">
                      <strong>Notas:</strong> {shipment.notes}
                    </div>
                  )}

                  <div className="d-flex gap-2 mt-3">
                    {getStatusActions(shipment)}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Modal para actualizar estado */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Actualizar Estado del Envío</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedShipment && (
            <div className="mb-3">
              <h6>Proyecto: {selectedShipment.project_name}</h6>
              <p className="text-muted">Cliente: {selectedShipment.client_name}</p>
            </div>
          )}
          
          <Form.Group className="mb-3">
            <Form.Label>Nuevo Estado</Form.Label>
            <Form.Control
              type="text"
              value={statusData.status}
              readOnly
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Notas</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={statusData.notes}
              onChange={(e) => setStatusData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Agregar notas sobre el cambio de estado..."
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Archivos Adjuntos</Form.Label>
            <Form.Control
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(e) => setStatusData(prev => ({ ...prev, files: Array.from(e.target.files) }))}
            />
            <Form.Text className="text-muted">
              Puedes adjuntar archivos relacionados con el cambio de estado
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleStatusUpdate} disabled={loading}>
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Actualizando...
              </>
            ) : (
              <>
                <FiCheck className="me-2" />
                Actualizar Estado
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SeguimientoEnvios;
