import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, InputGroup, Alert, Spinner, Dropdown } from 'react-bootstrap';
import { useQuery, useQueryClient } from 'react-query';
import { 
  FiUsers, FiTrendingUp, FiDollarSign, FiCalendar, 
  FiSearch, FiFilter, FiDownload, FiEye, FiMessageSquare,
  FiUser, FiMail, FiPhone, FiMapPin, FiHome, FiActivity,
  FiFileText, FiDatabase, FiChevronDown, FiRefreshCw
} from 'react-icons/fi';
import { listCompanies, listCompaniesWithTotals, getCompanyStats } from '../services/companies';
import exportService from '../services/exportService';
import { useAuth } from '../contexts/AuthContext';
import RequireRole from '../components/RequireRole';
import ClientHistoryModal from '../components/ClientHistoryModal';
import ClientEditModal from '../components/ClientEditModal';
import ClientSuccessModal from '../components/ClientSuccessModal';
import ClientCreateModal from '../components/ClientCreateModal';
import './CommercialManager.css';

// Función para limpiar el sector para mostrar (sin prioridad embebida)
const cleanSectorForDisplay = (sector) => {
  if (!sector) return 'General';
  // Limpiar cualquier prioridad embebida que pueda quedar
  return sector.replace(/\s*\[PRIORIDAD:\s*\w+\]/g, '').replace(/\s*\[URG\]/g, '').replace(/\s*\[ALTA\]/g, '').replace(/\s*\[BAJA\]/g, '').trim() || 'General';
};

// Configuración de prioridades
const PRIORITY_CONFIG = {
  urgent: { label: 'URGENTE', variant: 'danger', icon: FiActivity },
  high: { label: 'ALTA', variant: 'warning', icon: FiTrendingUp },
  normal: { label: 'NORMAL', variant: 'info', icon: FiUser },
  low: { label: 'BAJA', variant: 'secondary', icon: FiCalendar }
};

// Configuración de estados
const STATUS_CONFIG = {
  prospeccion: { label: 'Prospección', variant: 'primary' },
  interesado: { label: 'Interesado', variant: 'info' },
  pendiente_cotizacion: { label: 'Pendiente Cotización', variant: 'warning' },
  cotizacion_enviada: { label: 'Cotización Enviada', variant: 'secondary' },
  negociacion: { label: 'Negociación', variant: 'warning' },
  ganado: { label: 'Ganado', variant: 'success' },
  perdido: { label: 'Perdido', variant: 'danger' }
};

