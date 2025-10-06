import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Badge, Row, Col, Card, Container, Tabs, Tab, Toast, ToastContainer } from 'react-bootstrap';
import { FiPlus, FiEdit, FiTrash2, FiHome, FiMapPin, FiCalendar, FiUser, FiCheckCircle, FiClock, FiX, FiRefreshCw, FiFolder, FiMessageCircle, FiCheck, FiSettings, FiEye, FiUsers, FiDownload, FiAlertTriangle, FiUpload, FiFileText, FiSave } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import ModalForm from '../components/common/ModalForm';
import StatsCard from '../components/common/StatsCard';
import ConfirmModal from '../components/common/ConfirmModal';
import { listProjects, createProject, updateProject, deleteProject, getProjectStats, updateProjectStatus, updateProjectQueries, updateProjectMark } from '../services/projects';
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
};

export default function Proyectos() {
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);
  const [deletingFile, setDeletingFile] = useState(null);
  const [markingProject, setMarkingProject] = useState(null);
  const [showQueriesModal, setShowQueriesModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [editingData, setEditingData] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');
  
  // Estados para servicios modernos
  
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

  // Sistema de servicios moderno implementado

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
    setDeletingFile(attachmentId);
  };

  const confirmFileDelete = async () => {
    try {
      await deleteAttachment(deletingFile);
      
      // Recargar adjuntos
      const attachmentsData = await listProjectAttachments(selectedProject.id);
      setAttachments(attachmentsData);
      
      showNotification('✅ Archivo eliminado correctamente', 'success');
      setDeletingFile(null);
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      showNotification('❌ Error al eliminar archivo', 'danger');
      setDeletingFile(null);
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
    setDeletingProject(project);
  };

  const confirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(deletingProject.id);
      setDeletingProject(null);
    } catch (error) {
      console.error('Error eliminando proyecto:', error);
      setDeletingProject(null);
    }
  };


  const handleViewQueries = (project) => {
    setSelectedProject(project);
    setShowQueriesModal(true);
  };

  const handleToggleMark = async (project) => {
    setMarkingProject(project);
  };

  const confirmToggleMark = async () => {
    try {
      // Aquí implementarías la lógica para marcar/desmarcar
      console.log('Marcar/desmarcar proyecto:', markingProject);
      showNotification(`Proyecto ${markingProject.marked ? 'desmarcado' : 'marcado'}: ${markingProject.name}`, 'success');
      setMarkingProject(null);
    } catch (error) {
      console.error('Error al marcar proyecto:', error);
      showNotification('Error al marcar proyecto', 'danger');
      setMarkingProject(null);
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
    setActiveTab('info');
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
      width: '60px'
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
          {/* Mostrar tipo de proyecto como badge pequeño */}
          {row.project_type && (
            <div className="mt-1">
              <Badge bg="outline-secondary" size="sm" className="px-1 py-0 small">
                {row.project_type}
              </Badge>
            </div>
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
          {row.contact_name && (
            <small className="text-muted">
              <FiUser size={12} className="me-1" />
              {row.contact_name}
            </small>
          )}
        </div>
      )
    },
    {
      header: 'Estado',
      accessor: 'status',
      width: '100px',
      render: (value) => getStatusBadge(value || 'activo')
    },
    {
      header: 'Servicios',
      accessor: 'services',
      width: '120px',
      className: 'd-none d-lg-table-cell', // Ocultar en pantallas pequeñas
      render: (value, row) => (
        <div className="d-flex flex-wrap gap-1">
          {row.requiere_laboratorio && (
            <Badge bg="info" size="sm" className="px-1">
              Lab
            </Badge>
          )}
          {row.requiere_ingenieria && (
            <Badge bg="primary" size="sm" className="px-1">
              Ing
            </Badge>
          )}
          {row.requiere_consultoria && (
            <Badge bg="success" size="sm" className="px-1">
              Cons
            </Badge>
          )}
          {!row.requiere_laboratorio && !row.requiere_ingenieria && !row.requiere_consultoria && (
            <Badge bg="secondary" size="sm" className="px-1">
              N/A
            </Badge>
          )}
        </div>
      )
    },
    {
      header: 'Prioridad',
      accessor: 'priority',
      width: '100px',
      render: (value, row) => {
        const getPriorityDisplay = (priority) => {
          switch (priority) {
            case 'urgent':
              return { emoji: '🔴', text: 'Urgente', color: 'text-danger' };
            case 'high':
              return { emoji: '🟠', text: 'Alta', color: 'text-warning' };
            case 'active':
              return { emoji: '🔵', text: 'Activo', color: 'text-info' };
            case 'low':
              return { emoji: '🔵', text: 'Baja', color: 'text-primary' };
            case 'normal':
            default:
              return { emoji: '🟢', text: 'Normal', color: 'text-success' };
          }
        };

        const priorityInfo = getPriorityDisplay(row.priority);
        
        return (
          <div className="d-flex align-items-center">
            <span className="me-1" style={{ fontSize: '1em' }}>
              {priorityInfo.emoji}
            </span>
            <span className={`small ${priorityInfo.color} fw-medium`}>
              {priorityInfo.text}
            </span>
            {(row.priority === 'urgent' || row.priority === 'high') && row.requiere_laboratorio && (
              <FiAlertTriangle className="text-warning ms-1" size={12} />
            )}
          </div>
        );
      }
    },
    {
      header: 'Asignado a',
      accessor: 'vendedor_name',
      className: 'd-none d-md-table-cell', // Ocultar en pantallas muy pequeñas
      render: (value, row) => (
        <div>
          {row.vendedor_name && (
            <div className="small">
              <FiUser size={12} className="me-1 text-muted" />
              <span>{row.vendedor_name}</span>
            </div>
          )}
          {row.laboratorio_name && (
            <div className="small text-muted mt-1">
              <FiHome size={12} className="me-1" />
              <span>{row.laboratorio_name}</span>
            </div>
          )}
          {!row.vendedor_name && !row.laboratorio_name && (
            <span className="text-muted small">Sin asignar</span>
          )}
        </div>
      )
    },
    {
      header: 'Fecha',
      accessor: 'created_at',
      width: '100px',
      className: 'd-none d-xl-table-cell', // Solo mostrar en pantallas grandes
      render: (value) => {
        if (!value) return '-';
        const date = new Date(value);
        return (
          <div className="small">
            <div>{date.toLocaleDateString('es-ES')}</div>
          </div>
        );
      }
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
    // Sistema de servicios moderno
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
                {/* Tab Información General */}
                <Tab eventKey="info" title={
                  <span>
                    <FiHome className="me-1" />
                    Información
                  </span>
                }>
                  <style>{`
                    .info-item {
                      margin-bottom: 1rem;
                    }
                    .info-item label {
                      font-size: 0.75rem;
                      font-weight: 600;
                      text-transform: uppercase;
                      letter-spacing: 0.5px;
                      display: block;
                      margin-bottom: 0.25rem;
                    }
                    .service-status {
                      padding: 0.5rem 0;
                      border-bottom: 1px solid #eee;
                    }
                    .service-status:last-child {
                      border-bottom: none;
                    }
                    .upload-area:hover {
                      background-color: #e9ecef !important;
                      border-color: #f84616 !important;
                    }
                  `}</style>
                  <div className="row g-4">
                    {/* Información Principal */}
                    <div className="col-lg-8">
                      <div className="card border-0 shadow-sm">
                        <div className="card-header bg-primary text-white">
                          <h6 className="mb-0">
                            <FiHome className="me-2" />
                            {project.name}
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="row g-3">
                            <div className="col-md-6">
                              <div className="info-item">
                                <label className="text-muted small">ID del Proyecto</label>
                                <p className="fw-bold mb-2">#{project.id}</p>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="info-item">
                                <label className="text-muted small">Ubicación</label>
                                <p className="mb-2">{project.location}</p>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="info-item">
                                <label className="text-muted small">Estado Actual</label>
                                <div>
                                  <Badge bg="primary" className="fs-6">{project.status}</Badge>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="info-item">
                                <label className="text-muted small">Tipo de Proyecto</label>
                                <div>
                                  <Badge bg="info" className="fs-6">{project.project_type}</Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Panel de Estado */}
                    <div className="col-lg-4">
                      <div className="card border-0 shadow-sm">
                        <div className="card-header bg-success text-white">
                          <h6 className="mb-0">
                            <FiSettings className="me-2" />
                            Estado de Servicios
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="service-status mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="text-muted">Laboratorio</span>
                              {project.requiere_laboratorio ? (
                                <Badge bg="info">Requerido</Badge>
                              ) : (
                                <Badge bg="secondary">No requerido</Badge>
                              )}
                            </div>
                            {project.requiere_laboratorio && (
                              <small className="text-muted">Estado: {project.laboratorio_status}</small>
                            )}
                          </div>
                          
                          <div className="service-status">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="text-muted">Ingeniería</span>
                              {project.requiere_ingenieria ? (
                                <Badge bg="success">Requerido</Badge>
                              ) : (
                                <Badge bg="secondary">No requerido</Badge>
                              )}
                            </div>
                            {project.requiere_ingenieria && (
                              <small className="text-muted">Estado: {project.ingenieria_status}</small>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Información de Contacto */}
                    <div className="col-12">
                      <div className="card border-0 shadow-sm">
                        <div className="card-header bg-info text-white">
                          <h6 className="mb-0">
                            <FiUser className="me-2" />
                            Información de Contacto y Asignaciones
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="row g-3">
                            <div className="col-md-3">
                              <label className="text-muted small">Empresa</label>
                              <p className="mb-2 fw-semibold">{project.company_name}</p>
                            </div>
                            <div className="col-md-3">
                              <label className="text-muted small">RUC</label>
                              <p className="mb-2">{project.company_ruc}</p>
                            </div>
                            <div className="col-md-3">
                              <label className="text-muted small">Contacto</label>
                              <p className="mb-2">{project.contact_name || 'Sin contacto'}</p>
                            </div>
                            <div className="col-md-3">
                              <label className="text-muted small">Teléfono</label>
                              <p className="mb-2">{project.contact_phone || 'Sin teléfono'}</p>
                            </div>
                            <div className="col-md-4">
                              <label className="text-muted small">Email</label>
                              <p className="mb-2">{project.contact_email || 'Sin email'}</p>
                            </div>
                            <div className="col-md-4">
                              <label className="text-muted small">Vendedor Asignado</label>
                              <p className="mb-2">{project.vendedor_name || 'Sin asignar'}</p>
                            </div>
                            <div className="col-md-4">
                              <label className="text-muted small">Responsable Laboratorio</label>
                              <p className="mb-2">{project.laboratorio_name || 'Sin asignar'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notas del Estado */}
                    {project.status_notes && (
                      <div className="col-12">
                        <div className="card border-0 shadow-sm">
                          <div className="card-header bg-warning text-dark">
                            <h6 className="mb-0">
                              <FiMessageCircle className="me-2" />
                              Notas del Estado
                            </h6>
                          </div>
                          <div className="card-body">
                            <p className="mb-0">{project.status_notes}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Fechas */}
                    <div className="col-12">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="text-center">
                            <FiCalendar className="text-muted mb-2" size={20} />
                            <p className="text-muted small mb-1">Fecha de Creación</p>
                            <p className="fw-semibold">{new Date(project.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="text-center">
                            <FiClock className="text-muted mb-2" size={20} />
                            <p className="text-muted small mb-1">Última Actualización</p>
                            <p className="fw-semibold">{new Date(project.updated_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Tab>

                {/* Tab Configuración */}
                <Tab eventKey="config" title={
                  <span>
                    <FiSettings className="me-1" />
                    Configuración
                  </span>
                }>
                  <div className="row g-4">
                    {/* Información Básica */}
                    <div className="col-12">
                      <div className="card border-0 shadow-sm">
                        <div className="card-header bg-primary text-white">
                          <h6 className="mb-0">
                            <FiEdit className="me-2" />
                            Información Básica del Proyecto
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label">Nombre del Proyecto</label>
                              <input 
                                type="text" 
                                className="form-control" 
                                value={editingData.name || ''} 
                                onChange={(e) => setEditingData({...editingData, name: e.target.value})}
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Ubicación</label>
                              <input 
                                type="text" 
                                className="form-control" 
                                value={editingData.location || ''} 
                                onChange={(e) => setEditingData({...editingData, location: e.target.value})}
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Persona de Contacto</label>
                              <input 
                                type="text" 
                                className="form-control" 
                                value={editingData.contact_name || ''} 
                                onChange={(e) => setEditingData({...editingData, contact_name: e.target.value})}
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Teléfono de Contacto</label>
                              <input 
                                type="text" 
                                className="form-control" 
                                value={editingData.contact_phone || ''} 
                                onChange={(e) => setEditingData({...editingData, contact_phone: e.target.value})}
                              />
                            </div>
                            <div className="col-12">
                              <label className="form-label">Email de Contacto</label>
                              <input 
                                type="email" 
                                className="form-control" 
                                value={editingData.contact_email || ''} 
                                onChange={(e) => setEditingData({...editingData, contact_email: e.target.value})}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Estados del Proyecto */}
                    <div className="col-md-6">
                      <div className="card border-0 shadow-sm">
                        <div className="card-header bg-success text-white">
                          <h6 className="mb-0">
                            <FiSettings className="me-2" />
                            Estados del Proyecto
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="mb-3">
                            <label className="form-label">Estado Principal</label>
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
                          <div className="mb-3">
                            <label className="form-label">Prioridad</label>
                            <select 
                              className="form-select" 
                              value={editingData.priority || 'normal'} 
                              onChange={(e) => setEditingData({...editingData, priority: e.target.value})}
                            >
                              <option value="low">🟢 Baja</option>
                              <option value="normal">🔵 Normal</option>
                              <option value="high">🟠 Alta</option>
                              <option value="urgent">🔴 Urgente</option>
                            </select>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Estado Laboratorio</label>
                            <select 
                              className="form-select" 
                              value={editingData.laboratorio_status || ''} 
                              onChange={(e) => setEditingData({...editingData, laboratorio_status: e.target.value})}
                            >
                              <option value="no_requerido">No Requerido</option>
                              <option value="pendiente">Pendiente</option>
                              <option value="en_proceso">En Proceso</option>
                              <option value="completado">Completado</option>
                            </select>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Estado Ingeniería</label>
                            <select 
                              className="form-select" 
                              value={editingData.ingenieria_status || ''} 
                              onChange={(e) => setEditingData({...editingData, ingenieria_status: e.target.value})}
                            >
                              <option value="no_requerido">No Requerido</option>
                              <option value="pendiente">Pendiente</option>
                              <option value="en_proceso">En Proceso</option>
                              <option value="completado">Completado</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Servicios y Consultas */}
                    <div className="col-md-6">
                      <div className="card border-0 shadow-sm">
                        <div className="card-header bg-info text-white">
                          <h6 className="mb-0">
                            <FiFolder className="me-2" />
                            Servicios Requeridos
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="form-check mb-2">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              id="cat_laboratorio"
                              checked={editingData.requiere_laboratorio || false}
                              onChange={(e) => setEditingData({...editingData, requiere_laboratorio: e.target.checked})}
                            />
                            <label className="form-check-label" htmlFor="cat_laboratorio">
                              🧪 Laboratorio
                            </label>
                          </div>
                          <div className="form-check mb-2">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              id="cat_ingenieria"
                              checked={editingData.requiere_ingenieria || false}
                              onChange={(e) => setEditingData({...editingData, requiere_ingenieria: e.target.checked})}
                            />
                            <label className="form-check-label" htmlFor="cat_ingenieria">
                              ⚙️ Ingeniería
                            </label>
                          </div>
                          <div className="form-check mb-2">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              id="cat_consultoria"
                              checked={editingData.requiere_consultoria || false}
                              onChange={(e) => setEditingData({...editingData, requiere_consultoria: e.target.checked})}
                            />
                            <label className="form-check-label" htmlFor="cat_consultoria">
                              💼 Consultoría
                            </label>
                          </div>
                          <div className="form-check mb-2">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              id="cat_capacitacion"
                              checked={editingData.requiere_capacitacion || false}
                              onChange={(e) => setEditingData({...editingData, requiere_capacitacion: e.target.checked})}
                            />
                            <label className="form-check-label" htmlFor="cat_capacitacion">
                              📚 Capacitación
                            </label>
                          </div>
                          <div className="form-check mb-3">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              id="cat_auditoria"
                              checked={editingData.requiere_auditoria || false}
                              onChange={(e) => setEditingData({...editingData, requiere_auditoria: e.target.checked})}
                            />
                            <label className="form-check-label" htmlFor="cat_auditoria">
                              📋 Auditoría
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notas y Consultas */}
                    <div className="col-12">
                      <div className="card border-0 shadow-sm">
                        <div className="card-header bg-warning text-dark">
                          <h6 className="mb-0">
                            <FiMessageCircle className="me-2" />
                            Notas y Consultas
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label">Notas del Estado</label>
                              <textarea 
                                className="form-control" 
                                rows="4"
                                value={editingData.status_notes || ''} 
                                onChange={(e) => setEditingData({...editingData, status_notes: e.target.value})}
                                placeholder="Agrega comentarios sobre el estado del proyecto..."
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Consultas del Cliente</label>
                              <textarea 
                                className="form-control" 
                                rows="4"
                                value={editingData.queries || ''} 
                                onChange={(e) => setEditingData({...editingData, queries: e.target.value})}
                                placeholder="Consultas y dudas del cliente..."
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Botón de Guardar */}
                    <div className="col-12">
                      <div className="d-flex justify-content-end gap-2">
                        <Button 
                          variant="outline-secondary" 
                          onClick={() => setShowViewModal(false)}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          variant="primary" 
                          size="lg"
                          onClick={() => {
                            const projectId = selectedProject?.id;
                            
                            if (!projectId) {
                              console.error('No se encontró el ID del proyecto');
                              showNotification('❌ Error: No se encontró el ID del proyecto', 'danger');
                              return;
                            }
                            
                            // Llamar a la mutación con todos los datos
                            updateMutation.mutate({ 
                              id: projectId, 
                              data: editingData
                            }, {
                              onSuccess: (data) => {
                                showNotification('✅ Proyecto actualizado exitosamente!', 'success');
                                setShowViewModal(false);
                              },
                              onError: (error) => {
                                console.error('❌ Error al actualizar:', error);
                                showNotification('❌ Error al actualizar proyecto', 'danger');
                              }
                            });
                          }}
                          disabled={updateMutation.isLoading}
                          className="px-4"
                        >
                          <FiSave className="me-2" />
                          {updateMutation.isLoading ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Tab>

                {/* Tab Archivos */}
                <Tab eventKey="files" title={
                  <span>
                    <FiFolder className="me-1" />
                    Archivos
                  </span>
                }>
                  <div className="row g-4">
                    {/* Subir Archivo */}
                    <div className="col-12">
                      <div className="card border-0 shadow-sm">
                        <div className="card-header bg-primary text-white d-flex align-items-center">
                          <FiUpload className="me-2" />
                          <h6 className="mb-0">Subir Archivo</h6>
                        </div>
                        <div className="card-body">
                          <div className="upload-area border-2 border-dashed rounded p-4 text-center mb-3" 
                               style={{borderColor: '#dee2e6', backgroundColor: '#f8f9fa'}}>
                            <FiFolder size={32} className="text-muted mb-2" />
                            <div className="mb-2">
                              <input 
                                type="file" 
                                className="form-control" 
                                onChange={handleFileSelect}
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt"
                              />
                            </div>
                            <small className="text-muted">
                              📁 PDF, Word, Excel, PowerPoint, Imágenes, TXT (máx. 10MB)
                            </small>
                          </div>
                          
                          {selectedFile && (
                            <div className="alert alert-info d-flex align-items-center">
                              <FiFileText className="me-2" />
                              <div>
                                <strong>{selectedFile.name}</strong>
                                <br />
                                <small>📏 {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</small>
                              </div>
                            </div>
                          )}
                          
                          <div className="d-flex justify-content-end">
                            <Button 
                              variant="primary" 
                              onClick={handleFileUpload}
                              disabled={!selectedFile || uploadingFile}
                              className="px-4"
                            >
                              <FiUpload className="me-2" />
                              {uploadingFile ? 'Subiendo...' : 'Subir Archivo'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lista de Archivos */}
                    <div className="col-12">
                      <div className="card border-0 shadow-sm">
                        <div className="card-header bg-info text-white d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <FiFolder className="me-2" />
                            <h6 className="mb-0">Archivos del Proyecto</h6>
                          </div>
                          <Badge bg="light" text="dark" className="px-3 py-2">
                            {attachments.length} archivo{attachments.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <div className="card-body">
                          {attachments.length === 0 ? (
                            <div className="text-center py-5">
                              <FiFolder size={48} className="text-muted mb-3" />
                              <h6 className="text-muted">No hay archivos adjuntos</h6>
                              <p className="text-muted small">
                                📎 Sube cotizaciones, documentos técnicos, planos, etc.
                              </p>
                            </div>
                          ) : (
                            <div className="row g-3">
                              {attachments.map((attachment) => (
                                <div key={attachment.id} className="col-lg-6">
                                  <div className="card border h-100">
                                    <div className="card-body p-3">
                                      <div className="d-flex align-items-start">
                                        <div className="me-3">
                                          <FiFileText size={24} className="text-primary" />
                                        </div>
                                        <div className="flex-grow-1">
                                          <h6 className="mb-1">{attachment.original_name}</h6>
                                          <div className="small text-muted mb-2">
                                            📏 {attachment.file_size ? 
                                              `${(attachment.file_size / 1024 / 1024).toFixed(2)} MB` : 
                                              'N/A'
                                            }
                                            <span className="mx-2">•</span>
                                            📅 {new Date(attachment.created_at).toLocaleDateString()}
                                          </div>
                                          <div className="small text-muted mb-3">
                                            👤 {attachment.uploaded_by_name || 'Usuario'}
                                          </div>
                                          {attachment.description && (
                                            <p className="small text-muted">{attachment.description}</p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="d-flex gap-2 mt-3">
                                        <Button 
                                          variant="outline-primary" 
                                          size="sm"
                                          onClick={() => handleFileDownload(attachment)}
                                          className="flex-grow-1"
                                        >
                                          <FiDownload className="me-1" size={14} />
                                          Descargar
                                        </Button>
                                        <Button 
                                          variant="outline-danger" 
                                          size="sm"
                                          onClick={() => handleFileDelete(attachment.id)}
                                        >
                                          <FiTrash2 size={14} />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
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

      {/* Modales de confirmación */}
      <ConfirmModal
        show={!!deletingProject}
        onHide={() => setDeletingProject(null)}
        onConfirm={confirmDelete}
        title="Eliminar Proyecto"
        message={`¿Estás seguro de que quieres eliminar el proyecto "${deletingProject?.name}"?`}
        confirmText="Eliminar"
        variant="danger"
        isLoading={deleteMutation.isLoading}
        alertMessage="Esta acción eliminará permanentemente el proyecto y todos sus datos asociados."
        alertVariant="danger"
      />

      <ConfirmModal
        show={!!deletingFile}
        onHide={() => setDeletingFile(null)}
        onConfirm={confirmFileDelete}
        title="Eliminar Archivo"
        message="¿Estás seguro de que quieres eliminar este archivo?"
        confirmText="Eliminar"
        variant="danger"
        alertMessage="El archivo se eliminará permanentemente y no se puede recuperar."
        alertVariant="warning"
      />

      <ConfirmModal
        show={!!markingProject}
        onHide={() => setMarkingProject(null)}
        onConfirm={confirmToggleMark}
        title={`${markingProject?.marked ? 'Desmarcar' : 'Marcar'} Proyecto`}
        message={`¿Estás seguro de que quieres ${markingProject?.marked ? 'desmarcar' : 'marcar'} el proyecto "${markingProject?.name}"?`}
        confirmText={markingProject?.marked ? 'Desmarcar' : 'Marcar'}
        variant={markingProject?.marked ? 'warning' : 'success'}
      />
    </>
  );
};