import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Badge, Row, Col, Card, Container, Tabs, Tab, Toast, ToastContainer } from 'react-bootstrap';
import { FiPlus, FiEdit, FiTrash2, FiHome, FiMapPin, FiCalendar, FiUser, FiCheckCircle, FiClock, FiX, FiRefreshCw, FiFolder, FiMessageCircle, FiCheck, FiSettings, FiEye, FiUsers } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import ModalForm from '../components/common/ModalForm';
import StatsCard from '../components/common/StatsCard';
import { listProjects, createProject, updateProject, deleteProject, getProjectStats, updateProjectStatus, updateProjectCategories, updateProjectQueries, updateProjectMark } from '../services/projects';

const emptyForm = { 
  company_id: '', 
  name: '', 
  location: '', 
  vendedor_id: '', 
  laboratorio_id: '', 
  requiere_laboratorio: false, 
  requiere_ingenieria: false, 
  requiere_consultoria: false,
  requiere_capacitacion: false,
  requiere_auditoria: false,
  contact_name: '', 
  contact_phone: '', 
  contact_email: '',
  queries: '',
  priority: 'normal',
  marked: false
};

export default function Proyectos() {
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showQueriesModal, setShowQueriesModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState('view');
  const [editingData, setEditingData] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');


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
      refetchOnWindowFocus: false, // No refrescar automáticamente
      refetchOnMount: false, // No refrescar al montar
      staleTime: 30000, // 30 segundos - considerar datos frescos
      cacheTime: 300000, // 5 minutos - cachear datos
      retry: 2, // Reintentar máximo 2 veces
      retryDelay: 1000, // Esperar 1 segundo entre reintentos
    }
  );

  // Estadísticas separadas
  const { data: statsData, isLoading: statsLoading } = useQuery(
    ['projectStats'],
    getProjectStats,
    {
      refetchOnWindowFocus: false, // No refrescar automáticamente
      refetchOnMount: false, // No refrescar al montar
      staleTime: 60000, // 1 minuto - considerar datos frescos
      cacheTime: 300000, // 5 minutos - cachear datos
      retry: 1, // Reintentar máximo 1 vez
    }
  );

  const handleMutationSuccess = (message) => {
    queryClient.invalidateQueries('projects');
    queryClient.invalidateQueries('projectStats');
    setShowModal(false);
    setEditingProject(null);
    setDeletingProject(null);
  };

  const showNotification = (message, variant = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
    
    // Auto-close después de 5 segundos
    setTimeout(() => {
      setShowToast(false);
    }, 5000);
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

  const updateMutation = useMutation(
    ({ id, data }) => updateProject(id, data),
    {
      onSuccess: (updatedProject) => {
        console.log('✅ updateMutation - Success:', updatedProject);
        // Actualizar el proyecto seleccionado con los nuevos datos
        setSelectedProject(updatedProject);
        setEditingData(updatedProject);
        showNotification('✅ Proyecto actualizado exitosamente!', 'success');
        queryClient.invalidateQueries('projects');
      },
      onError: (error) => {
        console.error('❌ updateMutation - Error:', error);
        showNotification('❌ Error al actualizar proyecto', 'danger');
      }
    }
  );

  const deleteMutation = useMutation(deleteProject, {
    onSuccess: () => handleMutationSuccess('Proyecto eliminado exitosamente'),
    onError: (error) => console.error('Error deleting project:', error)
  });

  const updateStatusMutation = useMutation(
    ({ id, ...data }) => updateProjectStatus(id, data),
    {
      onSuccess: (updatedProject) => {
        setSelectedProject(updatedProject);
        setEditingData(updatedProject);
        handleMutationSuccess('Estado del proyecto actualizado exitosamente');
      },
      onError: (error) => console.error('Error updating project status:', error)
    }
  );

  const updateCategoriesMutation = useMutation(
    ({ id, ...data }) => updateProjectCategories(id, data),
    {
      onSuccess: (updatedProject) => {
        console.log('✅ updateCategoriesMutation - Success:', updatedProject);
        // Actualizar el proyecto seleccionado con los nuevos datos
        setSelectedProject(updatedProject);
        setEditingData(updatedProject);
        showNotification('✅ Categorías guardadas correctamente!', 'success');
        queryClient.invalidateQueries('projects');
      },
      onError: (error) => {
        console.error('❌ updateCategoriesMutation - Error:', error);
        showNotification('❌ Error al guardar categorías', 'danger');
      }
    }
  );

  const updateQueriesMutation = useMutation(
    ({ id, ...data }) => updateProjectQueries(id, data),
    {
      onSuccess: (updatedProject) => {
        setSelectedProject(updatedProject);
        setEditingData(updatedProject);
        handleMutationSuccess('Consultas del proyecto actualizadas exitosamente');
      },
      onError: (error) => console.error('Error updating project queries:', error)
    }
  );

  const updateMarkMutation = useMutation(
    ({ id, ...data }) => updateProjectMark(id, data),
    {
      onSuccess: (updatedProject) => {
        setSelectedProject(updatedProject);
        setEditingData(updatedProject);
        handleMutationSuccess('Proyecto marcado/desmarcado exitosamente');
      },
      onError: (error) => console.error('Error updating project mark:', error)
    }
  );

  const handleCreate = () => {
    // Si hay un cliente pre-seleccionado, pre-llenar el formulario
    const formData = selectedClient ? {
      ...emptyForm,
      company_id: selectedClient.id,
      name: `${selectedClient.sector || 'Proyecto'} - ${selectedClient.name}`,
      location: selectedClient.city || '',
      contact_name: selectedClient.contact_name || '',
      contact_phone: selectedClient.phone || '',
      contact_email: selectedClient.email || ''
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

  const handleViewCategories = (project) => {
    setSelectedProject(project);
    setShowCategoriesModal(true);
  };

  const handleViewQueries = (project) => {
    setSelectedProject(project);
    setShowQueriesModal(true);
  };

  const handleToggleMark = async (project) => {
    try {
      // Aquí implementarías la lógica para marcar/desmarcar
      console.log('Marcar/desmarcar proyecto:', project);
      // Por ahora solo mostramos un mensaje
      alert(`Proyecto ${project.marked ? 'desmarcado' : 'marcado'}: ${project.name}`);
    } catch (error) {
      console.error('Error al marcar proyecto:', error);
    }
  };

  const handleUpdateStatus = (project) => {
    setSelectedProject(project);
    setShowStatusModal(true);
  };

  const handleViewProject = (project) => {
    console.log('🔍 handleViewProject - Project recibido:', project);
    console.log('🔍 handleViewProject - Project.id:', project?.id);
    console.log('🔍 handleViewProject - Type of project.id:', typeof project?.id);
    
    setSelectedProject(project);
    
    // Inicializar editingData con todos los campos del proyecto
    const initialEditingData = {
      ...project,
      // Asegurar que los campos booleanos tengan valores por defecto
      requiere_laboratorio: project.requiere_laboratorio || false,
      requiere_ingenieria: project.requiere_ingenieria || false,
      requiere_consultoria: project.requiere_consultoria || false,
      requiere_capacitacion: project.requiere_capacitacion || false,
      requiere_auditoria: project.requiere_auditoria || false,
      marked: project.marked || false,
      priority: project.priority || 'normal',
      queries: project.queries || '',
      contact_name: project.contact_name || '',
      contact_phone: project.contact_phone || '',
      contact_email: project.contact_email || ''
    };
    
    console.log('🔍 handleViewProject - editingData inicializado:', initialEditingData);
    setEditingData(initialEditingData);
    setActiveTab('view');
    setShowViewModal(true);
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
      header: 'Contacto',
      accessor: 'contacto',
      render: (value, row) => (
        <div className="small">
          {row.contact_name && (
            <div><strong>{row.contact_name}</strong></div>
          )}
          {row.contact_phone && (
            <div className="text-muted">{row.contact_phone}</div>
          )}
          {row.contact_email && (
            <div className="text-muted">{row.contact_email}</div>
          )}
          {!row.contact_name && !row.contact_phone && !row.contact_email && (
            <span className="text-muted">Sin contacto</span>
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
      label: 'Empresa/Cliente',
      type: 'select',
      required: true,
      options: data?.companies?.map(company => ({
        value: company.id,
        label: `${company.name} (${company.ruc || company.dni || 'Sin RUC/DNI'})`
      })) || [],
      description: 'Selecciona un cliente existente o crea uno nuevo desde el módulo de clientes'
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
      label: 'Ubicación del Proyecto',
      type: 'text',
      placeholder: 'Ingresa la ubicación del proyecto',
      required: true
    },
    {
      name: 'contact_name',
      label: 'Persona de Contacto',
      type: 'text',
      placeholder: 'Nombre de la persona con quien negociar',
      description: 'Persona responsable del proyecto en el cliente'
    },
    {
      name: 'contact_phone',
      label: 'Teléfono de Contacto',
      type: 'text',
      placeholder: 'Teléfono para comunicación directa',
      description: 'Número para llamadas urgentes o seguimiento'
    },
    {
      name: 'contact_email',
      label: 'Email de Contacto',
      type: 'email',
      placeholder: 'Email para comunicación',
      description: 'Email para envío de reportes y documentos'
    },
    {
      name: 'requiere_laboratorio',
      label: 'Requiere Laboratorio',
      type: 'checkbox',
      description: 'Marcar si el proyecto necesita servicios de laboratorio'
    },
    {
      name: 'requiere_ingenieria',
      label: 'Requiere Ingeniería',
      type: 'checkbox',
      description: 'Marcar si el proyecto necesita servicios de ingeniería'
    },
    {
      name: 'requiere_consultoria',
      label: 'Requiere Consultoría',
      type: 'checkbox',
      description: 'Marcar si el proyecto necesita servicios de consultoría'
    },
    {
      name: 'requiere_capacitacion',
      label: 'Requiere Capacitación',
      type: 'checkbox',
      description: 'Marcar si el proyecto necesita servicios de capacitación'
    },
    {
      name: 'requiere_auditoria',
      label: 'Requiere Auditoría',
      type: 'checkbox',
      description: 'Marcar si el proyecto necesita servicios de auditoría'
    },
    {
      name: 'queries',
      label: 'Consultas del Cliente',
      type: 'textarea',
      placeholder: 'Ingresa las consultas o dudas del cliente...',
      description: 'Preguntas o dudas específicas del cliente sobre el proyecto'
    },
    {
      name: 'priority',
      label: 'Prioridad del Proyecto',
      type: 'select',
      options: [
        { value: 'low', label: 'Baja' },
        { value: 'normal', label: 'Normal' },
        { value: 'high', label: 'Alta' },
        { value: 'urgent', label: 'Urgente' }
      ],
      description: 'Nivel de prioridad para la ejecución del proyecto'
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
    <>
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
              actions={[
                { label: 'Gestionar', icon: FiEye, onClick: handleViewProject, variant: 'outline-primary' },
                { label: 'Eliminar', icon: FiTrash2, onClick: handleDelete, variant: 'outline-danger' }
              ]}
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

      {/* Modal Unificado para Gestionar Proyecto */}
      <ModalForm
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        title={`Gestionar Proyecto - ${selectedProject?.name || ''}`}
        data={editingData}
        fields={[
          {
            name: 'project_management',
            label: 'Gestión del Proyecto',
            type: 'custom',
            render: (project) => (
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
              >
                {/* Tab Ver */}
                <Tab eventKey="view" title={
                  <span>
                    <FiEye className="me-1" />
                    Ver
                  </span>
                }>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="border rounded p-3 h-100">
                        <h6 className="text-primary mb-3">
                          <FiHome className="me-2" />
                          Datos Generales
                        </h6>
                        <div className="mb-2">
                          <strong>ID:</strong> {project.id}
                        </div>
                        <div className="mb-2">
                          <strong>Nombre:</strong> {project.name}
                        </div>
                        <div className="mb-2">
                          <strong>Ubicación:</strong> {project.location}
                        </div>
                        <div className="mb-2">
                          <strong>Tipo:</strong> 
                          <Badge bg="info" className="ms-2">{project.project_type}</Badge>
                        </div>
                        <div className="mb-2">
                          <strong>Estado:</strong> 
                          <Badge bg="primary" className="ms-2">{project.status}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="border rounded p-3 h-100">
                        <h6 className="text-success mb-3">
                          <FiUser className="me-2" />
                          Información de Contacto
                        </h6>
                        <div className="mb-2">
                          <strong>Empresa:</strong> {project.company_name}
                        </div>
                        <div className="mb-2">
                          <strong>RUC:</strong> {project.company_ruc}
                        </div>
                        <div className="mb-2">
                          <strong>Contacto:</strong> {project.contact_name || 'Sin contacto'}
                        </div>
                        <div className="mb-2">
                          <strong>Teléfono:</strong> {project.contact_phone || 'Sin teléfono'}
                        </div>
                        <div className="mb-2">
                          <strong>Email:</strong> {project.contact_email || 'Sin email'}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="border rounded p-3 h-100">
                        <h6 className="text-warning mb-3">
                          <FiSettings className="me-2" />
                          Servicios Requeridos
                        </h6>
                        <div className="mb-2">
                          <strong>Laboratorio:</strong> 
                          {project.requiere_laboratorio ? (
                            <Badge bg="info" className="ms-2">Requerido</Badge>
                          ) : (
                            <Badge bg="secondary" className="ms-2">No requerido</Badge>
                          )}
                        </div>
                        <div className="mb-2">
                          <strong>Ingeniería:</strong> 
                          {project.requiere_ingenieria ? (
                            <Badge bg="success" className="ms-2">Requerido</Badge>
                          ) : (
                            <Badge bg="secondary" className="ms-2">No requerido</Badge>
                          )}
                        </div>
                        <div className="mb-2">
                          <strong>Estado Lab:</strong> 
                          <Badge bg="info" className="ms-2">{project.laboratorio_status}</Badge>
                        </div>
                        <div className="mb-2">
                          <strong>Estado Ing:</strong> 
                          <Badge bg="success" className="ms-2">{project.ingenieria_status}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="border rounded p-3 h-100">
                        <h6 className="text-info mb-3">
                          <FiUsers className="me-2" />
                          Asignaciones
                        </h6>
                        <div className="mb-2">
                          <strong>Vendedor:</strong> {project.vendedor_name || 'Sin asignar'}
                        </div>
                        <div className="mb-2">
                          <strong>Laboratorio:</strong> {project.laboratorio_name || 'Sin asignar'}
                        </div>
                        <div className="mb-2">
                          <strong>Fecha Creación:</strong> {new Date(project.created_at).toLocaleDateString()}
                        </div>
                        <div className="mb-2">
                          <strong>Última Actualización:</strong> {new Date(project.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    {project.status_notes && (
                      <div className="col-12">
                        <div className="border rounded p-3">
                          <h6 className="text-muted mb-3">
                            <FiMessageCircle className="me-2" />
                            Notas del Estado
                          </h6>
                          <p className="mb-0">{project.status_notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Tab>

                {/* Tab Editar */}
                <Tab eventKey="edit" title={
                  <span>
                    <FiEdit className="me-1" />
                    Editar
                  </span>
                }>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Nombre del Proyecto</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={editingData.name || ''} 
                          onChange={(e) => setEditingData({...editingData, name: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Ubicación</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={editingData.location || ''} 
                          onChange={(e) => setEditingData({...editingData, location: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Persona de Contacto</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={editingData.contact_name || ''} 
                          onChange={(e) => setEditingData({...editingData, contact_name: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Teléfono de Contacto</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={editingData.contact_phone || ''} 
                          onChange={(e) => setEditingData({...editingData, contact_phone: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="mb-3">
                        <label className="form-label">Email de Contacto</label>
                        <input 
                          type="email" 
                          className="form-control" 
                          value={editingData.contact_email || ''} 
                          onChange={(e) => setEditingData({...editingData, contact_email: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <Button 
                        variant="primary" 
                        onClick={() => {
                          const projectId = selectedProject?.id;
                          
                          if (!projectId) {
                            console.error('No se encontró el ID del proyecto');
                            showNotification('❌ Error: No se encontró el ID del proyecto', 'danger');
                            return;
                          }
                          
                          // Asegurar que projectId sea un número
                          const numericId = typeof projectId === 'object' ? projectId.id : projectId;
                          
                          // Llamar a la mutación con manejo de respuesta
                          updateMutation.mutate({ 
                            id: numericId, 
                            data: editingData
                          }, {
                            onSuccess: (data) => {
                              showNotification('✅ Proyecto actualizado exitosamente!', 'success');
                            },
                            onError: (error) => {
                              console.error('❌ Guardar Cambios - Error:', error);
                              showNotification('❌ Error al actualizar proyecto', 'danger');
                            }
                          });
                        }}
                        disabled={updateMutation.isLoading}
                      >
                        {updateMutation.isLoading ? 'Guardando...' : 'Guardar Cambios'}
                      </Button>
                    </div>
                  </div>
                </Tab>

                {/* Tab Estado */}
                <Tab eventKey="status" title={
                  <span>
                    <FiSettings className="me-1" />
                    Estado
                  </span>
                }>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Estado del Proyecto</label>
                        <select 
                          className="form-select" 
                          value={editingData.status || ''} 
                          onChange={(e) => setEditingData({...editingData, status: e.target.value})}
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="en_proceso">En Proceso</option>
                          <option value="completado">Completado</option>
                          <option value="pausado">Pausado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Estado del Laboratorio</label>
                        <select 
                          className="form-select" 
                          value={editingData.laboratorio_status || ''} 
                          onChange={(e) => setEditingData({...editingData, laboratorio_status: e.target.value})}
                        >
                          <option value="no_requerido">No Requerido</option>
                          <option value="pendiente">Pendiente</option>
                          <option value="en_proceso">En Proceso</option>
                          <option value="completado">Completado</option>
                          <option value="pausado">Pausado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Estado de Ingeniería</label>
                        <select 
                          className="form-select" 
                          value={editingData.ingenieria_status || ''} 
                          onChange={(e) => setEditingData({...editingData, ingenieria_status: e.target.value})}
                        >
                          <option value="no_requerido">No Requerido</option>
                          <option value="pendiente">Pendiente</option>
                          <option value="en_proceso">En Proceso</option>
                          <option value="completado">Completado</option>
                          <option value="pausado">Pausado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="mb-3">
                        <label className="form-label">Notas del Estado</label>
                        <textarea 
                          className="form-control" 
                          rows="3"
                          value={editingData.status_notes || ''} 
                          onChange={(e) => setEditingData({...editingData, status_notes: e.target.value})}
                          placeholder="Agrega comentarios sobre el cambio de estado..."
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <Button 
                        variant="success" 
                        onClick={() => {
                          const projectId = selectedProject?.id;
                          if (!projectId) {
                            console.error('No se encontró el ID del proyecto');
                            showNotification('❌ Error: No se encontró el ID del proyecto', 'danger');
                            return;
                          }
                          
                          updateStatusMutation.mutate({ id: projectId, ...editingData }, {
                            onSuccess: (data) => {
                              console.log('✅ Actualizar Estado - Éxito:', data);
                              showNotification('✅ Estado actualizado correctamente!', 'success');
                            },
                            onError: (error) => {
                              console.error('❌ Actualizar Estado - Error:', error);
                              showNotification('❌ Error al actualizar estado', 'danger');
                            }
                          });
                        }}
                        disabled={updateStatusMutation.isLoading}
                      >
                        {updateStatusMutation.isLoading ? 'Actualizando...' : 'Actualizar Estado'}
                      </Button>
                    </div>
                  </div>
                </Tab>

                {/* Tab Categorías */}
                <Tab eventKey="categories" title={
                  <span>
                    <FiFolder className="me-1" />
                    Categorías
                  </span>
                }>
                  <div className="row g-3">
                    <div className="col-12">
                      <h6 className="mb-3">Categorías del Proyecto</h6>
                      <div className="form-check">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="cat_laboratorio"
                          checked={editingData.requiere_laboratorio || false}
                          onChange={(e) => {
                            console.log('🔍 requiere_laboratorio onChange:', e.target.checked);
                            setEditingData({...editingData, requiere_laboratorio: e.target.checked});
                          }}
                        />
                        <label className="form-check-label" htmlFor="cat_laboratorio">
                          Laboratorio
                        </label>
                      </div>
                      <div className="form-check">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="cat_ingenieria"
                          checked={editingData.requiere_ingenieria || false}
                          onChange={(e) => setEditingData({...editingData, requiere_ingenieria: e.target.checked})}
                        />
                        <label className="form-check-label" htmlFor="cat_ingenieria">
                          Ingeniería
                        </label>
                      </div>
                      <div className="form-check">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="cat_consultoria"
                          checked={editingData.requiere_consultoria || false}
                          onChange={(e) => setEditingData({...editingData, requiere_consultoria: e.target.checked})}
                        />
                        <label className="form-check-label" htmlFor="cat_consultoria">
                          Consultoría
                        </label>
                      </div>
                      <div className="form-check">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="cat_capacitacion"
                          checked={editingData.requiere_capacitacion || false}
                          onChange={(e) => setEditingData({...editingData, requiere_capacitacion: e.target.checked})}
                        />
                        <label className="form-check-label" htmlFor="cat_capacitacion">
                          Capacitación
                        </label>
                      </div>
                      <div className="form-check">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="cat_auditoria"
                          checked={editingData.requiere_auditoria || false}
                          onChange={(e) => setEditingData({...editingData, requiere_auditoria: e.target.checked})}
                        />
                        <label className="form-check-label" htmlFor="cat_auditoria">
                          Auditoría
                        </label>
                      </div>
                    </div>
                    <div className="col-12">
                      <Button 
                        variant="info" 
                        onClick={() => {
                          const projectId = selectedProject?.id;
                          if (!projectId) {
                            console.error('No se encontró el ID del proyecto');
                            showNotification('❌ Error: No se encontró el ID del proyecto', 'danger');
                            return;
                          }
                          
                          updateCategoriesMutation.mutate({ 
                            id: projectId, 
                            requiere_laboratorio: editingData.requiere_laboratorio || false,
                            requiere_ingenieria: editingData.requiere_ingenieria || false,
                            requiere_consultoria: editingData.requiere_consultoria || false,
                            requiere_capacitacion: editingData.requiere_capacitacion || false,
                            requiere_auditoria: editingData.requiere_auditoria || false
                          }, {
                            onSuccess: (data) => {
                              console.log('✅ Guardar Categorías - Éxito:', data);
                              showNotification('✅ Categorías guardadas correctamente!', 'success');
                            },
                            onError: (error) => {
                              console.error('❌ Guardar Categorías - Error:', error);
                              showNotification('❌ Error al guardar categorías', 'danger');
                            }
                          });
                        }}
                        disabled={updateCategoriesMutation.isLoading}
                      >
                        {updateCategoriesMutation.isLoading ? 'Guardando...' : 'Guardar Categorías'}
                      </Button>
                    </div>
                  </div>
                </Tab>

                {/* Tab Consultas */}
                <Tab eventKey="queries" title={
                  <span>
                    <FiMessageCircle className="me-1" />
                    Consultas
                  </span>
                }>
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="mb-3">
                        <label className="form-label">Consultas y Dudas del Cliente</label>
                        <textarea 
                          className="form-control" 
                          rows="8"
                          value={editingData.queries || ''} 
                          onChange={(e) => setEditingData({...editingData, queries: e.target.value})}
                          placeholder="Ingresa las consultas o dudas del cliente..."
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <Button 
                        variant="warning"
                        onClick={() => {
                          const projectId = selectedProject?.id;
                          if (!projectId) {
                            console.error('No se encontró el ID del proyecto');
                            showNotification('❌ Error: No se encontró el ID del proyecto', 'danger');
                            return;
                          }
                          
                          updateQueriesMutation.mutate({ 
                            id: projectId, 
                            queries: editingData.queries || ''
                          }, {
                            onSuccess: (data) => {
                              console.log('✅ Guardar Consultas - Éxito:', data);
                              showNotification('✅ Consultas guardadas correctamente!', 'success');
                            },
                            onError: (error) => {
                              console.error('❌ Guardar Consultas - Error:', error);
                              showNotification('❌ Error al guardar consultas', 'danger');
                            }
                          });
                        }}
                        disabled={updateQueriesMutation.isLoading}
                      >
                        {updateQueriesMutation.isLoading ? 'Guardando...' : 'Guardar Consultas'}
                      </Button>
                    </div>
                  </div>
                </Tab>

                {/* Tab Marcar */}
                <Tab eventKey="mark" title={
                  <span>
                    <FiCheck className="me-1" />
                    Marcar
                  </span>
                }>
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="text-center">
                        <h6 className="mb-3">Marcar Proyecto</h6>
                        <p className="text-muted mb-4">
                          Marca este proyecto para seguimiento especial o prioridad alta.
                        </p>
                        <div className="mb-3">
                          <label className="form-label">Prioridad</label>
                          <select 
                            className="form-select" 
                            value={editingData.priority || 'normal'} 
                            onChange={(e) => setEditingData({...editingData, priority: e.target.value})}
                          >
                            <option value="low">Baja</option>
                            <option value="normal">Normal</option>
                            <option value="high">Alta</option>
                            <option value="urgent">Urgente</option>
                          </select>
                        </div>
                        <Button 
                          variant="success" 
                          size="lg"
                          onClick={() => {
                            const projectId = selectedProject?.id;
                            if (!projectId) {
                              console.error('No se encontró el ID del proyecto');
                              showNotification('❌ Error: No se encontró el ID del proyecto', 'danger');
                              return;
                            }
                            
                            updateMarkMutation.mutate({ 
                              id: projectId, 
                              marked: !editingData.marked,
                              priority: editingData.priority || 'normal'
                            }, {
                              onSuccess: (data) => {
                                console.log('✅ Marcar Proyecto - Éxito:', data);
                                const action = editingData.marked ? 'desmarcado' : 'marcado';
                                showNotification(`✅ Proyecto ${action} correctamente!`, 'success');
                              },
                              onError: (error) => {
                                console.error('❌ Marcar Proyecto - Error:', error);
                                showNotification('❌ Error al marcar proyecto', 'danger');
                              }
                            });
                          }}
                          disabled={updateMarkMutation.isLoading}
                        >
                          <FiCheck className="me-2" />
                          {updateMarkMutation.isLoading ? 'Procesando...' : (editingData.marked ? 'Desmarcar Proyecto' : 'Marcar Proyecto')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Tab>
              </Tabs>
            )
          }
        ]}
        onSubmit={() => setShowViewModal(false)}
        submitText="Cerrar"
        size="xl"
      />
      
      </div>
    </Container>
    
    {/* Toast de notificaciones - SOLUCIÓN ALTERNATIVA */}
    {showToast && (
      <div 
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 99999,
          backgroundColor: toastVariant === 'success' ? '#28a745' : '#dc3545',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          minWidth: '300px',
          border: 'none'
        }}
        onClick={() => setShowToast(false)}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
          {toastVariant === 'success' ? '✅ Éxito' : '❌ Error'}
        </div>
        <div>{toastMessage}</div>
      </div>
    )}
    </>
  );
};