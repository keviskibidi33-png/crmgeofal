import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { FiCheck, FiX, FiClock, FiEye, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Aprobaciones = () => {
  const { user } = useAuth();
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approvedQuotes, setApprovedQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Solo cargar datos si el usuario tiene permisos
      if (user.role === 'admin' || user.role === 'facturacion' || user.role === 'jefa_comercial') {
        const [pendingData, approvedData] = await Promise.all([
          api('/api/approvals/pending'),
          api('/api/approvals/approved')
        ]);

        setPendingApprovals(pendingData || []);
        setApprovedQuotes(approvedData || []);
      } else {
        setError('No tienes permisos para acceder a esta sección');
      }
    } catch (err) {
      console.error('Error fetching approvals:', err);
      if (err.status === 401) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
      } else if (err.status === 403) {
        setError('No tienes permisos para acceder a esta sección.');
      } else {
        setError('Error al cargar las aprobaciones: ' + (err.message || 'Error desconocido'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approvalId) => {
    try {
      await api('/api/approvals/approve', {
        method: 'POST',
        body: JSON.stringify({ approvalId })
      });
      fetchData(); // Recargar datos
    } catch (err) {
      console.error('Error approving quote:', err);
      setError('Error al aprobar la cotización: ' + (err.message || 'Error desconocido'));
    }
  };

  const handleReject = async (approvalId, reason) => {
    try {
      await api('/api/approvals/reject', {
        method: 'POST',
        body: JSON.stringify({ approvalId, reason })
      });
      fetchData(); // Recargar datos
    } catch (err) {
      console.error('Error rejecting quote:', err);
      setError('Error al rechazar la cotización: ' + (err.message || 'Error desconocido'));
    }
  };

  // Verificar permisos
  if (!user || !['admin', 'facturacion', 'jefa_comercial'].includes(user.role)) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">
          <h4>Acceso Denegado</h4>
          <p>No tienes permisos para acceder a esta sección. Solo los administradores, facturación y jefes comerciales pueden ver las aprobaciones.</p>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" />
        <div className="ms-3">
          <p>Cargando aprobaciones...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2>🔐 Sistema de Aprobaciones</h2>
          <p className="text-muted">Gestión de solicitudes de aprobación de cotizaciones</p>
        </Col>
        <Col xs="auto">
          <Button variant="outline-primary" onClick={fetchData}>
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

      <Row>
        {/* Solicitudes Pendientes */}
        <Col lg={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FiClock className="me-2" />
                Solicitudes Pendientes ({pendingApprovals.length})
              </h5>
            </Card.Header>
            <Card.Body>
              {pendingApprovals.length === 0 ? (
                <p className="text-muted text-center">No hay solicitudes pendientes</p>
              ) : (
                <div className="list-group list-group-flush">
                  {pendingApprovals.map((approval) => (
                    <div key={approval.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">Cotización #{approval.quote_id}</h6>
                          <p className="mb-1 text-muted">
                            Cliente: {approval.company_name}
                          </p>
                          <p className="mb-1 text-muted">
                            Proyecto: {approval.project_name}
                          </p>
                          <p className="mb-1">
                            <strong>Monto: ${approval.total_amount?.toLocaleString()}</strong>
                          </p>
                          <small className="text-muted">
                            Solicitado por: {approval.requested_by_name}
                          </small>
                        </div>
                        <div className="d-flex gap-2">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleApprove(approval.id)}
                          >
                            <FiCheck className="me-1" />
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                              const reason = prompt('Razón del rechazo:');
                              if (reason) handleReject(approval.id, reason);
                            }}
                          >
                            <FiX className="me-1" />
                            Rechazar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Cotizaciones Aprobadas */}
        <Col lg={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FiCheck className="me-2" />
                Cotizaciones Aprobadas ({approvedQuotes.length})
              </h5>
            </Card.Header>
            <Card.Body>
              {approvedQuotes.length === 0 ? (
                <p className="text-muted text-center">No hay cotizaciones aprobadas</p>
              ) : (
                <div className="list-group list-group-flush">
                  {approvedQuotes.map((quote) => (
                    <div key={quote.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">Cotización #{quote.quote_number}</h6>
                          <p className="mb-1 text-muted">
                            Cliente: {quote.company_name}
                          </p>
                          <p className="mb-1 text-muted">
                            Proyecto: {quote.project_name}
                          </p>
                          <p className="mb-1">
                            <strong>Monto: ${quote.total_amount?.toLocaleString()}</strong>
                          </p>
                          <Badge bg="success">Aprobada</Badge>
                        </div>
                        <Button size="sm" variant="outline-primary">
                          <FiEye className="me-1" />
                          Ver
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Aprobaciones;
