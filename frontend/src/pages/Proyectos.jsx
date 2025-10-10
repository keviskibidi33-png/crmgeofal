import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button, Badge, Row, Col, Card, Container, Tabs, Tab, Toast, ToastContainer } from 'react-bootstrap';
import { FiPlus, FiEdit, FiTrash2, FiHome, FiMapPin, FiCalendar, FiUser, FiCheckCircle, FiClock, FiX, FiRefreshCw, FiFolder, FiMessageCircle, FiCheck, FiSettings, FiEye, FiUsers, FiDownload, FiAlertTriangle, FiUpload, FiFileText, FiSave, FiMessageSquare } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import ModalForm from '../components/common/ModalForm';
import StatsCard from '../components/common/StatsCard';
import ConfirmModal from '../components/common/ConfirmModal';
import { listProjects, createProject, updateProject, deleteProject, getProjectStats, updateProjectStatus, updateProjectQueries, updateProjectMark } from '../services/projects';
import { listProjectAttachments, uploadAttachment, deleteAttachment, downloadFile } from '../services/attachments';
import { listUsers } from '../services/users';
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
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);
  const [deletingFile, setDeletingFile] = useState(null);
  const [markingProject, setMarkingProject] = useState(null);
  const [showQueriesModal, setShowQueriesModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showViewOnlyModal, setShowViewOnlyModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  
  // Estados para archivos adjuntos
  const [attachments, setAttachments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [editingData, setEditingData] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');
  
  // Estados para buscadores de usuarios
  const [vendedorSearch, setVendedorSearch] = useState('');
  const [laboratorioSearch, setLaboratorioSearch] = useState('');
  const [showVendedorDropdown, setShowVendedorDropdown] = useState(false);
  const [showLaboratorioDropdown, setShowLaboratorioDropdown] = useState(false);
  const [newQuery, setNewQuery] = useState('');
  
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
  
  // Obtener parámetros de URL para abrir proyecto específico
  const urlParams = new URLSearchParams(location.search);
  const viewProjectId = urlParams.get('view');
  
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

  // Cargar usuarios para los dropdowns
  const { data: usersData, isLoading: usersLoading } = useQuery(
    'users',
    () => listUsers(),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      staleTime: 300000, // 5 minutos
      cacheTime: 600000, // 10 minutos
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

  // Efecto para abrir proyecto específico desde URL
  useEffect(() => {
    if (viewProjectId && data?.data) {
      const project = data.data.find(p => p.id == viewProjectId);
      if (project) {
        handleViewProject(project);
        // Limpiar la URL después de abrir el modal
        navigate('/proyectos', { replace: true });
      }
    }
  }, [viewProjectId, data?.data]);

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

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.position-relative')) {
        setShowVendedorDropdown(false);
        setShowLaboratorioDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  // Funciones para manejo de usuarios
  const handleVendedorSelect = (user) => {
    setEditingData({...editingData, vendedor_id: user.id});
    setVendedorSearch(`${user.name} ${user.apellido}`);
    setShowVendedorDropdown(false);
    
    // Enviar notificación al vendedor asignado
    if (user.id && selectedProject) {
      sendAssignmentNotification(user.id, 'vendedor', selectedProject);
    }
  };

  const handleLaboratorioSelect = (user) => {
    setEditingData({...editingData, laboratorio_id: user.id});
    setLaboratorioSearch(`${user.name} ${user.apellido}`);
    setShowLaboratorioDropdown(false);
    
    // Enviar notificación al responsable de laboratorio asignado
    if (user.id && selectedProject) {
      sendAssignmentNotification(user.id, 'laboratorio', selectedProject);
    }
  };

  const sendAssignmentNotification = async (userId, role, project) => {
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:4000';
      const baseUrl = apiUrl.replace(/\/api$/, '');
      const token = localStorage.getItem('token');
      
      // Crear fecha y hora formateada
      const now = new Date();
      const fechaHora = now.toLocaleString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      
      const roleText = role === 'vendedor' ? 'vendedor comercial responsable' : 'usuario de laboratorio responsable';
      
      const notificationData = {
        user_id: userId,
        type: 'project_assignment',
        title: `🎯 Proyecto Asignado - ${project.name}`,
        message: `Se te ha asignado el proyecto "${project.name}" como ${roleText}.\n\n📅 Fecha y hora: ${fechaHora}\n🏢 Empresa: ${project.company_name || 'No especificada'}\n📍 Ubicación: ${project.location || 'No especificada'}\n📞 Contacto: ${project.contact_name || 'No especificado'}`,
        project_id: project.id,
        priority: 'high',
        metadata: {
          assignment_date: now.toISOString(),
          role: role,
          project_name: project.name,
          company_name: project.company_name
        }
      };

      console.log('📤 Enviando notificación:', notificationData);

      const response = await fetch(`${baseUrl}/api/notifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Notificación enviada exitosamente:', result);
        showNotification(`✅ Notificación enviada al ${roleText} - ${fechaHora}`, 'success');
      } else {
        const errorText = await response.text();
        console.warn('⚠️ No se pudo enviar la notificación:', response.status, errorText);
        showNotification(`⚠️ Error enviando notificación al ${roleText}`, 'warning');
      }
    } catch (error) {
      console.error('❌ Error enviando notificación:', error);
      showNotification(`❌ Error enviando notificación al ${role === 'vendedor' ? 'vendedor comercial' : 'usuario de laboratorio'}`, 'danger');
    }
  };

  // Filtrar usuarios por búsqueda
  const getFilteredVendedores = () => {
    if (!usersData?.data) return [];
    return usersData.data.filter(user => 
      user.role === 'vendedor_comercial' &&
      (vendedorSearch === '' || 
       `${user.name} ${user.apellido}`.toLowerCase().includes(vendedorSearch.toLowerCase()) ||
       user.email?.toLowerCase().includes(vendedorSearch.toLowerCase()))
    );
  };

  const getFilteredLaboratorio = () => {
    if (!usersData?.data) return [];
    return usersData.data.filter(user => 
      user.role === 'usuario_laboratorio' &&
      (laboratorioSearch === '' || 
       `${user.name} ${user.apellido}`.toLowerCase().includes(laboratorioSearch.toLowerCase()) ||
       user.email?.toLowerCase().includes(laboratorioSearch.toLowerCase()))
    );
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

  // Función para abrir modal de solo lectura (Ver Proyecto)
  const handleViewOnlyProject = (project) => {
    setSelectedProject(project);
    setShowViewOnlyModal(true);
  };

  // Función para abrir modal de gestión completa
  const handleViewProject = (project) => {
    console.log('🔍 handleViewProject - Project recibido:', project);
    console.log('🔍 handleViewProject - Project.id:', project?.id);
    console.log('🔍 handleViewProject - Type of project.id:', typeof project?.id);
    console.log('🔍 handleViewProject - Project.queries:', project?.queries);
    console.log('🔍 handleViewProject - Project.queries_history:', project?.queries_history);
    
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
      subcategory_name: project.subcategory_name || '',
      // Incluir IDs de usuarios asignados
      vendedor_id: project.vendedor_id || '',
      laboratorio_id: project.laboratorio_id || '',
      // Inicializar historial de consultas
      queries_history: (() => {
        try {
          console.log('🔍 Parseando queries_history - project.queries_history:', project.queries_history);
          console.log('🔍 Parseando queries_history - project.queries:', project.queries);
          
          // Si project.queries_history existe y es un array, usarlo
          if (project.queries_history && Array.isArray(project.queries_history)) {
            console.log('✅ Usando project.queries_history como array:', project.queries_history);
            return project.queries_history;
          }
          
          // Si project.queries es un JSON string, parsearlo
          if (project.queries && typeof project.queries === 'string') {
            try {
              const parsed = JSON.parse(project.queries);
              console.log('✅ Parseado project.queries como JSON:', parsed);
              if (Array.isArray(parsed)) {
                return parsed;
              }
            } catch (jsonError) {
              // Si no es JSON válido, tratar como texto plano y crear un historial
              console.log('⚠️ project.queries no es JSON válido, tratando como texto plano');
              if (project.queries.trim()) {
                // Crear un historial con el texto existente
                const historyEntry = {
                  message: project.queries.trim(),
                  user_name: 'Usuario Anterior',
                  created_at: new Date().toISOString()
                };
                console.log('✅ Creado historial desde texto plano:', historyEntry);
                return [historyEntry];
              }
            }
          }
          
          console.log('⚠️ No se encontró queries_history válido, retornando array vacío');
          return [];
        } catch (e) {
          console.warn('❌ Error parseando queries_history:', e);
          return [];
        }
      })()
    };
    
    console.log('🔍 handleViewProject - editingData inicializado:', initialEditingData);
    setEditingData(initialEditingData);
    
    // Inicializar campos de búsqueda con los nombres de usuarios asignados
    if (project.vendedor_name) {
      setVendedorSearch(project.vendedor_name);
    } else {
      setVendedorSearch('');
    }
    
    if (project.laboratorio_name) {
      setLaboratorioSearch(project.laboratorio_name);
    } else {
      setLaboratorioSearch('');
    }
    
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
      width: '180px',
      className: 'd-none d-lg-table-cell',
      render: (value, row) => {
        // Determinar servicio activo y su estado
        if (row.requiere_laboratorio) {
          const estadoLabMap = {
            'no_requerido': 'N/A',
            'pendiente': 'Pendiente',
            'en_proceso': 'En Proceso',
            'completado': 'Completado'
          };
          const estadoLab = estadoLabMap[row.laboratorio_status] || 'N/A';
          return (
            <div className="d-flex flex-column gap-1">
              <Badge bg="info" size="sm" className="px-2">
                🔬 Laboratorio
              </Badge>
              <span className="small text-muted">{estadoLab}</span>
            </div>
          );
        }
        
        if (row.requiere_ingenieria) {
          const estadoIngMap = {
            'no_requerido': 'N/A',
            'pendiente': 'Pendiente',
            'en_proceso': 'En Proceso',
            'completado': 'Completado'
          };
          const estadoIng = estadoIngMap[row.ingenieria_status] || 'N/A';
          return (
            <div className="d-flex flex-column gap-1">
              <Badge bg="primary" size="sm" className="px-2">
                ⚙️ Ingeniería
              </Badge>
              <span className="small text-muted">{estadoIng}</span>
            </div>
          );
        }
        
        if (row.requiere_consultoria) {
          return (
            <Badge bg="success" size="sm" className="px-2">
              💼 Consultoría
            </Badge>
          );
        }
        
        return (
          <Badge bg="secondary" size="sm" className="px-1">
            N/A
          </Badge>
        );
      }
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
      options: usersData?.data?.filter(user => 
        user.role === 'vendedor_comercial'
      ).map(user => ({
        value: user.id,
        label: `${user.name} ${user.apellido}`
      })) || []
    },
    {
      name: 'laboratorio_id',
      label: 'Responsable de Laboratorio',
      type: 'select',
      options: usersData?.data?.filter(user => 
        user.role === 'usuario_laboratorio'
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
                { 
                  label: 'Ver', 
                  icon: FiEye, 
                  onClick: handleViewOnlyProject, 
                  variant: 'primary',
                  style: { backgroundColor: '#f84616', borderColor: '#f84616' }
                },
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

      {/* Modal Rediseñado para Gestionar Proyecto */}
      <ModalForm
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        title={`📋 Gestionar Proyecto - ${selectedProject?.name || ''}`}
        data={editingData}
        size="xl"
        fields={[
          {
            name: 'project_management',
            label: 'Gestión del Proyecto',
            type: 'custom',
            render: (project) => (
              <div className="project-management-modal">
                  <style>{`
                  .project-management-modal {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                  }
                  .project-header {
                    background: #f84616;
                    color: white;
                    padding: 1.5rem;
                    border-radius: 12px;
                    margin-bottom: 2rem;
                    box-shadow: 0 8px 25px rgba(248, 70, 22, 0.3);
                  }
                  .project-header h4 {
                    margin: 0;
                    font-weight: 600;
                    font-size: 1.5rem;
                  }
                  .project-header .project-id {
                    background: rgba(255, 255, 255, 0.2);
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    margin-top: 0.5rem;
                    display: inline-block;
                  }
                  .info-card {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    margin-bottom: 1.5rem;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
                    border: 1px solid #e9ecef;
                  }
                  .info-card h6 {
                    color: #495057;
                    font-weight: 600;
                      margin-bottom: 1rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 2px solid #f8f9fa;
                  }
                  .info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1rem;
                  }
                  .info-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                    }
                    .info-item label {
                      font-size: 0.75rem;
                      font-weight: 600;
                    color: #6c757d;
                      text-transform: uppercase;
                      letter-spacing: 0.5px;
                  }
                  .info-item .value {
                    font-weight: 500;
                    color: #212529;
                    font-size: 0.95rem;
                  }
                  .priority-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-weight: 600;
                    font-size: 0.85rem;
                  }
                  .priority-urgent { background: #fee2e2; color: #dc2626; }
                  .priority-high { background: #fef3c7; color: #d97706; }
                  .priority-normal { background: #d1fae5; color: #059669; }
                  .priority-low { background: #e0e7ff; color: #3730a3; }
                  .status-badge {
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-weight: 600;
                    font-size: 0.85rem;
                  }
                  .status-pendiente { background: #fef3c7; color: #d97706; }
                  .status-activo { background: #d1fae5; color: #059669; }
                  .status-completado { background: #dbeafe; color: #2563eb; }
                  .status-cancelado { background: #fee2e2; color: #dc2626; }
                  .form-control, .form-select {
                    border-radius: 8px;
                    border: 1px solid #d1d5db;
                    padding: 0.75rem;
                    font-size: 0.9rem;
                    transition: all 0.2s ease;
                  }
                  .form-control:focus, .form-select:focus {
                    border-color: #f84616;
                    box-shadow: 0 0 0 3px rgba(248, 70, 22, 0.1);
                  }
                  .btn-primary {
                    background: #f84616;
                    border: none;
                    border-radius: 8px;
                    padding: 0.75rem 2rem;
                    font-weight: 600;
                    transition: all 0.2s ease;
                  }
                  .btn-primary:hover {
                    background: #e03d14;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(248, 70, 22, 0.3);
                  }
                  .btn-secondary {
                    border-radius: 8px;
                    padding: 0.75rem 2rem;
                    font-weight: 600;
                  }
                  .file-upload-area {
                    border: 2px dashed #d1d5db;
                    border-radius: 12px;
                    padding: 2rem;
                    text-align: center;
                    background: #f9fafb;
                    transition: all 0.2s ease;
                    cursor: pointer;
                  }
                  .file-upload-area:hover {
                    border-color: #f84616;
                    background: #fff5f2;
                  }
                  .file-item {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 1rem;
                    margin-bottom: 0.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                  }
                  .file-item:hover {
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    }
                  `}</style>
                
                <div className="project-header">
                  <h4>📋 {project.name}</h4>
                  <div className="project-id">ID: #{project.id}</div>
                </div>

                  <div className="row g-4">
                    {/* Información Principal */}
                    <div className="col-lg-8">
                    <div className="info-card">
                      <h6>📊 Información del Proyecto</h6>
                      <div className="info-grid">
                              <div className="info-item">
                          <label>Ubicación</label>
                          <div className="value">{project.location || 'No especificada'}</div>
                              </div>
                              <div className="info-item">
                          <label>Estado Actual</label>
                          <div>
                            <span className={`status-badge status-${project.status || 'pendiente'}`}>
                              {project.status === 'pendiente' ? 'Pendiente' :
                               project.status === 'activo' ? 'Activo' :
                               project.status === 'completado' ? 'Completado' :
                               project.status === 'cancelado' ? 'Cancelado' : project.status}
                            </span>
                              </div>
                            </div>
                              <div className="info-item">
                          <label>Prioridad</label>
                                <div>
                            <span className={`priority-badge priority-${project.priority || 'normal'}`}>
                              {project.priority === 'urgent' ? '🔴 Urgente' :
                               project.priority === 'high' ? '🟠 Alta' :
                               project.priority === 'normal' ? '🟢 Normal' :
                               project.priority === 'low' ? '🔵 Baja' : '🟢 Normal'}
                            </span>
                                </div>
                              </div>
                            </div>
                    </div>

                    <div className="info-card">
                      <h6>🏢 Información de la Empresa</h6>
                      <div className="info-grid">
                              <div className="info-item">
                          <label>Empresa</label>
                          <div className="value fw-bold">{project.company_name || 'Sin empresa'}</div>
                                </div>
                        <div className="info-item">
                          <label>RUC</label>
                          <div className="value">{project.company_ruc || 'Sin RUC'}</div>
                              </div>
                        <div className="info-item">
                          <label>Contacto</label>
                          <div className="value fw-bold">{project.contact_name || 'Sin contacto'}</div>
                            </div>
                        <div className="info-item">
                          <label>Teléfono</label>
                          <div className="value">{project.contact_phone || 'Sin teléfono'}</div>
                          </div>
                        <div className="info-item">
                          <label>Email</label>
                          <div className="value">{project.contact_email || 'Sin email'}</div>
                        </div>
                        <div className="info-item">
                          <label>Vendedor Asignado</label>
                          <div className="position-relative">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Buscar vendedor..."
                              value={vendedorSearch}
                              onChange={(e) => {
                                setVendedorSearch(e.target.value);
                                setShowVendedorDropdown(true);
                              }}
                              onFocus={() => setShowVendedorDropdown(true)}
                            />
                            {showVendedorDropdown && (
                              <div className="position-absolute w-100 bg-white border rounded shadow-lg" style={{zIndex: 1000, maxHeight: '200px', overflowY: 'auto'}}>
                                {getFilteredVendedores().length > 0 ? (
                                  getFilteredVendedores().map(user => (
                                    <div
                                      key={user.id}
                                      className="p-2 border-bottom cursor-pointer hover-bg-light"
                                      onClick={() => handleVendedorSelect(user)}
                                      style={{cursor: 'pointer'}}
                                    >
                                      <div className="fw-bold">{user.name} {user.apellido}</div>
                                      <div className="small text-muted">
                                        📧 {user.email}
                                        {user.phone && <span> • 📞 {user.phone}</span>}
                      </div>
                                      <div className="small">
                                        <span className="badge bg-primary">
                                          Vendedor Comercial
                                        </span>
                    </div>
                        </div>
                                  ))
                                ) : (
                                  <div className="p-2 text-muted">No se encontraron vendedores</div>
                              )}
                            </div>
                            )}
                          </div>
                            </div>
                        <div className="info-item">
                          <label>Responsable Laboratorio</label>
                          <div className="position-relative">
                              <input 
                                type="text" 
                              className="form-control form-control-sm"
                              placeholder="Buscar responsable de laboratorio..."
                              value={laboratorioSearch}
                              onChange={(e) => {
                                setLaboratorioSearch(e.target.value);
                                setShowLaboratorioDropdown(true);
                              }}
                              onFocus={() => setShowLaboratorioDropdown(true)}
                            />
                            {showLaboratorioDropdown && (
                              <div className="position-absolute w-100 bg-white border rounded shadow-lg" style={{zIndex: 1000, maxHeight: '200px', overflowY: 'auto'}}>
                                {getFilteredLaboratorio().length > 0 ? (
                                  getFilteredLaboratorio().map(user => (
                                    <div
                                      key={user.id}
                                      className="p-2 border-bottom cursor-pointer hover-bg-light"
                                      onClick={() => handleLaboratorioSelect(user)}
                                      style={{cursor: 'pointer'}}
                                    >
                                      <div className="fw-bold">{user.name} {user.apellido}</div>
                                      <div className="small text-muted">
                                        📧 {user.email}
                                        {user.phone && <span> • 📞 {user.phone}</span>}
                            </div>
                                      <div className="small">
                                        <span className="badge bg-info">
                                          Usuario Laboratorio
                                        </span>
                            </div>
                            </div>
                                  ))
                                ) : (
                                  <div className="p-2 text-muted">No se encontraron responsables de laboratorio</div>
                                )}
                            </div>
                            )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  {/* Panel de Control */}
                  <div className="col-lg-4">
                    <div className="info-card">
                      <h6>⚙️ Configuración Rápida</h6>
                      <div className="d-grid gap-3">
                        <div>
                          <label className="form-label small fw-bold">Estado del Proyecto</label>
                            <select 
                              className="form-select" 
                            value={editingData.status || 'pendiente'} 
                              onChange={(e) => setEditingData({...editingData, status: e.target.value})}
                            >
                            <option value="pendiente">🟡 Pendiente</option>
                            <option value="activo">🟢 Activo</option>
                            <option value="en_proceso">🔵 En Proceso</option>
                            <option value="completado">✅ Completado</option>
                            <option value="pausado">⏸️ Pausado</option>
                            <option value="cancelado">❌ Cancelado</option>
                            </select>
                          </div>
                        
                        <div>
                          <label className="form-label small fw-bold">Prioridad</label>
                            <select 
                              className="form-select" 
                              value={editingData.priority || 'normal'} 
                              onChange={(e) => setEditingData({...editingData, priority: e.target.value})}
                            >
                            <option value="low">🔵 Baja</option>
                            <option value="normal">🟢 Normal</option>
                              <option value="high">🟠 Alta</option>
                              <option value="urgent">🔴 Urgente</option>
                            </select>
                          </div>

                        <div>
                          <label className="form-label small fw-bold">
                            Estado Laboratorio
                            {editingData.ingenieria_status && editingData.ingenieria_status !== 'no_requerido' && (
                              <span className="text-muted small ms-2">(Bloqueado - Ingeniería activa)</span>
                            )}
                          </label>
                            <select 
                              className="form-select" 
                              disabled={editingData.ingenieria_status && editingData.ingenieria_status !== 'no_requerido'}
                              value={editingData.laboratorio_status || 'no_requerido'} 
                              onChange={(e) => {
                                const newValue = e.target.value;
                                // Si se activa laboratorio (no es "no_requerido"), desactivar ingeniería
                                if (newValue !== 'no_requerido') {
                                  setEditingData({
                                    ...editingData, 
                                    laboratorio_status: newValue,
                                    ingenieria_status: 'no_requerido',
                                    requiere_laboratorio: true,
                                    requiere_ingenieria: false
                                  });
                                } else {
                                  setEditingData({
                                    ...editingData, 
                                    laboratorio_status: newValue,
                                    requiere_laboratorio: false
                                  });
                                }
                              }}
                            >
                              <option value="no_requerido">No Requerido</option>
                              <option value="pendiente">Pendiente</option>
                              <option value="en_proceso">En Proceso</option>
                              <option value="completado">Completado</option>
                            </select>
                          </div>

                        <div>
                          <label className="form-label small fw-bold">
                            Estado Ingeniería
                            {editingData.laboratorio_status && editingData.laboratorio_status !== 'no_requerido' && (
                              <span className="text-muted small ms-2">(Bloqueado - Laboratorio activo)</span>
                            )}
                          </label>
                            <select 
                              className="form-select" 
                              disabled={editingData.laboratorio_status && editingData.laboratorio_status !== 'no_requerido'}
                              value={editingData.ingenieria_status || 'no_requerido'} 
                              onChange={(e) => {
                                const newValue = e.target.value;
                                // Si se activa ingeniería (no es "no_requerido"), desactivar laboratorio
                                if (newValue !== 'no_requerido') {
                                  setEditingData({
                                    ...editingData, 
                                    ingenieria_status: newValue,
                                    laboratorio_status: 'no_requerido',
                                    requiere_ingenieria: true,
                                    requiere_laboratorio: false
                                  });
                                } else {
                                  setEditingData({
                                    ...editingData, 
                                    ingenieria_status: newValue,
                                    requiere_ingenieria: false
                                  });
                                }
                              }}
                            >
                              <option value="no_requerido">No Requerido</option>
                              <option value="pendiente">Pendiente</option>
                              <option value="en_proceso">En Proceso</option>
                              <option value="completado">Completado</option>
                            </select>
                        </div>
                      </div>
                    </div>

                    <div className="info-card">
                      <h6>📅 Fechas</h6>
                      <div className="d-grid gap-2">
                        <div className="d-flex align-items-center gap-2">
                          <FiCalendar className="text-muted" size={16} />
                          <div>
                            <div className="small text-muted">Creado</div>
                            <div className="fw-bold">{new Date(project.created_at).toLocaleDateString()}</div>
                        </div>
                          </div>
                        <div className="d-flex align-items-center gap-2">
                          <FiClock className="text-muted" size={16} />
                          <div>
                            <div className="small text-muted">Actualizado</div>
                            <div className="fw-bold">{new Date(project.updated_at).toLocaleDateString()}</div>
                          </div>
                          </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notas y Consultas */}
                <div className="row g-4 mt-2">
                            <div className="col-md-6">
                    <div className="info-card">
                      <h6>📝 Notas del Estado</h6>
                              <textarea 
                                className="form-control" 
                                rows="4"
                                value={editingData.status_notes || ''} 
                                onChange={(e) => setEditingData({...editingData, status_notes: e.target.value})}
                                placeholder="Agrega comentarios sobre el estado del proyecto..."
                              />
                    </div>
                            </div>
                            <div className="col-md-6">
                    <div className="info-card">
                      <h6>❓ Consultas del Cliente</h6>
                      
                      {/* Área de comentarios existentes */}
                      <div className="mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {editingData.queries_history && editingData.queries_history.length > 0 ? (
                          editingData.queries_history.map((comment, index) => {
                            // Color consistente por usuario
                            const getUserColor = (userName) => {
                              const colors = ['#3b82f6', '#ef4444']; // Azul y Rojo
                              const hash = userName.split('').reduce((a, b) => {
                                a = ((a << 5) - a) + b.charCodeAt(0);
                                return a & a;
                              }, 0);
                              return colors[Math.abs(hash) % colors.length];
                            };
                            
                            const color = getUserColor(comment.user_name || 'Usuario');
                            
                            return (
                              <div key={index} className="mb-2 p-2 bg-light rounded border-start border-3" style={{ borderLeftColor: color }}>
                                <div className="d-flex justify-content-between align-items-start mb-1">
                                  <small className="fw-bold" style={{ color: color }}>
                                    👤 {comment.user_name || 'Usuario'}
                                  </small>
                                  <small className="text-muted">
                                    {new Date(comment.created_at).toLocaleString('es-ES', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </small>
                                </div>
                                <div className="small">{comment.message}</div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center text-muted py-3">
                            <small>No hay consultas registradas</small>
                          </div>
                        )}
                      </div>
                      
                      {/* Área para agregar nueva consulta */}
                      <div className="border-top pt-3">
                        <label className="form-label small fw-bold">Agregar consulta:</label>
                        <textarea 
                          className="form-control" 
                          rows="3"
                          value={newQuery} 
                          onChange={(e) => setNewQuery(e.target.value)}
                          placeholder="Escribe una nueva consulta o respuesta..."
                        />
                        <div className="d-flex justify-content-end mt-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              if (newQuery && newQuery.trim()) {
                                const newComment = {
                                  message: newQuery.trim(),
                                  user_name: user?.name || 'Usuario',
                                  created_at: new Date().toISOString()
                                };
                                
                                const updatedHistory = [
                                  ...(editingData.queries_history || []),
                                  newComment
                                ];
                                
                                setEditingData({
                                  ...editingData,
                                  queries_history: updatedHistory,
                                  queries: JSON.stringify(updatedHistory) // Enviar como JSON string al backend
                                });
                                
                                setNewQuery(''); // Limpiar el campo
                              }
                            }}
                            disabled={!newQuery || !newQuery.trim()}
                          >
                            <FiMessageSquare className="me-1" />
                            Agregar
                          </Button>
                        </div>
                      </div>
                    </div>
                          </div>
                        </div>

                {/* Archivos Adjuntos */}
                <div className="info-card mt-3">
                  <h6>📎 Archivos Adjuntos</h6>
                  
                  {/* Subir Archivo */}
                  <div className="file-upload-area mb-3" onClick={() => document.getElementById('fileInput').click()}>
                    <FiUpload size={32} className="text-muted mb-2" />
                    <div className="fw-bold text-muted">Hacer clic para subir archivo</div>
                    <div className="small text-muted">PDF, Word, Excel, PowerPoint, Imágenes (máx. 10MB)</div>
                    <input 
                      type="file" 
                      id="fileInput"
                      style={{ display: 'none' }}
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt"
                    />
                      </div>
                  
                  {selectedFile && (
                    <div className="alert alert-info d-flex align-items-center mb-3">
                      <FiFileText className="me-2" />
                      <div>
                        <strong>{selectedFile.name}</strong>
                        <br />
                        <small>📏 {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</small>
                    </div>
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={handleFileUpload}
                        disabled={uploadingFile}
                        className="ms-auto"
                      >
                        <FiUpload className="me-1" />
                        {uploadingFile ? 'Subiendo...' : 'Subir'}
                      </Button>
                    </div>
                  )}
                  
                  {/* Lista de Archivos */}
                  {attachments.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <FiFolder size={48} className="mb-2 opacity-50" />
                      <div>No hay archivos adjuntos</div>
                      <small>Sube cotizaciones, documentos técnicos, planos, etc.</small>
                    </div>
                  ) : (
                    <div className="row g-2">
                      {attachments.map((attachment) => (
                        <div key={attachment.id} className="col-12">
                          <div className="file-item">
                            <div className="d-flex align-items-center">
                              <FiFileText className="text-primary me-3" size={20} />
                              <div>
                                <div className="fw-bold">{attachment.original_name}</div>
                                <div className="small text-muted">
                                  📏 {attachment.file_size ? `${(attachment.file_size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                                  <span className="mx-2">•</span>
                                  📅 {new Date(attachment.created_at).toLocaleDateString()}
                                  <span className="mx-2">•</span>
                                  👤 {attachment.uploaded_by_name || 'Usuario'}
                                </div>
                                {attachment.description && (
                                  <div className="small text-muted mt-1">{attachment.description}</div>
                                )}
                              </div>
                            </div>
                            <div className="d-flex gap-2">
                        <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => handleFileDownload(attachment)}
                              >
                                <FiDownload size={14} />
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
                      ))}
                    </div>
                  )}
                </div>

                {/* Botones de Acción */}
                <div className="d-flex justify-content-between align-items-center gap-3 mt-4 pt-3 border-top">
                  <div>
                    {selectedProject?.quote_id && (
                      <Button
                        variant="outline-info"
                        onClick={() => navigate(`/cotizaciones?view=${selectedProject.quote_id}`)}
                        className="px-3"
                      >
                        <FiFileText className="me-2" />
                        📄 Ver Cotización Relacionada
                      </Button>
                    )}
                  </div>
                  <div className="d-flex gap-3">
                    <Button 
                      variant="secondary" 
                          onClick={() => setShowViewModal(false)}
                      className="px-4"
                        >
                      <FiX className="me-2" />
                          Cancelar
                        </Button>
                        <Button 
                          variant="primary" 
                          size="lg"
                          onClick={() => {
                            const projectId = selectedProject?.id;
                            
                            if (!projectId) {
                              showNotification('❌ Error: No se encontró el ID del proyecto', 'danger');
                              return;
                            }
                            
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
            )
          }
        ]}
        onSubmit={() => setShowViewModal(false)}
        submitText="Cerrar"
      />

      {/* Modal de Ver Proyecto (Solo Lectura) */}
      <ModalForm
        show={showViewOnlyModal}
        onHide={() => setShowViewOnlyModal(false)}
        title={`👁️ Ver Proyecto - ${selectedProject?.name || ''}`}
        data={selectedProject}
        size="lg"
        fields={[
          {
            name: 'project_view',
            label: 'Información del Proyecto',
            type: 'custom',
            render: (project) => (
              <div className="project-view-modal">
                <style>{`
                  .project-view-modal {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                  }
                  .project-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 1.5rem;
                    border-radius: 12px;
                    margin-bottom: 2rem;
                    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
                  }
                  .project-header h4 {
                    margin: 0;
                    font-weight: 600;
                    font-size: 1.5rem;
                  }
                  .project-header .project-id {
                    background: rgba(255, 255, 255, 0.2);
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    margin-top: 0.5rem;
                    display: inline-block;
                  }
                  .info-card {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    margin-bottom: 1.5rem;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
                    border: 1px solid #e9ecef;
                  }
                  .info-card h6 {
                    color: #495057;
                    font-weight: 600;
                    margin-bottom: 1rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 2px solid #f8f9fa;
                  }
                  .info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1rem;
                  }
                  .info-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                  }
                  .info-item label {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #6c757d;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                  }
                  .info-item .value {
                    font-weight: 500;
                    color: #212529;
                    font-size: 0.95rem;
                  }
                  .priority-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-weight: 600;
                    font-size: 0.85rem;
                  }
                  .priority-urgent { background: #fee2e2; color: #dc2626; }
                  .priority-high { background: #fef3c7; color: #d97706; }
                  .priority-normal { background: #d1fae5; color: #059669; }
                  .priority-low { background: #e0e7ff; color: #3730a3; }
                  .status-badge {
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-weight: 600;
                    font-size: 0.85rem;
                  }
                  .status-pendiente { background: #fef3c7; color: #d97706; }
                  .status-activo { background: #d1fae5; color: #059669; }
                  .status-completado { background: #dbeafe; color: #2563eb; }
                  .status-cancelado { background: #fee2e2; color: #dc2626; }
                `}</style>
                
                <div className="project-header">
                  <h4>👁️ {project.name}</h4>
                  <div className="project-id">ID: #{project.id}</div>
                </div>

                  <div className="row g-4">
                  {/* Información Principal */}
                  <div className="col-lg-8">
                    <div className="info-card">
                      <h6>📊 Información del Proyecto</h6>
                      <div className="info-grid">
                        <div className="info-item">
                          <label>Ubicación</label>
                          <div className="value">{project.location || 'No especificada'}</div>
                        </div>
                        <div className="info-item">
                          <label>Estado Actual</label>
                          <div>
                            <span className={`status-badge status-${project.status || 'pendiente'}`}>
                              {project.status === 'pendiente' ? 'Pendiente' :
                               project.status === 'activo' ? 'Activo' :
                               project.status === 'completado' ? 'Completado' :
                               project.status === 'cancelado' ? 'Cancelado' : project.status}
                            </span>
                            </div>
                          </div>
                        <div className="info-item">
                          <label>Prioridad</label>
                              <div>
                            <span className={`priority-badge priority-${project.priority || 'normal'}`}>
                              {project.priority === 'urgent' ? '🔴 Urgente' :
                               project.priority === 'high' ? '🟠 Alta' :
                               project.priority === 'normal' ? '🟢 Normal' :
                               project.priority === 'low' ? '🔵 Baja' : '🟢 Normal'}
                            </span>
                              </div>
                            </div>
                      </div>
                    </div>

                    <div className="info-card">
                      <h6>🏢 Información de la Empresa</h6>
                      <div className="info-grid">
                        <div className="info-item">
                          <label>Empresa</label>
                          <div className="value fw-bold">{project.company_name || 'Sin empresa'}</div>
                          </div>
                        <div className="info-item">
                          <label>RUC</label>
                          <div className="value">{project.company_ruc || 'Sin RUC'}</div>
                        </div>
                        <div className="info-item">
                          <label>Contacto</label>
                          <div className="value fw-bold">{project.contact_name || 'Sin contacto'}</div>
                        </div>
                        <div className="info-item">
                          <label>Teléfono</label>
                          <div className="value">{project.contact_phone || 'Sin teléfono'}</div>
                        </div>
                        <div className="info-item">
                          <label>Email</label>
                          <div className="value">{project.contact_email || 'Sin email'}</div>
                        </div>
                        <div className="info-item">
                          <label>Vendedor Asignado</label>
                          <div className="value fw-bold">{project.vendedor_name || 'Sin asignar'}</div>
                        </div>
                        <div className="info-item">
                          <label>Responsable Laboratorio</label>
                          <div className="value fw-bold">{project.laboratorio_name || 'Sin asignar'}</div>
                        </div>
                      </div>
                      </div>
                    </div>

                  {/* Información Adicional */}
                  <div className="col-lg-4">
                    <div className="info-card">
                      <h6>📅 Detalles del Proyecto</h6>
                      <div className="info-item mb-3">
                        <label>Fecha de Creación</label>
                        <div className="value">
                          {project.created_at ? new Date(project.created_at).toLocaleDateString('es-ES') : 'No disponible'}
                          </div>
                        </div>
                      <div className="info-item mb-3">
                        <label>Última Actualización</label>
                        <div className="value">
                          {project.updated_at ? new Date(project.updated_at).toLocaleDateString('es-ES') : 'No disponible'}
                            </div>
                                        </div>
                    {project.queries && (
                      <div className="info-item">
                        <label>Consultas/Notas</label>
                        <div className="value" style={{ fontSize: '0.9rem', lineHeight: '1.4', maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '5px', padding: '10px' }}>
                          {(() => {
                            try {
                              // Intentar parsear como JSON (historial de consultas)
                              const history = JSON.parse(project.queries);
                              if (Array.isArray(history) && history.length > 0) {
                return history.map((entry, index) => {
                  // Color consistente por usuario
                  const getUserColor = (userName) => {
                    const colors = ['#3b82f6', '#ef4444']; // Azul y Rojo
                    const hash = userName.split('').reduce((a, b) => {
                      a = ((a << 5) - a) + b.charCodeAt(0);
                      return a & a;
                    }, 0);
                    return colors[Math.abs(hash) % colors.length];
                  };
                  
                  const color = getUserColor(entry.user_name || 'Usuario Desconocido');
                  
                  return (
                    <div key={index} className="mb-2 pb-2" style={{ borderBottom: index < history.length - 1 ? '1px dotted #eee' : 'none' }}>
                      <div className="fw-bold d-flex align-items-center">
                        <div 
                          className="me-2" 
                          style={{ 
                            width: '4px', 
                            height: '20px', 
                            backgroundColor: color,
                            borderRadius: '2px'
                          }}
                        />
                        <FiMessageSquare className="me-1" style={{ color: color }} />
                        👤 {entry.user_name || 'Usuario Desconocido'}
                        <span className="ms-auto text-muted small" style={{ fontSize: '0.75rem' }}>
                          {new Date(entry.created_at).toLocaleString('es-ES', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <p className="mb-0 ms-3" style={{ fontSize: '0.85rem' }}>{entry.message}</p>
                    </div>
                  );
                });
                              } else {
                                return <p className="text-muted">No hay consultas registradas.</p>;
                              }
                            } catch (e) {
                              // Fallback si queries no es JSON válido (texto plano)
                              return <p className="text-muted">{project.queries}</p>;
                            }
                          })()}
                        </div>
                      </div>
                    )}
                                        </div>
                                      </div>
                </div>

                {/* Archivos Adjuntos */}
                <div className="info-card">
                  <h6>📎 Archivos Adjuntos</h6>
                  
                  {attachments.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <FiFolder size={48} className="mb-2 opacity-50" />
                      <div>No hay archivos adjuntos</div>
                      <small>Este proyecto no tiene archivos adjuntos</small>
                    </div>
                  ) : (
                    <div className="row g-2">
                      {attachments.map((attachment) => (
                        <div key={attachment.id} className="col-12">
                          <div className="file-item">
                            <div className="d-flex align-items-center">
                              <FiFileText className="text-primary me-3" size={20} />
                              <div>
                                <div className="fw-bold">{attachment.original_name}</div>
                                <div className="small text-muted">
                                  📏 {attachment.file_size ? `${(attachment.file_size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                                  <span className="mx-2">•</span>
                                  📅 {new Date(attachment.created_at).toLocaleDateString()}
                                  <span className="mx-2">•</span>
                                  👤 {attachment.uploaded_by_name || 'Usuario'}
                                </div>
                                {attachment.description && (
                                  <div className="small text-muted mt-1">{attachment.description}</div>
                                )}
                              </div>
                            </div>
                            <div className="d-flex gap-2">
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => handleFileDownload(attachment)}
                              >
                                <FiDownload size={14} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Botones de Acción */}
                <div className="d-flex justify-content-center gap-3 mt-4 pt-3 border-top">
                                        <Button 
                    variant="primary"
                    onClick={() => {
                      setShowViewOnlyModal(false);
                      handleViewProject(project);
                    }}
                    className="px-4"
                    style={{ backgroundColor: '#f84616', borderColor: '#f84616' }}
                  >
                    <FiSettings className="me-2" />
                    ⚙️ Gestionar Proyecto
                                        </Button>
                  
                  {project.quote_id && (
                    <Button
                      variant="primary"
                      onClick={() => {
                        setShowViewOnlyModal(false);
                        navigate(`/cotizaciones?view=${project.quote_id}`);
                      }}
                      className="px-4"
                      style={{ backgroundColor: '#f84616', borderColor: '#f84616' }}
                    >
                      <FiFileText className="me-2" />
                      📄 Ver Evidencias
                    </Button>
                  )}
                        </div>
                      </div>
            )
          }
        ]}
        onSubmit={() => setShowViewOnlyModal(false)}
        submitText="Cerrar"
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