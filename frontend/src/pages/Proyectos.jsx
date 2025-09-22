import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Badge, Row, Col, Card, Container } from 'react-bootstrap';
import { FiPlus, FiEdit, FiTrash2, FiHome, FiMapPin, FiCalendar, FiUser, FiCheckCircle, FiClock, FiX, FiRefreshCw } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import ModalForm from '../components/common/ModalForm';
import StatsCard from '../components/common/StatsCard';
import { listProjects, createProject, updateProject, deleteProject, getProjectStats } from '../services/projects';

const emptyForm = { company_id: '', name: '', location: '', vendedor_id: '', laboratorio_id: '', requiere_laboratorio: false, requiere_ingenieria: false };

export default function Proyectos() {
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedProjectType, setSelectedProjectType] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtener cliente pre-seleccionado desde la navegación
  const selectedClient = location.state?.selectedClient;

  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery(
    ['projects', currentPage, searchTerm, selectedStatus, selectedCompany, selectedProjectType],
    () => listProjects({ 
      page: currentPage, 
      limit: 20, 
      search: searchTerm, 
      status: selectedStatus, 
      company_id: selectedCompany,
      project_type: selectedProjectType
    }),
    { 
      keepPreviousData: true,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      staleTime: 0,
      cacheTime: 0
    }
  );

  // Estadísticas separadas
  const { data: statsData, isLoading: statsLoading } = useQuery(
    ['projectStats'],
    getProjectStats,
    {
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      staleTime: 30000, // 30 segundos
      cacheTime: 60000  // 1 minuto
    }
  );

  const handleMutationSuccess = (message) => {
    queryClient.invalidateQueries('projects');
    queryClient.invalidateQueries('projectStats');
    setShowModal(false);
    setEditingProject(null);
    setDeletingProject(null);
  };

  // Función para manejar búsqueda
  const handleSearch = (searchValue) => {
    console.log('🔍 handleSearch - Búsqueda:', searchValue);
    setSearchTerm(searchValue);
    setCurrentPage(1); // Resetear a la primera página
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 1000);
  };

  // Función para manejar filtros
  const handleFilter = (filters) => {
    console.log('🔍 handleFilter - Filtros:', filters);
    setSelectedStatus(filters.status || '');
    setSelectedCompany(filters.company_id || '');
    setSelectedProjectType(filters.project_type || '');
    setCurrentPage(1); // Resetear a la primera página
  };

  // Opciones de filtros específicas para proyectos
  const projectFilterOptions = [
    {
      title: 'Por Estado',
      options: [
        { label: 'Pendientes', filter: { status: 'pendiente' } },
        { label: 'Activos', filter: { status: 'activo' } },
        { label: 'Completados', filter: { status: 'completado' } },
        { label: 'Cancelados', filter: { status: 'cancelado' } }
      ]
    },
    {
      title: 'Por Tipo de Proyecto',
      options: [
        { label: 'Análisis de Suelos', filter: { project_type: 'Análisis de Suelos' } },
        { label: 'Estudio Geotécnico', filter: { project_type: 'Estudio Geotécnico' } },
        { label: 'Evaluación Ambiental', filter: { project_type: 'Evaluación Ambiental' } },
        { label: 'Control de Calidad', filter: { project_type: 'Control de Calidad' } },
        { label: 'Análisis de Agua', filter: { project_type: 'Análisis de Agua' } },
        { label: 'Estudio de Impacto', filter: { project_type: 'Estudio de Impacto' } },
        { label: 'Análisis Químico', filter: { project_type: 'Análisis Químico' } },
        { label: 'Pruebas de Laboratorio', filter: { project_type: 'Pruebas de Laboratorio' } },
        { label: 'Inspección Técnica', filter: { project_type: 'Inspección Técnica' } },
        { label: 'Certificación de Materiales', filter: { project_type: 'Certificación de Materiales' } }
      ]
    }
  ];

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
    // Si hay un cliente pre-seleccionado, pre-llenar el formulario
    const formData = selectedClient ? {
      ...emptyForm,
      company_id: selectedClient.id,
      name: `${selectedClient.sector || 'Proyecto'} - ${selectedClient.name}`,
      location: selectedClient.city || ''
    } : emptyForm;
    
    setEditingProject(formData);
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
      header: 'Tipo de Proyecto',
      accessor: 'project_type',
      render: (value, row) => {
        const projectType = row.project_type || 'General';
        let typeColor = 'secondary';
        
        // Asignar colores según el tipo de proyecto
        switch (projectType) {
          case 'Análisis de Suelos':
            typeColor = 'success';
            break;
          case 'Estudio Geotécnico':
            typeColor = 'primary';
            break;
          case 'Evaluación Ambiental':
            typeColor = 'info';
            break;
          case 'Control de Calidad':
            typeColor = 'warning';
            break;
          case 'Análisis de Agua':
            typeColor = 'info';
            break;
          case 'Estudio de Impacto':
            typeColor = 'danger';
            break;
          case 'Análisis Químico':
            typeColor = 'primary';
            break;
          case 'Pruebas de Laboratorio':
            typeColor = 'success';
            break;
          case 'Inspección Técnica':
            typeColor = 'warning';
            break;
          case 'Certificación de Materiales':
            typeColor = 'info';
            break;
          default:
            typeColor = 'secondary';
        }
        
        return (
          <Badge bg={typeColor} className="px-2 py-1">
            {projectType}
          </Badge>
        );
      }
    },
    {
      header: 'Empresa',
      accessor: 'company_name',
      render: (value, row) => (
        <div>
          <div className="fw-medium">{row.company_name || 'Sin empresa'}</div>
          {row.company_ruc && (
            <small className="text-muted">RUC: {row.company_ruc}</small>
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
      header: 'Servicios Requeridos',
      accessor: 'services',
      render: (value, row) => (
        <div className="d-flex flex-wrap gap-1">
          {row.requiere_laboratorio && (
            <Badge bg="info" className="px-2 py-1">
              <FiHome size={12} className="me-1" />
              Laboratorio
            </Badge>
          )}
          {row.requiere_ingenieria && (
            <Badge bg="primary" className="px-2 py-1">
              <FiUser size={12} className="me-1" />
              Ingeniería
            </Badge>
          )}
          {!row.requiere_laboratorio && !row.requiere_ingenieria && (
            <Badge bg="secondary" className="px-2 py-1">
              Sin servicios
            </Badge>
          )}
        </div>
      )
    },
    {
      header: 'Asignado a',
      accessor: 'vendedor_name',
      render: (value, row) => (
        <div>
          {row.vendedor_name && (
            <div className="d-flex align-items-center">
              <FiUser size={14} className="me-1 text-muted" />
              <span>{row.vendedor_name}</span>
            </div>
          )}
          {row.laboratorio_name && (
            <div className="d-flex align-items-center mt-1">
              <FiHome size={14} className="me-1 text-muted" />
              <span className="small text-muted">{row.laboratorio_name}</span>
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
    },
    {
      name: 'requiere_laboratorio',
      label: 'Requiere Servicios de Laboratorio',
      type: 'checkbox',
      description: 'Marcar si el proyecto necesita análisis o pruebas de laboratorio'
    },
    {
      name: 'requiere_ingenieria',
      label: 'Requiere Servicios de Ingeniería',
      type: 'checkbox',
      description: 'Marcar si el proyecto necesita estudios o consultoría de ingeniería'
    }
  ];

  // Calcular estadísticas
  const stats = useMemo(() => {
    if (statsData) {
      console.log('📊 Stats - Usando estadísticas reales del backend:', statsData);
      return {
        total: statsData.total || 0,
        activos: statsData.activos || 0,
        completados: statsData.completados || 0,
        pendientes: statsData.pendientes || 0,
        cancelados: statsData.cancelados || 0
      };
    }
    // Fallback: calcular desde los datos de la página actual
    const projects = data?.data || [];
    console.log('📊 Stats - Fallback: calculando desde página actual:', projects);
    return {
      total: projects.length,
      activos: projects.filter(p => p.status === 'activo').length,
      completados: projects.filter(p => p.status === 'completado').length,
      pendientes: projects.filter(p => p.status === 'pendiente').length,
      cancelados: projects.filter(p => p.status === 'cancelado').length
    };
  }, [statsData, data]);

  return (
    <Container fluid className="py-4">
      <div className="fade-in">
        <PageHeader
          title="Gestión de Proyectos"
          subtitle={selectedClient ? `Crear proyecto para: ${selectedClient.name}` : "Crear, editar y gestionar proyectos del sistema"}
          icon={FiHome}
          actions={
            <div className="d-flex gap-2">
              {selectedClient && (
                <Badge bg="info" className="px-3 py-2 d-flex align-items-center">
                  <FiUser className="me-1" />
                  Cliente: {selectedClient.name}
                </Badge>
              )}
              <Button variant="primary" onClick={handleCreate}>
                <FiPlus className="me-2" />
                {selectedClient ? 'Crear Proyecto' : 'Nuevo Proyecto'}
              </Button>
            </div>
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
              loading={statsLoading}
            />
          </Col>
          <Col md={6} lg={3}>
            <StatsCard
              title="Proyectos Activos"
              value={stats.activos}
              icon={FiCheckCircle}
              color="success"
              subtitle="En desarrollo"
              loading={statsLoading}
            />
          </Col>
          <Col md={6} lg={3}>
            <StatsCard
              title="Completados"
              value={stats.completados}
              icon={FiCheckCircle}
              color="info"
              subtitle="Finalizados"
              loading={statsLoading}
            />
          </Col>
          <Col md={6} lg={3}>
            <StatsCard
              title="Pendientes"
              value={stats.pendientes}
              icon={FiClock}
              color="warning"
              subtitle="Por iniciar"
              loading={statsLoading}
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
              <div className="d-flex align-items-center gap-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => refetch()}
                  className="d-flex align-items-center"
                  title="Actualizar datos"
                >
                  <FiRefreshCw className={`${isLoading ? 'spinning' : ''}`} />
                </Button>
                <Badge bg="light" text="dark" className="px-3 py-2">
                  {stats.total} proyectos
                </Badge>
              </div>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            <DataTable
              data={data?.data || []}
              columns={columns}
              loading={isLoading || isSearching}
              onEdit={handleEdit}
              onDelete={handleDelete}
              emptyMessage="No hay proyectos registrados"
              // Props para paginación del backend
              totalItems={data?.total || 0}
              itemsPerPage={20}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onSearch={handleSearch}
              onFilter={handleFilter}
              // Filtros específicos para proyectos
              filterOptions={projectFilterOptions}
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