import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Button, Badge } from 'react-bootstrap';
import { FiTarget, FiUsers, FiDollarSign, FiTrendingUp, FiActivity, FiBriefcase, FiPlus, FiEye, FiRefreshCw } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import StatsCard from '../../components/common/StatsCard';
import apiFetch from '../../services/api';

export default function VendedorComercialDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      setSuccessMessage(null);
      
      const data = await apiFetch('/api/role-dashboard/vendedor-comercial');
      
      // Validar que los datos recibidos sean válidos
      if (!data) {
        throw new Error('No se recibieron datos del servidor');
      }
      
      setStats(data);
      setLastUpdate(new Date());
      
      if (showRefreshLoader) {
        setSuccessMessage('Datos actualizados correctamente');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      const errorMessage = err.message || 'Error al cargar los datos del dashboard. Por favor, inténtalo de nuevo.';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const handleAction = async (action, actionName) => {
    try {
      setActionLoading(action);
      setError(null);
      setSuccessMessage(null);
      
      // Simular delay para mostrar feedback visual
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      switch (action) {
        case 'nueva-cotizacion':
          navigate('/cotizaciones/inteligente');
          break;
        case 'ver-clientes':
          navigate('/clientes');
          break;
        case 'ver-proyectos':
          navigate('/proyectos');
          break;
        case 'enviar-comprobante':
          navigate('/comprobantes-pago');
          break;
        default:
          throw new Error(`Acción ${action} no implementada`);
      }
      
      // Mostrar mensaje de éxito
      setSuccessMessage(`${actionName} ejecutado correctamente`);
      setTimeout(() => setSuccessMessage(null), 2000);
      
    } catch (err) {
      console.error(`Error en acción ${action}:`, err);
      const errorMessage = err.message || `Error al ejecutar ${actionName}. Por favor, inténtalo de nuevo.`;
      setError(errorMessage);
    } finally {
      setActionLoading(null);
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
      >
        <div className="d-flex align-items-center">
          {lastUpdate && (
            <small className="text-muted me-3">
              Última actualización: {lastUpdate.toLocaleTimeString('es-PE')}
            </small>
          )}
          <Button 
            variant="outline-primary" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <>
                <Spinner size="sm" className="me-2" />
                Actualizando...
              </>
            ) : (
              <>
                <FiRefreshCw className="me-2" />
                Actualizar
              </>
            )}
          </Button>
        </div>
      </PageHeader>

      {/* Notificaciones */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
          <Alert.Heading>⚠️ Error</Alert.Heading>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)} className="mb-4">
          <Alert.Heading>✅ Éxito</Alert.Heading>
          {successMessage}
        </Alert>
      )}

      {/* Acciones rápidas */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">⚡ Acciones Rápidas</h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={3}>
                  <Button
                    variant="primary"
                    className="w-100 d-flex align-items-center justify-content-center"
                    onClick={() => handleAction('nueva-cotizacion', 'Nueva Cotización')}
                    disabled={actionLoading === 'nueva-cotizacion'}
                  >
                    {actionLoading === 'nueva-cotizacion' ? (
                      <Spinner size="sm" className="me-2" />
                    ) : (
                      <FiPlus className="me-2" />
                    )}
                    Nueva Cotización
                  </Button>
                </Col>
                <Col md={3}>
                  <Button
                    variant="info"
                    className="w-100 d-flex align-items-center justify-content-center"
                    onClick={() => handleAction('ver-clientes', 'Ver Clientes')}
                    disabled={actionLoading === 'ver-clientes'}
                  >
                    {actionLoading === 'ver-clientes' ? (
                      <Spinner size="sm" className="me-2" />
                    ) : (
                      <FiUsers className="me-2" />
                    )}
                    Ver Clientes
                  </Button>
                </Col>
                <Col md={3}>
                  <Button
                    variant="success"
                    className="w-100 d-flex align-items-center justify-content-center"
                    onClick={() => handleAction('ver-proyectos', 'Ver Proyectos')}
                    disabled={actionLoading === 'ver-proyectos'}
                  >
                    {actionLoading === 'ver-proyectos' ? (
                      <Spinner size="sm" className="me-2" />
                    ) : (
                      <FiBriefcase className="me-2" />
                    )}
                    Ver Proyectos
                  </Button>
                </Col>
                <Col md={3}>
                  <Button
                    variant="warning"
                    className="w-100 d-flex align-items-center justify-content-center"
                    onClick={() => handleAction('enviar-comprobante', 'Enviar Comprobante')}
                    disabled={actionLoading === 'enviar-comprobante'}
                  >
                    {actionLoading === 'enviar-comprobante' ? (
                      <Spinner size="sm" className="me-2" />
                    ) : (
                      <FiDollarSign className="me-2" />
                    )}
                    Enviar Comprobante
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Métricas principales */}
      <Row className="mb-4 g-3">
        <Col>
          <h4 className="text-primary mb-3">
            <FiTarget className="me-2" />
            Resumen de tu actividad comercial
          </h4>
        </Col>
      </Row>
      <Row className="mb-4 g-3">
        <Col lg={3} md={6}>
          <StatsCard
            title="Mis Cotizaciones"
            value={stats?.misCotizaciones || 0}
            icon={FiTarget}
            color="primary"
            subtitle={`${stats?.cotizacionesAprobadas || 0} aprobadas`}
            size="normal"
          />
        </Col>
        <Col lg={3} md={6}>
          <StatsCard
            title="Clientes"
            value={stats?.totalClientes || 0}
            icon={FiUsers}
            color="info"
            subtitle={`${stats?.clientesNuevosEsteMes || 0} nuevos este mes`}
            size="normal"
          />
        </Col>
        <Col lg={3} md={6}>
          <StatsCard
            title="Ingresos Generados"
            value={`$${(stats?.ingresosGenerados || 0).toLocaleString()}`}
            icon={FiDollarSign}
            color="success"
            subtitle={`${stats?.cotizacionesFacturadas || 0} facturadas`}
            size="normal"
          />
        </Col>
        <Col lg={3} md={6}>
          <StatsCard
            title="Tasa de Conversión"
            value={`${stats?.conversionRate || 0}%`}
            icon={FiTrendingUp}
            color="warning"
            subtitle="Cotizaciones aprobadas"
            size="normal"
          />
        </Col>
      </Row>

      {/* Métricas de proyectos y mensuales */}
      <Row className="mb-4 g-3">
        <Col>
          <h4 className="text-info mb-3">
            <FiActivity className="me-2" />
            Métricas mensuales y proyectos
          </h4>
        </Col>
      </Row>
      <Row className="mb-4 g-3">
        <Col lg={3} md={6}>
          <StatsCard
            title="Proyectos Activos"
            value={stats?.proyectosActivos || 0}
            icon={FiBriefcase}
            color="primary"
            subtitle={`${stats?.proyectosCompletados || 0} completados`}
            size="normal"
          />
        </Col>
        <Col lg={3} md={6}>
          <StatsCard
            title="Cotizaciones Este Mes"
            value={stats?.cotizacionesEsteMes || 0}
            icon={FiActivity}
            color="info"
            subtitle="Nuevas cotizaciones"
            size="normal"
          />
        </Col>
        <Col lg={3} md={6}>
          <StatsCard
            title="Ingresos Este Mes"
            value={`$${(stats?.ingresosEsteMes || 0).toLocaleString()}`}
            icon={FiDollarSign}
            color="success"
            subtitle="Ingresos del mes actual"
            size="normal"
          />
        </Col>
        <Col lg={3} md={6}>
          <StatsCard
            title="Clientes Nuevos"
            value={stats?.clientesNuevosEsteMes || 0}
            icon={FiUsers}
            color="warning"
            subtitle="Este mes"
            size="normal"
          />
        </Col>
      </Row>

      {/* Cotizaciones recientes */}
      <Row className="mb-4">
        <Col>
          <h4 className="text-success mb-3">
            <FiTarget className="me-2" />
            Actividad reciente
          </h4>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">📋 Mis Cotizaciones Recientes</h5>
              <Badge bg="primary">{stats?.cotizacionesRecientes?.length || 0}</Badge>
            </Card.Header>
            <Card.Body>
              {stats?.cotizacionesRecientes?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead className="table-light">
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
                          <td>
                            <code className="text-primary">{cotizacion.quote_number}</code>
                            {cotizacion.distinctive_info?.variant && (
                              <div>
                                <Badge bg="primary" size="sm">{cotizacion.distinctive_info.variant}</Badge>
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="fw-medium">{cotizacion.client_contact}</div>
                            {cotizacion.project_name && (
                              <div className="text-muted small">{cotizacion.project_name}</div>
                            )}
                          </td>
                          <td>
                            <span className="fw-bold text-success">
                              S/ {cotizacion.total_amount?.toLocaleString('es-PE', { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                              }) || '0.00'}
                            </span>
                            {cotizacion.distinctive_info?.delivery_days && (
                              <div className="text-muted small">
                                {cotizacion.distinctive_info.delivery_days} días hábiles
                              </div>
                            )}
                          </td>
                          <td>
                            <Badge 
                              bg={
                                cotizacion.status === 'aprobada' ? 'success' :
                                cotizacion.status === 'facturada' ? 'primary' :
                                cotizacion.status === 'pendiente' ? 'warning' : 
                                cotizacion.status === 'borrador' ? 'secondary' : 'info'
                              }
                              className="text-capitalize"
                            >
                              {cotizacion.status || 'nueva'}
                            </Badge>
                          </td>
                          <td>
                            <small className="text-muted">
                              {new Date(cotizacion.created_at).toLocaleDateString('es-PE')}
                            </small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <FiTarget size={48} className="text-muted mb-3" />
                  <p className="text-muted mb-0">No tienes cotizaciones recientes</p>
                  <small className="text-muted">Crea tu primera cotización usando el botón "Nueva Cotización"</small>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Clientes recientes */}
        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">👥 Mis Clientes Recientes</h5>
              <Badge bg="info">{stats?.clientesRecientes?.length || 0}</Badge>
            </Card.Header>
            <Card.Body>
              {stats?.clientesRecientes?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Empresa</th>
                        <th>RUC</th>
                        <th>Última Cotización</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.clientesRecientes.map((cliente, index) => (
                        <tr key={index}>
                          <td>
                            <div className="fw-medium">{cliente.name}</div>
                          </td>
                          <td>
                            <code className="text-muted">{cliente.ruc}</code>
                          </td>
                          <td>
                            <small className="text-muted">
                              {new Date(cliente.ultima_cotizacion).toLocaleDateString('es-PE')}
                            </small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <FiUsers size={48} className="text-muted mb-3" />
                  <p className="text-muted mb-0">No tienes clientes recientes</p>
                  <small className="text-muted">Los clientes aparecerán aquí cuando crees cotizaciones</small>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Proyectos recientes */}
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">📁 Mis Proyectos Recientes</h5>
              <Badge bg="success">{stats?.proyectosRecientes?.length || 0}</Badge>
            </Card.Header>
            <Card.Body>
              {stats?.proyectosRecientes?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead className="table-light">
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
                          <td>
                            <div className="fw-medium">{proyecto.name}</div>
                          </td>
                          <td>
                            <div className="text-muted">{proyecto.company_name}</div>
                          </td>
                          <td>
                            <Badge 
                              bg={
                                proyecto.status === 'activo' ? 'success' :
                                proyecto.status === 'completado' ? 'primary' :
                                proyecto.status === 'pendiente' ? 'warning' : 
                                proyecto.status === 'en_progreso' ? 'info' : 'secondary'
                              }
                              className="text-capitalize"
                            >
                              {proyecto.status}
                            </Badge>
                          </td>
                          <td>
                            <small className="text-muted">
                              {new Date(proyecto.created_at).toLocaleDateString('es-PE')}
                            </small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <FiBriefcase size={48} className="text-muted mb-3" />
                  <p className="text-muted mb-0">No tienes proyectos recientes</p>
                  <small className="text-muted">Los proyectos aparecerán aquí cuando crees cotizaciones</small>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
