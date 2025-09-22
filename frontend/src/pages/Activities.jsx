import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Spinner, Alert } from 'react-bootstrap';
import { 
  FiActivity, FiRefreshCw, FiFilter, FiSearch, FiCalendar, FiUser, FiTag,
  FiArrowLeft, FiDownload, FiEye, FiClock, FiCheckCircle, FiX, FiAlertTriangle
} from 'react-icons/fi';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { getRecentActivities, getActivitiesByType, ACTIVITY_TYPES, ENTITY_TYPES } from '../services/activities';
import { useActivities } from '../hooks/useActivities';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/common/PageHeader';

const Activities = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    type: '',
    entityType: '',
    limit: 20,
    offset: 0
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Hook optimizado para actividades
  const { 
    data: activitiesData, 
    isLoading, 
    error,
    refreshActivities,
    hasActivities,
    activitiesCount
  } = useActivities({ 
    limit: filters.limit,
    refetchInterval: 0, // No auto-refresh en esta página
    staleTime: 30000, // 30 segundos
    userId: user?.id, // Filtrar por usuario actual
    role: user?.role // Filtrar por rol
  });

  // Función para formatear tiempo de actividad
  const formatActivityTime = (createdAt) => {
    const now = new Date();
    const activityTime = new Date(createdAt);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} h`;
    return `Hace ${Math.floor(diffInMinutes / 1440)} días`;
  };

  // Función para obtener icono según tipo de actividad
  const getActivityIcon = (type) => {
    const icons = {
      quote_created: FiActivity,
      quote_assigned: FiActivity,
      quote_approved: FiCheckCircle,
      quote_rejected: FiX,
      quote_completed: FiCheckCircle,
      project_created: FiActivity,
      project_assigned: FiActivity,
      project_started: FiActivity,
      project_completed: FiCheckCircle,
      project_delayed: FiAlertTriangle,
      ticket_created: FiActivity,
      ticket_assigned: FiActivity,
      ticket_resolved: FiCheckCircle,
      ticket_escalated: FiAlertTriangle,
      evidence_uploaded: FiActivity,
      evidence_approved: FiCheckCircle,
      evidence_rejected: FiX,
      user_registered: FiUser,
      user_assigned: FiUser,
      user_role_changed: FiUser,
      client_created: FiUser,
      client_updated: FiUser,
      system_maintenance: FiActivity,
      system_update: FiActivity
    };
    return icons[type] || FiActivity;
  };

  // Función para obtener color según tipo de actividad
  const getActivityColor = (type) => {
    const colors = {
      quote_created: 'primary',
      quote_assigned: 'primary',
      quote_approved: 'success',
      quote_rejected: 'danger',
      quote_completed: 'success',
      project_created: 'info',
      project_assigned: 'info',
      project_started: 'info',
      project_completed: 'success',
      project_delayed: 'warning',
      ticket_created: 'warning',
      ticket_assigned: 'warning',
      ticket_resolved: 'success',
      ticket_escalated: 'danger',
      evidence_uploaded: 'secondary',
      evidence_approved: 'success',
      evidence_rejected: 'danger',
      user_registered: 'info',
      user_assigned: 'info',
      user_role_changed: 'secondary',
      client_created: 'primary',
      client_updated: 'primary',
      system_maintenance: 'secondary',
      system_update: 'secondary'
    };
    return colors[type] || 'secondary';
  };

  // Función para obtener etiqueta del tipo de actividad
  const getActivityTypeLabel = (type) => {
    const labels = {
      quote_created: 'Cotización Creada',
      quote_assigned: 'Cotización Asignada',
      quote_approved: 'Cotización Aprobada',
      quote_rejected: 'Cotización Rechazada',
      quote_completed: 'Cotización Completada',
      project_created: 'Proyecto Creado',
      project_assigned: 'Proyecto Asignado',
      project_started: 'Proyecto Iniciado',
      project_completed: 'Proyecto Completado',
      project_delayed: 'Proyecto Retrasado',
      ticket_created: 'Ticket Creado',
      ticket_assigned: 'Ticket Asignado',
      ticket_resolved: 'Ticket Resuelto',
      ticket_escalated: 'Ticket Escalado',
      evidence_uploaded: 'Evidencia Subida',
      evidence_approved: 'Evidencia Aprobada',
      evidence_rejected: 'Evidencia Rechazada',
      user_registered: 'Usuario Registrado',
      user_assigned: 'Usuario Asignado',
      user_role_changed: 'Rol Cambiado',
      client_created: 'Cliente Creado',
      client_updated: 'Cliente Actualizado',
      system_maintenance: 'Mantenimiento',
      system_update: 'Actualización'
    };
    return labels[type] || type;
  };

  // Filtrar actividades
  const filteredActivities = activitiesData?.activities?.filter(activity => {
    const matchesSearch = !searchTerm || 
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !filters.type || activity.type === filters.type;
    const matchesEntity = !filters.entityType || activity.entity_type === filters.entityType;
    
    return matchesSearch && matchesType && matchesEntity;
  }) || [];

  return (
    <Container fluid className="py-4">
      <PageHeader
        title="Actividades del Sistema"
        subtitle="Historial completo de actividades y eventos"
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Actividades', active: true }
        ]}
      />

      <Row>
        {/* Filtros y controles */}
        <Col lg={12} className="mb-4">
          <Card>
            <Card.Body>
              <Row className="align-items-center">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>
                      <FiSearch className="me-1" />
                      Buscar
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Buscar en actividades..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>
                      <FiTag className="me-1" />
                      Tipo
                    </Form.Label>
                    <Form.Select
                      value={filters.type}
                      onChange={(e) => setFilters({...filters, type: e.target.value})}
                    >
                      <option value="">Todos los tipos</option>
                      <option value="quote_created">Cotización Creada</option>
                      <option value="quote_assigned">Cotización Asignada</option>
                      <option value="quote_approved">Cotización Aprobada</option>
                      <option value="quote_completed">Cotización Completada</option>
                      <option value="project_created">Proyecto Creado</option>
                      <option value="project_completed">Proyecto Completado</option>
                      <option value="ticket_created">Ticket Creado</option>
                      <option value="ticket_resolved">Ticket Resuelto</option>
                      <option value="evidence_uploaded">Evidencia Subida</option>
                      <option value="user_registered">Usuario Registrado</option>
                      <option value="client_created">Cliente Creado</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>
                      <FiFilter className="me-1" />
                      Entidad
                    </Form.Label>
                    <Form.Select
                      value={filters.entityType}
                      onChange={(e) => setFilters({...filters, entityType: e.target.value})}
                    >
                      <option value="">Todas las entidades</option>
                      <option value="quote">Cotizaciones</option>
                      <option value="project">Proyectos</option>
                      <option value="ticket">Tickets</option>
                      <option value="evidence">Evidencias</option>
                      <option value="user">Usuarios</option>
                      <option value="client">Clientes</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      onClick={refreshActivities}
                      disabled={isLoading}
                      title="Actualizar actividades"
                    >
                      <FiRefreshCw className={isLoading ? 'spinning' : ''} />
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => navigate('/dashboard')}
                      title="Volver al Dashboard"
                    >
                      <FiArrowLeft />
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Lista de actividades */}
        <Col lg={12}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Actividades Recientes</h5>
                <small className="text-muted">
                  {filteredActivities.length} de {activitiesCount} actividades
                </small>
              </div>
              <div className="d-flex gap-2">
                <Button variant="outline-success" size="sm">
                  <FiDownload className="me-1" />
                  Exportar
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {isLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3 text-muted">Cargando actividades...</p>
                </div>
              ) : error ? (
                <Alert variant="danger">
                  <Alert.Heading>Error al cargar actividades</Alert.Heading>
                  <p>No se pudieron cargar las actividades. Por favor, intenta nuevamente.</p>
                  <Button variant="outline-danger" onClick={refreshActivities}>
                    <FiRefreshCw className="me-1" />
                    Reintentar
                  </Button>
                </Alert>
              ) : filteredActivities.length === 0 ? (
                <div className="text-center py-5">
                  <FiActivity size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No hay actividades</h5>
                  <p className="text-muted">
                    {searchTerm || filters.type || filters.entityType 
                      ? 'No se encontraron actividades con los filtros aplicados.'
                      : 'Aún no hay actividades registradas en el sistema.'
                    }
                  </p>
                  {(searchTerm || filters.type || filters.entityType) && (
                    <Button 
                      variant="outline-primary" 
                      onClick={() => {
                        setSearchTerm('');
                        setFilters({ type: '', entityType: '', limit: 20, offset: 0 });
                      }}
                    >
                      Limpiar filtros
                    </Button>
                  )}
                </div>
              ) : (
                <div className="activity-list">
                  {filteredActivities.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    const color = getActivityColor(activity.type);
                    const typeLabel = getActivityTypeLabel(activity.type);
                    
                    return (
                      <div key={activity.id} className="activity-item d-flex align-items-start mb-4 p-3 border rounded">
                        <div className={`activity-icon bg-${color} bg-opacity-10 rounded-circle p-3 me-3`}>
                          <Icon size={24} className={`text-${color}`} />
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h6 className="mb-1">{activity.title}</h6>
                              <Badge bg={color} className="me-2">
                                {typeLabel}
                              </Badge>
                              {activity.entity_type && (
                                <Badge bg="secondary" variant="outline">
                                  {activity.entity_type}
                                </Badge>
                              )}
                            </div>
                            <div className="text-end">
                              <small className="text-muted d-flex align-items-center">
                                <FiClock className="me-1" />
                                {formatActivityTime(activity.created_at)}
                              </small>
                            </div>
                          </div>
                          <p className="text-muted mb-2">{activity.description}</p>
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                              {activity.user_name && (
                                <span>
                                  <FiUser className="me-1" />
                                  por {activity.user_name}
                                </span>
                              )}
                            </small>
                            <Button variant="outline-primary" size="sm">
                              <FiEye className="me-1" />
                              Ver detalles
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Activities;
