import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Badge, Button, Table, ProgressBar, Tabs, Tab } from 'react-bootstrap';
import { 
  FiTrendingUp, FiUsers, FiDollarSign, FiBarChart2, FiRefreshCw, 
  FiClock, FiCheckCircle, FiFileText, FiTarget, FiAward, FiActivity,
  FiPieChart, FiTrendingDown, FiEye, FiDownload, FiFilter
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './MetricasEmbudo.css';

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
    <div className="metricas-embudo">
      <Container fluid>
        {/* Header */}
        <div className="metricas-header">
          <Row className="align-items-center">
            <Col>
              <h1 className="metricas-title">
                <FiBarChart2 className="me-3" />
                Métricas de Embudo
              </h1>
              <p className="metricas-subtitle">
                Dashboard inteligente para análisis de conversión y rendimiento comercial
              </p>
            </Col>
            <Col xs="auto">
              <div className="d-flex gap-2">
                <Button className="btn-metricas-outline" onClick={fetchMetrics}>
                  <FiRefreshCw className="me-2" />
                  Actualizar
                </Button>
                <Button className="btn-metricas">
                  <FiDownload className="me-2" />
                  Exportar
                </Button>
              </div>
            </Col>
          </Row>
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)} className="metricas-card">
            <FiActivity className="me-2" />
            {error}
          </Alert>
        )}

        {/* KPIs Principales */}
        <Row className="mb-4">
          <Col lg={3} md={6} className="mb-3">
            <div className="kpi-card">
              <FiCheckCircle className="kpi-icon" />
              <div className="kpi-value">{metrics.executiveSummary.approved_quotes || 0}</div>
              <div className="kpi-label">Cotizaciones Aprobadas</div>
            </div>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <div className="kpi-card">
              <FiDollarSign className="kpi-icon" />
              <div className="kpi-value">{formatCurrency(metrics.executiveSummary.approved_amount || 0)}</div>
              <div className="kpi-label">Monto Total Aprobado</div>
            </div>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <div className="kpi-card">
              <FiTrendingUp className="kpi-icon" />
              <div className="kpi-value">{formatCurrency(metrics.executiveSummary.average_approved_amount || 0)}</div>
              <div className="kpi-label">Promedio por Cotización</div>
            </div>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <div className="kpi-card">
              <FiUsers className="kpi-icon" />
              <div className="kpi-value">{metrics.executiveSummary.active_salespeople || 0}</div>
              <div className="kpi-label">Vendedores Activos</div>
            </div>
          </Col>
        </Row>

        {/* Tabs de Análisis */}
        <div className="metricas-tabs">
          <Tabs defaultActiveKey="rankings" id="metricas-tabs" className="mb-4">
            <Tab eventKey="rankings" title={
              <span>
                <FiAward className="me-2" />
                Rankings
              </span>
            }>
              <Row>
                {/* Ranking de Categorías */}
                <Col lg={6} className="mb-4">
                  <div className="metricas-card">
                    <div className="metricas-card-header">
                      <h5 className="metricas-card-title">
                        <FiAward className="me-2" />
                        🏆 Top Categorías
                      </h5>
                    </div>
                    <div className="metricas-card-body">
                      {metrics.categoryRanking.length === 0 ? (
                        <div className="text-center text-muted py-4">
                          <FiBarChart2 size={48} className="mb-3 opacity-50" />
                          <p>No hay datos disponibles</p>
                        </div>
                      ) : (
                        <div>
                          {metrics.categoryRanking.slice(0, 8).map((category, index) => (
                            <div key={index} className="ranking-item d-flex align-items-center">
                              <div className={`ranking-position ${index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : ''}`}>
                                {index + 1}
                              </div>
                              <div className="ranking-content">
                                <div className="ranking-title text-capitalize">{category.category_name}</div>
                                <div className="ranking-subtitle">
                                  {category.total_items} ítems • {category.total_quotes} cotizaciones
                                </div>
                                <div className="ranking-stats">
                                  <span className="ranking-stat">
                                    {category.percentage_of_items}% del total
                                  </span>
                                  <span className="ranking-stat">
                                    Promedio: S/ {category.average_money_per_quote ? Number(category.average_money_per_quote).toFixed(2) : '0.00'}
                                  </span>
                                </div>
                              </div>
                              <div className="ranking-amount">
                                S/ {category.total_money?.toLocaleString() || '0'}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Col>

                {/* Ranking de Ensayos */}
                <Col lg={6} className="mb-4">
                  <div className="metricas-card">
                    <div className="metricas-card-header">
                      <h5 className="metricas-card-title">
                        <FiTarget className="me-2" />
                        🧪 Top Ensayos
                      </h5>
                    </div>
                    <div className="metricas-card-body">
                      {metrics.ensayosRanking.length === 0 ? (
                        <div className="text-center text-muted py-4">
                          <FiTrendingUp size={48} className="mb-3 opacity-50" />
                          <p>No hay datos disponibles</p>
                        </div>
                      ) : (
                        <div>
                          {metrics.ensayosRanking.slice(0, 8).map((ensayo, index) => (
                            <div key={index} className="ranking-item d-flex align-items-center">
                              <div className={`ranking-position ${index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : ''}`}>
                                {index + 1}
                              </div>
                              <div className="ranking-content">
                                <div className="ranking-title text-capitalize">{ensayo.ensayo_name}</div>
                                <div className="ranking-subtitle">
                                  {ensayo.total_hijos_cotizados} hijos cotizados • {ensayo.total_quotes} cotizaciones
                                </div>
                                <div className="ranking-stats">
                                  <span className="ranking-stat">
                                    {ensayo.category_main}
                                  </span>
                                  <span className="ranking-stat">
                                    {ensayo.percentage_of_items}% del total
                                  </span>
                                </div>
                              </div>
                              <div className="ranking-amount">
                                S/ {ensayo.total_money?.toLocaleString() || '0'}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Col>
              </Row>
            </Tab>

            <Tab eventKey="performance" title={
              <span>
                <FiUsers className="me-2" />
                Rendimiento
              </span>
            }>
              <Row>
                {/* Conversión por Categoría */}
                <Col lg={6} className="mb-4">
                  <div className="metricas-card">
                    <div className="metricas-card-header">
                      <h5 className="metricas-card-title">
                        <FiCheckCircle className="me-2" />
                        Conversión por Categoría
                      </h5>
                    </div>
                    <div className="metricas-card-body">
                      {metrics.conversionByCategory.length === 0 ? (
                        <div className="text-center text-muted py-4">
                          <FiPieChart size={48} className="mb-3 opacity-50" />
                          <p>No hay datos disponibles</p>
                        </div>
                      ) : (
                        <div>
                          {metrics.conversionByCategory.map((category, index) => (
                            <div key={index} className="ranking-item">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="ranking-title">{category.category_name}</div>
                                <Badge bg={category.conversion_rate > 50 ? 'success' : category.conversion_rate > 25 ? 'warning' : 'danger'}>
                                  {category.conversion_rate}%
                                </Badge>
                              </div>
                              <div className="progress-custom">
                                <div 
                                  className="progress-bar-custom" 
                                  style={{ width: `${category.conversion_rate}%` }}
                                ></div>
                              </div>
                              <div className="d-flex justify-content-between mt-2">
                                <small className="text-muted">Borradores: {category.draft_count}</small>
                                <small className="text-muted">Aprobadas: {category.approved_count}</small>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Col>

                {/* Rendimiento de Vendedores */}
                <Col lg={6} className="mb-4">
                  <div className="metricas-card">
                    <div className="metricas-card-header">
                      <h5 className="metricas-card-title">
                        <FiUsers className="me-2" />
                        Rendimiento de Vendedores
                      </h5>
                    </div>
                    <div className="metricas-card-body">
                      {metrics.salespersonPerformance.length === 0 ? (
                        <div className="text-center text-muted py-4">
                          <FiUsers size={48} className="mb-3 opacity-50" />
                          <p>No hay datos disponibles</p>
                        </div>
                      ) : (
                        <div>
                          {metrics.salespersonPerformance.map((salesperson, index) => (
                            <div key={index} className="ranking-item">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <div>
                                  <div className="ranking-title">{salesperson.name} {salesperson.apellido}</div>
                                  <Badge bg="info" className="mt-1">{salesperson.area}</Badge>
                                </div>
                                <div className="text-end">
                                  <div className="ranking-amount">{salesperson.approval_rate}%</div>
                                  <small className="text-muted">Éxito</small>
                                </div>
                              </div>
                              <div className="row text-center">
                                <div className="col-4">
                                  <div className="fw-bold text-primary">{salesperson.total_quotes}</div>
                                  <small className="text-muted">Total</small>
                                </div>
                                <div className="col-4">
                                  <div className="fw-bold text-success">{salesperson.approved_quotes}</div>
                                  <small className="text-muted">Aprobadas</small>
                                </div>
                                <div className="col-4">
                                  <div className="fw-bold text-info">{formatCurrency(salesperson.approved_amount)}</div>
                                  <small className="text-muted">Monto</small>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Col>
              </Row>
            </Tab>

            <Tab eventKey="structure" title={
              <span>
                <FiBarChart2 className="me-2" />
                Estructura
              </span>
            }>
              <Row>
                <Col lg={12} className="mb-4">
                  <div className="metricas-card">
                    <div className="metricas-card-header">
                      <h5 className="metricas-card-title">
                        <FiBarChart2 className="me-2" />
                        🌳 Estructura Jerárquica del Embudo
                      </h5>
                    </div>
                    <div className="metricas-card-body">
                      {metrics.hierarchicalStructure.length === 0 ? (
                        <div className="text-center text-muted py-4">
                          <FiBarChart2 size={48} className="mb-3 opacity-50" />
                          <p>No hay datos disponibles</p>
                        </div>
                      ) : (
                        <div className="hierarchical-structure">
                          {metrics.hierarchicalStructure.map((item, index) => (
                            <div 
                              key={index} 
                              className={`hierarchy-item ${item.level}`}
                              style={{
                                marginLeft: item.level === 'category' ? '0px' : 
                                           item.level === 'ensayo' ? '20px' : '40px',
                                padding: '15px',
                                border: '1px solid rgba(102, 126, 234, 0.2)',
                                borderRadius: '12px',
                                marginBottom: '10px',
                                background: item.level === 'category' ? 'linear-gradient(135deg, #f8f9fa, #e9ecef)' : 
                                           item.level === 'ensayo' ? 'linear-gradient(135deg, #e3f2fd, #bbdefb)' : 
                                           'linear-gradient(135deg, #f3e5f5, #e1bee7)',
                                transition: 'all 0.3s ease'
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
                                  <div className="ranking-amount">
                                    S/ {item.total_money?.toLocaleString() || '0'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Col>
              </Row>
            </Tab>
          </Tabs>
        </div>

        {/* Métricas Adicionales */}
        <Row>
          {/* Servicios Subutilizados */}
          <Col lg={6} className="mb-4">
            <div className="metricas-card">
              <div className="metricas-card-header">
                <h5 className="metricas-card-title">
                  <FiTrendingDown className="me-2" />
                  Servicios Subutilizados
                </h5>
              </div>
              <div className="metricas-card-body">
                {metrics.underutilizedServices.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    <FiTrendingDown size={48} className="mb-3 opacity-50" />
                    <p>No hay servicios subutilizados</p>
                  </div>
                ) : (
                  <div>
                    {metrics.underutilizedServices.map((service, index) => (
                      <div key={index} className="ranking-item d-flex justify-content-between align-items-center">
                        <div>
                          <div className="ranking-title">{service.service_name}</div>
                          <div className="ranking-subtitle">
                            {service.category_name} • {service.area}
                          </div>
                        </div>
                        <div className="text-end">
                          <Badge bg="warning" className="mb-1">{service.usage_count} usos</Badge>
                          <div className="ranking-amount">{formatCurrency(service.total_revenue)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Col>

          {/* Métricas de Tiempo */}
          <Col lg={6} className="mb-4">
            <div className="metricas-card">
              <div className="metricas-card-header">
                <h5 className="metricas-card-title">
                  <FiClock className="me-2" />
                  Métricas de Tiempo
                </h5>
              </div>
              <div className="metricas-card-body">
                <div className="text-center">
                  <div className="kpi-value text-primary">
                    {Math.round(metrics.approvalMetrics.avg_approval_hours || 0)}h
                  </div>
                  <div className="kpi-label">Tiempo Promedio de Aprobación</div>
                  
                  <div className="mt-4">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="fw-bold">Rápido (&lt;24h)</span>
                      <span className="fw-bold text-success">{metrics.approvalMetrics.fast_approvals || 0}</span>
                    </div>
                    <div className="progress-custom">
                      <div 
                        className="progress-bar-custom" 
                        style={{ 
                          width: `${metrics.approvalMetrics.total_approvals ? 
                            ((metrics.approvalMetrics.fast_approvals || 0) / metrics.approvalMetrics.total_approvals) * 100 : 0
                          }%` 
                        }}
                      ></div>
                    </div>
                    <small className="text-muted mt-2 d-block">
                      Total de aprobaciones: {metrics.approvalMetrics.total_approvals || 0}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default MetricasEmbudo;