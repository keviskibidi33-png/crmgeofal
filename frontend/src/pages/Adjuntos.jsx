import React, { useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Container, Row, Col, Card, Badge, Button, Form, Alert, Spinner, ProgressBar } from 'react-bootstrap';
import { FiUpload, FiDownload, FiTrash2, FiFile, FiFolder, FiSearch, FiFilter, FiRefreshCw, FiAlertTriangle, FiCheckCircle, FiClock, FiUsers, FiEdit } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import StatsCard from '../components/common/StatsCard';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { listProjectAttachments, getAllAttachments, uploadAttachment, updateAttachment, deleteAttachment, downloadFile } from '../services/attachments';
import { listProjects } from '../services/projects';
import { listCategories, listSubcategories } from '../services/categories';

const emptyForm = { 
  project_id: '', 
  description: '', 
  file: null, 
  category_id: '', 
  subcategory_id: '',
  requiere_laboratorio: false,
  requiere_ingenieria: false,
  requiere_consultoria: false,
  requiere_capacitacion: false,
  requiere_auditoria: false
};

export default function Adjuntos() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedFileType, setSelectedFileType] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success', show: false });
  const location = useLocation();

  // State for modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploadForm, setUploadForm] = useState(emptyForm);
  const [editingAttachment, setEditingAttachment] = useState(null);
  const [deletingAttachment, setDeletingAttachment] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (location.state?.search) {
      setSearchTerm(location.state.search);
    }
  }, [location.state]);

  // Obtener todos los adjuntos de todos los proyectos
  const { data, isLoading, refetch } = useQuery(
    ['allAttachments', currentPage, limit, searchTerm, selectedProject, selectedFileType],
    () => getAllAttachments({ 
      page: currentPage, 
      limit, 
      search: searchTerm,
      project_id: selectedProject,
      file_type: selectedFileType
    }),
    { 
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    }
  );

  const { data: projectsData } = useQuery('projectsList', () => listProjects({ page: 1, limit: 500 }), { staleTime: Infinity });
  const projects = useMemo(() => projectsData?.data || [], [projectsData]);

  // Obtener todas las categorías disponibles
  const { data: categoriesData, refetch: refetchCategories } = useQuery('categoriesList', listCategories, { 
    staleTime: 30000, // 30 segundos
    refetchOnWindowFocus: true 
  });
  const categories = useMemo(() => categoriesData || [], [categoriesData]);

  // Obtener todas las subcategorías disponibles
  const { data: subcategoriesData, refetch: refetchSubcategories } = useQuery('subcategoriesList', listSubcategories, { 
    staleTime: 30000, // 30 segundos
    refetchOnWindowFocus: true 
  });
  const subcategories = useMemo(() => subcategoriesData || [], [subcategoriesData]);

  // Obtener el proyecto seleccionado para sus categorías
  const selectedProjectData = useMemo(() => {
    return projects.find(p => p.id === parseInt(uploadForm.project_id));
  }, [projects, uploadForm.project_id]);

  // Obtener el proyecto del archivo que se está editando
  const selectedProjectDataForEdit = useMemo(() => {
    if (!editingAttachment) return null;
    return projects.find(p => p.id === parseInt(editingAttachment.project_id));
  }, [projects, editingAttachment]);

  // Función helper para actualizar categorías y subcategorías
  const refreshCategoriesAndSubcategories = () => {
    refetchCategories();
    refetchSubcategories();
  };

  // Actualizar categorías cuando se abra el modal
  useEffect(() => {
    if (showUploadModal || showEditModal) {
      refreshCategoriesAndSubcategories();
    }
  }, [showUploadModal, showEditModal, refetchCategories, refetchSubcategories]);

  const handleMutationSuccess = (message) => {
    setToast({ message, type: 'success', show: true });
    queryClient.invalidateQueries('allAttachments');
    setShowUploadModal(false);
    setShowEditModal(false);
    setUploadForm(emptyForm);
    setEditingAttachment(null);
    setDeletingAttachment(null);
    setUploadProgress(0);
  };

  const handleMutationError = (error, defaultMessage) => {
    setToast({ message: error?.message || defaultMessage, type: 'error', show: true });
    setUploadProgress(0);
  };

  const createMutation = useMutation(
    (formData) => uploadAttachment(uploadForm.project_id, formData),
    {
      onSuccess: () => handleMutationSuccess('Archivo subido correctamente.'),
      onError: (err) => handleMutationError(err, 'Error al subir archivo.'),
    }
  );

  const updateMutation = useMutation(
    ({ id, formData }) => updateAttachment(id, formData),
    {
      onSuccess: () => handleMutationSuccess('Archivo actualizado correctamente.'),
      onError: (err) => handleMutationError(err, 'Error al actualizar archivo.'),
    }
  );

  const deleteMutation = useMutation(deleteAttachment, {
    onSuccess: () => handleMutationSuccess('Adjunto eliminado correctamente.'),
    onError: (err) => handleMutationError(err, 'Error al eliminar adjunto.'),
  });

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.project_id) {
      setToast({ message: 'Debe seleccionar un proyecto y un archivo.', type: 'error', show: true });
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadForm.file);
    formData.append('description', uploadForm.description || '');
    if (uploadForm.category_id) formData.append('category_id', uploadForm.category_id);
    if (uploadForm.subcategory_id) formData.append('subcategory_id', uploadForm.subcategory_id);
    formData.append('requiere_laboratorio', uploadForm.requiere_laboratorio);
    formData.append('requiere_ingenieria', uploadForm.requiere_ingenieria);
    formData.append('requiere_consultoria', uploadForm.requiere_consultoria);
    formData.append('requiere_capacitacion', uploadForm.requiere_capacitacion);
    formData.append('requiere_auditoria', uploadForm.requiere_auditoria);
    
    createMutation.mutate(formData);
  };

  const handleEdit = (attachment) => {
    setEditingAttachment(attachment);
    setUploadForm({
      project_id: attachment.project_id,
      description: attachment.description || '',
      file: null,
      category_id: attachment.category_id || '',
      subcategory_id: attachment.subcategory_id || '',
      requiere_laboratorio: attachment.requiere_laboratorio || false,
      requiere_ingenieria: attachment.requiere_ingenieria || false,
      requiere_consultoria: attachment.requiere_consultoria || false,
      requiere_capacitacion: attachment.requiere_capacitacion || false,
      requiere_auditoria: attachment.requiere_auditoria || false
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingAttachment) return;

    const updateData = {
      description: uploadForm.description || '',
      category_id: uploadForm.category_id || null,
      subcategory_id: uploadForm.subcategory_id || null,
      requiere_laboratorio: uploadForm.requiere_laboratorio,
      requiere_ingenieria: uploadForm.requiere_ingenieria,
      requiere_consultoria: uploadForm.requiere_consultoria,
      requiere_capacitacion: uploadForm.requiere_capacitacion,
      requiere_auditoria: uploadForm.requiere_auditoria
    };

    console.log('🔄 handleEditSubmit - Editing attachment ID:', editingAttachment.id);
    console.log('🔄 handleEditSubmit - Upload form data:', uploadForm);
    console.log('🔄 handleEditSubmit - Update data:', updateData);

    // Siempre usar FormData para mantener consistencia
    const formData = new FormData();
    
    // Si hay un nuevo archivo, lo agregamos
    if (uploadForm.file) {
      formData.append('file', uploadForm.file);
    }
    
    // Agregar todos los datos de actualización
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== null && updateData[key] !== undefined) {
        formData.append(key, updateData[key]);
        console.log(`🔄 FormData - ${key}:`, updateData[key]);
      }
    });
    
    console.log('🔄 FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }
    
    updateMutation.mutate({ id: editingAttachment.id, formData });
  };

  const handleDeleteConfirm = () => {
    if (deletingAttachment) {
      deleteMutation.mutate(deletingAttachment.id);
    }
  };

  const handleDownload = async (attachment) => {
    try {
      await downloadFile(attachment);
      setToast({ message: 'Descarga iniciada correctamente.', type: 'success', show: true });
    } catch (error) {
      console.error('Error al descargar archivo:', error);
      setToast({ message: 'Error al descargar el archivo.', type: 'error', show: true });
    }
  };


  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setUploadForm(f => ({ ...f, file: files[0] }));
    }
  };

  const handleFilter = (filters) => {
    setSelectedProject(filters.project_id || '');
    setSelectedFileType(filters.file_type || '');
    setCurrentPage(1);
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'xls':
      case 'xlsx': return '📊';
      case 'ppt':
      case 'pptx': return '📈';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️';
      case 'txt': return '📃';
      default: return '📎';
    }
  };

  const getFileTypeBadge = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const typeMap = {
      'pdf': { variant: 'danger', text: 'PDF' },
      'doc': { variant: 'primary', text: 'DOC' },
      'docx': { variant: 'primary', text: 'DOCX' },
      'xls': { variant: 'success', text: 'XLS' },
      'xlsx': { variant: 'success', text: 'XLSX' },
      'ppt': { variant: 'warning', text: 'PPT' },
      'pptx': { variant: 'warning', text: 'PPTX' },
      'jpg': { variant: 'info', text: 'JPG' },
      'jpeg': { variant: 'info', text: 'JPEG' },
      'png': { variant: 'info', text: 'PNG' },
      'gif': { variant: 'info', text: 'GIF' },
      'txt': { variant: 'secondary', text: 'TXT' }
    };
    return typeMap[ext] || { variant: 'secondary', text: ext?.toUpperCase() || 'FILE' };
  };

  const getRoleBadge = (role) => {
    const roleMap = {
      'admin': { variant: 'danger', text: 'Admin' },
      'jefa_comercial': { variant: 'primary', text: 'Jefa Comercial' },
      'jefe_laboratorio': { variant: 'info', text: 'Jefe Lab' },
      'vendedor_comercial': { variant: 'success', text: 'Vendedor' },
      'usuario_laboratorio': { variant: 'warning', text: 'Lab User' }
    };
    return roleMap[role] || { variant: 'secondary', text: role || 'N/A' };
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'activo': { variant: 'success', text: 'Activo' },
      'pendiente': { variant: 'warning', text: 'Pendiente' },
      'completado': { variant: 'primary', text: 'Completado' },
      'cancelado': { variant: 'danger', text: 'Cancelado' },
      'pausado': { variant: 'secondary', text: 'Pausado' }
    };
    return statusMap[status] || { variant: 'secondary', text: status || 'N/A' };
  };

  const columns = useMemo(() => [
    { 
      header: 'ID', 
      accessor: 'id', 
      width: 60 
    },
    { 
      header: 'Proyecto', 
      accessor: 'project_name',
      render: (value, row) => (
        <div>
          <div className="fw-medium">{value || 'Sin proyecto'}</div>
          <div className="small text-muted">
            <div>📍 {row.project_location || 'Sin ubicación'}</div>
            <div className="d-flex align-items-center gap-2 mt-1">
              <Badge bg={getStatusBadge(row.project_status).variant} className="small">
                {getStatusBadge(row.project_status).text}
              </Badge>
              {row.project_priority && (
                <Badge bg={row.project_priority === 'urgent' ? 'danger' : row.project_priority === 'high' ? 'warning' : 'info'} className="small">
                  {row.project_priority}
                </Badge>
              )}
            </div>
          </div>
        </div>
      )
    },
    { 
      header: 'Empresa', 
      accessor: 'company_name',
      render: (value, row) => (
        <div>
          <div className="fw-medium">{value || 'Sin empresa'}</div>
          <small className="text-muted">RUC: {row.company_ruc || 'N/A'}</small>
        </div>
      )
    },
    { 
      header: 'Archivo', 
      accessor: 'original_name',
      render: (value, row) => {
        const fileType = getFileTypeBadge(value);
        return (
          <div className="d-flex align-items-center">
            <span className="me-2" style={{ fontSize: '1.2em' }}>
              {getFileIcon(value)}
            </span>
            <div>
              <div className="fw-medium">{value}</div>
              <Badge bg={fileType.variant} className="small">
                {fileType.text}
              </Badge>
            </div>
          </div>
        );
      }
    },
    { 
      header: 'Categorías', 
      accessor: 'category_name',
      render: (value, row) => (
        <div>
          {value && (
            <div className="mb-1">
              <Badge bg="primary" className="small">
                📁 {value}
              </Badge>
            </div>
          )}
          {row.subcategory_name && (
            <div>
              <Badge bg="info" className="small">
                📂 {row.subcategory_name}
              </Badge>
            </div>
          )}
          {!value && !row.subcategory_name && (
            <span className="text-muted small">Sin categoría</span>
          )}
        </div>
      )
    },
    { 
      header: 'Servicios', 
      accessor: 'requiere_laboratorio',
      render: (value, row) => (
        <div className="d-flex flex-wrap gap-1">
          {row.requiere_laboratorio && (
            <Badge bg="warning" className="small">🧪 Lab</Badge>
          )}
          {row.requiere_ingenieria && (
            <Badge bg="info" className="small">⚙️ Ing</Badge>
          )}
          {row.requiere_consultoria && (
            <Badge bg="success" className="small">💼 Cons</Badge>
          )}
          {row.requiere_capacitacion && (
            <Badge bg="primary" className="small">🎓 Cap</Badge>
          )}
          {row.requiere_auditoria && (
            <Badge bg="secondary" className="small">📋 Aud</Badge>
          )}
          {!row.requiere_laboratorio && !row.requiere_ingenieria && !row.requiere_consultoria && !row.requiere_capacitacion && !row.requiere_auditoria && (
            <span className="text-muted small">Sin servicios</span>
          )}
        </div>
      )
    },
    { 
      header: 'Roles', 
      accessor: 'vendedor_name',
      render: (value, row) => (
        <div>
          {value && (
            <div className="mb-1">
              <div className="small">
                <Badge bg={getRoleBadge(row.vendedor_role).variant} className="small me-1">
                  {getRoleBadge(row.vendedor_role).text}
                </Badge>
                <span className="text-muted">{value}</span>
              </div>
            </div>
          )}
          {row.laboratorio_name && (
            <div className="small">
              <Badge bg={getRoleBadge(row.laboratorio_role).variant} className="small me-1">
                {getRoleBadge(row.laboratorio_role).text}
              </Badge>
              <span className="text-muted">{row.laboratorio_name}</span>
            </div>
          )}
          {!value && !row.laboratorio_name && (
            <span className="text-muted small">Sin asignación</span>
          )}
        </div>
      )
    },
    { 
      header: 'Subido por', 
      accessor: 'uploaded_by_name',
      render: (value, row) => (
        <div>
          <div className="fw-medium">{value || 'Usuario desconocido'}</div>
          <div className="small">
            <Badge bg={getRoleBadge(row.uploaded_by_role).variant} className="small">
              {getRoleBadge(row.uploaded_by_role).text}
            </Badge>
          </div>
        </div>
      )
    },
    { 
      header: 'Fecha', 
      accessor: 'created_at',
      render: (value) => (
        <div>
          <div>{new Date(value).toLocaleDateString()}</div>
          <small className="text-muted">{new Date(value).toLocaleTimeString()}</small>
        </div>
      ),
      width: 120
    },
    { 
      header: 'Acciones', 
      accessor: 'actions',
      width: 180,
      render: (value, row) => (
        <div className="d-flex gap-1">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => handleDownload(row)}
            title="Descargar"
          >
            <FiDownload />
          </Button>
          <Button
            variant="outline-success"
            size="sm"
            onClick={() => handleEdit(row)}
            title="Editar"
          >
            <FiEdit />
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => setDeletingAttachment(row)}
            title="Eliminar"
          >
            <FiTrash2 />
          </Button>
        </div>
      )
    },
  ], []);

  const rows = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Estadísticas calculadas
  const stats = useMemo(() => {
    const fileTypes = {};
    const projects = new Set();
    const categories = new Set();
    const subcategories = new Set();
    const roles = new Set();
    let totalSize = 0;
    
    rows.forEach(row => {
      const ext = row.original_name?.split('.').pop()?.toLowerCase() || 'unknown';
      fileTypes[ext] = (fileTypes[ext] || 0) + 1;
      if (row.project_id) projects.add(row.project_id);
      if (row.category_name) categories.add(row.category_name);
      if (row.subcategory_name) subcategories.add(row.subcategory_name);
      if (row.vendedor_name) roles.add('vendedor');
      if (row.laboratorio_name) roles.add('laboratorio');
      if (row.file_size) totalSize += parseInt(row.file_size);
    });

    return {
      total: total,
      totalFiles: rows.length,
      totalProjects: projects.size,
      totalCategories: categories.size,
      totalSubcategories: subcategories.size,
      totalRoles: roles.size,
      fileTypes: Object.keys(fileTypes).length,
      totalSize: (totalSize / 1024 / 1024).toFixed(1) + ' MB'
    };
  }, [rows, total]);

  const filterOptions = [
    {
      title: 'Por Proyecto',
      options: projects.map(project => ({
        label: `${project.name} - ${project.location}`,
        filter: { project_id: project.id }
      }))
    },
    {
      title: 'Por Tipo de Archivo',
      options: [
        { label: '📄 PDF', filter: { file_type: 'pdf' } },
        { label: '📝 Documentos', filter: { file_type: 'doc' } },
        { label: '📊 Excel', filter: { file_type: 'xls' } },
        { label: '🖼️ Imágenes', filter: { file_type: 'img' } }
      ]
    },
    {
      title: 'Por Estado de Proyecto',
      options: [
        { label: '🟢 Activos', filter: { project_status: 'activo' } },
        { label: '🟡 Pendientes', filter: { project_status: 'pendiente' } },
        { label: '🔵 Completados', filter: { project_status: 'completado' } },
        { label: '🔴 Cancelados', filter: { project_status: 'cancelado' } }
      ]
    }
  ];

  return (
    <>
      <Container fluid className="py-4">
        <PageHeader
          title="Gestión de Adjuntos"
          subtitle="Archivos relacionados a proyectos y cotizaciones"
          icon={FiFolder}
        />

        {/* Estadísticas */}
        <Row className="mb-4">
          <Col md={6} lg={3}>
            <StatsCard
              title="Total Archivos"
              value={stats.total}
              icon={FiFile}
              color="primary"
              subtitle="Archivos en el sistema"
              loading={isLoading}
            />
          </Col>
          <Col md={6} lg={3}>
            <StatsCard
              title="Proyectos"
              value={stats.totalProjects}
              icon={FiFolder}
              color="info"
              subtitle="Con archivos adjuntos"
              loading={isLoading}
            />
          </Col>
          <Col md={6} lg={3}>
            <StatsCard
              title="Categorías"
              value={stats.totalCategories}
              icon={FiUsers}
              color="success"
              subtitle="Con archivos asignados"
              loading={isLoading}
            />
          </Col>
          <Col md={6} lg={3}>
            <StatsCard
              title="Espacio Usado"
              value={stats.totalSize}
              icon={FiAlertTriangle}
              color="warning"
              subtitle="Almacenamiento total"
              loading={isLoading}
            />
          </Col>
        </Row>

        {/* Barra de herramientas */}
        <Card className="mb-4">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={6}>
                <div className="d-flex gap-2">
                  <div className="position-relative flex-grow-1">
                    <FiSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                    <Form.Control
                      type="text"
                      placeholder="Buscar por archivo, proyecto..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="ps-5"
                    />
                  </div>
                  <Button
                    variant="outline-secondary"
                    onClick={() => refetch()}
                    title="Actualizar"
                  >
                    <FiRefreshCw />
                  </Button>
                </div>
              </Col>
              <Col md={6} className="text-end">
                <div className="d-flex gap-2 justify-content-end">
                  <Button
                    variant="outline-primary"
                    onClick={() => setShowUploadModal(true)}
                  >
                    <FiUpload className="me-2" />
                    Subir Archivo
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Tabla de adjuntos */}
        <Card>
          <Card.Body className="p-0">
            <DataTable
              columns={columns}
              data={rows}
              loading={isLoading}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={total}
              itemsPerPage={limit}
              filterOptions={filterOptions}
              onFilter={handleFilter}
              emptyMessage="No hay archivos adjuntos"
              emptyDescription="Sube tu primer archivo usando el botón 'Subir Archivo'"
            />
          </Card.Body>
        </Card>
      </Container>

      {/* Upload Modal */}
      {showUploadModal && (
        <Modal open={showUploadModal} onClose={() => setShowUploadModal(false)} size="lg">
          <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="d-flex align-items-center mb-4">
              <FiUpload className="me-2 text-primary" size={24} />
              <h4 className="mb-0">Subir Archivo Adjunto</h4>
            </div>
            
            <form onSubmit={handleUploadSubmit}>
              <Row className="g-3">
                <Col md={12}>
                  <Form.Label className="fw-medium">Proyecto *</Form.Label>
                  <Form.Select
                    value={uploadForm.project_id}
                    onChange={(e) => {
                      const projectId = e.target.value;
                      const project = projects.find(p => p.id === parseInt(projectId));
                      setUploadForm(f => ({ 
                        ...f, 
                        project_id: projectId,
                        category_id: project?.category_id || '',
                        subcategory_id: project?.subcategory_id || ''
                      }));
                    }}
                    required
                    className="form-select-lg"
                  >
                    <option value="">Seleccione un proyecto...</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} - {p.location}
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                {/* Categorías disponibles */}
                <Col md={12}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Form.Label className="fw-medium mb-0">Categorías Disponibles</Form.Label>
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={refreshCategoriesAndSubcategories}
                      title="Actualizar lista de categorías"
                    >
                      🔄 Actualizar
                    </Button>
                  </div>
                  <div className="border rounded p-3 bg-light" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {categories.length > 0 ? (
                      categories.map(category => (
                        <Form.Check
                          key={category.id}
                          type="checkbox"
                          id={`category-${category.id}`}
                          label={`📁 ${category.name}`}
                          checked={uploadForm.category_id === category.id}
                          onChange={(e) => setUploadForm(f => ({ 
                            ...f, 
                            category_id: e.target.checked ? category.id : ''
                          }))}
                          className="mb-2"
                        />
                      ))
                    ) : (
                      <p className="text-muted mb-0">No hay categorías disponibles</p>
                    )}
                  </div>
                  <Form.Text className="text-muted d-block mt-1">
                    Selecciona una categoría para asignar al archivo
                  </Form.Text>
                </Col>

                {/* Subcategorías disponibles */}
                <Col md={12}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Form.Label className="fw-medium mb-0">Subcategorías Disponibles</Form.Label>
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={refreshCategoriesAndSubcategories}
                      title="Actualizar lista de subcategorías"
                    >
                      🔄 Actualizar
                    </Button>
                  </div>
                  <div className="border rounded p-3 bg-light" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {subcategories.length > 0 ? (
                      subcategories.map(subcategory => (
                        <Form.Check
                          key={subcategory.id}
                          type="checkbox"
                          id={`subcategory-${subcategory.id}`}
                          label={`📂 ${subcategory.name}`}
                          checked={uploadForm.subcategory_id === subcategory.id}
                          onChange={(e) => setUploadForm(f => ({ 
                            ...f, 
                            subcategory_id: e.target.checked ? subcategory.id : ''
                          }))}
                          className="mb-2"
                        />
                      ))
                    ) : (
                      <p className="text-muted mb-0">No hay subcategorías disponibles</p>
                    )}
                  </div>
                  <Form.Text className="text-muted d-block mt-1">
                    Selecciona una subcategoría para asignar al archivo
                  </Form.Text>
                </Col>
                
                <Col md={12}>
                  <Form.Label className="fw-medium">Descripción (Opcional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Describe el contenido del archivo..."
                  />
                </Col>

                {/* Servicios del archivo */}
                <Col md={12}>
                  <Form.Label className="fw-medium">Servicios Requeridos</Form.Label>
                  <div className="border rounded p-3 bg-light">
                    <Row>
                      <Col md={6}>
                        <Form.Check
                          type="checkbox"
                          id="upload-requiere-laboratorio"
                          label="🧪 Laboratorio"
                          checked={uploadForm.requiere_laboratorio}
                          onChange={(e) => setUploadForm(f => ({ 
                            ...f, 
                            requiere_laboratorio: e.target.checked
                          }))}
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Check
                          type="checkbox"
                          id="upload-requiere-ingenieria"
                          label="⚙️ Ingeniería"
                          checked={uploadForm.requiere_ingenieria}
                          onChange={(e) => setUploadForm(f => ({ 
                            ...f, 
                            requiere_ingenieria: e.target.checked
                          }))}
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Check
                          type="checkbox"
                          id="upload-requiere-consultoria"
                          label="💼 Consultoría"
                          checked={uploadForm.requiere_consultoria}
                          onChange={(e) => setUploadForm(f => ({ 
                            ...f, 
                            requiere_consultoria: e.target.checked
                          }))}
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Check
                          type="checkbox"
                          id="upload-requiere-capacitacion"
                          label="🎓 Capacitación"
                          checked={uploadForm.requiere_capacitacion}
                          onChange={(e) => setUploadForm(f => ({ 
                            ...f, 
                            requiere_capacitacion: e.target.checked
                          }))}
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Check
                          type="checkbox"
                          id="upload-requiere-auditoria"
                          label="📋 Auditoría"
                          checked={uploadForm.requiere_auditoria}
                          onChange={(e) => setUploadForm(f => ({ 
                            ...f, 
                            requiere_auditoria: e.target.checked
                          }))}
                        />
                      </Col>
                    </Row>
                    <Form.Text className="text-muted d-block mt-2">
                      Marca los servicios que requiere este archivo
                    </Form.Text>
                  </div>
                </Col>
                
                <Col md={12}>
                  <Form.Label className="fw-medium">Archivo *</Form.Label>
                  <div
                    className={`border-2 border-dashed rounded p-4 text-center ${
                      dragActive ? 'border-primary bg-light' : 'border-secondary'
                    }`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    style={{ minHeight: '120px', cursor: 'pointer' }}
                    onClick={() => document.getElementById('fileInput').click()}
                  >
                    {uploadForm.file ? (
                      <div>
                        <FiCheckCircle className="text-success mb-2" size={32} />
                        <div className="fw-medium">{uploadForm.file.name}</div>
                        <small className="text-muted">
                          {(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB
                        </small>
                      </div>
                    ) : (
                      <div>
                        <FiUpload className="text-muted mb-2" size={32} />
                        <div className="fw-medium">Arrastra y suelta tu archivo aquí</div>
                        <small className="text-muted">o haz clic para seleccionar</small>
                        <div className="mt-2">
                          <small className="text-muted">
                            Formatos permitidos: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, GIF, TXT
                          </small>
                        </div>
                      </div>
                    )}
                  </div>
                  <Form.Control
                    id="fileInput"
                    type="file"
                    className="d-none"
                    onChange={(e) => setUploadForm(f => ({ ...f, file: e.target.files[0] }))}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt"
                    required
                  />
                </Col>
              </Row>
              
              {createMutation.isLoading && (
                <div className="mt-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small>Subiendo archivo...</small>
                    <small>{uploadProgress}%</small>
                  </div>
                  <ProgressBar now={uploadProgress} animated />
                </div>
              )}
              
              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={() => setShowUploadModal(false)}
                  disabled={createMutation.isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={createMutation.isLoading || !uploadForm.file || !uploadForm.project_id}
                >
                  {createMutation.isLoading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <FiUpload className="me-2" />
                      Subir Archivo
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEditModal && editingAttachment && (
        <Modal open={showEditModal} onClose={() => setShowEditModal(false)} size="lg">
          <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="d-flex align-items-center mb-4">
              <FiEdit className="me-2 text-success" size={24} />
              <h4 className="mb-0">Editar Archivo Adjunto</h4>
            </div>
            
            <form onSubmit={handleEditSubmit}>
              <Row className="g-3">
                <Col md={12}>
                  <Form.Label className="fw-medium">Proyecto</Form.Label>
                  <Form.Control
                    type="text"
                    value={editingAttachment.project_name || 'Sin proyecto'}
                    readOnly
                    className="bg-light"
                  />
                </Col>
                
                <Col md={12}>
                  <Form.Label className="fw-medium">Archivo Actual</Form.Label>
                  <div className="d-flex align-items-center p-3 bg-light rounded">
                    <span className="me-2" style={{ fontSize: '1.2em' }}>
                      {getFileIcon(editingAttachment.original_name)}
                    </span>
                    <div>
                      <div className="fw-medium">{editingAttachment.original_name}</div>
                      <small className="text-muted">
                        {(editingAttachment.file_size / 1024 / 1024).toFixed(2)} MB
                      </small>
                    </div>
                  </div>
                </Col>
                
                <Col md={12}>
                  <Form.Label className="fw-medium">Nuevo Archivo (Opcional)</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={(e) => setUploadForm(f => ({ ...f, file: e.target.files[0] }))}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt"
                  />
                  <Form.Text className="text-muted">
                    Deja vacío para mantener el archivo actual
                  </Form.Text>
                </Col>
                
                <Col md={12}>
                  <Form.Label className="fw-medium">Descripción</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Describe el contenido del archivo..."
                  />
                </Col>

                {/* Categorías disponibles en edición */}
                <Col md={12}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Form.Label className="fw-medium mb-0">Categorías Disponibles</Form.Label>
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={refreshCategoriesAndSubcategories}
                      title="Actualizar lista de categorías"
                    >
                      🔄 Actualizar
                    </Button>
                  </div>
                  <div className="border rounded p-3 bg-light" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {categories.length > 0 ? (
                      categories.map(category => (
                        <Form.Check
                          key={category.id}
                          type="checkbox"
                          id={`edit-category-${category.id}`}
                          label={`📁 ${category.name}`}
                          checked={uploadForm.category_id === category.id}
                          onChange={(e) => setUploadForm(f => ({ 
                            ...f, 
                            category_id: e.target.checked ? category.id : ''
                          }))}
                          className="mb-2"
                        />
                      ))
                    ) : (
                      <p className="text-muted mb-0">No hay categorías disponibles</p>
                    )}
                  </div>
                  <Form.Text className="text-muted d-block mt-1">
                    Selecciona una categoría para asignar al archivo
                  </Form.Text>
                </Col>

                {/* Subcategorías disponibles en edición */}
                <Col md={12}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Form.Label className="fw-medium mb-0">Subcategorías Disponibles</Form.Label>
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={refreshCategoriesAndSubcategories}
                      title="Actualizar lista de subcategorías"
                    >
                      🔄 Actualizar
                    </Button>
                  </div>
                  <div className="border rounded p-3 bg-light" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {subcategories.length > 0 ? (
                      subcategories.map(subcategory => (
                        <Form.Check
                          key={subcategory.id}
                          type="checkbox"
                          id={`edit-subcategory-${subcategory.id}`}
                          label={`📂 ${subcategory.name}`}
                          checked={uploadForm.subcategory_id === subcategory.id}
                          onChange={(e) => setUploadForm(f => ({ 
                            ...f, 
                            subcategory_id: e.target.checked ? subcategory.id : ''
                          }))}
                          className="mb-2"
                        />
                      ))
                    ) : (
                      <p className="text-muted mb-0">No hay subcategorías disponibles</p>
                    )}
                  </div>
                  <Form.Text className="text-muted d-block mt-1">
                    Selecciona una subcategoría para asignar al archivo
                  </Form.Text>
                </Col>

                {/* Servicios del archivo */}
                <Col md={12}>
                  <Form.Label className="fw-medium">Servicios Requeridos</Form.Label>
                  <div className="border rounded p-3 bg-light">
                    <Row>
                      <Col md={6}>
                        <Form.Check
                          type="checkbox"
                          id="requiere-laboratorio"
                          label="🧪 Laboratorio"
                          checked={uploadForm.requiere_laboratorio}
                          onChange={(e) => setUploadForm(f => ({ 
                            ...f, 
                            requiere_laboratorio: e.target.checked
                          }))}
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Check
                          type="checkbox"
                          id="requiere-ingenieria"
                          label="⚙️ Ingeniería"
                          checked={uploadForm.requiere_ingenieria}
                          onChange={(e) => setUploadForm(f => ({ 
                            ...f, 
                            requiere_ingenieria: e.target.checked
                          }))}
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Check
                          type="checkbox"
                          id="requiere-consultoria"
                          label="💼 Consultoría"
                          checked={uploadForm.requiere_consultoria}
                          onChange={(e) => setUploadForm(f => ({ 
                            ...f, 
                            requiere_consultoria: e.target.checked
                          }))}
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Check
                          type="checkbox"
                          id="requiere-capacitacion"
                          label="🎓 Capacitación"
                          checked={uploadForm.requiere_capacitacion}
                          onChange={(e) => setUploadForm(f => ({ 
                            ...f, 
                            requiere_capacitacion: e.target.checked
                          }))}
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Check
                          type="checkbox"
                          id="requiere-auditoria"
                          label="📋 Auditoría"
                          checked={uploadForm.requiere_auditoria}
                          onChange={(e) => setUploadForm(f => ({ 
                            ...f, 
                            requiere_auditoria: e.target.checked
                          }))}
                        />
                      </Col>
                    </Row>
                    <Form.Text className="text-muted d-block mt-2">
                      Marca los servicios que requiere este archivo
                    </Form.Text>
                  </div>
                </Col>
              </Row>
              
              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={() => setShowEditModal(false)}
                  disabled={updateMutation.isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="success"
                  disabled={updateMutation.isLoading}
                >
                  {updateMutation.isLoading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <FiEdit className="me-2" />
                      Actualizar Archivo
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingAttachment && (
        <Modal open={!!deletingAttachment} onClose={() => setDeletingAttachment(null)}>
          <div>
            <div className="d-flex align-items-center mb-4">
              <FiTrash2 className="me-2 text-danger" size={24} />
              <h4 className="mb-0">Confirmar Eliminación</h4>
            </div>
            
            <Alert variant="warning" className="mb-4">
              <FiAlertTriangle className="me-2" />
              <strong>¡Atención!</strong> Esta acción no se puede deshacer.
            </Alert>
            
            <div className="mb-4">
              <p>¿Estás seguro de que quieres eliminar el siguiente archivo?</p>
              <Card className="bg-light">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <span className="me-3" style={{ fontSize: '1.5em' }}>
                      {getFileIcon(deletingAttachment.original_name)}
                    </span>
                    <div>
                      <div className="fw-medium">{deletingAttachment.original_name}</div>
                      <small className="text-muted">
                        Proyecto: {deletingAttachment.project_name || 'Sin proyecto'}
                      </small>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
            
            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="outline-secondary"
                onClick={() => setDeletingAttachment(null)}
                disabled={deleteMutation.isLoading}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isLoading}
              >
                {deleteMutation.isLoading ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <FiTrash2 className="me-2" />
                    Eliminar Archivo
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: 'success', show: false })} 
      />
    </>
  );
}