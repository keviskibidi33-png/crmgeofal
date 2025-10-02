import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Badge, Button, Table, ProgressBar } from 'react-bootstrap';
import { FiTrendingUp, FiUsers, FiDollarSign, FiBarChart2, FiRefreshCw, FiClock, FiCheckCircle, FiFileText } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const MetricasEmbudo = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    servicesDistribution: [],
    categoryRanking: [],
    ensayosRanking: [],
    hierarchicalStructure: [],
    conversionByCategory: [],
    monthlyTrends: [],
    underutilizedServices: [],
    salespersonPerformance: [],
    executiveSummary: {},
    funnelByArea: [],
    approvalMetrics: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Solo cargar datos si el usuario tiene permisos
      if (user.role === 'admin' || user.role === 'jefa_comercial') {
        const [
          services,
          categoryRanking,
          ensayosRanking,
          hierarchicalStructure,
          categories,
          trends,
          underutilized,
          performance,
          summary,
          byArea,
          approvalMetrics
        ] = await Promise.all([
          api('/api/funnel/distribution'),
          api('/api/funnel/category-ranking'),
          api('/api/funnel/ensayos-ranking'),
          api('/api/funnel/hierarchical-structure'),
          api('/api/funnel/categories'),
          api('/api/funnel/trends'),
          api('/api/funnel/underutilized'),
          api('/api/funnel/performance'),
          api('/api/funnel/summary'),
          api('/api/funnel/by-area'),
          api('/api/funnel/approval-metrics')
        ]);

        setMetrics({
          servicesDistribution: services || [],
          categoryRanking: categoryRanking || [],
          ensayosRanking: ensayosRanking || [],
          hierarchicalStructure: hierarchicalStructure || [],
          conversionByCategory: categories || [],
          monthlyTrends: trends || [],
          underutilizedServices: underutilized || [],
          salespersonPerformance: performance || [],
          executiveSummary: summary || {},
          funnelByArea: byArea || [],
          approvalMetrics: approvalMetrics || {}
        });
      } else {
        setError('No tienes permisos para acceder a esta sección');
      }
    } catch (err) {
      console.error('Error fetching metrics:', err);
      if (err.status === 401) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
      } else if (err.status === 403) {
        setError('No tienes permisos para acceder a esta sección.');
      } else {
        setError('Error al cargar las métricas: ' + (err.message || 'Error desconocido'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Verificar permisos
  if (!user || !['admin', 'jefa_comercial'].includes(user.role)) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">
          <h4>Acceso Denegado</h4>
          <p>No tienes permisos para acceder a esta sección. Solo los administradores y jefes comerciales pueden ver las métricas de embudo.</p>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" />
        <div className="ms-3">
          <p>Cargando métricas...</p>
        </div>
      </Container>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('es-PE').format(number);
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2>📊 Análisis de Conversión y Rendimiento Comercial</h2>
          <p className="text-muted">Dashboard inteligente para jefes comerciales</p>
        </Col>
        <Col xs="auto">
          <Button variant="outline-primary" onClick={fetchMetrics}>
            <FiRefreshCw className="me-2" />
            Actualizar
          </Button>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Resumen Ejecutivo */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FiDollarSign className="me-2" />
                Resumen Ejecutivo
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <div className="text-center">
                    <h3 className="text-primary">{metrics.executiveSummary.approved_quotes || 0}</h3>
                    <p className="text-muted">Cotizaciones Aprobadas</p>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h3 className="text-success">
                      {formatCurrency(metrics.executiveSummary.approved_amount || 0)}
                    </h3>
                    <p className="text-muted">Monto Total Aprobado</p>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h3 className="text-info">
                      {formatCurrency(metrics.executiveSummary.average_approved_amount || 0)}
                    </h3>
                    <p className="text-muted">Promedio por Cotización</p>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h3 className="text-warning">
                      {metrics.executiveSummary.active_salespeople || 0}
                    </h3>
                    <p className="text-muted">Vendedores Activos</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Ranking de Categorías por Ítems y Dinero */}
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FiBarChart2 className="me-2" />
                🏆 Ranking de Categorías
              </h5>
            </Card.Header>
            <Card.Body>
              {metrics.categoryRanking.length === 0 ? (
                <p className="text-muted text-center">No hay datos disponibles</p>
              ) : (
                <div className="list-group list-group-flush">
                  {metrics.categoryRanking.map((category, index) => (
                    <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <Badge 
                          bg={index === 0 ? "warning" : index === 1 ? "secondary" : "info"} 
                          className="me-3 fs-6"
                        >
                          #{index + 1}
                        </Badge>
                        <div>
                          <strong className="text-capitalize">{category.category_name}</strong>
                          <br />
                          <small className="text-muted">
                            {category.total_items} ítems • {category.total_quotes} cotizaciones
                          </small>
                        </div>
                      </div>
                      <div className="text-end">
                        <Badge bg="success" className="fs-6 mb-1">
                          S/ {category.total_money?.toLocaleString() || '0'}
                        </Badge>
                        <br />
                        <small className="text-muted">
                          Promedio: S/ {category.average_money_per_quote?.toLocaleString() || '0'}
                        </small>
                        <br />
                        <small className="text-info">
                          {category.percentage_of_items}% del total
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Ranking de Ensayos (Servicios Padre) */}
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FiTrendingUp className="me-2" />
                🧪 Ranking de Ensayos
              </h5>
            </Card.Header>
            <Card.Body>
              {metrics.ensayosRanking.length === 0 ? (
                <p className="text-muted text-center">No hay datos disponibles</p>
              ) : (
                <div className="list-group list-group-flush">
                  {metrics.ensayosRanking.slice(0, 10).map((ensayo, index) => (
                    <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <Badge 
                          bg={index === 0 ? "warning" : index === 1 ? "secondary" : index === 2 ? "info" : "light"} 
                          className="me-3 fs-6"
                        >
                          #{index + 1}
                        </Badge>
                        <div>
                          <strong className="text-capitalize">{ensayo.ensayo_name}</strong>
                          <br />
                          <small className="text-muted">
                            {ensayo.total_hijos_cotizados} hijos cotizados • {ensayo.total_quotes} cotizaciones
                          </small>
                          <br />
                          <small className="text-info">
                            {ensayo.category_main} • {ensayo.percentage_of_items}% del total
                          </small>
                        </div>
                      </div>
                      <div className="text-end">
                        <Badge bg="success" className="fs-6 mb-1">
                          S/ {ensayo.total_money?.toLocaleString() || '0'}
                        </Badge>
                        <br />
                        <small className="text-muted">
                          Promedio: S/ {ensayo.average_money_per_quote?.toLocaleString() || '0'}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Estructura Jerárquica Completa */}
        <Col lg={12} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FiBarChart2 className="me-2" />
                🌳 Estructura Jerárquica del Embudo
              </h5>
            </Card.Header>
            <Card.Body>
              {metrics.hierarchicalStructure.length === 0 ? (
                <p className="text-muted text-center">No hay datos disponibles</p>
              ) : (
                <div className="hierarchical-structure">
                  {metrics.hierarchicalStructure.map((item, index) => (
                    <div 
                      key={index} 
                      className={`hierarchy-item ${item.level}`}
                      style={{
                        marginLeft: item.level === 'category' ? '0px' : 
                                   item.level === 'ensayo' ? '20px' : '40px',
                        padding: '10px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '5px',
                        marginBottom: '5px',
                        backgroundColor: item.level === 'category' ? '#f8f9fa' : 
                                       item.level === 'ensayo' ? '#e3f2fd' : '#f3e5f5'
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          {item.level === 'category' && <span className="me-2">📁</span>}
                          {item.level === 'ensayo' && <span className="me-2">🧪</span>}
                          {item.level === 'subservicio' && <span className="me-2">📋</span>}
                          <div>
                            <strong className="text-capitalize">{item.name}</strong>
                            {item.level === 'category' && (
                              <div className="text-muted small">
                                {item.total_items} ítems • {item.total_quotes} cotizaciones
                              </div>
                            )}
                            {item.level === 'ensayo' && (
                              <div className="text-muted small">
                                {item.total_items} hijos cotizados • {item.total_quotes} cotizaciones
                              </div>
                            )}
                            {item.level === 'subservicio' && (
                              <div className="text-muted small">
                                {item.veces_cotizado} veces cotizado • {item.total_quotes} cotizaciones
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-end">
                          <Badge bg="success" className="fs-6">
                            S/ {item.total_money?.toLocaleString() || '0'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Conversión por Categoría */}
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FiCheckCircle className="me-2" />
                Conversión por Categoría
              </h5>
            </Card.Header>
            <Card.Body>
              {metrics.conversionByCategory.length === 0 ? (
                <p className="text-muted text-center">No hay datos disponibles</p>
              ) : (
                <Table responsive size="sm">
                  <thead>
                    <tr>
                      <th>Categoría</th>
                      <th>Borradores</th>
                      <th>Aprobadas</th>
                      <th>% Conversión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.conversionByCategory.map((category, index) => (
                      <tr key={index}>
                        <td>{category.category_name}</td>
                        <td>{category.draft_count}</td>
                        <td>{category.approved_count}</td>
                        <td>
                          <Badge bg={category.conversion_rate > 50 ? 'success' : category.conversion_rate > 25 ? 'warning' : 'danger'}>
                            {category.conversion_rate}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Rendimiento de Vendedores */}
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FiUsers className="me-2" />
                Rendimiento de Vendedores
              </h5>
            </Card.Header>
            <Card.Body>
              {metrics.salespersonPerformance.length === 0 ? (
                <p className="text-muted text-center">No hay datos disponibles</p>
              ) : (
                <div className="list-group list-group-flush">
                  {metrics.salespersonPerformance.map((salesperson, index) => (
                    <div key={index} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0">{salesperson.name} {salesperson.apellido}</h6>
                        <Badge bg="info">{salesperson.area}</Badge>
                      </div>
                      <div className="row text-center">
                        <div className="col-4">
                          <small className="text-muted">Total</small>
                          <div className="fw-bold">{salesperson.total_quotes}</div>
                        </div>
                        <div className="col-4">
                          <small className="text-muted">Aprobadas</small>
                          <div className="fw-bold text-success">{salesperson.approved_quotes}</div>
                        </div>
                        <div className="col-4">
                          <small className="text-muted">% Éxito</small>
                          <div className="fw-bold text-primary">{salesperson.approval_rate}%</div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <small className="text-muted">Monto: </small>
                        <span className="fw-bold text-success">{formatCurrency(salesperson.approved_amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Servicios Subutilizados */}
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FiFileText className="me-2" />
                Servicios Subutilizados
              </h5>
            </Card.Header>
            <Card.Body>
              {metrics.underutilizedServices.length === 0 ? (
                <p className="text-muted text-center">No hay servicios subutilizados</p>
              ) : (
                <div className="list-group list-group-flush">
                  {metrics.underutilizedServices.map((service, index) => (
                    <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">{service.service_name}</h6>
                        <small className="text-muted">
                          {service.category_name} • {service.area}
                        </small>
                      </div>
                      <div className="text-end">
                        <Badge bg="warning">{service.usage_count} usos</Badge>
                        <div className="small text-muted">{formatCurrency(service.total_revenue)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Métricas de Tiempo */}
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FiClock className="me-2" />
                Métricas de Tiempo
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center">
                <h4 className="text-primary">
                  {Math.round(metrics.approvalMetrics.avg_approval_hours || 0)}h
                </h4>
                <p className="text-muted">Tiempo Promedio de Aprobación</p>
                
                <div className="mt-3">
                  <div className="d-flex justify-content-between">
                    <span>Rápido (&lt;24h)</span>
                    <span>{metrics.approvalMetrics.fast_approvals || 0}</span>
                  </div>
                  <ProgressBar 
                    now={metrics.approvalMetrics.total_approvals ? 
                      ((metrics.approvalMetrics.fast_approvals || 0) / metrics.approvalMetrics.total_approvals) * 100 : 0
                    } 
                    variant="success" 
                    className="mt-1"
                  />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MetricasEmbudo;