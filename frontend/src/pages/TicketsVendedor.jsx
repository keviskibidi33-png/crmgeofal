import React, { useState, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup, Tabs, Tab, Alert } from 'react-bootstrap';
import { 
  FiPlus, FiSearch, FiFilter, FiClock, FiUser, FiMessageSquare, 
  FiFileText, FiUpload, FiEye, FiEdit, FiTrash2, FiCheckCircle,
  FiAlertTriangle, FiFlag, FiTag, FiCalendar, FiDownload
} from 'react-icons/fi';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { listTickets, createTicket, updateTicketStatus } from '../services/tickets';
import TicketFormUnified from '../components/TicketFormUnified';
import TicketHistoryVendedor from '../components/TicketHistoryVendedor';
import SuccessModal from '../components/SuccessModal';
import './TicketsVendedor.css';

const TicketsVendedor = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('todos');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Obtener tickets del vendedor
  const { data: tickets = [], isLoading, error } = useQuery(
    'tickets-vendedor',
    () => listTickets({ user_id: user?.id }),
    {
      enabled: !!user?.id,
      refetchInterval: 30000 // Refrescar cada 30 segundos
    }
  );

  // Mutaciones
  const createMutation = useMutation(createTicket, {
    onSuccess: () => {
      queryClient.invalidateQueries('tickets-vendedor');
      setShowCreateModal(false);
      // Mostrar modal de éxito personalizado
      setSuccessMessage('El ticket ha sido creado exitosamente y está listo para ser procesado por el equipo de soporte.');
      setShowSuccessModal(true);
    },
    onError: () => {
      alert('❌ Error al crear el ticket');
    }
  });

  const updateMutation = useMutation(
    ({ id, status }) => updateTicketStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tickets-vendedor');
        // Mostrar modal de éxito personalizado
        setSuccessMessage('El estado del ticket ha sido actualizado exitosamente.');
        setShowSuccessModal(true);
      },
      onError: () => {
        alert('❌ Error al actualizar el ticket');
      }
    }
  );

  // Filtrar tickets
  const filteredTickets = useMemo(() => {
    if (!Array.isArray(tickets)) return [];
    
    return tickets.filter(ticket => {
      const matchesSearch = ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ticket.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'todos' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'todos' || ticket.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchTerm, statusFilter, priorityFilter]);

  // Estadísticas
  const stats = useMemo(() => {
    if (!Array.isArray(tickets)) return { total: 0, abiertos: 0, en_progreso: 0, cerrados: 0 };
    
    return {
      total: tickets.length,
      abiertos: tickets.filter(t => t.status === 'abierto').length,
      en_progreso: tickets.filter(t => t.status === 'en_progreso').length,
      cerrados: tickets.filter(t => t.status === 'cerrado').length
    };
  }, [tickets]);

  const getStatusBadge = (status) => {
    const variants = {
      abierto: 'warning',
      en_progreso: 'info',
      cerrado: 'success',
      cancelado: 'danger'
    };
    return variants[status] || 'secondary';
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      baja: 'success',
      media: 'warning',
      alta: 'danger',
      urgente: 'dark'
    };
    return variants[priority] || 'secondary';
  };

  const handleCreateTicket = (ticketData) => {
    createMutation.mutate({
      ...ticketData,
      user_id: user.id,
      assigned_to: null, // Vendedor crea el ticket, soporte lo asigna
      status: 'abierto'
    });
  };

  const handleUpdateStatus = (ticketId, newStatus) => {
    updateMutation.mutate({ id: ticketId, status: newStatus });
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowHistoryModal(true);
  };

  if (isLoading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando tickets...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Error cargando tickets</Alert.Heading>
          <p>{error.message}</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">
                <FiMessageSquare className="me-2" />
                Mis Tickets
              </h2>
              <p className="text-muted mb-0">Gestiona tus tickets y solicitudes</p>
            </div>
            <Button 
              variant="primary" 
              onClick={() => setShowCreateModal(true)}
              className="btn-modern"
            >
              <FiPlus className="me-2" />
              Nuevo Ticket
            </Button>
          </div>
        </Col>
      </Row>

      {/* Estadísticas */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body className="text-center">
              <FiMessageSquare className="stat-icon text-primary" />
              <h3 className="stat-number">{stats.total}</h3>
              <p className="stat-label">Total Tickets</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body className="text-center">
              <FiClock className="stat-icon text-warning" />
              <h3 className="stat-number">{stats.abiertos}</h3>
              <p className="stat-label">Abiertos</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body className="text-center">
              <FiUser className="stat-icon text-info" />
              <h3 className="stat-number">{stats.en_progreso}</h3>
              <p className="stat-label">En Progreso</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body className="text-center">
              <FiCheckCircle className="stat-icon text-success" />
              <h3 className="stat-number">{stats.cerrados}</h3>
              <p className="stat-label">Cerrados</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Row className="mb-4">
        <Col md={4}>
          <InputGroup>
            <InputGroup.Text><FiSearch /></InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Buscar tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="todos">Todos los estados</option>
            <option value="abierto">Abierto</option>
            <option value="en_progreso">En Progreso</option>
            <option value="cerrado">Cerrado</option>
            <option value="cancelado">Cancelado</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="todos">Todas las prioridades</option>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Button variant="outline-secondary" className="w-100">
            <FiFilter className="me-2" />
            Filtros
          </Button>
        </Col>
      </Row>

      {/* Lista de Tickets */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Mis Tickets ({filteredTickets.length})</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {filteredTickets.length === 0 ? (
                <div className="text-center py-5">
                  <FiMessageSquare className="text-muted" size={48} />
                  <h5 className="mt-3 text-muted">No hay tickets</h5>
                  <p className="text-muted">Crea tu primer ticket para comenzar</p>
                  <Button 
                    variant="primary" 
                    onClick={() => setShowCreateModal(true)}
                  >
                    <FiPlus className="me-2" />
                    Crear Ticket
                  </Button>
                </div>
              ) : (
                <div className="ticket-list">
                  {filteredTickets.map((ticket) => (
                    <div key={ticket.id} className="ticket-item">
                      <div className="ticket-header">
                        <div className="ticket-title">
                          <h6 className="mb-1">{ticket.title}</h6>
                          <div className="ticket-meta">
                            <Badge bg={getStatusBadge(ticket.status)} className="me-2">
                              {ticket.status}
                            </Badge>
                            <Badge bg={getPriorityBadge(ticket.priority)} className="me-2">
                              {ticket.priority}
                            </Badge>
                            <small className="text-muted">
                              <FiCalendar className="me-1" />
                              {new Date(ticket.created_at).toLocaleDateString()}
                            </small>
                          </div>
                        </div>
                        <div className="ticket-actions">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleViewTicket(ticket)}
                          >
                            <FiEye className="me-1" />
                            Ver
                          </Button>
                        </div>
                      </div>
                      <div className="ticket-content">
                        <p className="text-muted mb-2">{ticket.description}</p>
                        {ticket.module && (
                          <Badge bg="info" className="me-1">
                            <FiTag className="me-1" />
                            {ticket.module}
                          </Badge>
                        )}
                        {ticket.category && (
                          <Badge bg="secondary" className="me-1">
                            {ticket.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modales */}
      <TicketFormUnified
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSubmit={handleCreateTicket}
        isLoading={createMutation.isLoading}
      />

      <TicketHistoryVendedor
        show={showHistoryModal}
        onHide={() => setShowHistoryModal(false)}
        ticket={selectedTicket}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Modal de Éxito */}
      <SuccessModal
        show={showSuccessModal}
        onHide={() => setShowSuccessModal(false)}
        title="¡Ticket Procesado!"
        message={successMessage}
        buttonText="Continuar"
      />
    </Container>
  );
};

export default TicketsVendedor;
