import React from 'react';
import { Modal, Tab, Tabs, Table, Badge, Row, Col, Card } from 'react-bootstrap';
import { useQuery } from 'react-query';
import { getClientHistory } from '../services/companies';
import { 
  FiFileText, FiHome, FiUser, FiCalendar, 
  FiDollarSign, FiTrendingUp, FiCheckCircle, FiX,
  FiClock, FiSend, FiMessageSquare, FiSearch, FiActivity
} from 'react-icons/fi';

const STATUS_CONFIG = {
  // Estados de cotizaciones
  'nuevo': { label: 'Nuevo', variant: 'primary', icon: FiClock },
  'cotizacion_enviada': { label: 'Cotización Enviada', variant: 'info', icon: FiSend },
  'pendiente_cotizacion': { label: 'Pendiente de Cotización', variant: 'warning', icon: FiClock },
  'en_negociacion': { label: 'En Negociación', variant: 'secondary', icon: FiMessageSquare },
  'seguimiento': { label: 'Seguimiento', variant: 'info', icon: FiTrendingUp },
  'ganado': { label: 'Ganado', variant: 'success', icon: FiCheckCircle },
  'perdido': { label: 'Perdido', variant: 'danger', icon: FiX },
  
  // Estados de proyectos
  'activo': { label: 'Activo', variant: 'success', icon: FiCheckCircle },
  'completado': { label: 'Completado', variant: 'primary', icon: FiCheckCircle },
  'pausado': { label: 'Pausado', variant: 'warning', icon: FiClock },
  'cancelado': { label: 'Cancelado', variant: 'danger', icon: FiX },
};

const ClientHistoryModal = ({ show, onHide, clientId, clientName }) => {
  const { data: historyData, isLoading, error } = useQuery(
    ['clientHistory', clientId],
    () => getClientHistory(clientId),
    {
      enabled: show && !!clientId,
      staleTime: 5 * 60 * 1000, // 5 minutos
    }
  );

  const getStatusBadge = (status, type = 'quote') => {
    const config = STATUS_CONFIG[status] || { label: status, variant: 'secondary', icon: FiFileText };
    const Icon = config.icon;
    
    return (
      <Badge bg={config.variant} className="d-flex align-items-center gap-1">
        <Icon size={12} />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Modal show={show} onHide={onHide} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Historial de {clientName}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal show={show} onHide={onHide} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Historial de {clientName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="alert alert-danger">
            Error al cargar el historial: {error.message}
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  const history = historyData?.data || { quotes: [], projects: [], manager: null, stats: {} };

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>
          <FiActivity className="me-2" />
          Historial de {clientName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Información del gestor */}
        {history.manager && (
          <Card className="mb-4">
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6><FiUser className="me-2" />Gestor Actual</h6>
                  <p className="mb-1"><strong>{history.manager.name}</strong></p>
                  <p className="mb-1 text-muted">{history.manager.role}</p>
                  <p className="mb-0 text-muted">{history.manager.email}</p>
                </Col>
                <Col md={6}>
                  <h6>Estadísticas</h6>
                  <Row>
                    <Col xs={6}>
                      <div className="text-center">
                        <h4 className="text-primary mb-0">{history.stats.totalQuotes}</h4>
                        <small className="text-muted">Cotizaciones</small>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="text-center">
                        <h4 className="text-success mb-0">{history.stats.totalProjects}</h4>
                        <small className="text-muted">Proyectos</small>
                      </div>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        <Tabs defaultActiveKey="quotes" className="mb-3">
          {/* Tab de Cotizaciones */}
          <Tab eventKey="quotes" title={
            <span>
              <FiFileText className="me-1" />
              Cotizaciones ({history.quotes.length})
            </span>
          }>
            {history.quotes.length > 0 ? (
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Creado por</th>
                    <th>Fecha Creación</th>
                    <th>Última Actualización</th>
                  </tr>
                </thead>
                <tbody>
                  {history.quotes.map((quote) => (
                    <tr key={quote.id}>
                      <td>
                        <strong>#{quote.id}</strong>
                      </td>
                      <td>
                        <FiDollarSign className="me-1" />
                        {formatCurrency(quote.total)}
                      </td>
                      <td>
                        {getStatusBadge(quote.status, 'quote')}
                      </td>
                      <td>
                        <div>
                          <div>{quote.created_by_name}</div>
                          <small className="text-muted">{quote.created_by_role}</small>
                        </div>
                      </td>
                      <td>
                        <FiCalendar className="me-1" />
                        {formatDate(quote.created_at)}
                      </td>
                      <td>
                        <FiCalendar className="me-1" />
                        {formatDate(quote.updated_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="text-center py-4">
                <FiFileText size={48} className="text-muted mb-3" />
                <p className="text-muted">No hay cotizaciones registradas para este cliente</p>
              </div>
            )}
          </Tab>

          {/* Tab de Proyectos */}
          <Tab eventKey="projects" title={
            <span>
              <FiHome className="me-1" />
              Proyectos ({history.projects.length})
            </span>
          }>
            {history.projects.length > 0 ? (
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Estado</th>
                    <th>Creado por</th>
                    <th>Fecha Creación</th>
                    <th>Última Actualización</th>
                  </tr>
                </thead>
                <tbody>
                  {history.projects.map((project) => (
                    <tr key={project.id}>
                      <td>
                        <strong>#{project.id}</strong>
                      </td>
                      <td>
                        <FiHome className="me-1" />
                        {project.name}
                      </td>
                      <td>
                        {getStatusBadge(project.status, 'project')}
                      </td>
                      <td>
                        <div>
                          <div>{project.created_by_name}</div>
                          <small className="text-muted">{project.created_by_role}</small>
                        </div>
                      </td>
                      <td>
                        <FiCalendar className="me-1" />
                        {formatDate(project.created_at)}
                      </td>
                      <td>
                        <FiCalendar className="me-1" />
                        {formatDate(project.updated_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="text-center py-4">
                <FiHome size={48} className="text-muted mb-3" />
                <p className="text-muted">No hay proyectos registrados para este cliente</p>
              </div>
            )}
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-secondary" onClick={onHide}>
          Cerrar
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ClientHistoryModal;
