import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, Modal, Form, Table } from 'react-bootstrap';
import { FiCheck, FiX, FiClock, FiEye, FiRefreshCw, FiMail, FiFileText, FiDollarSign, FiBell } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const FacturacionDashboard = () => {
  const { user } = useAuth();
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approvedQuotes, setApprovedQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [pendingData, approvedData] = await Promise.all([
        api('/api/approvals/pending'),
        api('/api/approvals/approved')
      ]);

      setPendingApprovals(pendingData || []);
      setApprovedQuotes(approvedData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error al cargar los datos: ' + (err.message || 'Error desconocido'));
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
      
      // Enviar notificación de aprobación
      await api('/api/notifications/quote-approved', {
        method: 'POST',
        body: JSON.stringify({ approvalId })
      });
      
      fetchData();
      setShowApprovalModal(false);
    } catch (err) {
      console.error('Error approving quote:', err);
      setError('Error al aprobar la cotización: ' + (err.message || 'Error desconocido'));
    }
  };

  const handleReject = async () => {
    try {
      await api('/api/approvals/reject', {
        method: 'POST',
        body: JSON.stringify({ 
          approvalId: selectedQuote?.approval_id, 
          reason: rejectionReason 
        })
      });
      
      // Enviar notificación de rechazo
      await api('/api/notifications/quote-rejected', {
        method: 'POST',
        body: JSON.stringify({ 
          approvalId: selectedQuote?.approval_id,
          reason: rejectionReason 
        })
      });
      
      fetchData();
      setShowRejectionModal(false);
      setRejectionReason('');
    } catch (err) {
      console.error('Error rejecting quote:', err);
      setError('Error al rechazar la cotización: ' + (err.message || 'Error desconocido'));
    }
  };

  const handleSendDocument = async (quoteId, companyEmail, companyName) => {
    try {
      setSendingEmail(true);
      await api('/api/notifications/send-quote-document', {
        method: 'POST',
        body: JSON.stringify({ 
          quoteId, 
          recipientEmail: companyEmail,
          recipientName: companyName 
        })
      });
      
      setError(null);
      // Mostrar mensaje de éxito
      alert('Documento enviado exitosamente');
    } catch (err) {
      console.error('Error sending document:', err);
      setError('Error al enviar el documento: ' + (err.message || 'Error desconocido'));
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSendPaymentReminder = async (quoteId, companyEmail, companyName) => {
    try {
      setSendingEmail(true);
      await api('/api/notifications/send-payment-reminder', {
        method: 'POST',
        body: JSON.stringify({ 
          quoteId, 
          recipientEmail: companyEmail,
          recipientName: companyName 
        })
      });
      
      setError(null);
      // Mostrar mensaje de éxito
      alert('Recordatorio de pago enviado exitosamente');
    } catch (err) {
      console.error('Error sending payment reminder:', err);
      setError('Error al enviar el recordatorio: ' + (err.message || 'Error desconocido'));
    } finally {
      setSendingEmail(false);
    }
  };

  if (!user || !['admin', 'facturacion'].includes(user.role)) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">
          <h4>Acceso Denegado</h4>
          <p>No tienes permisos para acceder a esta sección. Solo los usuarios de facturación pueden ver este dashboard.</p>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" />
        <div className="ms-3">
          <p>Cargando dashboard de facturación...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2>💼 Dashboard de Facturación</h2>
          <p className="text-muted">Gestión de aprobaciones y envío de documentos</p>
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
                          <h6 className="mb-1">{approval.quote_number}</h6>
                          <p className="mb-1 text-muted">
                            <strong>Empresa:</strong> {approval.company_name}<br/>
                            <strong>Proyecto:</strong> {approval.project_name}<br/>
                            <strong>Monto:</strong> ${approval.total_amount?.toLocaleString()}<br/>
                            <strong>Solicitado por:</strong> {approval.requested_by_name}
                          </p>
                        </div>
                        <div className="d-flex flex-column gap-2">
                          <Button 
                            variant="success" 
                            size="sm"
                            onClick={() => {
                              setSelectedQuote(approval);
                              setShowApprovalModal(true);
                            }}
                          >
                            <FiCheck className="me-1" />
                            Aprobar
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => {
                              setSelectedQuote(approval);
                              setShowRejectionModal(true);
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
                          <h6 className="mb-1">{quote.quote_number}</h6>
                          <p className="mb-1 text-muted">
                            <strong>Empresa:</strong> {quote.company_name}<br/>
                            <strong>Proyecto:</strong> {quote.project_name}<br/>
                            <strong>Monto:</strong> ${quote.total_amount?.toLocaleString()}<br/>
                            <strong>Fecha de aprobación:</strong> {new Date(quote.approved_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="d-flex flex-column gap-2">
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => handleSendDocument(quote.quote_id, quote.company_email, quote.company_name)}
                            disabled={sendingEmail}
                          >
                            <FiMail className="me-1" />
                            Enviar Documento
                          </Button>
                          <Button 
                            variant="warning" 
                            size="sm"
                            onClick={() => handleSendPaymentReminder(quote.quote_id, quote.company_email, quote.company_name)}
                            disabled={sendingEmail}
                          >
                            <FiDollarSign className="me-1" />
                            Recordatorio Pago
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
      </Row>

      {/* Modal de Aprobación */}
      <Modal show={showApprovalModal} onHide={() => setShowApprovalModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Aprobación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Está seguro de que desea aprobar la cotización <strong>{selectedQuote?.quote_number}</strong>?</p>
          <p><strong>Empresa:</strong> {selectedQuote?.company_name}</p>
          <p><strong>Monto:</strong> ${selectedQuote?.total_amount?.toLocaleString()}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApprovalModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={() => handleApprove(selectedQuote?.approval_id)}>
            <FiCheck className="me-1" />
            Aprobar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Rechazo */}
      <Modal show={showRejectionModal} onHide={() => setShowRejectionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Rechazar Cotización</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Está seguro de que desea rechazar la cotización <strong>{selectedQuote?.quote_number}</strong>?</p>
          <Form.Group className="mb-3">
            <Form.Label>Motivo del rechazo:</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ingrese el motivo del rechazo..."
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectionModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleReject} disabled={!rejectionReason.trim()}>
            <FiX className="me-1" />
            Rechazar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default FacturacionDashboard;