const CommercialManager = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Estados para filtros y paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState('');
  
  // Estados para modales
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  
  // Estados para modal de éxito
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successClientData, setSuccessClientData] = useState(null);
  const [isEditSuccess, setIsEditSuccess] = useState(false);

  // Consulta principal de clientes con totales
  const { data, isLoading, error, refetch } = useQuery(
    ['commercial-clients-with-totals', currentPage, searchTerm, selectedStatus, selectedPriority, selectedSector, sortBy, sortOrder],
    () => listCompaniesWithTotals({ 
      page: currentPage, 
      limit: 50, 
      search: searchTerm,
      status: selectedStatus,
      priority: selectedPriority,
      sector: selectedSector,
      sortBy,
      sortOrder
    }),
    { 
      keepPreviousData: true,
      refetchOnWindowFocus: true,
      staleTime: 0 // No usar cache, siempre obtener datos frescos
    }
  );

  const clients = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const totalClients = data?.total || 0;

  // Consulta para obtener estadísticas globales
  const { data: statsData, isLoading: isLoadingStats } = useQuery(
    ['company-stats'],
    () => getCompanyStats(),
    {
      staleTime: 60000, // 1 minuto
      onError: (error) => {
        console.error('Error cargando estadísticas:', error);
      }
    }
  );

  // Estadísticas calculadas - usar datos globales del backend
  const stats = React.useMemo(() => {
    // Usar estadísticas reales del backend si están disponibles
    if (statsData && statsData.data) {
      console.log('📊 Stats - Usando estadísticas reales del backend:', statsData);
      return {
        total: statsData.data.total || 0,
        byStatus: statsData.data.byStatus || {},
        byPriority: statsData.data.byPriority || {},
        bySector: statsData.data.bySector || {}
      };
    }
    
    // Fallback: calcular desde los datos de la página actual
    if (!clients.length) return { total: 0, byStatus: {}, byPriority: {}, bySector: {} };
    
    const byStatus = {};
    const byPriority = {};
    const bySector = {};
    
    clients.forEach(client => {
      // Por estado
      byStatus[client.status] = (byStatus[client.status] || 0) + 1;
      
      // Por prioridad
      const priority = client.priority || 'normal'; // Usar el campo priority de la base de datos
      byPriority[priority] = (byPriority[priority] || 0) + 1;
      
      // Por sector
      const cleanSector = cleanSectorForDisplay(client.sector);
      bySector[cleanSector] = (bySector[cleanSector] || 0) + 1;
    });
    
    return {
      total: clients.length,
      byStatus,
      byPriority,
      bySector
    };
  }, [statsData, clients]);

  // Función para manejar el ordenamiento
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedPriority('');
    setSelectedSector('');
    setCurrentPage(1);
  };

  // Función para exportar datos
  const handleExport = async (type) => {
    try {
      setIsExporting(true);
      setExportType(type);
      
      const filters = {
        search: searchTerm,
        status: selectedStatus,
        sector: selectedSector,
        sortBy,
        sortOrder
      };
      
      if (type === 'csv') {
        await exportService.exportClientsCSV(filters);
      } else if (type === 'json') {
        await exportService.exportClientsJSON(filters);
      }
      
      alert(`✅ Datos exportados exitosamente en formato ${type.toUpperCase()}`);
    } catch (error) {
      console.error('Error en exportación:', error);
      alert(`❌ Error al exportar datos: ${error.message}`);
    } finally {
      setIsExporting(false);
      setExportType('');
    }
  };

  // Funciones para manejar modales
  const handleViewClient = (client) => {
    setSelectedClient(client);
    setShowViewModal(true);
  };

  const handleEditClient = (client) => {
    console.log('🔧 CommercialManager - Editando cliente:', {
      id: client.id,
      name: client.name,
      priority: client.priority,
      status: client.status
    });
    setSelectedClient(client);
    setShowEditModal(true);
  };

  const handleCreateClient = () => {
    setSelectedClient(null);
    setShowCreateModal(true);
  };

  const handleCloseModals = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setShowCreateModal(false);
    // No resetear selectedClient aquí para mantener el clientId disponible
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedClient(null); // Resetear solo cuando se cierre el modal de edición
  };

  // Callbacks para modales de éxito
  const handleCreateSuccess = (data) => {
    setSuccessClientData(data);
    setIsEditSuccess(false);
    setShowSuccessModal(true);
  };

  const handleEditSuccess = (data) => {
    setSuccessClientData(data);
    setIsEditSuccess(true);
    setShowSuccessModal(true);
  };

  if (isLoading) {
    return (
      <Container fluid className="py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Error al cargar los datos</Alert.Heading>
          <p>{error.message}</p>
          <Button variant="outline-danger" onClick={() => refetch()}>
            Reintentar
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <RequireRole roles={['admin', 'comercial']}>
      <div className="commercial-manager">
        <Container fluid className="py-4">
          {/* Header */}
          <Row className="mb-4">
            <Col>
              <div className="excel-header">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="excel-title">
                      <FiUsers className="me-2" />
                      Panel de Gestión Comercial
                    </h2>
                    <p className="excel-subtitle">
                      Vista completa de todos los clientes y su información de seguimiento
                    </p>
                  </div>
                  <div className="d-flex gap-2">
                    <Button variant="success" onClick={handleCreateClient}>
                      <FiUser className="me-1" />
                      Crear Cliente
                    </Button>
                    <Dropdown>
                      <Dropdown.Toggle 
                        variant="outline-primary" 
                        disabled={isExporting}
                        className="d-flex align-items-center"
                      >
                        {isExporting ? (
                          <>
                            <Spinner size="sm" className="me-1" />
                            Exportando {exportType?.toUpperCase()}...
                          </>
                        ) : (
                          <>
                            <FiDownload className="me-1" />
                            Exportar
                            <FiChevronDown className="ms-1" />
                          </>
                        )}
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => handleExport('csv')} disabled={isExporting}>
                          <FiFileText className="me-2" />
                          Exportar CSV
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleExport('json')} disabled={isExporting}>
                          <FiDatabase className="me-2" />
                          Exportar JSON
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                    <Button variant="primary" onClick={() => refetch()} disabled={isExporting}>
                      <FiRefreshCw className="me-1" />
                      Actualizar
                    </Button>
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          {/* Estadísticas */}
          <Row className="mb-4">
            <Col md={3}>
              <div className="stat-card">
                <div className="stat-icon text-primary">
                  <FiUsers size={24} />
                </div>
                <h4 className="stat-number text-primary">{stats.total}</h4>
                <p className="stat-label">Total Clientes</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="stat-card">
                <div className="stat-icon text-warning">
                  <FiTrendingUp size={24} />
                </div>
                <h4 className="stat-number text-warning">{stats.byPriority.urgent || 0}</h4>
                <p className="stat-label">Urgentes</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="stat-card">
                <div className="stat-icon text-success">
                  <FiDollarSign size={24} />
                </div>
                <h4 className="stat-number text-success">{stats.byStatus.ganado || 0}</h4>
                <p className="stat-label">Ganados</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="stat-card">
                <div className="stat-icon text-info">
                  <FiActivity size={24} />
                </div>
                <h4 className="stat-number text-info">{stats.byStatus.prospeccion || 0}</h4>
                <p className="stat-label">En Prospección</p>
              </div>
            </Col>
          </Row>

          {/* Filtros */}
          <div className="excel-filters">
            <div className="filter-row">
              <div className="filter-group">
                <div className="filter-label">Buscar</div>
                <InputGroup>
                  <InputGroup.Text><FiSearch /></InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Buscar cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="filter-input"
                  />
                </InputGroup>
              </div>
              <div className="filter-group">
                <div className="filter-label">Estado</div>
                <Form.Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="filter-input"
                >
                  <option value="">Todos los estados</option>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </Form.Select>
              </div>
              <div className="filter-group">
                <div className="filter-label">Prioridad</div>
                <Form.Select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="filter-input"
                >
                  <option value="">Todas las prioridades</option>
                  {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </Form.Select>
              </div>
              <div className="filter-group">
                <div className="filter-label">Sector</div>
                <Form.Select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="filter-input"
                >
                  <option value="">Todos los sectores</option>
                  {Object.keys(stats.bySector).map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </Form.Select>
              </div>
              <div className="filter-group">
                <div className="filter-label">&nbsp;</div>
                <Button variant="outline-secondary" onClick={clearFilters} className="filter-input">
                  <FiFilter className="me-1" />
                  Limpiar
                </Button>
              </div>
            </div>
          </div>

          {/* Tabla de clientes */}
          <div className="excel-table-container">
            <div className="excel-table-header">
              <div className="d-flex justify-content-between align-items-center w-100">
                <h5 className="excel-table-title">Lista de Clientes</h5>
                <small className="excel-table-count">
                  Mostrando {clients.length} de {totalClients} clientes
                </small>
              </div>
            </div>
            <div className="table-responsive">
              <Table className="excel-table">
                <thead>
                  <tr>
                    <th 
                      className={`sortable ${sortBy === 'name' ? (sortOrder === 'asc' ? 'sort-asc' : 'sort-desc') : ''}`}
                      onClick={() => handleSort('name')}
                    >
                      Cliente
                    </th>
                    <th>Contacto</th>
                    <th 
                      className={`sortable ${sortBy === 'status' ? (sortOrder === 'asc' ? 'sort-asc' : 'sort-desc') : ''}`}
                      onClick={() => handleSort('status')}
                    >
                      Estado
                    </th>
                    <th>Prioridad</th>
                    <th>Sector</th>
                    <th>Actividad</th>
                    <th>Servicios</th>
                    <th 
                      className={`sortable ${sortBy === 'created_at' ? (sortOrder === 'asc' ? 'sort-asc' : 'sort-desc') : ''}`}
                      onClick={() => handleSort('created_at')}
                    >
                      Fecha Creación
                    </th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => {
                    const priority = client.priority || 'normal'; // Usar el campo priority de la base de datos
                    const cleanSector = cleanSectorForDisplay(client.sector);
                    const priorityConfig = PRIORITY_CONFIG[priority];
                    const statusConfig = STATUS_CONFIG[client.status];
                    
                    return (
                      <tr key={client.id}>
                        <td>
                          <div className="cell-client">
                            <div>{client.name}</div>
                            <small className="text-muted">
                              {client.ruc && `RUC: ${client.ruc}`}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div className="cell-contact">
                            <div className="cell-contact-item">
                              <FiUser className="cell-contact-icon" />
                              {client.contact_name || 'Sin contacto'}
                            </div>
                            {client.email && (
                              <div className="cell-contact-item">
                                <FiMail className="cell-contact-icon" />
                                <small className="text-muted">{client.email}</small>
                              </div>
                            )}
                            {client.phone && (
                              <div className="cell-contact-item">
                                <FiPhone className="cell-contact-icon" />
                                <small className="text-muted">{client.phone}</small>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`cell-status status-${client.status}`}>
                            {statusConfig?.label || client.status}
                          </span>
                        </td>
                        <td>
                          <span className={`cell-priority priority-${priority}`}>
                            {priorityConfig?.icon && <priorityConfig.icon className="cell-priority-icon" />}
                            {priorityConfig?.label || priority}
                          </span>
                        </td>
                        <td>
                          <div className="cell-sector">
                            <div>{cleanSector}</div>
                            {client.city && (
                              <div className="cell-sector-location">
                                <FiMapPin className="cell-contact-icon" />
                                {client.city}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="cell-activity">
                            {client.actividad ? (
                              <div className="cell-activity-content">
                                <div className="cell-activity-text" title={client.actividad}>
                                  {client.actividad.length > 50 
                                    ? `${client.actividad.substring(0, 50)}...` 
                                    : client.actividad
                                  }
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted">Sin especificar</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="cell-services">
                            {client.servicios ? (
                              <div className="cell-services-content">
                                <div className="cell-services-text" title={client.servicios}>
                                  {client.servicios.length > 50 
                                    ? `${client.servicios.substring(0, 50)}...` 
                                    : client.servicios
                                  }
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted">Sin especificar</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="cell-date">
                            <FiCalendar className="cell-date-icon" />
                            {new Date(client.created_at).toLocaleDateString('es-ES')}
                          </div>
                        </td>
                        <td>
                          <div className="cell-actions">
                            <button
                              className="cell-action-btn"
                              title="Ver historial y comentarios"
                              onClick={() => handleViewClient(client)}
                            >
                              <FiEye className="cell-action-icon" />
                            </button>
                            <button
                              className="cell-action-btn"
                              title="Editar cliente"
                              onClick={() => handleEditClient(client)}
                            >
                              <FiUser className="cell-action-icon" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
            <div className="excel-pagination">
              <div className="d-flex justify-content-between align-items-center w-100">
                <small className="text-muted">
                  Página {currentPage} de {totalPages}
                </small>
                <div className="d-flex gap-2">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </button>
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Container>
        
        {/* Modal de Vista de Cliente */}
        {showViewModal && selectedClient && (
          <ClientHistoryModal
            show={showViewModal}
            onHide={handleCloseModals}
            clientId={selectedClient.id}
            clientName={selectedClient.name}
          />
        )}
        
        {/* Modal de Edición de Cliente */}
        {showEditModal && selectedClient && (
          <ClientEditModal
            show={showEditModal}
            onHide={handleCloseEditModal}
            clientId={selectedClient.id}
            clientName={selectedClient.name}
            onSuccess={handleEditSuccess}
          />
        )}
        
        {/* Modal de Crear Cliente */}
        {showCreateModal && (
          <ClientCreateModal
            show={showCreateModal}
            onHide={handleCloseModals}
            onSuccess={handleCreateSuccess}
          />
        )}

        {/* Modal de Éxito */}
        <ClientSuccessModal
          show={showSuccessModal}
          onHide={() => setShowSuccessModal(false)}
          clientData={successClientData}
          isEdit={isEditSuccess}
        />
      </div>
    </RequireRole>
  );
};

export default CommercialManager;
