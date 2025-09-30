import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { FiFileText, FiUpload, FiCheckCircle, FiClock, FiDollarSign, FiUser, FiHome } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAsesorStats } from '../services/asesor';

const DashboardAsesor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalQuotes: 0,
    pendingQuotes: 0,
    approvedQuotes: 0,
    totalProofs: 0,
    pendingProofs: 0,
    approvedProofs: 0,
    recentQuotes: [],
    recentProofs: []
  });

  useEffect(() => {
    fetchAsesorStats();
  }, []);

  const fetchAsesorStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getAsesorStats();

      setStats({
        totalQuotes: data.quotes.total,
        pendingQuotes: data.quotes.pending,
        approvedQuotes: data.quotes.approved,
        totalProofs: data.proofs.total,
        pendingProofs: data.proofs.pending,
        approvedProofs: data.proofs.approved,
        recentQuotes: data.recentQuotes,
        recentProofs: data.recentProofs
      });

    } catch (err) {
      console.error('Error fetching asesor stats:', err);
      setError('Error al cargar las estadísticas: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2>📊 Dashboard Asesor</h2>
          <p className="text-muted">Resumen de tu actividad comercial</p>
        </Col>
        <Col xs="auto">
          <Button variant="outline-primary" onClick={fetchAsesorStats}>
            <FiClock className="me-2" />
            Actualizar
          </Button>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Estadísticas principales */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FiFileText className="text-primary mb-2" style={{ fontSize: '2rem' }} />
              <h3>{stats.totalQuotes}</h3>
              <p className="text-muted mb-0">Cotizaciones Totales</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FiClock className="text-warning mb-2" style={{ fontSize: '2rem' }} />
              <h3>{stats.pendingQuotes}</h3>
              <p className="text-muted mb-0">Cotizaciones Pendientes</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FiCheckCircle className="text-success mb-2" style={{ fontSize: '2rem' }} />
              <h3>{stats.approvedQuotes}</h3>
              <p className="text-muted mb-0">Cotizaciones Aprobadas</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FiUpload className="text-info mb-2" style={{ fontSize: '2rem' }} />
              <h3>{stats.totalProofs}</h3>
              <p className="text-muted mb-0">Comprobantes Enviados</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Estadísticas de comprobantes */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <FiClock className="text-warning mb-2" style={{ fontSize: '1.5rem' }} />
              <h4>{stats.pendingProofs}</h4>
              <p className="text-muted mb-0">Comprobantes Pendientes</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <FiCheckCircle className="text-success mb-2" style={{ fontSize: '1.5rem' }} />
              <h4>{stats.approvedProofs}</h4>
              <p className="text-muted mb-0">Comprobantes Aprobados</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <FiDollarSign className="text-primary mb-2" style={{ fontSize: '1.5rem' }} />
              <h4>{stats.approvedProofs}</h4>
              <p className="text-muted mb-0">Pagos Procesados</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Cotizaciones recientes */}
        <Col lg={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FiFileText className="me-2" />
                Cotizaciones Recientes
              </h5>
            </Card.Header>
            <Card.Body>
              {stats.recentQuotes.length === 0 ? (
                <p className="text-muted text-center">No tienes cotizaciones</p>
              ) : (
                <div className="list-group list-group-flush">
                  {stats.recentQuotes.map((quote) => (
                    <div key={quote.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">{quote.quote_number}</h6>
                          <p className="mb-1 text-muted">
                            <strong>Cliente:</strong> {quote.client_name}<br/>
                            <strong>Monto:</strong> ${quote.total_amount?.toLocaleString()}
                          </p>
                        </div>
                        <Badge bg={
                          quote.status === 'approved' ? 'success' : 
                          quote.status === 'pending' ? 'warning' : 'secondary'
                        }>
                          {quote.status === 'approved' ? 'Aprobada' : 
                           quote.status === 'pending' ? 'Pendiente' : 'Nueva'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Comprobantes recientes */}
        <Col lg={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FiUpload className="me-2" />
                Comprobantes Recientes
              </h5>
            </Card.Header>
            <Card.Body>
              {stats.recentProofs.length === 0 ? (
                <p className="text-muted text-center">No has enviado comprobantes</p>
              ) : (
                <div className="list-group list-group-flush">
                  {stats.recentProofs.map((proof) => (
                    <div key={proof.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">Cotización: {proof.quote_number}</h6>
                          <p className="mb-1 text-muted">
                            <strong>Monto:</strong> ${proof.amount_paid?.toLocaleString()}<br/>
                            <strong>Fecha:</strong> {new Date(proof.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge bg={
                          proof.status === 'approved' ? 'success' : 
                          proof.status === 'pending' ? 'warning' : 'danger'
                        }>
                          {proof.status === 'approved' ? 'Aprobado' : 
                           proof.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Acciones rápidas */}
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Acciones Rápidas</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex gap-3">
                <Button 
                  variant="primary" 
                  onClick={() => navigate('/cotizaciones/inteligente')}
                  className="d-flex align-items-center"
                >
                  <FiFileText className="me-2" />
                  Nueva Cotización
                </Button>
                <Button 
                  variant="success" 
                  onClick={() => navigate('/enviar-comprobante')}
                  className="d-flex align-items-center"
                >
                  <FiUpload className="me-2" />
                  Enviar Comprobante
                </Button>
                <Button 
                  variant="info" 
                  onClick={() => navigate('/clientes')}
                  className="d-flex align-items-center"
                >
                  <FiUser className="me-2" />
                  Ver Clientes
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => navigate('/proyectos')}
                  className="d-flex align-items-center"
                >
                  <FiHome className="me-2" />
                  Ver Proyectos
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardAsesor;
