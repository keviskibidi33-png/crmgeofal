import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { FiDollarSign, FiCheckCircle, FiXCircle, FiClock, FiTrendingUp, FiFileText } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import StatsCard from '../../components/common/StatsCard';
import apiFetch from '../../services/api';

export default function FacturacionDashboard() {
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
      const data = await apiFetch('/api/role-dashboard/facturacion');
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
        title="Dashboard Facturación"
        subtitle="Comprobantes de pago y gestión financiera"
        icon={FiDollarSign}
      />

      {/* Métricas principales */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Comprobantes Pendientes"
            value={stats?.comprobantesPendientes || 0}
            icon={FiClock}
            color="warning"
            subtitle={`$${(stats?.montoTotalPendiente || 0).toLocaleString()}`}
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Comprobantes Aprobados"
            value={stats?.comprobantesAprobados || 0}
            icon={FiCheckCircle}
            color="success"
            subtitle={`$${(stats?.montoTotalAprobado || 0).toLocaleString()}`}
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Comprobantes Rechazados"
            value={stats?.comprobantesRechazados || 0}
            icon={FiXCircle}
            color="danger"
            subtitle={`$${(stats?.montoTotalRechazado || 0).toLocaleString()}`}
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Total Comprobantes"
            value={stats?.totalComprobantes || 0}
            icon={FiFileText}
            color="info"
            subtitle="Todos los estados"
          />
        </Col>
      </Row>

      {/* Métricas mensuales */}
      <Row className="mb-4">
        <Col lg={6} md={6} className="mb-3">
          <StatsCard
            title="Comprobantes Este Mes"
            value={stats?.comprobantesEsteMes || 0}
            icon={FiTrendingUp}
            color="primary"
            subtitle="Nuevos comprobantes"
          />
        </Col>
        <Col lg={6} md={6} className="mb-3">
          <StatsCard
            title="Monto Este Mes"
            value={`$${(stats?.montoEsteMes || 0).toLocaleString()}`}
            icon={FiDollarSign}
            color="success"
            subtitle="Ingresos del mes"
          />
        </Col>
      </Row>

      {/* Comprobantes recientes */}
      <Row className="mb-4">
        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Comprobantes Recientes</h5>
            </Card.Header>
            <Card.Body>
              {stats?.comprobantesRecientes?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Monto</th>
                        <th>Empresa</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                        <th>Subido por</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.comprobantesRecientes.map((comprobante, index) => (
                        <tr key={index}>
                          <td>${comprobante.amount?.toLocaleString() || 0}</td>
                          <td>{comprobante.company_name}</td>
                          <td>
                            <span className={`badge ${
                              comprobante.status === 'aprobado' ? 'bg-success' :
                              comprobante.status === 'rechazado' ? 'bg-danger' :
                              comprobante.status === 'pendiente' ? 'bg-warning' : 'bg-secondary'
                            }`}>
                              {comprobante.status}
                            </span>
                          </td>
                          <td>{new Date(comprobante.created_at).toLocaleDateString()}</td>
                          <td>{comprobante.uploaded_by_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No hay comprobantes recientes</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Pagos recientes */}
        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Pagos Aprobados Recientes</h5>
            </Card.Header>
            <Card.Body>
              {stats?.pagosRecientes?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Monto</th>
                        <th>Empresa</th>
                        <th>Fecha Aprobación</th>
                        <th>Aprobado por</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.pagosRecientes.map((pago, index) => (
                        <tr key={index}>
                          <td>${pago.amount?.toLocaleString() || 0}</td>
                          <td>{pago.company_name}</td>
                          <td>{new Date(pago.approved_at).toLocaleDateString()}</td>
                          <td>{pago.approved_by_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No hay pagos recientes</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Resumen de estados */}
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Resumen de Estados de Comprobantes</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <div className="text-center p-3">
                    <div className="display-6 text-warning">{stats?.comprobantesPendientes || 0}</div>
                    <div className="text-muted">Pendientes</div>
                    <small className="text-muted">${(stats?.montoTotalPendiente || 0).toLocaleString()}</small>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center p-3">
                    <div className="display-6 text-success">{stats?.comprobantesAprobados || 0}</div>
                    <div className="text-muted">Aprobados</div>
                    <small className="text-muted">${(stats?.montoTotalAprobado || 0).toLocaleString()}</small>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center p-3">
                    <div className="display-6 text-danger">{stats?.comprobantesRechazados || 0}</div>
                    <div className="text-muted">Rechazados</div>
                    <small className="text-muted">${(stats?.montoTotalRechazado || 0).toLocaleString()}</small>
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
