import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { FiTrendingUp, FiDollarSign, FiBarChart, FiUsers, FiTarget, FiActivity } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import StatsCard from '../../components/common/StatsCard';
import apiFetch from '../../services/api';

export default function GerenciaDashboard() {
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
      const data = await apiFetch('/api/role-dashboard/gerencia');
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
        title="Dashboard Gerencia"
        subtitle="KPIs ejecutivos, ingresos y rendimiento por área"
        icon={FiBarChart}
      />

      {/* KPIs principales */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Revenue Total"
            value={`$${(stats?.kpis?.totalRevenue || 0).toLocaleString()}`}
            icon={FiDollarSign}
            color="success"
            subtitle={`${stats?.kpis?.revenueGrowth || 0}% crecimiento`}
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Revenue Mensual"
            value={`$${(stats?.kpis?.monthlyRevenue || 0).toLocaleString()}`}
            icon={FiTrendingUp}
            color="info"
            subtitle="Mes actual"
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Clientes Totales"
            value={stats?.kpis?.totalClients || 0}
            icon={FiUsers}
            color="primary"
            subtitle={`${stats?.kpis?.activeClients || 0} activos`}
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Tasa de Conversión"
            value={`${(stats?.kpis?.conversionRate || 0).toFixed(1)}%`}
            icon={FiTarget}
            color="warning"
            subtitle="Cotizaciones"
          />
        </Col>
      </Row>

      {/* Rendimiento por área */}
      <Row className="mb-4">
        <Col lg={6} className="mb-3">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FiActivity className="me-2" />
                Rendimiento - Ventas
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="metric-item mb-3">
                    <small className="text-muted">Revenue</small>
                    <div className="h5">${(stats?.areaPerformance?.ventas?.revenue || 0).toLocaleString()}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="metric-item mb-3">
                    <small className="text-muted">Cotizaciones</small>
                    <div className="h5">{stats?.areaPerformance?.ventas?.quotesGenerated || 0}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="metric-item mb-3">
                    <small className="text-muted">Conversión</small>
                    <div className="h5">{(stats?.areaPerformance?.ventas?.conversionRate || 0).toFixed(1)}%</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="metric-item mb-3">
                    <small className="text-muted">Deals Activos</small>
                    <div className="h5">{stats?.areaPerformance?.ventas?.activeDeals || 0}</div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-3">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FiActivity className="me-2" />
                Rendimiento - Laboratorio
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="metric-item mb-3">
                    <small className="text-muted">Proyectos Completados</small>
                    <div className="h5">{stats?.areaPerformance?.laboratorio?.projectsCompleted || 0}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="metric-item mb-3">
                    <small className="text-muted">Tiempo Promedio</small>
                    <div className="h5">{stats?.areaPerformance?.laboratorio?.avgProcessingTime || 0} días</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="metric-item mb-3">
                    <small className="text-muted">Evidencias</small>
                    <div className="h5">{stats?.areaPerformance?.laboratorio?.evidencesSubmitted || 0}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="metric-item mb-3">
                    <small className="text-muted">Eficiencia</small>
                    <div className="h5">{(stats?.areaPerformance?.laboratorio?.efficiency || 0).toFixed(1)}%</div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Soporte y Facturación */}
      <Row className="mb-4">
        <Col lg={6} className="mb-3">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FiActivity className="me-2" />
                Rendimiento - Soporte
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="metric-item mb-3">
                    <small className="text-muted">Tickets Resueltos</small>
                    <div className="h5">{stats?.areaPerformance?.soporte?.ticketsResolved || 0}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="metric-item mb-3">
                    <small className="text-muted">Tiempo Resolución</small>
                    <div className="h5">{stats?.areaPerformance?.soporte?.avgResolutionTime || 0} días</div>
                  </div>
                </Col>
                <Col md={12}>
                  <div className="metric-item mb-3">
                    <small className="text-muted">SLA Compliance</small>
                    <div className="h5">{(stats?.areaPerformance?.soporte?.slaCompliance || 0).toFixed(1)}%</div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-3">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FiActivity className="me-2" />
                Rendimiento - Facturación
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="metric-item mb-3">
                    <small className="text-muted">Comprobantes Procesados</small>
                    <div className="h5">{stats?.areaPerformance?.facturacion?.vouchersProcessed || 0}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="metric-item mb-3">
                    <small className="text-muted">Tiempo Aprobación</small>
                    <div className="h5">{stats?.areaPerformance?.facturacion?.avgApprovalTime || 0} días</div>
                  </div>
                </Col>
                <Col md={12}>
                  <div className="metric-item mb-3">
                    <small className="text-muted">Monto Pendiente</small>
                    <div className="h5">${(stats?.areaPerformance?.facturacion?.pendingAmount || 0).toLocaleString()}</div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Top clientes */}
      {stats?.clientAnalysis?.topClients && stats.clientAnalysis.topClients.length > 0 && (
        <Row className="mb-4">
          <Col lg={12}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <FiUsers className="me-2" />
                  Top Clientes por Revenue
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <table className="table table-borderless">
                    <thead>
                      <tr>
                        <th>Cliente</th>
                        <th className="text-end">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.clientAnalysis.topClients.map((cliente, index) => (
                        <tr key={index}>
                          <td>{cliente.name}</td>
                          <td className="text-end">${cliente.revenue.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Alertas estratégicas */}
      {stats?.strategicAlerts && stats.strategicAlerts.length > 0 && (
        <Row className="mb-4">
          <Col lg={12}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <FiTarget className="me-2" />
                  Alertas Estratégicas
                </h5>
              </Card.Header>
              <Card.Body>
                {stats.strategicAlerts.map((alert, index) => (
                  <Alert 
                    key={index} 
                    variant={alert.type === 'warning' ? 'warning' : 'info'}
                    className="mb-2"
                  >
                    <strong>{alert.category}:</strong> {alert.message}
                    <small className="d-block text-muted">Impacto: {alert.impact}</small>
                  </Alert>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Tendencias mensuales */}
      {stats?.financial?.monthlyTrends && stats.financial.monthlyTrends.length > 0 && (
        <Row className="mb-4">
          <Col lg={12}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <FiTrendingUp className="me-2" />
                  Tendencias Mensuales (últimos 6 meses)
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <table className="table table-borderless">
                    <thead>
                      <tr>
                        <th>Mes</th>
                        <th className="text-end">Revenue</th>
                        <th className="text-end">Deals</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.financial.monthlyTrends.map((trend, index) => (
                        <tr key={index}>
                          <td>{trend.month}</td>
                          <td className="text-end">${trend.revenue.toLocaleString()}</td>
                          <td className="text-end">{trend.deals}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
}