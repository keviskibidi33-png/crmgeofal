import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Badge, Row, Col, Card, Container, Tabs, Tab, Toast, ToastContainer } from 'react-bootstrap';
import { FiPlus, FiEdit, FiTrash2, FiHome, FiMapPin, FiCalendar, FiUser, FiCheckCircle, FiClock, FiX, FiRefreshCw, FiFolder, FiMessageCircle, FiCheck, FiSettings, FiEye, FiUsers, FiDownload, FiAlertTriangle } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import ModalForm from '../components/common/ModalForm';
import StatsCard from '../components/common/StatsCard';
import { listProjects, createProject, updateProject, deleteProject, getProjectStats, updateProjectStatus, updateProjectCategories, updateProjectQueries, updateProjectMark } from '../services/projects';
// import { listCategories, listSubcategories } from '../services/categories'; // Eliminado - sistema antiguo
import { listProjectAttachments, uploadAttachment, deleteAttachment, downloadFile } from '../services/attachments';
import ProjectServiceForm from '../components/ProjectServiceForm';
import ProjectFormRedesigned from '../components/ProjectFormRedesigned';

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
  // category_id, subcategory_id, category_name, subcategory_name eliminados - sistema antiguo
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
  
  // Estados para categorías eliminados - reemplazados por sistema de servicios
  
  // Estados para adjuntos
  const [attachments, setAttachments] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Estados para servicios
  const [selectedServices, setSelectedServices] = useState([]);
  const [showServiceForm, setShowServiceForm] = useState(false);
  
  // Estados para formulario rediseñado
  const [useNewForm, setUseNewForm] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);


  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedProjectType, setSelectedProjectType] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtener cliente pre-seleccionado desde la navegación
  const selectedClient = location.state?.selectedClient;

  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery(
    ['projects', currentPage, searchTerm, selectedStatus, selectedCompany, selectedProjectType, selectedPriority],
    () => listProjects({ 
      page: currentPage, 
      limit: 20, 
      search: searchTerm, 
      status: selectedStatus, 
      company_id: selectedCompany,
      project_type: selectedProjectType,
      priority: selectedPriority
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
      onSuccess: (data) => {
        console.log('📊 Frontend - Estadísticas recibidas:', data);
        console.log('📊 Frontend - alta_prioridad:', data?.alta_prioridad);
      }
    }
  );

  // Código de carga de categorías eliminado - sistema antiguo removido

  // Código de categorías eliminado - sistema antiguo removido

  // Cargar adjuntos cuando se abra el modal de gestión
  useEffect(() => {
    const loadAttachments = async () => {
      if (selectedProject?.id) {
        try {
          const attachmentsData = await listProjectAttachments(selectedProject.id);
          setAttachments(attachmentsData);
        } catch (error) {
          console.error('Error al cargar adjuntos:', error);
        }
      }
    };
    loadAttachments();
  }, [selectedProject?.id, showViewModal]);

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
    setSelectedPriority(filters.priority || '');
    setCurrentPage(1); // Resetear a la primera página
  };

  // Funciones para manejar adjuntos
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !selectedProject?.id) {
      showNotification('❌ Por favor selecciona un archivo', 'danger');
      return;
    }

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('description', `Archivo subido: ${selectedFile.name}`);

      await uploadAttachment(selectedProject.id, formData);
      
      // Recargar adjuntos
      const attachmentsData = await listProjectAttachments(selectedProject.id);
      setAttachments(attachmentsData);
      
      setSelectedFile(null);
      setUploadingFile(false);
      showNotification('✅ Archivo subido correctamente', 'success');
    } catch (error) {
      console.error('Error al subir archivo:', error);
      setUploadingFile(false);
      showNotification('❌ Error al subir archivo', 'danger');
    }
  };

  const handleFileDownload = async (attachment) => {
    try {
      await downloadFile(attachment);
      showNotification('✅ Archivo descargado correctamente', 'success');
    } catch (error) {
      console.error('Error al descargar archivo:', error);
      showNotification('❌ Error al descargar archivo', 'danger');
    }
  };

  const handleFileDelete = async (attachmentId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
      try {
        await deleteAttachment(attachmentId);
        
        // Recargar adjuntos
        const attachmentsData = await listProjectAttachments(selectedProject.id);
        setAttachments(attachmentsData);
        
        showNotification('✅ Archivo eliminado correctamente', 'success');
      } catch (error) {
        console.error('Error al eliminar archivo:', error);
        showNotification('❌ Error al eliminar archivo', 'danger');
      }
    }
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
      title: 'Por Prioridad',
      options: [
        { label: '🔴 Urgente', filter: { priority: 'urgent' } },
        { label: '🟠 Alta', filter: { priority: 'high' } },
        { label: '🔵 Activo', filter: { priority: 'active' } },
        { label: '🟢 Normal', filter: { priority: 'normal' } },
        { label: '🔵 Baja', filter: { priority: 'low' } }
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
      contact_email: project.contact_email || '',
      category_id: project.category_id || '',
      subcategory_id: project.subcategory_id || '',
      category_name: project.category_name || '',
      subcategory_name: project.subcategory_name || ''
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
      header: 'Categoría',
      accessor: 'category_name',
      render: (value, row) => (
        <div>
          {row.category_name && (
            <Badge bg="primary" className="px-2 py-1 mb-1 d-block">
              {row.category_name}
            </Badge>
          )}
          {row.subcategory_name && (
            <Badge bg="secondary" className="px-2 py-1 d-block">
              {row.subcategory_name}
            </Badge>
          )}
          {!row.category_name && (
            <span className="text-muted">Sin categoría</span>
          )}
        </div>
      )
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
      header: 'Prioridad',
      accessor: 'priority',
      render: (value, row) => {
        const getPriorityDisplay = (priority) => {
          switch (priority) {
            case 'urgent':
              return { emoji: '🔴', text: 'Urgente', color: 'text-danger', bgColor: 'bg-danger' };
            case 'high':
              return { emoji: '🟠', text: 'Alta', color: 'text-warning', bgColor: 'bg-warning' };
            case 'active':
              return { emoji: '🔵', text: 'Activo', color: 'text-info', bgColor: 'bg-info' };
            case 'low':
              return { emoji: '🔵', text: 'Baja', color: 'text-primary', bgColor: 'bg-primary' };
            case 'normal':
            default:
              return { emoji: '🟢', text: 'Normal', color: 'text-success', bgColor: 'bg-success' };
          }
        };

        const priorityInfo = getPriorityDisplay(row.priority);
        
        return (
          <div className="d-flex align-items-center">
            <span className="me-2" style={{ fontSize: '1.2em' }}>
              {priorityInfo.emoji}
            </span>
            <span className={`small ${priorityInfo.color} fw-medium`}>
              {priorityInfo.text}
            </span>
            {/* Indicador para proyectos de alta prioridad que requieren atención del laboratorio */}
            {(row.priority === 'urgent' || row.priority === 'high') && row.requiere_laboratorio && (
              <span className="ms-2" title="Requiere atención prioritaria del laboratorio">
                <FiAlertTriangle className="text-warning" size={14} />
              </span>
            )}
          </div>
        );
      }
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
    // Categorías antiguas eliminadas - reemplazadas por sistema de servicios
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
      name: 'services',
      label: 'Servicios del Proyecto',
      type: 'custom',
      component: (
        <div>
          <div className="mb-3">
            <Button 
              variant="outline-primary" 
              onClick={() => setShowServiceForm(true)}
              className="w-100"
            >
              <FiSettings className="me-2" />
              {selectedServices.length > 0 
                ? `Configurar Servicios (${selectedServices.length} seleccionados)` 
                : 'Seleccionar Servicios'
              }
            </Button>
          </div>
          {selectedServices.length > 0 && (
            <div className="border rounded p-3 bg-light">
              <h6 className="mb-2">Servicios Seleccionados:</h6>
              {selectedServices.map((service, index) => (
                <div key={index} className="mb-2 p-2 border rounded bg-white">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong>{service.ensayo.name}</strong>
                      <div className="small text-muted">
                        {service.subservices.map(sub => sub.codigo).join(', ')}
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold text-success">
                        S/ {service.total.toFixed(2)}
                      </div>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => {
                          const newServices = selectedServices.filter((_, i) => i !== index);
                          setSelectedServices(newServices);
                        }}
                      >
                        <FiX size={12} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="mt-2 pt-2 border-top">
                <div className="d-flex justify-content-between">
                  <strong>Subtotal:</strong>
                  <strong>S/ {selectedServices.reduce((sum, service) => sum + service.total, 0).toFixed(2)}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span>IGV (18%):</span>
                  <span>S/ {(selectedServices.reduce((sum, service) => sum + service.total, 0) * 0.18).toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between fw-bold text-success">
                  <span>Total:</span>
                  <span>S/ {(selectedServices.reduce((sum, service) => sum + service.total, 0) * 1.18).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )
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
    // Campos duplicados eliminados - ya existen arriba en el formulario
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
        cancelados: statsData.cancelados || 0,
        alta_prioridad: statsData.alta_prioridad || 0
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
      cancelados: projects.filter(p => p.status === 'cancelado').length,
      alta_prioridad: projects.filter(p => p.priority === 'urgent' || p.priority === 'high').length
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
                <Button variant="primary" onClick={() => setShowNewForm(true)}>
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
              title="Alta Prioridad"
              value={stats.alta_prioridad || 0}
              icon={FiAlertTriangle}
              color="danger"
              subtitle="🔴 Urgente + 🟠 Alta"
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
              // Función para estilos de fila
              getRowClassName={(project) => {
                if (project.status === 'cancelado') {
                  return 'table-secondary opacity-50 text-muted';
                }
                return '';
              }}
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
                          <option value="activo">Activo</option>
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
                            <option value="active">Activo</option>
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

                {/* Tab Adjuntos */}
                <Tab eventKey="attachments" title={
                  <span>
                    <FiFolder className="me-1" />
                    Adjuntos
                  </span>
                }>
                  <div className="row g-3">
                    <div className="col-12">
                      <h6 className="mb-3">Gestión de Archivos</h6>
                      
                      {/* Subir archivo */}
                      <div className="card mb-4">
                        <div className="card-header">
                          <h6 className="mb-0">Subir Nuevo Archivo</h6>
                        </div>
                        <div className="card-body">
                          <div className="mb-3">
                            <label className="form-label">Seleccionar Archivo</label>
                            <input 
                              type="file" 
                              className="form-control" 
                              onChange={handleFileSelect}
                              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt"
                            />
                            <div className="form-text">
                              Formatos permitidos: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, JPEG, PNG, GIF, TXT (máx. 10MB)
                            </div>
                          </div>
                          {selectedFile && (
                            <div className="mb-3">
                              <div className="alert alert-info">
                                <strong>Archivo seleccionado:</strong> {selectedFile.name} 
                                <br />
                                <small>Tamaño: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</small>
                              </div>
                            </div>
                          )}
                          <Button 
                            variant="primary" 
                            onClick={handleFileUpload}
                            disabled={!selectedFile || uploadingFile}
                          >
                            {uploadingFile ? 'Subiendo...' : 'Subir Archivo'}
                          </Button>
                        </div>
                      </div>

                      {/* Lista de archivos */}
                      <div className="card">
                        <div className="card-header">
                          <h6 className="mb-0">Archivos Adjuntos ({attachments.length})</h6>
                        </div>
                        <div className="card-body">
                          {attachments.length === 0 ? (
                            <div className="text-center text-muted py-4">
                              <FiFolder size={48} className="mb-3" />
                              <p>No hay archivos adjuntos</p>
                              <small>Sube archivos como cotizaciones, documentos técnicos, etc.</small>
                            </div>
                          ) : (
                            <div className="table-responsive">
                              <table className="table table-hover">
                                <thead>
                                  <tr>
                                    <th>Archivo</th>
                                    <th>Tamaño</th>
                                    <th>Fecha</th>
                                    <th>Subido por</th>
                                    <th>Acciones</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {attachments.map((attachment) => (
                                    <tr key={attachment.id}>
                                      <td>
                                        <div>
                                          <strong>{attachment.original_name}</strong>
                                          {attachment.description && (
                                            <>
                                              <br/>
                                              <small className="text-muted">{attachment.description}</small>
                                            </>
                                          )}
                                        </div>
                                      </td>
                                      <td>
                                        {attachment.file_size ? 
                                          `${(attachment.file_size / 1024 / 1024).toFixed(2)} MB` : 
                                          'N/A'
                                        }
                                      </td>
                                      <td>
                                        {new Date(attachment.created_at).toLocaleDateString()}
                                      </td>
                                      <td>
                                        {attachment.uploaded_by_name || 'Usuario'}
                                      </td>
                                      <td>
                                        <div className="btn-group btn-group-sm">
                                          <Button 
                                            variant="outline-primary" 
                                            size="sm"
                                            onClick={() => handleFileDownload(attachment)}
                                            title="Descargar"
                                          >
                                            <FiDownload size={14} />
                                          </Button>
                                          <Button 
                                            variant="outline-danger" 
                                            size="sm"
                                            onClick={() => handleFileDelete(attachment.id)}
                                            title="Eliminar"
                                          >
                                            <FiTrash2 size={14} />
                                          </Button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
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

      {/* Modal para selección de servicios */}
      <ModalForm
        show={showServiceForm}
        onHide={() => setShowServiceForm(false)}
        title="Seleccionar Servicios del Proyecto"
        size="xl"
        data={{}}
        fields={[]}
        onSubmit={() => setShowServiceForm(false)}
        loading={false}
        submitText="Cerrar"
        customBody={
          <ProjectServiceForm
            selectedServices={selectedServices}
            onServicesChange={setSelectedServices}
            serviceType="laboratorio"
          />
        }
      />

      {/* Nuevo Formulario Rediseñado */}
      {showNewForm && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1050,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="modal-content bg-white rounded shadow-lg" style={{
            width: '90%',
            maxWidth: '1200px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div className="modal-header p-4 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Crear Nuevo Proyecto</h5>
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => setShowNewForm(false)}
              >
                <FiX />
              </Button>
            </div>
            <div className="modal-body p-4">
              <ProjectFormRedesigned
                data={selectedClient ? { company_id: selectedClient.id } : {}}
                onSubmit={(formData) => {
                  console.log('Datos del formulario:', formData);
                  // Aquí se procesaría la creación del proyecto
                  setShowNewForm(false);
                }}
                onCancel={() => setShowNewForm(false)}
                loading={createMutation.isLoading}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};