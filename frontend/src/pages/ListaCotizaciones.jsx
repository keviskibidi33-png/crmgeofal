import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Button, Badge, Row, Col, Card, Container, Alert, Form } from 'react-bootstrap';
import { 
  FiPlus, FiEdit, FiTrash2, FiFileText, FiDollarSign, 
  FiCalendar, FiUser, FiHome, FiCopy, FiDownload,
  FiEye, FiCheckCircle, FiClock, FiX, FiCheck, FiSquare, FiMessageSquare
} from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import StatsCard from '../components/common/StatsCard';
import ConfirmModal from '../components/common/ConfirmModal';
import SuccessModal from '../components/SuccessModal';
import useSimpleMultiSelect from '../hooks/useSimpleMultiSelect';
import { listQuotes, createQuote, deleteQuote } from '../services/quotes';
import { listCompanies } from '../services/companies';
import { listProjects } from '../services/projects';
import QuoteStatusDropdown from '../components/QuoteStatusDropdown';
import './ListaCotizaciones.css';

export default function ListaCotizaciones() {
  const [deletingQuote, setDeletingQuote] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const tableRef = useRef(null);

  const { data: companiesData } = useQuery('companiesList', () => listCompanies({ page: 1, limit: 200 }), { staleTime: Infinity });
  const { data: projectsData } = useQuery('projectsList', () => listProjects({ page: 1, limit: 500 }), { staleTime: Infinity });

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const { data, isLoading, error } = useQuery(
    ['quotes', currentPage, itemsPerPage],
    async () => {
      const result = await listQuotes({ 
        page: currentPage, 
        limit: itemsPerPage 
      });
      // Enriquecer cotizaciones con datos del meta
      if (result?.data) {
        result.data = result.data.map(quote => {
          let meta = null;
          if (quote.meta && typeof quote.meta === 'string') {
            try {
              meta = JSON.parse(quote.meta);
            } catch (e) {
              meta = null;
            }
          } else if (quote.meta && typeof quote.meta === 'object') {
            meta = quote.meta;
          }
          
          if (meta && meta.customer) {
            quote.client_company = meta.customer.company_name || quote.company_name;
            quote.client_ruc = meta.customer.ruc || quote.company_ruc;
          }
          
          return quote;
        });
      }
      return result;
    },
    { keepPreviousData: true }
  );

  // Debug: mostrar datos en consola (temporal)

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

  // Hook de selección múltiple simple
  const {
    selectedItems,
    selectedIds,
    isAllSelected,
    isPartiallySelected,
    isSelected,
    toggleItem,
    toggleAll,
    clearSelection
  } = useSimpleMultiSelect(quotes, (quote) => quote.id);

  const showBulkActions = selectedIds.length > 0;

  const handleCreate = () => {
    navigate('/cotizaciones/inteligente');
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
      
      // Mostrar modal de éxito y cargar el módulo de cotización
      setSuccessMessage(`Cotización clonada exitosamente. Código: ${created.quote_code || created.id}`);
      setShowSuccessModal(true);
      
      // Cargar el módulo de cotización con los datos clonados
      navigate(`/cotizaciones?edit=${created.id}`);
    } catch (error) {
      console.error('Error cloning quote:', error);
      setSuccessMessage('Error al clonar la cotización. Por favor, inténtalo de nuevo.');
      setShowSuccessModal(true);
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

  // Función para manejar el cambio de estado
  const handleStatusChange = (quoteId, newStatus) => {
    // Actualizar la cotización en la lista local
    queryClient.setQueryData(['quotes'], (oldData) => {
      if (!oldData?.data) return oldData;
      
      return {
        ...oldData,
        data: oldData.data.map(quote => 
          quote.id === quoteId 
            ? { ...quote, status: newStatus }
            : quote
        )
      };
    });
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

  const getRoleAbbreviation = (role) => {
    if (!role) return '';
    
    const roleMap = {
      'admin': 'Admin',
      'jefa_comercial': 'Jefa Com.',
      'vendedor_comercial': 'Vend.',
      'tecnico_laboratorio': 'Téc. Lab.',
      'jefe_laboratorio': 'Jefe Lab.',
      'supervisor_campo': 'Sup. Campo',
      'tecnico_campo': 'Téc. Campo'
    };
    
    return roleMap[role] || role.substring(0, 8);
  };

  const getRoleColor = (role) => {
    if (!role) return 'secondary';
    
    const colorMap = {
      'admin': 'danger',           // Rojo para admin
      'jefa_comercial': 'primary', // Azul para jefa comercial
      'vendedor_comercial': 'info', // Celeste para vendedor
      'tecnico_laboratorio': 'success', // Verde para técnico lab
      'jefe_laboratorio': 'success', // Verde para jefe lab
      'supervisor_campo': 'warning', // Amarillo para supervisor
      'tecnico_campo': 'warning'   // Amarillo para técnico campo
    };
    
    return colorMap[role] || 'secondary';
  };

  const stats = useMemo(() => {
    if (!quotes.length) return { 
      total: 0, 
      nuevo: 0, 
      cotizacion_enviada: 0, 
      pendiente_cotizacion: 0, 
      en_negociacion: 0, 
      seguimiento: 0, 
      ganado: 0, 
      perdido: 0 
    };
    
    return quotes.reduce((acc, quote) => {
      acc.total++;
      acc[quote.status] = (acc[quote.status] || 0) + 1;
      return acc;
    }, { 
      total: 0, 
      nuevo: 0, 
      cotizacion_enviada: 0, 
      pendiente_cotizacion: 0, 
      en_negociacion: 0, 
      seguimiento: 0, 
      ganado: 0, 
      perdido: 0 
    });
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
      <Row className="mb-4 g-2">
        <Col xs={6} sm={4} md={2}>
          <StatsCard
            title="Total"
            value={stats.total}
            icon={FiFileText}
            color="primary"
            size="compact"
          />
        </Col>
        <Col xs={6} sm={4} md={2}>
          <StatsCard
            title="Nuevas"
            value={stats.nuevo}
            icon={FiClock}
            color="primary"
            size="compact"
          />
        </Col>
        <Col xs={6} sm={4} md={2}>
          <StatsCard
            title="Enviadas"
            value={stats.cotizacion_enviada}
            icon={FiFileText}
            color="info"
            size="compact"
          />
        </Col>
        <Col xs={6} sm={4} md={2}>
          <StatsCard
            title="En Negociación"
            value={stats.en_negociacion}
            icon={FiMessageSquare}
            color="secondary"
            size="compact"
          />
        </Col>
        <Col xs={6} sm={4} md={2}>
          <StatsCard
            title="Ganadas"
            value={stats.ganado}
            icon={FiCheckCircle}
            color="success"
            size="compact"
          />
        </Col>
        <Col xs={6} sm={4} md={2}>
          <StatsCard
            title="Perdidas"
            value={stats.perdido}
            icon={FiX}
            color="danger"
            size="compact"
          />
        </Col>
        <Col xs={6} sm={4} md={2}>
          <StatsCard
            title="Seleccionadas"
            value={selectedIds.length}
            icon={FiCheck}
            color="warning"
            size="compact"
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
                  <th>Creado por</th>
                  <th style={{ width: '120px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote, index) => (
                  <tr
                    key={quote.id}
                    className={`quote-row ${isSelected(quote) ? 'selected' : ''}`}
                  >
                    <td>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleItem(quote);
                        }}
                        className="p-1"
                      >
                        {isSelected(quote) ? (
                          <FiCheck size={16} />
                        ) : (
                          <FiSquare size={16} />
                        )}
                      </Button>
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
                        <div className="fw-bold">{quote.client_company || quote.client_contact || 'Sin razón social'}</div>
                        {quote.client_ruc && (
                          <div className="text-muted small">RUC: {quote.client_ruc}</div>
                        )}
                        {quote.client_contact && quote.client_company && (
                          <div className="text-muted small">
                            <FiUser size={12} className="me-1" />
                            {quote.client_contact}
                          </div>
                        )}
                        {quote.client_email && (
                          <div className="text-muted small">
                            {quote.client_email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="text-muted">
                        {getProjectName(quote.project_id)}
                      </span>
                    </td>
                    <td>
                      <QuoteStatusDropdown
                        quoteId={quote.id}
                        currentStatus={quote.status}
                        onStatusChange={(newStatus) => handleStatusChange(quote.id, newStatus)}
                        size="sm"
                        showLabel={true}
                      />
                    </td>
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
                      <div>
                        <div className="fw-bold small">{quote.created_by_name || 'Usuario desconocido'}</div>
                        <div className="mt-1">
                          <Badge 
                            bg={getRoleColor(quote.created_by_role)} 
                            className="small"
                            style={{ fontSize: '0.7rem' }}
                          >
                            {getRoleAbbreviation(quote.created_by_role)}
                          </Badge>
                        </div>
                        <div className="text-muted small mt-1">
                          {new Date(quote.created_at).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
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
                          title="Ver Evidencias"
                        >
                          <FiEye className="me-1" />
                          Evidencias
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

      {/* Paginación */}
      {data?.total > itemsPerPage && (
        <Card className="mt-3">
          <Card.Body className="py-3">
            <Row className="align-items-center">
              <Col>
                <small className="text-muted">
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, data.total)} de {data.total} cotizaciones
                </small>
              </Col>
              <Col xs="auto">
                <div className="d-flex align-items-center gap-2">
                  {/* Selector de elementos por página */}
                  <Form.Select
                    size="sm"
                    style={{ width: '80px' }}
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </Form.Select>
                  
                  {/* Botón Primera página */}
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                    title="Primera página"
                  >
                    ««
                  </Button>
                  
                  {/* Botón Anterior */}
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    title="Página anterior"
                  >
                    «
                  </Button>
                  
                  {/* Páginas dinámicas */}
                  {(() => {
                    const totalPages = Math.ceil(data.total / itemsPerPage);
                    const pages = [];
                    const startPage = Math.max(1, currentPage - 1);
                    const endPage = Math.min(totalPages, startPage + 2);
                    
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <Button
                          key={i}
                          variant={currentPage === i ? "primary" : "outline-secondary"}
                          size="sm"
                          onClick={() => setCurrentPage(i)}
                          className="px-3"
                        >
                          {i}
                        </Button>
                      );
                    }
                    return pages;
                  })()}
                  
                  {/* Botón Siguiente */}
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    disabled={currentPage >= Math.ceil(data.total / itemsPerPage)}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    title="Página siguiente"
                  >
                    »
                  </Button>
                  
                  {/* Botón Última página */}
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    disabled={currentPage >= Math.ceil(data.total / itemsPerPage)}
                    onClick={() => setCurrentPage(Math.ceil(data.total / itemsPerPage))}
                    title="Última página"
                  >
                    »»
                  </Button>
                  
                  {/* Input para ir a página específica */}
                  <div className="d-flex align-items-center gap-1 ms-3">
                    <span className="text-muted small">Ir a:</span>
                    <input
                      type="number"
                      min="1"
                      max={Math.ceil(data.total / itemsPerPage)}
                      className="form-control form-control-sm"
                      style={{ width: '60px' }}
                      placeholder="..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const page = parseInt(e.target.value);
                          const totalPages = Math.ceil(data.total / itemsPerPage);
                          if (page >= 1 && page <= totalPages) {
                            setCurrentPage(page);
                            e.target.value = '';
                          } else {
                            setCurrentPage(totalPages);
                            e.target.value = '';
                          }
                        }
                      }}
                      title={`Ingresa un número del 1 al ${Math.ceil(data.total / itemsPerPage)}`}
                    />
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

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

      {/* Modal de Éxito */}
      <SuccessModal
        show={showSuccessModal}
        onHide={() => setShowSuccessModal(false)}
        title="¡Cotización Clonada!"
        message={successMessage}
        buttonText="Continuar"
      />
    </Container>
  );
}