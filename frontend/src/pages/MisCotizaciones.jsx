import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Container, Row, Col, Card, Button, Badge, Form, Spinner, Alert } from 'react-bootstrap';
import { FiCheck, FiX, FiEdit, FiEye, FiFileText, FiRefreshCw } from 'react-icons/fi';
import { approveQuote, revertQuoteToDraft, getMyQuotes } from '../services/quoteApproval';
import { useAuth } from '../contexts/AuthContext';

const MisCotizaciones = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Estados
  const [filters, setFilters] = useState({
    status: '',
    page: 1,
    limit: 20
  });
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Queries
  const { data: quotesData, isLoading, error, refetch } = useQuery(
    ['myQuotes', filters],
    () => getMyQuotes(filters),
    {
      enabled: !!user,
      refetchOnWindowFocus: false
    }
  );

  // Mutations
  const approveMutation = useMutation(approveQuote, {
    onSuccess: () => {
      queryClient.invalidateQueries(['myQuotes']);
      alert('Cotización aprobada exitosamente');
    },
    onError: (error) => {
      alert(`Error aprobando cotización: ${error.message}`);
    }
  });

  const revertMutation = useMutation(revertQuoteToDraft, {
    onSuccess: () => {
      queryClient.invalidateQueries(['myQuotes']);
      alert('Cotización revertida a borrador exitosamente');
    },
    onError: (error) => {
      alert(`Error revirtiendo cotización: ${error.message}`);
    }
  });

  // Handlers
  const handleApprove = (quoteId) => {
    if (window.confirm('¿Estás seguro de que quieres aprobar esta cotización?')) {
      approveMutation.mutate(quoteId);
    }
  };

  const handleRevert = (quoteId) => {
    if (window.confirm('¿Estás seguro de que quieres revertir esta cotización a borrador?')) {
      revertMutation.mutate(quoteId);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset page when filtering
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'borrador': { variant: 'warning', text: 'Borrador' },
      'aprobada': { variant: 'success', text: 'Aprobada' },
      'facturada': { variant: 'info', text: 'Facturada' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const getStatusActions = (quote) => {
    const actions = [];
    
    if (quote.status === 'borrador') {
      actions.push(
        <Button
          key="approve"
          variant="success"
          size="sm"
          onClick={() => handleApprove(quote.id)}
          disabled={approveMutation.isLoading}
        >
          <FiCheck className="me-1" />
          Aprobar
        </Button>
      );
    }
    
    if (quote.status === 'aprobada') {
      actions.push(
        <Button
          key="revert"
          variant="warning"
          size="sm"
          onClick={() => handleRevert(quote.id)}
          disabled={revertMutation.isLoading}
        >
          <FiRefreshCw className="me-1" />
          Revertir
        </Button>
      );
    }
    
    actions.push(
      <Button
        key="view"
        variant="outline-primary"
        size="sm"
        onClick={() => {
          setSelectedQuote(quote);
          setShowDetails(true);
        }}
      >
        <FiEye className="me-1" />
        Ver
      </Button>
    );
    
    return actions;
  };

  if (isLoading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-2">Cargando mis cotizaciones...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          Error cargando cotizaciones: {error.message}
        </Alert>
      </Container>
    );
  }

  const quotes = quotesData?.data || [];
  const pagination = quotesData?.pagination || {};

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>Mis Cotizaciones</h2>
          <p className="text-muted">Gestiona tus cotizaciones de forma autónoma</p>
        </Col>
      </Row>

      {/* Filtros */}
      <Row className="mb-4">
        <Col md={4}>
          <Form.Select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">Todos los estados</option>
            <option value="borrador">Borrador</option>
            <option value="aprobada">Aprobada</option>
            <option value="facturada">Facturada</option>
          </Form.Select>
        </Col>
        <Col md={4}>
          <Button variant="outline-secondary" onClick={() => refetch()}>
            <FiRefreshCw className="me-1" />
            Actualizar
          </Button>
        </Col>
      </Row>

      {/* Lista de cotizaciones */}
      <Row>
        {quotes.length === 0 ? (
          <Col>
            <Card>
              <Card.Body className="text-center py-5">
                <FiFileText size={48} className="text-muted mb-3" />
                <h5>No hay cotizaciones</h5>
                <p className="text-muted">
                  {filters.status 
                    ? `No se encontraron cotizaciones en estado "${filters.status}"`
                    : 'No tienes cotizaciones registradas'
                  }
                </p>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          quotes.map((quote) => (
            <Col key={quote.id} md={6} lg={4} className="mb-3">
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <strong>{quote.quote_number || `COT-${quote.id}`}</strong>
                  {getStatusBadge(quote.status)}
                </Card.Header>
                <Card.Body>
                  <div className="mb-2">
                    <strong>Cliente:</strong> {quote.company_name || 'N/A'}
                  </div>
                  <div className="mb-2">
                    <strong>Proyecto:</strong> {quote.project_name || 'N/A'}
                  </div>
                  <div className="mb-2">
                    <strong>Total:</strong> S/ {quote.total?.toFixed(2) || '0.00'}
                  </div>
                  <div className="mb-3">
                    <strong>Fecha:</strong> {new Date(quote.created_at).toLocaleDateString()}
                  </div>
                  
                  <div className="d-flex gap-2 flex-wrap">
                    {getStatusActions(quote)}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Paginación */}
      {pagination.pages > 1 && (
        <Row className="mt-4">
          <Col>
            <div className="d-flex justify-content-center">
              <div className="btn-group">
                <Button
                  variant="outline-secondary"
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Anterior
                </Button>
                <Button variant="outline-secondary" disabled>
                  Página {pagination.page} de {pagination.pages}
                </Button>
                <Button
                  variant="outline-secondary"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      )}

      {/* Modal de detalles */}
      {showDetails && selectedQuote && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Detalles de Cotización
                </h5>
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowDetails(false)}
                >
                  <FiX />
                </Button>
              </div>
              <div className="modal-body">
                <Row>
                  <Col md={6}>
                    <strong>Número:</strong> {selectedQuote.quote_number || `COT-${selectedQuote.id}`}
                  </Col>
                  <Col md={6}>
                    <strong>Estado:</strong> {getStatusBadge(selectedQuote.status)}
                  </Col>
                </Row>
                <hr />
                <Row>
                  <Col md={6}>
                    <strong>Cliente:</strong> {selectedQuote.company_name || 'N/A'}
                  </Col>
                  <Col md={6}>
                    <strong>RUC:</strong> {selectedQuote.company_ruc || 'N/A'}
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <strong>Proyecto:</strong> {selectedQuote.project_name || 'N/A'}
                  </Col>
                  <Col md={6}>
                    <strong>Total:</strong> S/ {selectedQuote.total?.toFixed(2) || '0.00'}
                  </Col>
                </Row>
                <hr />
                <Row>
                  <Col md={6}>
                    <strong>Fecha de creación:</strong> {new Date(selectedQuote.created_at).toLocaleString()}
                  </Col>
                  <Col md={6}>
                    <strong>Última actualización:</strong> {new Date(selectedQuote.updated_at).toLocaleString()}
                  </Col>
                </Row>
              </div>
              <div className="modal-footer">
                <Button
                  variant="secondary"
                  onClick={() => setShowDetails(false)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default MisCotizaciones;
