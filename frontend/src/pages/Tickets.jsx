import React, { useState, useMemo } from 'react';
import { Button, Badge, Row, Col, Card, Container, Alert, Spinner, Form, InputGroup } from 'react-bootstrap';
import { 
  FiPlus, FiEdit, FiTrash2, FiMessageSquare, FiClock, 
  FiCheckCircle, FiX, FiAlertTriangle, FiUser, FiCalendar,
  FiEye, FiFlag, FiSearch, FiFilter, FiRefreshCw, FiTrendingUp,
  FiLayers, FiTag, FiActivity
} from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import StatsCard from '../components/common/StatsCard';
import TicketFormUnified from '../components/TicketFormUnified';
import TicketHistoryWithChat from '../components/TicketHistoryWithChat';
import { listTickets, createTicket, updateTicketStatus } from '../services/tickets';
import { getUsersForAssignment, getModules, getCategories, getTypes, getTicketStats } from '../services/ticketFilters';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import './Tickets.css';

const emptyForm = { 
  title: '', 
  description: '', 
  priority: 'media',
  module: 'sistema',
  category: 'tecnico',
  type: 'solicitud',
  assigned_to: '',
  estimated_time: '',
  tags: '',
  additional_notes: ''
};

export default function Tickets() {
  const [showModal, setShowModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const queryClient = useQueryClient();

  const { data: tickets, isLoading, error } = useQuery(
    ['tickets'],
    () => listTickets(),
    { 
      keepPreviousData: true,
      onSuccess: (data) => {
        console.log('🎫 Tickets cargados:', data);
        console.log('🎫 Tipo de datos:', typeof data);
        console.log('🎫 Es array:', Array.isArray(data));
      },
      onError: (error) => {
        console.error('❌ Error cargando tickets:', error);
      }
    }
  );

  // Consultas para filtros dinámicos
  const { data: users = [] } = useQuery(['users'], getUsersForAssignment);
  const { data: modules = [] } = useQuery(['ticket-modules'], getModules);
  const { data: categories = [] } = useQuery(['ticket-categories'], getCategories);
  const { data: types = [] } = useQuery(['ticket-types'], getTypes);
  const { data: ticketStats = {} } = useQuery(['ticket-stats'], getTicketStats);

  const createMutation = useMutation(createTicket, {
    onSuccess: () => {
      queryClient.invalidateQueries('tickets');
      setShowModal(false);
      setEditingTicket(null);
      // Mostrar notificación de éxito
      alert('✅ Ticket creado exitosamente');
    },
    onError: (error) => {
      console.error('Error creating ticket:', error);
      alert('❌ Error al crear el ticket');
    }
  });

  const updateMutation = useMutation(
    ({ id, status }) => updateTicketStatus(id, status),
    {
    onSuccess: () => {
      queryClient.invalidateQueries('tickets');
        // Mostrar notificación de éxito
        alert('✅ Estado del ticket actualizado exitosamente');
      },
      onError: (error) => {
        console.error('Error updating ticket:', error);
        alert('❌ Error al actualizar el ticket');
      }
    }
  );

  const handleCreate = () => {
    setEditingTicket(null);
    setShowModal(true);
  };

  const handleCreateTicket = (formData) => {
    createMutation.mutate(formData);
  };

  const handleEdit = (ticket) => {
    setEditingTicket(ticket);
    setShowModal(true);
  };

  const handleViewHistory = (ticket) => {
    setSelectedTicket(ticket);
    setShowHistory(true);
  };

  const handleSubmit = (formData) => {
    if (editingTicket?.id) {
      updateMutation.mutate({ id: editingTicket.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleStatusUpdate = (ticketId, newStatus) => {
    updateMutation.mutate({ id: ticketId, status: newStatus });
  };

  const getStatusColor = (status) => {
    const colors = {
      'abierto': 'warning',
      'en_progreso': 'info',
      'resuelto': 'success',
      'cerrado': 'secondary',
      'cancelado': 'danger'
    };
    return colors[status] || 'secondary';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'abierto': 'Abierto',
      'en_progreso': 'En Progreso',
      'resuelto': 'Resuelto',
      'cerrado': 'Cerrado',
      'cancelado': 'Cancelado'
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'baja': 'success',
      'media': 'warning',
      'alta': 'danger',
      'critica': 'dark'
    };
    return colors[priority] || 'secondary';
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      'baja': 'Baja',
      'media': 'Media',
      'alta': 'Alta',
      'critica': 'Crítica'
    };
    return labels[priority] || priority;
  };

  const filteredTickets = useMemo(() => {
    if (!tickets || !Array.isArray(tickets)) return [];
    
    return tickets.filter(ticket => {
      const matchesSearch = ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || ticket.status === statusFilter;
      const matchesPriority = !priorityFilter || ticket.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchTerm, statusFilter, priorityFilter]);

  const stats = useMemo(() => {
    // Usar estadísticas del servidor si están disponibles, sino calcular localmente
    if (ticketStats && Object.keys(ticketStats).length > 0) {
    return {
        total: ticketStats.total || 0,
        open: ticketStats.abierto || 0,
        inProgress: ticketStats.en_progreso || 0,
        resolved: ticketStats.resuelto || 0
      };
    }
    
    if (!tickets || !Array.isArray(tickets)) return { total: 0, open: 0, inProgress: 0, resolved: 0 };
    
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'abierto').length;
    const inProgress = tickets.filter(t => t.status === 'en_progreso').length;
    const resolved = tickets.filter(t => t.status === 'resuelto').length;
    
    return { total, open, inProgress, resolved };
  }, [tickets, ticketStats]);

  if (error) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">
          <FiAlertTriangle className="me-2" />
          Error al cargar los tickets: {error.message}
        </Alert>
      </Container>
    );
  }

  return (
    <div className="tickets-page">
    <Container fluid className="py-4">
        <PageHeader
          title="🎫 Gestión de Tickets"
          subtitle="Administra y da seguimiento a los tickets de soporte"
        />

        {/* Estadísticas */}
        <Row className="mb-4">
          <Col md={3}>
            <StatsCard
              title="Total Tickets"
              value={stats.total}
              icon={FiMessageSquare}
              color="primary"
            />
          </Col>
          <Col md={3}>
            <StatsCard
              title="Abiertos"
              value={stats.open}
              icon={FiAlertTriangle}
              color="warning"
            />
          </Col>
          <Col md={3}>
            <StatsCard
              title="En Progreso"
              value={stats.inProgress}
              icon={FiClock}
              color="info"
            />
          </Col>
          <Col md={3}>
            <StatsCard
              title="Resueltos"
              value={stats.resolved}
              icon={FiCheckCircle}
              color="success"
            />
          </Col>
        </Row>

        {/* Filtros y Búsqueda */}
        <Card className="mb-4 tickets-filters-card">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={4}>
                <InputGroup>
                  <InputGroup.Text>
                    <FiSearch />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Buscar tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="tickets-search-input"
                  />
                </InputGroup>
              </Col>
              <Col md={3}>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="tickets-filter-select"
                >
                  <option value="">Todos los estados</option>
                  <option value="abierto">Abierto</option>
                  <option value="en_progreso">En Progreso</option>
                  <option value="resuelto">Resuelto</option>
                  <option value="cerrado">Cerrado</option>
                  <option value="cancelado">Cancelado</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="tickets-filter-select"
                >
                  <option value="">Todas las prioridades</option>
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Button
                  variant="outline-primary"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                    setPriorityFilter('');
                  }}
                  className="w-100"
                >
                  <FiRefreshCw className="me-1" />
                  Limpiar
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Lista de Tickets */}
        <Card className="tickets-list-card">
          <Card.Header className="tickets-list-header">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FiMessageSquare className="me-2" />
                Tickets de Soporte ({filteredTickets.length})
              </h5>
              <Button variant="primary" onClick={handleCreate} className="tickets-create-btn">
                <FiPlus className="me-2" />
                Nuevo Ticket
              </Button>
            </div>
          </Card.Header>
          <Card.Body className="tickets-list-body">
            {isLoading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Cargando tickets...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-5">
                <FiMessageSquare size={48} className="text-muted mb-3" />
                <h5 className="text-muted">No hay tickets</h5>
                <p className="text-muted">No se encontraron tickets que coincidan con los filtros.</p>
                <Button variant="primary" onClick={handleCreate}>
                  <FiPlus className="me-2" />
                  Crear Primer Ticket
                </Button>
              </div>
            ) : (
              <div className="tickets-grid">
                {filteredTickets.map((ticket) => (
                  <Card key={ticket.id} className="ticket-card">
                    <Card.Body>
                      <div className="ticket-header">
                        <div className="ticket-title">
                          <h6 className="mb-1">#{ticket.id} - {ticket.title}</h6>
                          <small className="text-muted">
                            {ticket.description?.substring(0, 100)}...
                          </small>
                        </div>
                        <div className="ticket-badges">
                          <Badge bg={getStatusColor(ticket.status)} className="me-1">
                            {getStatusLabel(ticket.status)}
                          </Badge>
                          <Badge bg={getPriorityColor(ticket.priority)}>
                            {getPriorityLabel(ticket.priority)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="ticket-meta">
                        <div className="ticket-info">
                          <small className="text-muted">
                            <FiCalendar className="me-1" />
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </small>
                          {ticket.module && (
                            <small className="text-muted ms-3">
                              <FiLayers className="me-1" />
                              {ticket.module}
                            </small>
                          )}
                          {ticket.category && (
                            <small className="text-muted ms-3">
                              <FiTag className="me-1" />
                              {ticket.category}
                            </small>
                          )}
                        </div>
                      </div>
                      
                      <div className="ticket-actions">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleViewHistory(ticket)}
                          className="me-2"
                        >
                          <FiEye className="me-1" />
                          Ver
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleEdit(ticket)}
                        >
                          <FiEdit className="me-1" />
                          Editar
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Modal de Formulario */}
        <TicketFormUnified
        show={showModal}
        onHide={() => setShowModal(false)}
          onSubmit={handleCreateTicket}
          isLoading={createMutation.isLoading}
        />

        {/* Modal de Historial */}
        <TicketHistoryWithChat
          show={showHistory}
          onHide={() => setShowHistory(false)}
          ticket={selectedTicket}
          onUpdateStatus={handleStatusUpdate}
        />
      </Container>
      </div>
  );
}