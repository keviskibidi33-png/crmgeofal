import React from 'react';
import { Card, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import { FiDollarSign, FiFileText, FiTrendingUp, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import { useQuery } from 'react-query';
import { getCompanyWithTotals } from '../services/companies';

const ClientCostTab = ({ clientId }) => {
  const { data: clientData, isLoading, error } = useQuery(
    ['client-with-totals', clientId],
    () => getCompanyWithTotals(clientId),
    {
      enabled: !!clientId,
      staleTime: 60000, // Cache por 1 minuto
      onError: (err) => {
        console.error('Error cargando datos del cliente con totales:', err);
      }
    }
  );

  const client = clientData?.data || clientData?.company || clientData;

  if (!clientId) {
    return (
      <Alert variant="info">
        <FiAlertCircle className="me-2" />
        No se ha seleccionado ningún cliente.
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Cargando información de costos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <FiAlertCircle className="me-2" />
        Error al cargar la información de costos del cliente.
      </Alert>
    );
  }

  if (!client) {
    return (
      <Alert variant="warning">
        <FiAlertCircle className="me-2" />
        No se encontraron datos para el cliente seleccionado.
      </Alert>
    );
  }

  // Función para formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  // Función para obtener el color del badge según el estado
  const getStatusColor = (status) => {
    const colors = {
      'borrador': 'secondary',
      'cotizacion_enviada': 'info',
      'en_negociacion': 'warning',
      'ganado': 'success',
      'perdido': 'danger',
      'aprobada': 'primary',
      'facturada': 'success'
    };
    return colors[status] || 'secondary';
  };

  return (
    <div className="client-cost-tab">
      {/* Header con información del cliente */}
      <Card className="mb-4">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">
            <FiDollarSign className="me-2" />
            Información de Costos - {client.name}
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <p className="text-dark"><strong>RUC/DNI:</strong> {client.ruc || client.dni || 'No especificado'}</p>
              <p className="text-dark"><strong>Contacto:</strong> {client.contact_name || 'No especificado'}</p>
            </Col>
            <Col md={6}>
              <p className="text-dark"><strong>Email:</strong> {client.email || 'No especificado'}</p>
              <p className="text-dark"><strong>Teléfono:</strong> {client.phone || 'No especificado'}</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Resumen de totales */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <FiDollarSign className="text-primary mb-2" size={32} />
              <h4 className="text-primary">{formatCurrency(client.total_accumulated)}</h4>
              <p className="text-dark mb-0">Total Acumulado</p>
              <small className="text-dark">(Solo cotizaciones)</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <FiFileText className="text-info mb-2" size={32} />
              <h4 className="text-info">{client.quotes_count || 0}</h4>
              <p className="text-dark mb-0">Cotizaciones</p>
              <small className="text-dark">(No aprobadas para facturación)</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <FiTrendingUp className="text-success mb-2" size={32} />
              <h4 className="text-success">{formatCurrency(client.won_quotes_total || 0)}</h4>
              <p className="text-dark mb-0">Cotizaciones Ganadas</p>
              <small className="text-dark">(Estado: Ganado)</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Desglose detallado */}
      <Row>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <FiFileText className="me-2" />
                Desglose de Cotizaciones
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-dark">Total Cotizado:</span>
                <Badge bg="primary">{formatCurrency(client.total_quoted || 0)}</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-dark">Cotizaciones Ganadas:</span>
                <Badge bg="success">{formatCurrency(client.won_quotes_total || 0)}</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-dark">Número de Cotizaciones:</span>
                <Badge bg="info">{client.quotes_count || 0}</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-dark">Cotizaciones Ganadas:</span>
                <Badge bg="success">{client.won_quotes_count || 0}</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <FiCheckCircle className="me-2" />
                Información de Referencia
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-dark">Aprobadas para Facturación:</span>
                <Badge bg="warning">{formatCurrency(client.approved_for_billing || 0)}</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-dark">Cantidad Aprobadas:</span>
                <Badge bg="warning">{client.approved_count || 0}</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-dark">Total General:</span>
                <Badge bg="secondary">{formatCurrency(client.total_all_quotes || 0)}</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-dark">Total Cotizaciones:</span>
                <Badge bg="secondary">{client.total_quotes_count || 0}</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Proyectos asociados */}
      <Row className="mt-4">
        <Col md={12}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <FiClock className="me-2" />
                Proyectos Asociados
              </h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-dark">Total de Proyectos:</span>
                    <Badge bg="info">{client.projects_count || 0}</Badge>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-dark">Proyectos Completados:</span>
                    <Badge bg="success">{client.completed_projects_count || 0}</Badge>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Nota explicativa */}
      <Alert variant="info" className="mt-4">
        <FiAlertCircle className="me-2" />
        <strong>Nota:</strong> El "Total Acumulado" incluye únicamente las cotizaciones que no han sido aprobadas para facturación. 
        Las cotizaciones aprobadas y facturadas se muestran como información de referencia en la sección correspondiente.
      </Alert>
    </div>
  );
};

export default ClientCostTab;
