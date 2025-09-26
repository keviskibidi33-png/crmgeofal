import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  getProyectosAsignados, 
  getEstadisticasLaboratorio,
  actualizarEstadoProyecto,
  subirArchivosLaboratorio,
  obtenerArchivosProyecto
} from '../services/laboratorio';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Badge, 
  Form, 
  InputGroup, 
  Spinner, 
  Alert, 
  Modal, 
  Table, 
  ProgressBar, 
  Dropdown,
  Nav,
  Tab,
  Tabs
} from 'react-bootstrap';
import { 
  FiActivity, 
  FiSearch, 
  FiFilter, 
  FiEye, 
  FiEdit, 
  FiClock, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiUsers, 
  FiFileText, 
  FiCalendar, 
  FiDownload, 
  FiTrendingUp, 
  FiTarget, 
  FiPlay, 
  FiRefreshCw, 
  FiPlus, 
  FiMoreVertical,
  FiBarChart,
  FiGrid,
  FiSettings,
  FiMessageSquare
} from 'react-icons/fi';

const Laboratorio = () => {
  const [filtros, setFiltros] = useState({
    estado: '',
    search: '',
    page: 1
  });
  
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [archivos, setArchivos] = useState([]);
  const [notas, setNotas] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  const queryClient = useQueryClient();

  // Obtener proyectos asignados
  const { data: proyectos, isLoading: proyectosLoading, error: proyectosError } = useQuery({
    queryKey: ['laboratorio-proyectos', filtros],
    queryFn: () => getProyectosAsignados(filtros),
    keepPreviousData: true,
    retry: 1,
    retryDelay: 1000,
    staleTime: 30000
  });

  // Obtener estadísticas
  const { data: estadisticas, isLoading: statsLoading } = useQuery({
    queryKey: ['laboratorio-estadisticas'],
    queryFn: getEstadisticasLaboratorio,
    retry: 1,
    retryDelay: 1000,
    staleTime: 30000
  });

  // Obtener archivos del proyecto seleccionado
  const { data: archivosProyecto, isLoading: archivosLoading } = useQuery({
    queryKey: ['laboratorio-archivos', proyectoSeleccionado?.id],
    queryFn: () => obtenerArchivosProyecto(proyectoSeleccionado.id),
    enabled: !!proyectoSeleccionado
  });

  // Mutación para actualizar estado
  const actualizarEstadoMutation = useMutation({
    mutationFn: ({ proyectoId, nuevoEstado, notas }) => 
      actualizarEstadoProyecto(proyectoId, nuevoEstado, notas),
    onSuccess: () => {
      queryClient.invalidateQueries(['laboratorio-proyectos']);
      queryClient.invalidateQueries(['laboratorio-estadisticas']);
      setMostrarModal(false);
    }
  });

  // Mutación para subir archivos
  const subirArchivosMutation = useMutation({
    mutationFn: ({ proyectoId, archivos, notas }) => 
      subirArchivosLaboratorio(proyectoId, archivos, notas),
    onSuccess: () => {
      queryClient.invalidateQueries(['laboratorio-archivos', proyectoSeleccionado?.id]);
      setArchivos([]);
      setNotas('');
    }
  });

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor,
      page: campo !== 'page' ? 1 : valor
    }));
  };

  const handleVerProyecto = (proyecto) => {
    setProyectoSeleccionado(proyecto);
    setMostrarModal(true);
  };

  const handleActualizarEstado = (nuevoEstado) => {
    if (proyectoSeleccionado) {
      actualizarEstadoMutation.mutate({
        proyectoId: proyectoSeleccionado.id,
        nuevoEstado,
        notas
      });
    }
  };

  const handleSubirArchivos = (event) => {
    const files = Array.from(event.target.files);
    setArchivos(files);
  };

  const handleEnviarArchivos = () => {
    if (proyectoSeleccionado && archivos.length > 0) {
      subirArchivosMutation.mutate({
        proyectoId: proyectoSeleccionado.id,
        archivos,
        notas
      });
    }
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      'borrador': { variant: 'secondary', icon: FiEdit, text: 'Borrador' },
      'en_laboratorio': { variant: 'warning', icon: FiClock, text: 'En Laboratorio' },
      'en_proceso': { variant: 'info', icon: FiPlay, text: 'En Proceso' },
      'completado': { variant: 'success', icon: FiCheckCircle, text: 'Completado' },
      'pendiente': { variant: 'danger', icon: FiAlertCircle, text: 'Pendiente' }
    };
    
    const config = estados[estado] || { variant: 'secondary', icon: FiEdit, text: estado };
    const IconComponent = config.icon;
    
    return (
      <Badge bg={config.variant} className="d-flex align-items-center gap-1">
        <IconComponent size={12} />
        {config.text}
      </Badge>
    );
  };

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case 'alta': return 'danger';
      case 'media': return 'warning';
      case 'baja': return 'success';
      default: return 'secondary';
    }
  };

  // Optimización: Removidos logs de debug para producción

  if (proyectosLoading || statsLoading) {
    return (
      <Container fluid className="py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <Spinner animation="border" variant="primary" size="lg" />
            <p className="mt-3 text-muted">Cargando datos del laboratorio...</p>
          </div>
        </div>
      </Container>
    );
  }

  if (proyectosError) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger" className="text-center">
          <FiAlertCircle className="me-2" />
          Error al cargar los datos del laboratorio. Por favor, intenta de nuevo.
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header con navegación por tabs */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">
                <FiActivity className="me-2 text-primary" />
                Gestión de Laboratorio
              </h2>
              <p className="text-muted mb-0">Administra proyectos y procesos de laboratorio</p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-primary" size="sm">
                <FiRefreshCw className="me-1" />
                Actualizar
              </Button>
              <Button variant="primary" size="sm">
                <FiPlus className="me-1" />
                Nuevo Proyecto
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Navegación por tabs */}
      <Row className="mb-4">
        <Col>
          <Nav variant="tabs" defaultActiveKey="dashboard">
            <Nav.Item>
              <Nav.Link eventKey="dashboard" onClick={() => setActiveTab('dashboard')}>
                <FiBarChart className="me-1" />
                Dashboard
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="proyectos" onClick={() => setActiveTab('proyectos')}>
                <FiGrid className="me-1" />
                Proyectos
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="reportes" onClick={() => setActiveTab('reportes')}>
                <FiFileText className="me-1" />
                Reportes
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="configuracion" onClick={() => setActiveTab('configuracion')}>
                <FiSettings className="me-1" />
                Configuración
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>
      </Row>

      {/* Contenido principal */}
      {activeTab === 'dashboard' && (
        <>
          {/* Tarjetas de estadísticas */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                      <FiTarget className="text-primary" size={24} />
                    </div>
                    <div className="text-end">
                      <h3 className="mb-0 text-primary">{estadisticas?.data?.total_proyectos || 0}</h3>
                      <small className="text-muted">Total Proyectos</small>
                    </div>
                  </div>
                  <ProgressBar 
                    now={estadisticas?.data?.total_proyectos || 0} 
                    max={100} 
                    variant="primary" 
                    className="mb-2"
                  />
                  <small className="text-muted">Proyectos en el sistema</small>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={3}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                      <FiPlay className="text-warning" size={24} />
                    </div>
                    <div className="text-end">
                      <h3 className="mb-0 text-warning">{estadisticas?.data?.en_proceso || 0}</h3>
                      <small className="text-muted">En Proceso</small>
                    </div>
                  </div>
                  <ProgressBar 
                    now={estadisticas?.data?.en_proceso || 0} 
                    max={estadisticas?.data?.total_proyectos || 1} 
                    variant="warning" 
                    className="mb-2"
                  />
                  <small className="text-muted">Proyectos activos</small>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={3}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="bg-success bg-opacity-10 rounded-circle p-3">
                      <FiCheckCircle className="text-success" size={24} />
                    </div>
                    <div className="text-end">
                      <h3 className="mb-0 text-success">{estadisticas?.data?.completados || 0}</h3>
                      <small className="text-muted">Completados</small>
                    </div>
                  </div>
                  <ProgressBar 
                    now={estadisticas?.data?.completados || 0} 
                    max={estadisticas?.data?.total_proyectos || 1} 
                    variant="success" 
                    className="mb-2"
                  />
                  <small className="text-muted">Proyectos finalizados</small>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={3}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="bg-info bg-opacity-10 rounded-circle p-3">
                      <FiTrendingUp className="text-info" size={24} />
                    </div>
                    <div className="text-end">
                      <h3 className="mb-0 text-info">{estadisticas?.data?.esta_semana || 0}</h3>
                      <small className="text-muted">Esta Semana</small>
                    </div>
                  </div>
                  <ProgressBar 
                    now={estadisticas?.data?.esta_semana || 0} 
                    max={estadisticas?.data?.total_proyectos || 1} 
                    variant="info" 
                    className="mb-2"
                  />
                  <small className="text-muted">Proyectos recientes</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Proyectos recientes */}
          <Row>
            <Col>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      <FiGrid className="me-2 text-primary" />
                      Proyectos Recientes
                    </h5>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => setActiveTab('proyectos')}
                    >
                      Ver Todos
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  {proyectos?.data?.proyectos?.slice(0, 5).map((proyecto) => (
                    <div key={proyecto.id} className="d-flex align-items-center justify-content-between py-3 border-bottom">
                      <div className="d-flex align-items-center">
                        <div className="bg-light rounded-circle p-2 me-3">
                          <FiFileText className="text-primary" />
                        </div>
                        <div>
                          <h6 className="mb-1">{proyecto.proyecto_nombre}</h6>
                          <small className="text-muted">
                            Cliente: {proyecto.cliente_nombre} • {proyecto.vendedor_nombre}
                          </small>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        {getEstadoBadge(proyecto.estado)}
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleVerProyecto(proyecto)}
                        >
                          <FiEye className="me-1" />
                          Ver
                        </Button>
                      </div>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {activeTab === 'proyectos' && (
        <>
          {/* Filtros y búsqueda */}
          <Row className="mb-4">
            <Col>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <Row>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Buscar proyecto</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FiSearch />
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            placeholder="Nombre del proyecto o cliente..."
                            value={filtros.search}
                            onChange={(e) => handleFiltroChange('search', e.target.value)}
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Estado</Form.Label>
                        <Form.Select
                          value={filtros.estado}
                          onChange={(e) => handleFiltroChange('estado', e.target.value)}
                        >
                          <option value="">Todos los estados</option>
                          <option value="borrador">Borrador</option>
                          <option value="en_laboratorio">En Laboratorio</option>
                          <option value="en_proceso">En Proceso</option>
                          <option value="completado">Completado</option>
                          <option value="pendiente">Pendiente</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Prioridad</Form.Label>
                        <Form.Select>
                          <option value="">Todas las prioridades</option>
                          <option value="alta">Alta</option>
                          <option value="media">Media</option>
                          <option value="baja">Baja</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={2} className="d-flex align-items-end">
                      <Button variant="outline-secondary" className="w-100">
                        <FiFilter className="me-1" />
                        Filtrar
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Tabla de proyectos */}
          <Row>
            <Col>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      <FiGrid className="me-2 text-primary" />
                      Lista de Proyectos ({proyectos?.data?.total || 0})
                    </h5>
                    <div className="d-flex gap-2">
                      <Button variant="outline-success" size="sm">
                        <FiDownload className="me-1" />
                        Exportar
                      </Button>
                      <Button variant="primary" size="sm">
                        <FiPlus className="me-1" />
                        Nuevo
                      </Button>
                    </div>
                  </div>
                </Card.Header>
                <Card.Body className="p-0">
                  <Table hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Proyecto</th>
                        <th>Cliente</th>
                        <th>Vendedor</th>
                        <th>Estado</th>
                        <th>Prioridad</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proyectos?.data?.proyectos?.map((proyecto) => (
                        <tr key={proyecto.id}>
                          <td>
                            <div>
                              <h6 className="mb-1">{proyecto.proyecto_nombre}</h6>
                              <small className="text-muted">{proyecto.description}</small>
                            </div>
                          </td>
                          <td>
                            <div>
                              <div className="fw-medium">{proyecto.cliente_nombre}</div>
                              <small className="text-muted">{proyecto.cliente_email}</small>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="bg-primary bg-opacity-10 rounded-circle p-1 me-2">
                                <FiUsers className="text-primary" size={14} />
                              </div>
                              {proyecto.vendedor_nombre}
                            </div>
                          </td>
                          <td>{getEstadoBadge(proyecto.estado)}</td>
                          <td>
                            <Badge bg={getPrioridadColor('media')}>Media</Badge>
                          </td>
                          <td>
                            <small className="text-muted">
                              {new Date(proyecto.fecha_envio_laboratorio || proyecto.created_at).toLocaleDateString()}
                            </small>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => handleVerProyecto(proyecto)}
                              >
                                <FiEye />
                              </Button>
                              <Button variant="outline-success" size="sm">
                                <FiEdit />
                              </Button>
                              <Dropdown>
                                <Dropdown.Toggle variant="outline-secondary" size="sm">
                                  <FiMoreVertical />
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item>
                                    <FiDownload className="me-2" />
                                    Descargar
                                  </Dropdown.Item>
                                  <Dropdown.Item>
                                    <FiMessageSquare className="me-2" />
                                    Notificar
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* Modal de detalles del proyecto */}
      <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FiFileText className="me-2" />
            {proyectoSeleccionado?.proyecto_nombre}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {proyectoSeleccionado && (
            <Tabs defaultActiveKey="detalles">
              <Tab eventKey="detalles" title="Detalles">
                <Row>
                  <Col md={6}>
                    <h6>Información del Proyecto</h6>
                    <p><strong>Cliente:</strong> {proyectoSeleccionado.cliente_nombre}</p>
                    <p><strong>Vendedor:</strong> {proyectoSeleccionado.vendedor_nombre}</p>
                    <p><strong>Estado:</strong> {getEstadoBadge(proyectoSeleccionado.estado)}</p>
                    <p><strong>Descripción:</strong> {proyectoSeleccionado.description}</p>
                  </Col>
                  <Col md={6}>
                    <h6>Acciones Rápidas</h6>
                    <div className="d-grid gap-2">
                      <Button 
                        variant="warning" 
                        onClick={() => handleActualizarEstado('en_proceso')}
                        disabled={actualizarEstadoMutation.isLoading}
                      >
                        <FiPlay className="me-1" />
                        Marcar en Proceso
                      </Button>
                      <Button 
                        variant="success" 
                        onClick={() => handleActualizarEstado('completado')}
                        disabled={actualizarEstadoMutation.isLoading}
                      >
                        <FiCheckCircle className="me-1" />
                        Completar Proyecto
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Tab>
              
              <Tab eventKey="archivos" title="Archivos">
                <div className="mb-3">
                  <Form.Group>
                    <Form.Label>Subir Archivos</Form.Label>
                    <Form.Control
                      type="file"
                      multiple
                      onChange={handleSubirArchivos}
                    />
                  </Form.Group>
                  <Form.Group className="mt-3">
                    <Form.Label>Notas</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                      placeholder="Agrega notas sobre el proyecto..."
                    />
                  </Form.Group>
                  <Button 
                    variant="primary" 
                    className="mt-2"
                    onClick={handleEnviarArchivos}
                    disabled={archivos.length === 0 || subirArchivosMutation.isLoading}
                  >
                    <FiPlus className="me-1" />
                    Subir Archivos
                  </Button>
                </div>
                
                <h6>Archivos del Proyecto</h6>
                {archivosProyecto?.map((archivo, index) => (
                  <div key={index} className="d-flex align-items-center justify-content-between p-2 border rounded mb-2">
                    <div className="d-flex align-items-center">
                      <FiFileText className="me-2 text-primary" />
                      <span>{archivo.nombre}</span>
                    </div>
                    <Button variant="outline-primary" size="sm">
                      <FiDownload />
                    </Button>
                  </div>
                ))}
              </Tab>
            </Tabs>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Laboratorio;