import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form, Spinner, Alert, Table, Modal } from 'react-bootstrap';
import { FiEye, FiFileText, FiUser, FiCalendar, FiDollarSign, FiTrendingUp, FiRefreshCw, FiUpload, FiCheck, FiDownload } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const FacturacionProyectos = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    vendedor: '',
    cliente: ''
  });

  // Modal para adjuntar factura
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [invoiceData, setInvoiceData] = useState({
    invoice_number: '',
    invoice_date: new Date().toISOString().split('T')[0],
    invoice_amount: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener proyectos para facturación
      const projectsData = await api('/api/projects/for-invoicing');
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
    if (filters.vendedor && !project.created_by_name?.toLowerCase().includes(filters.vendedor.toLowerCase())) return false;
    if (filters.cliente && !project.company_name?.toLowerCase().includes(filters.cliente.toLowerCase())) return false;
    return true;
  });

  const handleInvoiceUpload = async () => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('project_id', selectedProject.id);
      formData.append('invoice_number', invoiceData.invoice_number);
      formData.append('invoice_date', invoiceData.invoice_date);
      formData.append('invoice_amount', invoiceData.invoice_amount);
      formData.append('notes', invoiceData.notes);
      if (invoiceFile) {
        formData.append('invoice_file', invoiceFile);
      }

      await api('/api/projects/upload-invoice', {
        method: 'POST',
        body: formData
      });

      setShowInvoiceModal(false);
      setSelectedProject(null);
      setInvoiceFile(null);
      setInvoiceData({
        invoice_number: '',
        invoice_date: new Date().toISOString().split('T')[0],
        invoice_amount: '',
        notes: ''
      });

      // Recargar datos
      await fetchData();

    } catch (error) {
      setError('Error al subir factura: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const openInvoiceModal = (project) => {
    setSelectedProject(project);
    const metrics = getProjectMetrics(project);
    setInvoiceData(prev => ({
      ...prev,
      invoice_amount: metrics.totalAmount.toString()
    }));
    setShowInvoiceModal(true);
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-2">Cargando proyectos para facturación...</p>
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
          <h2>💰 Facturación de Proyectos</h2>
          <p className="text-muted">Proyectos listos para facturar</p>
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
            placeholder="Filtrar por vendedor..."
            value={filters.vendedor}
            onChange={(e) => setFilters(prev => ({ ...prev, vendedor: e.target.value }))}
          />
        </Col>
        <Col md={3}>
          <Form.Control
            type="text"
            placeholder="Filtrar por cliente..."
            value={filters.cliente}
            onChange={(e) => setFilters(prev => ({ ...prev, cliente: e.target.value }))}
          />
        </Col>
        <Col md={3}>
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              onClick={() => setFilters({ status: '', vendedor: '', cliente: '' })}
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
              <small className="text-muted">Vendedores Asignados</small>
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
                    : 'No hay proyectos listos para facturar'
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
                      {status === 'en_proceso' && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => openInvoiceModal(project)}
                        >
                          <FiUpload className="me-1" />
                          Adjuntar Factura
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })
        )}
      </Row>

      {/* Modal para adjuntar factura */}
      <Modal show={showInvoiceModal} onHide={() => setShowInvoiceModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Adjuntar Factura</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProject && (
            <div className="mb-3">
              <h6>Proyecto: {selectedProject.name}</h6>
              <p className="text-muted">Cliente: {selectedProject.company_name}</p>
            </div>
          )}
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Número de Factura *</Form.Label>
                <Form.Control
                  type="text"
                  value={invoiceData.invoice_number}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, invoice_number: e.target.value }))}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha de Factura *</Form.Label>
                <Form.Control
                  type="date"
                  value={invoiceData.invoice_date}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, invoice_date: e.target.value }))}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Monto de Factura (S/) *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={invoiceData.invoice_amount}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, invoice_amount: e.target.value }))}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Archivo de Factura</Form.Label>
                <Form.Control
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setInvoiceFile(e.target.files[0])}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Notas</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={invoiceData.notes}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInvoiceModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleInvoiceUpload} disabled={loading}>
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Subiendo...
              </>
            ) : (
              <>
                <FiUpload className="me-2" />
                Adjuntar Factura
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default FacturacionProyectos;
