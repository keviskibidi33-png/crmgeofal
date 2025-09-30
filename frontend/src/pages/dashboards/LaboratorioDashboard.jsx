import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { FiActivity, FiPackage, FiUpload, FiCheckCircle, FiClock, FiSend } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import StatsCard from '../../components/common/StatsCard';
import apiFetch from '../../services/api';

export default function LaboratorioDashboard() {
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
      const data = await apiFetch('/api/role-dashboard/laboratorio');
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
        title="Dashboard Laboratorio"
        subtitle="Proyectos, evidencias y envíos de laboratorio"
        icon={FiActivity}
      />

      {/* Métricas principales */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Proyectos Asignados"
            value={stats?.proyectosAsignados || 0}
            icon={FiActivity}
            color="primary"
            subtitle={`${stats?.proyectosEnProceso || 0} en proceso`}
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Proyectos Completados"
            value={stats?.proyectosCompletados || 0}
            icon={FiCheckCircle}
            color="success"
            subtitle="Proyectos finalizados"
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Evidencias Subidas"
            value={stats?.evidenciasSubidas || 0}
            icon={FiUpload}
            color="info"
            subtitle={`${stats?.evidenciasEsteMes || 0} este mes`}
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Proyectos Nuevos"
            value={stats?.proyectosNuevosEsteMes || 0}
            icon={FiClock}
            color="warning"
            subtitle="Este mes"
          />
        </Col>
      </Row>

      {/* Métricas de envíos */}
      <Row className="mb-4">
        <Col lg={4} md={6} className="mb-3">
          <StatsCard
            title="Envíos Recibidos"
            value={stats?.enviosRecibidos || 0}
            icon={FiPackage}
            color="primary"
            subtitle="Muestras recibidas"
          />
        </Col>
        <Col lg={4} md={6} className="mb-3">
          <StatsCard
            title="En Proceso"
            value={stats?.enviosEnProceso || 0}
            icon={FiClock}
            color="warning"
            subtitle="En análisis"
          />
        </Col>
        <Col lg={4} md={6} className="mb-3">
          <StatsCard
            title="Completados"
            value={stats?.enviosCompletados || 0}
            icon={FiCheckCircle}
            color="success"
            subtitle="Análisis finalizados"
          />
        </Col>
      </Row>

      {/* Proyectos recientes */}
      <Row className="mb-4">
        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Proyectos Recientes</h5>
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
                        <th>Fecha</th>
                        <th>Creado por</th>
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
                          <td>{proyecto.created_by_name}</td>
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

        {/* Evidencias recientes */}
        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Evidencias Recientes</h5>
            </Card.Header>
            <Card.Body>
              {stats?.evidenciasRecientes?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Proyecto</th>
                        <th>Notas</th>
                        <th>Subido por</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.evidenciasRecientes.map((evidencia, index) => (
                        <tr key={index}>
                          <td>{evidencia.project_name}</td>
                          <td>
                            <span className="text-truncate d-inline-block" style={{ maxWidth: '150px' }}>
                              {evidencia.notes || 'Sin notas'}
                            </span>
                          </td>
                          <td>{evidencia.uploaded_by_name}</td>
                          <td>{new Date(evidencia.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No hay evidencias recientes</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Envíos recientes */}
      {stats?.enviosRecientes?.length > 0 && (
        <Row>
          <Col>
            <Card className="shadow-sm">
              <Card.Header>
                <h5 className="mb-0">Envíos Recientes</h5>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Número de Seguimiento</th>
                        <th>Estado</th>
                        <th>Enviado por</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.enviosRecientes.map((envio, index) => (
                        <tr key={index}>
                          <td>{envio.tracking_number}</td>
                          <td>
                            <span className={`badge ${
                              envio.status === 'completado' ? 'bg-success' :
                              envio.status === 'en_proceso' ? 'bg-warning' :
                              envio.status === 'recibido' ? 'bg-info' : 'bg-secondary'
                            }`}>
                              {envio.status}
                            </span>
                          </td>
                          <td>{envio.sender_name}</td>
                          <td>{new Date(envio.created_at).toLocaleDateString()}</td>
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
