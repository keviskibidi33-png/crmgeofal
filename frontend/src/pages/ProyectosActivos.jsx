import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form, Spinner, Alert, Table } from 'react-bootstrap';
import { FiEye, FiFileText, FiUser, FiCalendar, FiDollarSign, FiTrendingUp, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const ProyectosActivos = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    client: '',
    vendedor: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener proyectos activos
      const projectsData = await api('/api/projects/active');
      setProjects(projectsData || []);

      // Obtener cotizaciones relacionadas
      const quotesData = await api('/api/quotes/with-projects');
      setQuotes(quotesData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error al cargar los datos: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'borrador': { variant: 'warning', text: 'Borrador' },
      'aprobada': { variant: 'success', text: 'Aprobada' },
      'facturada': { variant: 'info', text: 'Facturada' },
      'activo': { variant: 'primary', text: 'Activo' },
      'completado': { variant: 'success', text: 'Completado' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const getProjectStatus = (project) => {
    // Determinar estado del proyecto basado en sus cotizaciones
    const projectQuotes = quotes.filter(q => q.project_id === project.id);
    
    if (projectQuotes.length === 0) return 'sin_cotizaciones';
    if (projectQuotes.some(q => q.status === 'facturada')) return 'completado';
    if (projectQuotes.some(q => q.status === 'aprobada')) return 'en_proceso';
    if (projectQuotes.some(q => q.status === 'borrador')) return 'pendiente';
    
    return 'activo';
  };

  const getProjectMetrics = (project) => {
    const projectQuotes = quotes.filter(q => q.project_id === project.id);
    
    return {
      totalQuotes: projectQuotes.length,
      approvedQuotes: projectQuotes.filter(q => q.status === 'aprobada').length,
      invoicedQuotes: projectQuotes.filter(q => q.status === 'facturada').length,
      totalAmount: projectQuotes.reduce((sum, q) => sum + (q.total || 0), 0),
      lastActivity: projectQuotes.length > 0 ? 
        new Date(Math.max(...projectQuotes.map(q => new Date(q.updated_at)))) : 
        new Date(project.updated_at)
    };
  };

  const filteredProjects = projects.filter(project => {
    if (filters.status && getProjectStatus(project) !== filters.status) return false;
    if (filters.client && !project.company_name?.toLowerCase().includes(filters.client.toLowerCase())) return false;
    if (filters.vendedor && !project.created_by_name?.toLowerCase().includes(filters.vendedor.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-2">Cargando proyectos activos...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>🏗️ Proyectos Activos</h2>
          <p className="text-muted">Seguimiento de proyectos y sus cotizaciones</p>
        </Col>
        <Col md="auto">
          <Button variant="outline-secondary" onClick={fetchData}>
            <FiRefreshCw className="me-2" />
            Actualizar
          </Button>
        </Col>
      </Row>

      {/* Filtros */}
      <Row className="mb-4">
        <Col md={3}>
          <Form.Select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_proceso">En Proceso</option>
            <option value="completado">Completado</option>
            <option value="sin_cotizaciones">Sin Cotizaciones</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Control
            type="text"
            placeholder="Filtrar por cliente..."
            value={filters.client}
            onChange={(e) => setFilters(prev => ({ ...prev, client: e.target.value }))}
          />
        </Col>
        <Col md={3}>
          <Form.Control
            type="text"
            placeholder="Filtrar por vendedor..."
            value={filters.vendedor}
            onChange={(e) => setFilters(prev => ({ ...prev, vendedor: e.target.value }))}
          />
        </Col>
        <Col md={3}>
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              onClick={() => setFilters({ status: '', client: '', vendedor: '' })}
            >
              Limpiar
            </Button>
          </div>
        </Col>
      </Row>

      {/* Resumen de métricas */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FiFileText size={24} className="text-primary mb-2" />
              <h4>{projects.length}</h4>
              <small className="text-muted">Total Proyectos</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FiTrendingUp size={24} className="text-success mb-2" />
              <h4>{projects.filter(p => getProjectStatus(p) === 'en_proceso').length}</h4>
              <small className="text-muted">En Proceso</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FiDollarSign size={24} className="text-info mb-2" />
              <h4>S/ {projects.reduce((sum, p) => {
                const metrics = getProjectMetrics(p);
                return sum + metrics.totalAmount;
              }, 0).toFixed(2)}</h4>
              <small className="text-muted">Monto Total</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FiUser size={24} className="text-warning mb-2" />
              <h4>{new Set(projects.map(p => p.created_by_name)).size}</h4>
              <small className="text-muted">Vendedores Activos</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Lista de proyectos */}
      <Row>
        {filteredProjects.length === 0 ? (
          <Col>
            <Card>
              <Card.Body className="text-center py-5">
                <FiFileText size={48} className="text-muted mb-3" />
                <h5>No hay proyectos</h5>
                <p className="text-muted">
                  {Object.values(filters).some(f => f) 
                    ? 'No se encontraron proyectos con los filtros aplicados'
                    : 'No hay proyectos activos registrados'
                  }
                </p>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          filteredProjects.map((project) => {
            const metrics = getProjectMetrics(project);
            const status = getProjectStatus(project);
            const projectQuotes = quotes.filter(q => q.project_id === project.id);

            return (
              <Col key={project.id} md={6} lg={4} className="mb-3">
                <Card>
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <strong>{project.name}</strong>
                    {getStatusBadge(status)}
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-2">
                      <strong>Cliente:</strong> {project.company_name || 'N/A'}
                    </div>
                    <div className="mb-2">
                      <strong>Vendedor:</strong> {project.created_by_name || 'N/A'}
                    </div>
                    <div className="mb-2">
                      <strong>Ubicación:</strong> {project.location || 'N/A'}
                    </div>
                    <div className="mb-2">
                      <strong>Descripción:</strong> {project.description || 'Sin descripción'}
                    </div>
                    
                    <hr />
                    
                    <div className="mb-2">
                      <strong>Cotizaciones:</strong> {metrics.totalQuotes}
                    </div>
                    <div className="mb-2">
                      <strong>Monto Total:</strong> S/ {metrics.totalAmount.toFixed(2)}
                    </div>
                    <div className="mb-2">
                      <strong>Última Actividad:</strong> {metrics.lastActivity.toLocaleDateString()}
                    </div>

                    {projectQuotes.length > 0 && (
                      <div className="mt-3">
                        <h6>Cotizaciones del Proyecto:</h6>
                        <Table size="sm">
                          <thead>
                            <tr>
                              <th>Número</th>
                              <th>Estado</th>
                              <th>Monto</th>
                            </tr>
                          </thead>
                          <tbody>
                            {projectQuotes.map((quote) => (
                              <tr key={quote.id}>
                                <td>{quote.quote_number || `COT-${quote.id}`}</td>
                                <td>{getStatusBadge(quote.status)}</td>
                                <td>S/ {quote.total?.toFixed(2) || '0.00'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    )}

                    <div className="d-flex gap-2 mt-3">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => {
                          // Navegar a detalles del proyecto
                          window.location.href = `/proyectos/${project.id}`;
                        }}
                      >
                        <FiEye className="me-1" />
                        Ver Detalles
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })
        )}
      </Row>
    </Container>
  );
};

export default ProyectosActivos;
