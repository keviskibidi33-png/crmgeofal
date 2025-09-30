import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { FiTrendingUp, FiUsers, FiDollarSign, FiTarget, FiBarChart, FiActivity } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import StatsCard from '../../components/common/StatsCard';
import apiFetch from '../../services/api';

export default function JefaComercialDashboard() {
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
      const data = await apiFetch('/api/role-dashboard/jefa-comercial');
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
        title="Dashboard Jefa Comercial"
        subtitle="Métricas de embudo, vendedores y conversiones"
        icon={FiBarChart}
      />

      {/* Métricas principales */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Total Vendedores"
            value={stats?.totalVendedores || 0}
            icon={FiUsers}
            color="primary"
            subtitle="Vendedores activos"
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Cotizaciones Totales"
            value={stats?.totalCotizaciones || 0}
            icon={FiTarget}
            color="info"
            subtitle={`${stats?.cotizacionesAprobadas || 0} aprobadas`}
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Ingresos Generados"
            value={`$${(stats?.totalIngresos || 0).toLocaleString()}`}
            icon={FiDollarSign}
            color="success"
            subtitle={`${stats?.cotizacionesFacturadas || 0} facturadas`}
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Tasa de Conversión"
            value={`${stats?.conversionRate || 0}%`}
            icon={FiTrendingUp}
            color="warning"
            subtitle="Cotizaciones aprobadas"
          />
        </Col>
      </Row>

      {/* Métricas mensuales */}
      <Row className="mb-4">
        <Col lg={6} md={6} className="mb-3">
          <StatsCard
            title="Cotizaciones Este Mes"
            value={stats?.cotizacionesEsteMes || 0}
            icon={FiActivity}
            color="primary"
            subtitle="Nuevas cotizaciones"
          />
        </Col>
        <Col lg={6} md={6} className="mb-3">
          <StatsCard
            title="Ingresos Este Mes"
            value={`$${(stats?.ingresosEsteMes || 0).toLocaleString()}`}
            icon={FiDollarSign}
            color="success"
            subtitle="Ingresos del mes actual"
          />
        </Col>
      </Row>

      {/* Embudo por categoría */}
      <Row className="mb-4">
        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Embudo por Categoría</h5>
            </Card.Header>
            <Card.Body>
              {stats?.embudoPorCategoria?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Categoría</th>
                        <th>Total</th>
                        <th>Aprobadas</th>
                        <th>Conversión</th>
                        <th>Ingresos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.embudoPorCategoria.map((item, index) => (
                        <tr key={index}>
                          <td>{item.categoria}</td>
                          <td>{item.total}</td>
                          <td>{item.aprobadas}</td>
                          <td>
                            <span className={`badge ${item.conversionRate > 20 ? 'bg-success' : item.conversionRate > 10 ? 'bg-warning' : 'bg-danger'}`}>
                              {item.conversionRate}%
                            </span>
                          </td>
                          <td>${item.ingresos.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No hay datos de embudo disponibles</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Rendimiento de vendedores */}
        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Rendimiento de Vendedores</h5>
            </Card.Header>
            <Card.Body>
              {stats?.rendimientoVendedores?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Vendedor</th>
                        <th>Cotizaciones</th>
                        <th>Aprobadas</th>
                        <th>Conversión</th>
                        <th>Ingresos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.rendimientoVendedores.map((vendedor, index) => (
                        <tr key={index}>
                          <td>{vendedor.nombre}</td>
                          <td>{vendedor.totalCotizaciones}</td>
                          <td>{vendedor.cotizacionesAprobadas}</td>
                          <td>
                            <span className={`badge ${vendedor.conversionRate > 20 ? 'bg-success' : vendedor.conversionRate > 10 ? 'bg-warning' : 'bg-danger'}`}>
                              {vendedor.conversionRate}%
                            </span>
                          </td>
                          <td>${vendedor.ingresosGenerados.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No hay datos de vendedores disponibles</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Cotizaciones recientes */}
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Cotizaciones Recientes</h5>
            </Card.Header>
            <Card.Body>
              {stats?.cotizacionesRecientes?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Cliente</th>
                        <th>Empresa</th>
                        <th>Monto</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                        <th>Vendedor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.cotizacionesRecientes.map((cotizacion, index) => (
                        <tr key={index}>
                          <td>{cotizacion.quote_number}</td>
                          <td>{cotizacion.client_contact}</td>
                          <td>{cotizacion.company_name || 'N/A'}</td>
                          <td>${cotizacion.total_amount?.toLocaleString() || 0}</td>
                          <td>
                            <span className={`badge ${
                              cotizacion.status === 'aprobada' ? 'bg-success' :
                              cotizacion.status === 'facturada' ? 'bg-primary' :
                              cotizacion.status === 'pendiente' ? 'bg-warning' : 'bg-secondary'
                            }`}>
                              {cotizacion.status}
                            </span>
                          </td>
                          <td>{new Date(cotizacion.created_at).toLocaleDateString()}</td>
                          <td>{cotizacion.created_by_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No hay cotizaciones recientes</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
