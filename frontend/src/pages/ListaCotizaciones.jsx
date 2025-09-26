import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Button, Badge, Row, Col, Card, Container } from 'react-bootstrap';
import { 
  FiPlus, FiEdit, FiTrash2, FiFileText, FiDollarSign, 
  FiCalendar, FiUser, FiHome, FiCopy, FiDownload,
  FiEye, FiCheckCircle, FiClock, FiX
} from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import StatsCard from '../components/common/StatsCard';
import { listQuotes, createQuote, deleteQuote } from '../services/quotes';
import { listCompanies } from '../services/companies';
import { listProjects } from '../services/projects';

export default function ListaCotizaciones() {
  const [deletingQuote, setDeletingQuote] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: companiesData } = useQuery('companiesList', () => listCompanies({ page: 1, limit: 200 }), { staleTime: Infinity });
  const { data: projectsData } = useQuery('projectsList', () => listProjects({ page: 1, limit: 500 }), { staleTime: Infinity });

  const { data, isLoading } = useQuery(
    ['quotes'],
    () => listQuotes(),
    { keepPreviousData: true }
  );

  const deleteMutation = useMutation(deleteQuote, {
    onSuccess: () => {
      queryClient.invalidateQueries('quotes');
      setDeletingQuote(null);
    },
    onError: (error) => console.error('Error deleting quote:', error)
  });

  const handleCreate = () => {
    navigate('/cotizaciones/nueva');
  };

  const handleEdit = (quote) => {
    navigate(`/cotizaciones/${quote.id}/editar`);
  };

  const handleView = (quote) => {
    navigate(`/cotizaciones/${quote.id}`);
  };

  const handleDelete = (quote) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la cotización "${quote.code || quote.id}"?`)) {
      deleteMutation.mutate(quote.id);
    }
  };

  const handleClone = async (quote) => {
    try {
      const payload = {
        project_id: quote.project_id,
        variant_id: quote.variant_id || null,
        client_contact: quote.client_contact,
        client_email: quote.client_email,
        client_phone: quote.client_phone,
        issue_date: new Date().toISOString().slice(0, 10),
        subtotal: quote.subtotal,
        igv: quote.igv,
        total: quote.total,
        status: 'borrador',
        meta: { from_quote_id: quote.id, ...quote.meta }
      };
      const created = await createQuote(payload);
      // Los ítems se manejan en el frontend, no se duplican en el backend
      queryClient.invalidateQueries('quotes');
      navigate(`/cotizaciones/${created.id}/editar`);
    } catch (error) {
      console.error('Error cloning quote:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'borrador': { bg: 'secondary', text: 'Borrador', icon: FiClock },
      'enviada': { bg: 'primary', text: 'Enviada', icon: FiFileText },
      'aprobada': { bg: 'success', text: 'Aprobada', icon: FiCheckCircle },
      'rechazada': { bg: 'danger', text: 'Rechazada', icon: FiX },
      'cancelada': { bg: 'warning', text: 'Cancelada', icon: FiX }
    };
    
    const config = statusConfig[status] || { bg: 'secondary', text: status, icon: FiFileText };
    const Icon = config.icon;
    
    return (
      <Badge bg={config.bg} className="status-badge d-flex align-items-center">
        <Icon size={12} className="me-1" />
        {config.text}
      </Badge>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount || 0);
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      width: '80px'
    },
    {
      header: 'Código',
      accessor: 'code',
      render: (value, row) => (
        <div>
          <div className="fw-medium">{value || `COT-${row.id}`}</div>
          <small className="text-muted">
            <FiCalendar size={12} className="me-1" />
            {new Date(row.issue_date).toLocaleDateString('es-ES')}
          </small>
        </div>
      )
    },
    {
      header: 'Cliente',
      accessor: 'client',
      render: (value, row) => (
        <div>
          <div className="fw-medium">{row.client_contact || 'Sin contacto'}</div>
          {row.client_email && (
            <small className="text-muted">
              <FiUser size={12} className="me-1" />
              {row.client_email}
            </small>
          )}
        </div>
      )
    },
    {
      header: 'Proyecto',
      accessor: 'project',
      render: (value, row) => (
        <div>
          <div className="fw-medium">{row.project?.name || 'Sin proyecto'}</div>
          {row.project?.company && (
            <small className="text-muted">
              <FiHome size={12} className="me-1" />
              {row.project.company.name}
            </small>
          )}
        </div>
      )
    },
    {
      header: 'Estado',
      accessor: 'status',
      render: (value) => getStatusBadge(value)
    },
    {
      header: 'Total',
      accessor: 'total',
      render: (value, row) => (
        <div className="text-end">
          <div className="fw-bold text-success">{formatCurrency(value)}</div>
          <small className="text-muted">IGV: {formatCurrency(row.igv || 0)}</small>
        </div>
      )
    }
  ];

  // Calcular estadísticas
  const stats = useMemo(() => {
    const quotes = data?.quotes || [];
    
    const totalValue = quotes.reduce((sum, quote) => {
      const quoteTotal = parseFloat(quote.total) || 0;
      return sum + quoteTotal;
    }, 0);
    
    return {
      total: quotes.length,
      borrador: quotes.filter(q => q.status === 'borrador').length,
      enviadas: quotes.filter(q => q.status === 'enviada').length,
      aprobadas: quotes.filter(q => q.status === 'aprobada').length,
      rechazadas: quotes.filter(q => q.status === 'rechazada').length,
      totalValue: totalValue
    };
  }, [data]);

  return (
    <Container fluid className="py-4">
      <div className="fade-in">
        <PageHeader
          title="Gestión de Cotizaciones"
          subtitle="Crear, editar y gestionar cotizaciones del sistema"
          icon={FiFileText}
          actions={
            <Button 
              variant="primary" 
              size="lg"
              onClick={handleCreate}
              className="px-4 py-2 shadow-sm"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                fontWeight: '600',
                fontSize: '1.1rem'
              }}
            >
              <FiPlus className="me-2" size={20} />
              Nueva Cotización
            </Button>
          }
        />

        {/* Estadísticas */}
        <Row className="g-4 mb-4">
          <Col md={6} lg={3}>
            <StatsCard
              title="Total Cotizaciones"
              value={stats.total}
              icon={FiFileText}
              color="primary"
              subtitle="Cotizaciones registradas"
            />
          </Col>
          <Col md={6} lg={3}>
            <StatsCard
              title="Enviadas"
              value={stats.enviadas}
              icon={FiCheckCircle}
              color="success"
              subtitle="Enviadas a clientes"
            />
          </Col>
          <Col md={6} lg={3}>
            <StatsCard
              title="Aprobadas"
              value={stats.aprobadas}
              icon={FiCheckCircle}
              color="info"
              subtitle="Aceptadas por clientes"
            />
          </Col>
          <Col md={6} lg={3}>
            <StatsCard
              title="Valor Total"
              value={`S/ ${Number(stats.totalValue).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={FiDollarSign}
              color="warning"
              subtitle="Valor acumulado"
            />
          </Col>
        </Row>

        {/* Tabla de cotizaciones */}
        <Card className="shadow-sm border-0">
          <Card.Header className="bg-white border-bottom">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FiFileText className="me-2 text-primary" />
                Lista de Cotizaciones
              </h5>
              <Badge bg="light" text="dark" className="px-3 py-2">
                {stats.total} cotizaciones
              </Badge>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            <DataTable
              data={data?.quotes || []}
              columns={columns}
              loading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              emptyMessage="No hay cotizaciones registradas"
              actions={[
                {
                  label: 'Ver',
                  icon: FiEye,
                  onClick: handleView,
                  variant: 'outline-info'
                },
                {
                  label: 'Editar',
                  icon: FiEdit,
                  onClick: handleEdit,
                  variant: 'outline-primary'
                },
                {
                  label: 'Clonar',
                  icon: FiCopy,
                  onClick: handleClone,
                  variant: 'outline-secondary'
                },
                {
                  label: 'Eliminar',
                  icon: FiTrash2,
                  onClick: handleDelete,
                  variant: 'outline-danger'
                }
              ]}
            />
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};