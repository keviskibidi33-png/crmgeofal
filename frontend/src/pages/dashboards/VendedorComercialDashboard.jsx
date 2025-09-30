import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { FiTarget, FiUsers, FiDollarSign, FiTrendingUp, FiActivity, FiBriefcase } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import StatsCard from '../../components/common/StatsCard';
import apiFetch from '../../services/api';

export default function VendedorComercialDashboard() {
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
      const data = await apiFetch('/api/role-dashboard/vendedor-comercial');
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
        title="Mi Dashboard Comercial"
        subtitle="Métricas personales y rendimiento"
        icon={FiTarget}
      />

      {/* Métricas principales */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Mis Cotizaciones"
            value={stats?.misCotizaciones || 0}
            icon={FiTarget}
            color="primary"
            subtitle={`${stats?.cotizacionesAprobadas || 0} aprobadas`}
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Clientes"
            value={stats?.totalClientes || 0}
            icon={FiUsers}
            color="info"
            subtitle={`${stats?.clientesNuevosEsteMes || 0} nuevos este mes`}
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Ingresos Generados"
            value={`$${(stats?.ingresosGenerados || 0).toLocaleString()}`}
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

      {/* Métricas de proyectos y mensuales */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Proyectos Activos"
            value={stats?.proyectosActivos || 0}
            icon={FiBriefcase}
            color="primary"
            subtitle={`${stats?.proyectosCompletados || 0} completados`}
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Cotizaciones Este Mes"
            value={stats?.cotizacionesEsteMes || 0}
            icon={FiActivity}
            color="info"
            subtitle="Nuevas cotizaciones"
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Ingresos Este Mes"
            value={`$${(stats?.ingresosEsteMes || 0).toLocaleString()}`}
            icon={FiDollarSign}
            color="success"
            subtitle="Ingresos del mes actual"
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Clientes Nuevos"
            value={stats?.clientesNuevosEsteMes || 0}
            icon={FiUsers}
            color="warning"
            subtitle="Este mes"
          />
        </Col>
      </Row>

      {/* Cotizaciones recientes */}
      <Row className="mb-4">
        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Mis Cotizaciones Recientes</h5>
            </Card.Header>
            <Card.Body>
              {stats?.cotizacionesRecientes?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Cliente</th>
                        <th>Monto</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.cotizacionesRecientes.map((cotizacion, index) => (
                        <tr key={index}>
                          <td>{cotizacion.quote_number}</td>
                          <td>{cotizacion.client_contact}</td>
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

        {/* Clientes recientes */}
        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Mis Clientes Recientes</h5>
            </Card.Header>
            <Card.Body>
              {stats?.clientesRecientes?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Empresa</th>
                        <th>RUC</th>
                        <th>Última Cotización</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.clientesRecientes.map((cliente, index) => (
                        <tr key={index}>
                          <td>{cliente.name}</td>
                          <td>{cliente.ruc}</td>
                          <td>{new Date(cliente.ultima_cotizacion).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No hay clientes recientes</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Proyectos recientes */}
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Mis Proyectos Recientes</h5>
            </Card.Header>
            <Card.Body>
              {stats?.proyectosRecientes?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Proyecto</th>
                        <th>Empresa</th>
                        <th>Estado</th>
                        <th>Fecha Creación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.proyectosRecientes.map((proyecto, index) => (
                        <tr key={index}>
                          <td>{proyecto.name}</td>
                          <td>{proyecto.company_name}</td>
                          <td>
                            <span className={`badge ${
                              proyecto.status === 'activo' ? 'bg-success' :
                              proyecto.status === 'completado' ? 'bg-primary' :
                              proyecto.status === 'pendiente' ? 'bg-warning' : 'bg-secondary'
                            }`}>
                              {proyecto.status}
                            </span>
                          </td>
                          <td>{new Date(proyecto.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No hay proyectos recientes</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
