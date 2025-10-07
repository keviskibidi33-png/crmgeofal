import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Button, Badge, Row, Col, Card, Container, Alert } from 'react-bootstrap';
import { 
  FiPlus, FiEdit, FiTrash2, FiFileText, FiDollarSign, 
  FiCalendar, FiUser, FiHome, FiCopy, FiDownload,
  FiEye, FiCheckCircle, FiClock, FiX, FiCheck, FiSquare
} from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import StatsCard from '../components/common/StatsCard';
import ConfirmModal from '../components/common/ConfirmModal';
import useMultiSelect from '../hooks/useMultiSelect';
import { listQuotes, createQuote, deleteQuote } from '../services/quotes';
import { listCompanies } from '../services/companies';
import { listProjects } from '../services/projects';
import './ListaCotizaciones.css';

export default function ListaCotizaciones() {
  const [deletingQuote, setDeletingQuote] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const tableRef = useRef(null);

  const { data: companiesData } = useQuery('companiesList', () => listCompanies({ page: 1, limit: 200 }), { staleTime: Infinity });
  const { data: projectsData } = useQuery('projectsList', () => listProjects({ page: 1, limit: 500 }), { staleTime: Infinity });

  const { data, isLoading, error } = useQuery(
    ['quotes'],
    () => listQuotes(),
    { keepPreviousData: true }
  );

  // Debug: mostrar datos en consola (temporal)
  console.log('📊 Datos de cotizaciones:', { data, quotes: data?.data?.length || 0, isLoading, error });

  const deleteMutation = useMutation(deleteQuote, {
    onSuccess: () => {
      queryClient.invalidateQueries('quotes');
      setDeletingQuote(null);
    },
    onError: (error) => console.error('Error deleting quote:', error)
  });

  const bulkDeleteMutation = useMutation(
    async (quoteIds) => {
      const deletePromises = quoteIds.map(id => deleteQuote(id));
      await Promise.all(deletePromises);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('quotes');
        clearSelection();
        setBulkDeleting(false);
      },
      onError: (error) => {
        console.error('Error deleting quotes:', error);
        setBulkDeleting(false);
      }
    }
  );

  const quotes = data?.data || [];

  // Hook de selección múltiple
  const {
    selectedItems,
    selectedIds,
    isSelecting,
    isAllSelected,
    isPartiallySelected,
    isSelected,
    toggleItem,
    toggleAll,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    clearSelection
  } = useMultiSelect(quotes, (quote) => quote.id);

  const showBulkActions = selectedIds.length > 0;

  const handleCreate = () => {
    navigate('/cotizaciones/nueva');
  };

  const handleEdit = (quote) => {
    // Navegar a cotización inteligente con datos precargados
    navigate(`/cotizaciones/inteligente?edit=${quote.id}`);
  };

  const handleView = (quote) => {
    navigate(`/cotizaciones/${quote.id}`);
  };

  const handleDelete = (quote) => {
    setDeletingQuote(quote);
  };

  const confirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(deletingQuote.id);
      setDeletingQuote(null);
    } catch (error) {
      console.error('Error eliminando cotización:', error);
      setDeletingQuote(null);
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
      queryClient.invalidateQueries('quotes');
      navigate(`/cotizaciones/${created.id}/editar`);
    } catch (error) {
      console.error('Error cloning quote:', error);
    }
  };

  const handleBulkDelete = () => {
    setBulkDeleting(true);
  };

  const confirmBulkDelete = async () => {
    try {
      await bulkDeleteMutation.mutateAsync(selectedIds);
    } catch (error) {
      console.error('Error eliminando cotizaciones:', error);
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
      <Badge bg={config.bg} className="d-flex align-items-center gap-1">
        <Icon size={12} />
        {config.text}
      </Badge>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getCompanyName = (companyId) => {
    if (!companiesData?.data) return 'Cliente no encontrado';
    const company = companiesData.data.find(c => c.id === companyId);
    return company ? company.name : 'Cliente no encontrado';
  };

  const getProjectName = (projectId) => {
    if (!projectId || !projectsData?.data) return 'Sin proyecto';
    const project = projectsData.data.find(p => p.id === projectId);
    return project ? project.name : 'Sin proyecto';
  };

  const stats = useMemo(() => {
    if (!quotes.length) return { total: 0, borrador: 0, enviada: 0, aprobada: 0, rechazada: 0 };
    
    return quotes.reduce((acc, quote) => {
      acc.total++;
      acc[quote.status] = (acc[quote.status] || 0) + 1;
      return acc;
    }, { total: 0, borrador: 0, enviada: 0, aprobada: 0, rechazada: 0 });
  }, [quotes]);

  return (
    <Container fluid className="p-4">
      <PageHeader
        title="Lista de Cotizaciones"
        subtitle="Gestiona todas las cotizaciones del sistema"
        icon={FiFileText}
        actions={
          <Button variant="primary" onClick={handleCreate}>
            <FiPlus className="me-2" />
            Nueva Cotización
          </Button>
        }
      />

      {/* Estadísticas */}
      <Row className="mb-4">
        <Col md={2}>
          <StatsCard
            title="Total"
            value={stats.total}
            icon={FiFileText}
            color="primary"
          />
        </Col>
        <Col md={2}>
          <StatsCard
            title="Borradores"
            value={stats.borrador}
            icon={FiClock}
            color="secondary"
          />
        </Col>
        <Col md={2}>
          <StatsCard
            title="Enviadas"
            value={stats.enviada}
            icon={FiFileText}
            color="info"
          />
        </Col>
        <Col md={2}>
          <StatsCard
            title="Aprobadas"
            value={stats.aprobada}
            icon={FiCheckCircle}
            color="success"
          />
        </Col>
        <Col md={2}>
          <StatsCard
            title="Rechazadas"
            value={stats.rechazada}
            icon={FiX}
            color="danger"
          />
        </Col>
        <Col md={2}>
          <StatsCard
            title="Seleccionadas"
            value={selectedIds.length}
            icon={FiCheck}
            color="warning"
          />
        </Col>
      </Row>

      {/* Acciones en lote */}
      {showBulkActions && (
        <Alert variant="info" className="mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <span>
              <FiCheck className="me-2" />
              {selectedIds.length} cotización(es) seleccionada(s)
            </span>
            <div className="d-flex gap-2">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={clearSelection}
              >
                <FiX className="me-1" />
                Cancelar
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
              >
                <FiTrash2 className="me-1" />
                {bulkDeleting ? 'Eliminando...' : 'Eliminar Seleccionadas'}
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {/* Tabla de cotizaciones */}
      <Card>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0" ref={tableRef}>
              <thead className="table-light">
                <tr>
                  <th style={{ width: '50px' }}>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={toggleAll}
                      className="p-1"
                    >
                      {isAllSelected ? (
                        <FiCheck size={16} />
                      ) : (
                        <FiSquare size={16} />
                      )}
                    </Button>
                  </th>
                  <th>ID</th>
                  <th>Código</th>
                  <th>Cliente</th>
                  <th>Proyecto</th>
                  <th>Estado</th>
                  <th>Total</th>
                  <th>Fecha</th>
                  <th style={{ width: '120px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {quotes.map((quote, index) => (
                  <tr
                    key={quote.id}
                    className={`quote-row ${isSelected(quote) ? 'selected' : ''} ${isSelecting ? 'selecting' : ''}`}
                    onMouseDown={(e) => handleMouseDown(quote, index, e)}
                    onMouseEnter={(e) => handleMouseEnter(quote, index, e)}
                    onMouseUp={handleMouseUp}
                  >
                    <td>
                      <div className="selection-indicator">
                        {isSelected(quote) && <FiCheck size={16} />}
                      </div>
                    </td>
                    <td>{quote.id}</td>
                    <td>
                      <div>
                        <strong>COT-{quote.id}</strong>
                        <div className="text-muted small">
                          <FiCalendar size={12} className="me-1" />
                          {formatDate(quote.issue_date)}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="fw-medium">{quote.client_contact}</div>
                        <div className="text-muted small">
                          <FiUser size={12} className="me-1" />
                          {quote.client_email}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-muted">
                        {getProjectName(quote.project_id)}
                      </span>
                    </td>
                    <td>{getStatusBadge(quote.status)}</td>
                    <td>
                      <div>
                        <div className="fw-bold text-success">
                          {formatCurrency(quote.total)}
                        </div>
                        <div className="text-muted small">
                          IGV: {formatCurrency(quote.igv)}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-muted">
                        {formatDate(quote.created_at)}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group" role="group">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleView(quote);
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          onMouseUp={(e) => e.stopPropagation()}
                          title="Ver"
                        >
                          <FiEye />
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(quote);
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          onMouseUp={(e) => e.stopPropagation()}
                          title="Editar"
                        >
                          <FiEdit />
                        </Button>
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClone(quote);
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          onMouseUp={(e) => e.stopPropagation()}
                          title="Clonar"
                        >
                          <FiCopy />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(quote);
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          onMouseUp={(e) => e.stopPropagation()}
                          title="Eliminar"
                        >
                          <FiTrash2 />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>

      {/* Modales de confirmación */}
      <ConfirmModal
        show={!!deletingQuote}
        title="Confirmar eliminación"
        message={`¿Estás seguro de que quieres eliminar la cotización COT-${deletingQuote?.id}?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingQuote(null)}
        confirmText="Eliminar"
        confirmVariant="danger"
      />

      <ConfirmModal
        show={bulkDeleting}
        title="Confirmar eliminación múltiple"
        message={`¿Estás seguro de que quieres eliminar ${selectedIds.length} cotización(es) seleccionada(s)? Esta acción no se puede deshacer.`}
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleting(false)}
        confirmText="Eliminar Todas"
        confirmVariant="danger"
      />
    </Container>
  );
}