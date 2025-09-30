import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { FiHeadphones, FiCheckCircle, FiClock, FiAlertTriangle, FiActivity, FiTrendingUp } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import StatsCard from '../../components/common/StatsCard';
import apiFetch from '../../services/api';

export default function SoporteDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch('/api/role-dashboard/soporte');
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container fluid className="p-4">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <Spinner animation="border" size="lg" />
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="p-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4">
      <PageHeader
        title="Dashboard Soporte"
        subtitle="Gestión de tickets y resolución de problemas"
        icon={FiHeadphones}
      />

      {/* Métricas principales */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Tickets Abiertos"
            value={stats?.ticketsAbiertos || 0}
            icon={FiClock}
            color="warning"
            subtitle="Requieren atención"
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Tickets Resueltos"
            value={stats?.ticketsResueltos || 0}
            icon={FiCheckCircle}
            color="success"
            subtitle="Problemas solucionados"
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="En Proceso"
            value={stats?.ticketsEnProceso || 0}
            icon={FiActivity}
            color="info"
            subtitle="En análisis"
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Total Tickets"
            value={stats?.totalTickets || 0}
            icon={FiHeadphones}
            color="primary"
            subtitle="Todos los tickets"
          />
        </Col>
      </Row>

      {/* Métricas por prioridad */}
      <Row className="mb-4">
        <Col lg={4} md={6} className="mb-3">
          <StatsCard
            title="Alta Prioridad"
            value={stats?.ticketsAltaPrioridad || 0}
            icon={FiAlertTriangle}
            color="danger"
            subtitle="Urgentes"
          />
        </Col>
        <Col lg={4} md={6} className="mb-3">
          <StatsCard
            title="Media Prioridad"
            value={stats?.ticketsMediaPrioridad || 0}
            icon={FiClock}
            color="warning"
            subtitle="Importantes"
          />
        </Col>
        <Col lg={4} md={6} className="mb-3">
          <StatsCard
            title="Baja Prioridad"
            value={stats?.ticketsBajaPrioridad || 0}
            icon={FiActivity}
            color="info"
            subtitle="Rutinarios"
          />
        </Col>
      </Row>

      {/* Métricas de rendimiento */}
      <Row className="mb-4">
        <Col lg={6} md={6} className="mb-3">
          <StatsCard
            title="Tiempo Promedio"
            value={`${(stats?.tiempoPromedioResolucion || 0).toFixed(1)}h`}
            icon={FiTrendingUp}
            color="primary"
            subtitle="Resolución promedio"
          />
        </Col>
        <Col lg={6} md={6} className="mb-3">
          <StatsCard
            title="Resueltos Este Mes"
            value={stats?.ticketsResueltosEsteMes || 0}
            icon={FiCheckCircle}
            color="success"
            subtitle="Tickets del mes"
          />
        </Col>
      </Row>

      {/* Tickets recientes */}
      <Row className="mb-4">
        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Tickets Recientes</h5>
            </Card.Header>
            <Card.Body>
              {stats?.ticketsRecientes?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Título</th>
                        <th>Estado</th>
                        <th>Prioridad</th>
                        <th>Fecha</th>
                        <th>Creado por</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.ticketsRecientes.map((ticket, index) => (
                        <tr key={index}>
                          <td>
                            <span className="text-truncate d-inline-block" style={{ maxWidth: '150px' }}>
                              {ticket.title}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${
                              ticket.status === 'resuelto' ? 'bg-success' :
                              ticket.status === 'en_proceso' ? 'bg-warning' :
                              ticket.status === 'abierto' ? 'bg-danger' : 'bg-secondary'
                            }`}>
                              {ticket.status}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${
                              ticket.priority === 'alta' ? 'bg-danger' :
                              ticket.priority === 'media' ? 'bg-warning' :
                              ticket.priority === 'baja' ? 'bg-info' : 'bg-secondary'
                            }`}>
                              {ticket.priority}
                            </span>
                          </td>
                          <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
                          <td>{ticket.created_by_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No hay tickets recientes</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Tickets por resolver */}
        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Tickets por Resolver</h5>
            </Card.Header>
            <Card.Body>
              {stats?.ticketsPorResolver?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Título</th>
                        <th>Estado</th>
                        <th>Prioridad</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.ticketsPorResolver.map((ticket, index) => (
                        <tr key={index}>
                          <td>
                            <span className="text-truncate d-inline-block" style={{ maxWidth: '150px' }}>
                              {ticket.title}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${
                              ticket.status === 'en_proceso' ? 'bg-warning' :
                              ticket.status === 'abierto' ? 'bg-danger' : 'bg-secondary'
                            }`}>
                              {ticket.status}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${
                              ticket.priority === 'alta' ? 'bg-danger' :
                              ticket.priority === 'media' ? 'bg-warning' :
                              ticket.priority === 'baja' ? 'bg-info' : 'bg-secondary'
                            }`}>
                              {ticket.priority}
                            </span>
                          </td>
                          <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No hay tickets pendientes</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Resumen de rendimiento */}
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Resumen de Rendimiento</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <div className="text-center p-3">
                    <div className="display-6 text-danger">{stats?.ticketsAbiertos || 0}</div>
                    <div className="text-muted">Abiertos</div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center p-3">
                    <div className="display-6 text-warning">{stats?.ticketsEnProceso || 0}</div>
                    <div className="text-muted">En Proceso</div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center p-3">
                    <div className="display-6 text-success">{stats?.ticketsResueltos || 0}</div>
                    <div className="text-muted">Resueltos</div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center p-3">
                    <div className="display-6 text-info">{stats?.ticketsResueltosEsteMes || 0}</div>
                    <div className="text-muted">Este Mes</div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
