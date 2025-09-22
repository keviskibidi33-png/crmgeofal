import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { Button, Badge, Row, Col, Card, Container } from 'react-bootstrap';
import { FiPlus, FiEdit, FiTrash2, FiHome, FiMapPin, FiCalendar, FiUser, FiCheckCircle, FiClock, FiX } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import ModalForm from '../components/common/ModalForm';
import StatsCard from '../components/common/StatsCard';
import { listProjects, createProject, updateProject, deleteProject } from '../services/projects';

const emptyForm = { company_id: '', name: '', location: '', vendedor_id: '', laboratorio_id: '' };

export default function Proyectos() {
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ['projects'],
    () => listProjects(),
    { keepPreviousData: true }
  );

  const handleMutationSuccess = (message) => {
    queryClient.invalidateQueries('projects');
    setShowModal(false);
    setEditingProject(null);
    setDeletingProject(null);
  };

  const createMutation = useMutation(createProject, {
    onSuccess: () => handleMutationSuccess('Proyecto creado exitosamente'),
    onError: (error) => console.error('Error creating project:', error)
  });

  const updateMutation = useMutation(updateProject, {
    onSuccess: () => handleMutationSuccess('Proyecto actualizado exitosamente'),
    onError: (error) => console.error('Error updating project:', error)
  });

  const deleteMutation = useMutation(deleteProject, {
    onSuccess: () => handleMutationSuccess('Proyecto eliminado exitosamente'),
    onError: (error) => console.error('Error deleting project:', error)
  });

  const handleCreate = () => {
    setEditingProject(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setShowModal(true);
  };

  const handleDelete = (project) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el proyecto "${project.name}"?`)) {
      deleteMutation.mutate(project.id);
    }
  };

  const handleSubmit = async (formData) => {
    if (editingProject.id) {
      await updateMutation.mutateAsync({ id: editingProject.id, ...formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'activo': { bg: 'success', text: 'Activo' },
      'pendiente': { bg: 'warning', text: 'Pendiente' },
      'completado': { bg: 'primary', text: 'Completado' },
      'cancelado': { bg: 'danger', text: 'Cancelado' }
    };
    
    const config = statusConfig[status] || { bg: 'secondary', text: status };
    return <Badge bg={config.bg} className="status-badge">{config.text}</Badge>;
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      width: '80px'
    },
    {
      header: 'Proyecto',
      accessor: 'name',
      render: (value, row) => (
        <div>
          <div className="fw-medium">{row.name}</div>
          {row.location && (
            <small className="text-muted">
              <FiMapPin size={12} className="me-1" />
              {row.location}
            </small>
          )}
        </div>
      )
    },
    {
      header: 'Empresa',
      accessor: 'company',
      render: (value, row) => (
        <div>
          <div className="fw-medium">{row.company?.name || 'Sin empresa'}</div>
          {row.company?.ruc && (
            <small className="text-muted">RUC: {row.company.ruc}</small>
          )}
        </div>
      )
    },
    {
      header: 'Estado',
      accessor: 'status',
      render: (value) => getStatusBadge(value || 'activo')
    },
    {
      header: 'Asignado a',
      accessor: 'vendedor',
      render: (value, row) => (
        <div>
          {row.vendedor && (
            <div className="d-flex align-items-center">
              <FiUser size={14} className="me-1 text-muted" />
              <span>{row.vendedor.name}</span>
            </div>
          )}
          {row.laboratorio && (
            <div className="d-flex align-items-center mt-1">
              <FiHome size={14} className="me-1 text-muted" />
              <span className="small text-muted">{row.laboratorio.name}</span>
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Fecha Creación',
      accessor: 'created_at',
      type: 'date'
    }
  ];

  const formFields = [
    {
      name: 'company_id',
      label: 'Empresa',
      type: 'select',
      required: true,
      options: data?.companies?.map(company => ({
        value: company.id,
        label: `${company.name} (${company.ruc})`
      })) || []
    },
    {
      name: 'name',
      label: 'Nombre del Proyecto',
      type: 'text',
      required: true,
      placeholder: 'Ingresa el nombre del proyecto'
    },
    {
      name: 'location',
      label: 'Ubicación',
      type: 'text',
      placeholder: 'Ingresa la ubicación del proyecto'
    },
    {
      name: 'vendedor_id',
      label: 'Vendedor Asignado',
      type: 'select',
      options: data?.users?.filter(user => 
        ['vendedor_comercial', 'jefa_comercial'].includes(user.role)
      ).map(user => ({
        value: user.id,
        label: `${user.name} ${user.apellido}`
      })) || []
    },
    {
      name: 'laboratorio_id',
      label: 'Responsable de Laboratorio',
      type: 'select',
      options: data?.users?.filter(user => 
        ['jefe_laboratorio', 'usuario_laboratorio', 'laboratorio'].includes(user.role)
      ).map(user => ({
        value: user.id,
        label: `${user.name} ${user.apellido}`
      })) || []
    }
  ];

  // Calcular estadísticas
  const stats = useMemo(() => {
    const projects = data?.projects || [];
    return {
      total: projects.length,
      activos: projects.filter(p => p.status === 'activo').length,
      completados: projects.filter(p => p.status === 'completado').length,
      pendientes: projects.filter(p => p.status === 'pendiente').length,
      cancelados: projects.filter(p => p.status === 'cancelado').length
    };
  }, [data]);

  return (
    <Container fluid className="py-4">
      <div className="fade-in">
        <PageHeader
          title="Gestión de Proyectos"
          subtitle="Crear, editar y gestionar proyectos del sistema"
          icon={FiHome}
          actions={
            <Button variant="primary" onClick={handleCreate}>
              <FiPlus className="me-2" />
              Nuevo Proyecto
            </Button>
          }
        />

        {/* Estadísticas */}
        <Row className="g-4 mb-4">
          <Col md={6} lg={3}>
            <StatsCard
              title="Total Proyectos"
              value={stats.total}
              icon={FiHome}
              color="primary"
              subtitle="Proyectos registrados"
            />
          </Col>
          <Col md={6} lg={3}>
            <StatsCard
              title="Proyectos Activos"
              value={stats.activos}
              icon={FiCheckCircle}
              color="success"
              subtitle="En desarrollo"
            />
          </Col>
          <Col md={6} lg={3}>
            <StatsCard
              title="Completados"
              value={stats.completados}
              icon={FiCheckCircle}
              color="info"
              subtitle="Finalizados"
            />
          </Col>
          <Col md={6} lg={3}>
            <StatsCard
              title="Pendientes"
              value={stats.pendientes}
              icon={FiClock}
              color="warning"
              subtitle="Por iniciar"
            />
          </Col>
        </Row>

        {/* Tabla de proyectos */}
        <Card className="shadow-sm border-0">
          <Card.Header className="bg-white border-bottom">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FiHome className="me-2 text-primary" />
                Lista de Proyectos
              </h5>
              <Badge bg="light" text="dark" className="px-3 py-2">
                {stats.total} proyectos
              </Badge>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            <DataTable
              data={data?.projects || []}
              columns={columns}
              loading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              emptyMessage="No hay proyectos registrados"
            />
          </Card.Body>
        </Card>

      <ModalForm
        show={showModal}
        onHide={() => setShowModal(false)}
        title={editingProject?.id ? 'Editar Proyecto' : 'Nuevo Proyecto'}
        data={editingProject || emptyForm}
        fields={formFields}
        onSubmit={handleSubmit}
        loading={createMutation.isLoading || updateMutation.isLoading}
        submitText={editingProject?.id ? 'Actualizar' : 'Crear'}
      />
      </div>
    </Container>
  );
};