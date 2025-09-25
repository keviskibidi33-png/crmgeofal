import React from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Badge,
  ProgressBar,
  ListGroup,
  Spinner
} from 'react-bootstrap';
import { 
  FiTrendingUp, 
  FiTrendingDown,
  FiActivity,
  FiUsers,
  FiClock,
  FiBarChart,
  FiPieChart
} from 'react-icons/fi';
import { useQuery } from 'react-query';
import { getHourlyDistribution } from '../services/auditActions';

export default function AuditAnalytics({ 
  analyticsData = {},
  isLoading = false 
}) {
  const {
    total = 0,
    todayActivities = 0,
    weekActivities = 0,
    uniqueUsers = 0,
    uniqueActions = 0,
    recentActivities = 0,
    actionCounts = {},
    activeUsers = []
  } = analyticsData;

  // Obtener distribución horaria real
  const { data: hourlyData, isLoading: isLoadingHourly } = useQuery(
    ['audit-hourly-distribution'],
    () => getHourlyDistribution(24),
    {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
    }
  );

  // Procesar datos para analytics
  const topActions = Object.entries(actionCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const userActivity = activeUsers.map(user => ({
    name: user.name || user.user_name || user.username || `Usuario ${user.id}`,
    actions: user.action_count || 0
  })).sort((a, b) => b.actions - a.actions).slice(0, 5);

  // Usar datos reales de distribución horaria
  const hourlyDistribution = hourlyData?.data || Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: 0
  }));

  const getTrendIcon = (trend) => {
    if (trend > 0) return <FiTrendingUp className="text-success" />;
    if (trend < 0) return <FiTrendingDown className="text-danger" />;
    return <FiActivity className="text-muted" />;
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return 'success';
    if (trend < 0) return 'danger';
    return 'secondary';
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

  return (
    <div>
      {/* Métricas Principales */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center border-primary">
            <Card.Body>
              <FiActivity className="text-primary mb-2" size={24} />
              <h5 className="mb-1">{total.toLocaleString()}</h5>
              <small className="text-muted">Total de Acciones</small>
              <div className="mt-2">
                <Badge bg="info" className="fs-6">
                  {todayActivities} hoy
                </Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center border-success">
            <Card.Body>
              <FiUsers className="text-success mb-2" size={24} />
              <h5 className="mb-1">{uniqueUsers}</h5>
              <small className="text-muted">Usuarios Activos</small>
              <div className="mt-2">
                <Badge bg="success" className="fs-6">
                  Únicos
                </Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center border-info">
            <Card.Body>
              <FiBarChart className="text-info mb-2" size={24} />
              <h5 className="mb-1">{weekActivities}</h5>
              <small className="text-muted">Esta Semana</small>
              <div className="mt-2">
                <Badge bg="info" className="fs-6">
                  +{Math.round((weekActivities / 7) * 100) / 100}/día
                </Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center border-warning">
            <Card.Body>
              <FiClock className="text-warning mb-2" size={24} />
              <h5 className="mb-1">{recentActivities}</h5>
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

      <Row>
        {/* Top Acciones */}
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <FiPieChart className="me-2" />
                Acciones Más Frecuentes
              </h6>
            </Card.Header>
            <Card.Body>
              {topActions.length > 0 ? (
                <ListGroup variant="flush">
                  {topActions.map((action, index) => (
                    <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <Badge bg="primary" className="me-2">
                          {index + 1}
                        </Badge>
                        <span className="fw-medium">{action.name}</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          <ProgressBar 
                            now={(action.count / topActions[0].count) * 100} 
                            style={{ width: '100px', height: '8px' }}
                            variant="primary"
                          />
                        </div>
                        <Badge bg="secondary">{action.count}</Badge>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center text-muted py-3">
                  <FiActivity size={32} className="mb-2" />
                  <p className="mb-0">No hay datos de acciones disponibles</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Actividad por Usuario */}
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <FiUsers className="me-2" />
                Actividad por Usuario
              </h6>
            </Card.Header>
            <Card.Body>
              {userActivity.length > 0 ? (
                <ListGroup variant="flush">
                  {userActivity.map((user, index) => (
                    <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <Badge bg="success" className="me-2">
                          {index + 1}
                        </Badge>
                        <span className="fw-medium">{user.name}</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          <ProgressBar 
                            now={(user.actions / userActivity[0].actions) * 100} 
                            style={{ width: '100px', height: '8px' }}
                            variant="success"
                          />
                        </div>
                        <Badge bg="secondary">{user.actions}</Badge>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center text-muted py-3">
                  <FiUsers size={32} className="mb-2" />
                  <p className="mb-0">No hay datos de usuarios disponibles</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Distribución Horaria */}
      <Row>
        <Col md={12}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <FiClock className="me-2" />
                Distribución de Actividad por Hora (Datos Reales)
                {isLoadingHourly && (
                  <Spinner animation="border" size="sm" className="ms-2" />
                )}
              </h6>
            </Card.Header>
            <Card.Body>
              {isLoadingHourly ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2 text-muted">Cargando distribución horaria...</p>
                </div>
              ) : hourlyDistribution.length > 0 ? (
                <div className="row">
                  {hourlyDistribution.map((hour, index) => (
                    <div key={index} className="col-md-2 mb-3">
                      <div className="text-center">
                        <div className="fw-medium">{hour.hour}:00</div>
                        <div className="mt-2">
                          <ProgressBar 
                            now={(hour.count / Math.max(...hourlyDistribution.map(h => h.count), 1)) * 100} 
                            variant="info"
                            style={{ height: '20px' }}
                          />
                        </div>
                        <div className="text-muted small mt-1">{hour.count}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-3">
                  <FiClock size={32} className="mb-2" />
                  <p className="mb-0">No hay datos de distribución horaria disponibles</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
