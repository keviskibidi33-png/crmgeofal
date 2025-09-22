import React, { useState, useMemo } from 'react';
import { Button, Badge, Row, Col, Card, Container } from 'react-bootstrap';
import { 
  FiPlus, FiEdit, FiTrash2, FiMessageSquare, FiClock, 
  FiCheckCircle, FiX, FiAlertTriangle, FiUser, FiCalendar,
  FiEye, FiFlag
} from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import ModalForm from '../components/common/ModalForm';
import StatsCard from '../components/common/StatsCard';
import { listTickets, createTicket, updateTicketStatus } from '../services/tickets';
import { useQuery, useMutation, useQueryClient } from 'react-query';

const emptyForm = { title: '', description: '', priority: 'media' };

export default function Tickets() {
  const [showModal, setShowModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [deletingTicket, setDeletingTicket] = useState(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ['tickets'],
    () => listTickets(),
    { keepPreviousData: true }
  );

  const createMutation = useMutation(createTicket, {
    onSuccess: () => {
      queryClient.invalidateQueries('tickets');
      setShowModal(false);
      setEditingTicket(null);
    },
    onError: (error) => console.error('Error creating ticket:', error)
  });

  const updateMutation = useMutation(updateTicketStatus, {
    onSuccess: () => {
      queryClient.invalidateQueries('tickets');
    },
    onError: (error) => console.error('Error updating ticket:', error)
  });

  // const deleteMutation = useMutation(deleteTicket, {
  //   onSuccess: () => {
  //     queryClient.invalidateQueries('tickets');
  //     setDeletingTicket(null);
  //   },
  //   onError: (error) => console.error('Error deleting ticket:', error)
  // });

  const handleCreate = () => {
    setEditingTicket(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (ticket) => {
    setEditingTicket(ticket);
    setShowModal(true);
  };

  // const handleDelete = (ticket) => {
  //   if (window.confirm(`¿Estás seguro de que quieres eliminar el ticket "${ticket.title}"?`)) {
  //     deleteMutation.mutate(ticket.id);
  //   }
  // };

  const handleStatusChange = (ticket, newStatus) => {
    updateMutation.mutate({ id: ticket.id, status: newStatus });
  };

  const handleSubmit = async (formData) => {
    if (editingTicket.id) {
      await updateMutation.mutateAsync({ id: editingTicket.id, ...formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'abierto': { bg: 'primary', text: 'Abierto', icon: FiMessageSquare },
      'en_progreso': { bg: 'warning', text: 'En Progreso', icon: FiClock },
      'resuelto': { bg: 'success', text: 'Resuelto', icon: FiCheckCircle },
      'cerrado': { bg: 'secondary', text: 'Cerrado', icon: FiX }
    };
    
    const config = statusConfig[status] || { bg: 'secondary', text: status, icon: FiMessageSquare };
    const Icon = config.icon;
    
    return (
      <Badge bg={config.bg} className="status-badge d-flex align-items-center">
        <Icon size={12} className="me-1" />
        {config.text}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      'baja': { bg: 'success', text: 'Baja', icon: FiFlag },
      'media': { bg: 'warning', text: 'Media', icon: FiAlertTriangle },
      'alta': { bg: 'danger', text: 'Alta', icon: FiAlertTriangle }
    };
    
    const config = priorityConfig[priority] || { bg: 'secondary', text: priority, icon: FiFlag };
    const Icon = config.icon;
    
    return (
      <Badge bg={config.bg} className="status-badge d-flex align-items-center">
        <Icon size={12} className="me-1" />
        {config.text}
      </Badge>
    );
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      width: '80px'
    },
    {
      header: 'Título',
      accessor: 'title',
      render: (value, row) => (
        <div>
          <div className="fw-medium">{row.title}</div>
          <small className="text-muted">
            <FiUser size={12} className="me-1" />
            {row.user?.name || 'Usuario'}
          </small>
        </div>
      )
    },
    {
      header: 'Descripción',
      accessor: 'description',
      render: (value) => (
        <div className="text-truncate" style={{ maxWidth: '200px' }} title={value}>
          {value}
        </div>
      )
    },
    {
      header: 'Prioridad',
      accessor: 'priority',
      render: (value) => getPriorityBadge(value)
    },
    {
      header: 'Estado',
      accessor: 'status',
      render: (value) => getStatusBadge(value)
    },
    {
      header: 'Fecha',
      accessor: 'created_at',
      render: (value) => (
        <div className="d-flex align-items-center">
          <FiCalendar size={12} className="me-1 text-muted" />
          <small>{new Date(value).toLocaleDateString('es-ES')}</small>
        </div>
      )
    }
  ];

  const formFields = [
    {
      name: 'title',
      label: 'Título',
      type: 'text',
      required: true,
      placeholder: 'Ingresa el título del ticket'
    },
    {
      name: 'description',
      label: 'Descripción',
      type: 'textarea',
      required: true,
      placeholder: 'Describe el problema o solicitud',
      rows: 4
    },
    {
      name: 'priority',
      label: 'Prioridad',
      type: 'select',
      required: true,
      options: [
        { value: 'baja', label: 'Baja' },
        { value: 'media', label: 'Media' },
        { value: 'alta', label: 'Alta' }
      ]
    }
  ];

  // Calcular estadísticas
  const stats = useMemo(() => {
    const tickets = data?.tickets || [];
    return {
      total: tickets.length,
      abiertos: tickets.filter(t => t.status === 'abierto').length,
      enProgreso: tickets.filter(t => t.status === 'en_progreso').length,
      resueltos: tickets.filter(t => t.status === 'resuelto').length,
      cerrados: tickets.filter(t => t.status === 'cerrado').length,
      alta: tickets.filter(t => t.priority === 'alta').length,
      media: tickets.filter(t => t.priority === 'media').length,
      baja: tickets.filter(t => t.priority === 'baja').length
    };
  }, [data]);

  return (
    <Container fluid className="py-4">
      <div className="fade-in">
        <PageHeader
          title="Gestión de Tickets"
          subtitle="Crear, editar y gestionar tickets de soporte"
          icon={FiMessageSquare}
          actions={
            <Button variant="primary" onClick={handleCreate}>
              <FiPlus className="me-2" />
              Nuevo Ticket
            </Button>
          }
        />

        {/* Estadísticas */}
        <Row className="g-4 mb-4">
          <Col md={6} lg={3}>
            <StatsCard
              title="Total Tickets"
              value={stats.total}
              icon={FiMessageSquare}
              color="primary"
              subtitle="Tickets registrados"
            />
          </Col>
          <Col md={6} lg={3}>
            <StatsCard
              title="Abiertos"
              value={stats.abiertos}
              icon={FiClock}
              color="warning"
              subtitle="Pendientes de atención"
            />
          </Col>
          <Col md={6} lg={3}>
            <StatsCard
              title="En Progreso"
              value={stats.enProgreso}
              icon={FiAlertTriangle}
              color="info"
              subtitle="En proceso de resolución"
            />
          </Col>
          <Col md={6} lg={3}>
            <StatsCard
              title="Resueltos"
              value={stats.resueltos}
              icon={FiCheckCircle}
              color="success"
              subtitle="Completados"
            />
          </Col>
        </Row>

        {/* Tabla de tickets */}
        <Card className="shadow-sm border-0">
          <Card.Header className="bg-white border-bottom">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FiMessageSquare className="me-2 text-primary" />
                Lista de Tickets
              </h5>
              <Badge bg="light" text="dark" className="px-3 py-2">
                {stats.total} tickets
              </Badge>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            <DataTable
              data={data?.tickets || []}
              columns={columns}
              loading={isLoading}
              onEdit={handleEdit}
              emptyMessage="No hay tickets registrados"
            />
          </Card.Body>
        </Card>

      <ModalForm
        show={showModal}
        onHide={() => setShowModal(false)}
        title={editingTicket?.id ? 'Editar Ticket' : 'Nuevo Ticket'}
        data={editingTicket || emptyForm}
        fields={formFields}
        onSubmit={handleSubmit}
        loading={createMutation.isLoading || updateMutation.isLoading}
        submitText={editingTicket?.id ? 'Actualizar' : 'Crear'}
      />
      </div>
    </Container>
  );
};
