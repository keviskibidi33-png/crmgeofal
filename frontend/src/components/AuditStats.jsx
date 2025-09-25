import React from 'react';
import { Card, Row, Col, Badge, Button, Spinner } from 'react-bootstrap';
import { 
  FiActivity, 
  FiUsers, 
  FiSettings, 
  FiClock,
  FiTrendingUp,
  FiAlertCircle,
  FiCheckCircle,
  FiRefreshCw
} from 'react-icons/fi';
import { useAuditStats } from '../hooks/useAuditStats';

export default function AuditStats({ showRefreshButton = true }) {
  const { data, isLoading, refetch, isFetching } = useAuditStats();

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <Row>
        {[1, 2, 3, 4].map(i => (
          <Col md={3} key={i} className="mb-3">
            <Card>
              <Card.Body className="text-center">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  const stats = data || {};

  return (
    <div>
      {showRefreshButton && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0">
            <FiActivity className="me-2" />
            Estadísticas de Auditoría
          </h6>
          <Button 
            variant="outline-primary" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isFetching}
          >
            {isFetching ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                Actualizando...
              </>
            ) : (
              <>
                <FiRefreshCw className="me-1" />
                Actualizar
              </>
            )}
          </Button>
        </div>
      )}
      <Row>
      <Col md={3} className="mb-3">
        <Card className="text-center border-primary">
          <Card.Body>
            <FiActivity className="text-primary mb-2" size={24} />
            <h5 className="mb-1">{stats.total || 0}</h5>
            <small className="text-muted">Total de Acciones</small>
            <div className="mt-2">
              <Badge bg="info" className="fs-6">
                {stats.todayActivities || 0} hoy
              </Badge>
            </div>
          </Card.Body>
        </Card>
      </Col>
      
      <Col md={3} className="mb-3">
        <Card className="text-center border-success">
          <Card.Body>
            <FiUsers className="text-success mb-2" size={24} />
            <h5 className="mb-1">{stats.uniqueUsers || 0}</h5>
            <small className="text-muted">Usuarios Activos</small>
            <div className="mt-2">
              <Badge bg="success" className="fs-6">
                Únicos
              </Badge>
            </div>
          </Card.Body>
        </Card>
      </Col>
      
      <Col md={3} className="mb-3">
        <Card className="text-center border-info">
          <Card.Body>
            <FiSettings className="text-info mb-2" size={24} />
            <h5 className="mb-1">{stats.uniqueActions || 0}</h5>
            <small className="text-muted">Tipos de Acciones</small>
            <div className="mt-2">
              <Badge bg="info" className="fs-6">
                {stats.mostCommonAction || 'N/A'}
              </Badge>
            </div>
          </Card.Body>
        </Card>
      </Col>
      
      <Col md={3} className="mb-3">
        <Card className="text-center border-warning">
          <Card.Body>
            <FiTrendingUp className="text-warning mb-2" size={24} />
            <h5 className="mb-1">{stats.recentActivities || 0}</h5>
            <small className="text-muted">Últimas 24h</small>
            <div className="mt-2">
              <Badge bg="warning" className="fs-6">
                Activo
              </Badge>
            </div>
          </Card.Body>
        </Card>
      </Col>
      </Row>
    </div>
  );
}
