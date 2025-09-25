import React, { useMemo, useState } from 'react';
import { 
  Card, 
  Badge, 
  Button, 
  Row, 
  Col, 
  Form, 
  InputGroup, 
  Spinner, 
  Alert,
  Dropdown,
  ButtonGroup
} from 'react-bootstrap';
import { 
  FiActivity, 
  FiUser, 
  FiClock, 
  FiFilter, 
  FiDownload, 
  FiRefreshCw,
  FiEye,
  FiSearch,
  FiCalendar,
  FiUsers,
  FiSettings,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiBarChart
} from 'react-icons/fi';
import { useQuery } from 'react-query';
import { listAudit } from '../services/audit';
import { getUsersForAudit } from '../services/users';
import { useAuditStats } from '../hooks/useAuditStats';
import { exportAuditToExcel, exportAuditToPDF, exportAuditToCSV, downloadFile } from '../services/auditExport';
import { editAuditRecord, deleteAuditRecord, deleteBulkAuditRecords, archiveAuditRecords } from '../services/auditActions';
import PageHeader from '../components/common/PageHeader';
import AuditAdvancedFilters from '../components/AuditAdvancedFilters';
import AuditDetailModal from '../components/AuditDetailModal';
import AuditBulkActions from '../components/AuditBulkActions';
import AuditAnalytics from '../components/AuditAnalytics';
import AuditCleanup from '../components/AuditCleanup';

export default function Auditoria() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    action: 'all',
    user: 'all',
    dateRange: 'all',
    dateStart: '',
    dateEnd: '',
    timeStart: '',
    timeEnd: ''
  });

  const { data, isLoading, refetch, isFetching } = useQuery(['audit', { page, limit, searchQuery, actionFilter, userFilter, dateFilter, filters }], async () => {
    // Construir parámetros de filtro
    const queryParams = {
      page,
      limit,
      search: searchQuery,
      action: actionFilter !== 'all' ? actionFilter : undefined,
      user: userFilter !== 'all' ? userFilter : undefined,
      date: dateFilter !== 'all' ? dateFilter : undefined,
      // Filtros avanzados
      dateStart: filters.dateStart,
      dateEnd: filters.dateEnd,
      timeStart: filters.timeStart,
      timeEnd: filters.timeEnd
    };
    
    // Remover parámetros undefined
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined || queryParams[key] === '') {
        delete queryParams[key];
      }
    });
    
    const resp = await listAudit(queryParams);
    const rows = Array.isArray(resp?.data) ? resp.data : (resp?.rows || resp || []);
    const total = Number(resp?.total || rows.length || 0);
    return { rows, total };
  }, { 
    keepPreviousData: true,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Obtener usuarios para mapeo de nombres
  const { data: usersData } = useQuery(['users-for-audit'], getUsersForAudit, {
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
  });

  // Obtener estadísticas globales
  const { data: globalStats } = useAuditStats();

  // Función para obtener el icono según la acción
  const getActionIcon = (action) => {
    switch (action) {
      case 'crear':
      case 'create':
        return <FiPlus className="text-success" />;
      case 'actualizar':
      case 'update':
        return <FiEdit className="text-primary" />;
      case 'eliminar':
      case 'delete':
        return <FiTrash2 className="text-danger" />;
      case 'login':
        return <FiUser className="text-info" />;
      case 'logout':
        return <FiUser className="text-secondary" />;
      case 'actualizar_estado':
        return <FiSettings className="text-warning" />;
      case 'actualizar_categorias':
        return <FiSettings className="text-info" />;
      case 'marcar_proyecto':
        return <FiCheckCircle className="text-primary" />;
      case 'exportar':
        return <FiDownload className="text-success" />;
      case 'importar':
        return <FiPlus className="text-info" />;
      case 'configurar':
        return <FiSettings className="text-warning" />;
      case 'asignar':
        return <FiUser className="text-primary" />;
      case 'desasignar':
        return <FiXCircle className="text-secondary" />;
      default:
        return <FiActivity className="text-muted" />;
    }
  };

  // Función para convertir acción a tercera persona
  const formatActionThirdPerson = (action) => {
    const actionMap = {
      'crear': 'creó',
      'create': 'creó',
      'actualizar': 'actualizó',
      'update': 'actualizó',
      'eliminar': 'eliminó',
      'delete': 'eliminó',
      'login': 'inició sesión',
      'logout': 'cerró sesión',
      'actualizar_estado': 'actualizó el estado',
      'actualizar_categorias': 'actualizó las categorías',
      'marcar_proyecto': 'marcó el proyecto',
      'exportar': 'exportó',
      'importar': 'importó',
      'configurar': 'configuró',
      'asignar': 'asignó',
      'desasignar': 'desasignó'
    };
    return actionMap[action] || action;
  };

  // Función para obtener nombre de usuario real
  const getUserDisplayName = (userData) => {
    // Si ya tenemos un nombre completo, lo usamos
    if (userData.user_name && userData.user_name !== userData.user_id) {
      return userData.user_name;
    }
    
    // Si tenemos performed_by, lo usamos
    if (userData.performed_by) {
      return userData.performed_by;
    }
    
    // Si tenemos user_id, intentamos mapearlo con los usuarios reales
    if (userData.user_id && usersData) {
      const user = usersData.find(u => u.id === userData.user_id);
      if (user) {
        return user.name || user.full_name || user.username || `Usuario ${userData.user_id}`;
      }
    }
    
    // Fallback a mapeo estático si no hay datos de usuarios
    if (userData.user_id && typeof userData.user_id === 'number') {
      const userMap = {
        1: 'Administrador',
        2: 'Jefe de Laboratorio',
        3: 'Jefa Comercial',
        4: 'Gerencia',
        5: 'Sistemas',
        6: 'Admin',
        7: 'Usuario',
        8: 'Operador'
      };
      return userMap[userData.user_id] || `Usuario ${userData.user_id}`;
    }
    
    return 'Sistema';
  };

  // Función para obtener el color del badge según la acción
  const getActionBadgeColor = (action) => {
    switch (action) {
      case 'crear':
      case 'create':
        return 'success';
      case 'actualizar':
      case 'update':
        return 'primary';
      case 'eliminar':
      case 'delete':
        return 'danger';
      case 'login':
        return 'info';
      case 'logout':
        return 'dark';
      case 'actualizar_estado':
        return 'warning';
      case 'actualizar_categorias':
        return 'info';
      case 'marcar_proyecto':
        return 'primary';
      case 'exportar':
        return 'success';
      case 'importar':
        return 'info';
      case 'configurar':
        return 'warning';
      case 'asignar':
        return 'primary';
      case 'desasignar':
        return 'secondary';
      default:
        return 'dark';
    }
  };

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Función para obtener acciones únicas para el filtro
  const uniqueActions = useMemo(() => {
    const actions = [...new Set(data?.rows?.map(row => row.action) || [])];
    return actions.sort();
  }, [data?.rows]);

  // Función para obtener usuarios únicos para el filtro
  const uniqueUsers = useMemo(() => {
    const users = [...new Set(data?.rows?.map(row => row.user_name || row.performed_by || row.user_id) || [])];
    return users.sort();
  }, [data?.rows]);

  const total = data?.total || 0;
  const rows = data?.rows || [];
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Usar estadísticas globales para las cards
  const globalTotal = globalStats?.total || 0;
  const globalUniqueUsers = globalStats?.uniqueUsers || 0;
  const globalUniqueActions = globalStats?.uniqueActions || 0;

  // Función para limpiar filtros
  const clearFilters = () => {
    setSearchQuery('');
    setActionFilter('all');
    setUserFilter('all');
    setDateFilter('all');
  };

  // Función para exportar datos (versión simple)
  const handleSimpleExport = () => {
    // Implementar exportación de datos
    console.log('Exportando datos de auditoría...');
  };

  // Función para actualizar todos los datos
  const handleRefreshAll = () => {
    refetch(); // Actualizar datos de auditoría
    // Los datos globales se actualizarán automáticamente por el hook
  };

  // Función para manejar filtros avanzados
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setSearchQuery(newFilters.search || '');
    setActionFilter(newFilters.action || 'all');
    setUserFilter(newFilters.user || 'all');
    setDateFilter(newFilters.dateRange || 'all');
  };

  // Función para limpiar filtros
  const handleClearFilters = () => {
    setFilters({
      search: '',
      action: 'all',
      user: 'all',
      dateRange: 'all',
      dateStart: '',
      dateEnd: '',
      timeStart: '',
      timeEnd: ''
    });
    setSearchQuery('');
    setActionFilter('all');
    setUserFilter('all');
    setDateFilter('all');
  };

  // Función para exportar datos
  const handleExport = async (format = 'excel') => {
    try {
      let blob;
      const currentFilters = {
        search: searchQuery,
        action: actionFilter,
        user: userFilter,
        date: dateFilter,
        ...filters
      };

      switch (format) {
        case 'excel':
          blob = await exportAuditToExcel(currentFilters);
          downloadFile(blob, `auditoria_${new Date().toISOString().split('T')[0]}.xlsx`);
          break;
        case 'pdf':
          blob = await exportAuditToPDF(currentFilters);
          downloadFile(blob, `auditoria_${new Date().toISOString().split('T')[0]}.pdf`);
          break;
        case 'csv':
          blob = await exportAuditToCSV(currentFilters);
          downloadFile(blob, `auditoria_${new Date().toISOString().split('T')[0]}.csv`);
          break;
      }
    } catch (error) {
      console.error('Error al exportar:', error);
    }
  };

  // Función para mostrar detalles
  const handleShowDetails = (record) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  // Función para seleccionar elementos
  const handleSelectItem = (item, isSelected) => {
    if (isSelected) {
      setSelectedItems(prev => [...prev, item]);
    } else {
      setSelectedItems(prev => prev.filter(i => i.id !== item.id));
    }
  };

  // Función para seleccionar todos
  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedItems(rows);
    } else {
      setSelectedItems([]);
    }
  };

  // Función para acciones masivas
  const handleBulkExport = async (items) => {
    try {
      const blob = await exportAuditToExcel({ selectedIds: items.map(i => i.id) });
      downloadFile(blob, `auditoria_seleccionados_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error en exportación masiva:', error);
    }
  };

  const handleBulkDelete = async (items) => {
    if (window.confirm(`¿Estás seguro de eliminar ${items.length} registros? Esta acción no se puede deshacer.`)) {
      try {
        const ids = items.map(item => item.id);
        await deleteBulkAuditRecords(ids);
        refetch(); // Actualizar la lista
        setSelectedItems([]); // Limpiar selección
      } catch (error) {
        console.error('Error eliminando elementos:', error);
      }
    }
  };

  const handleBulkArchive = async (items) => {
    try {
      const ids = items.map(item => item.id);
      await archiveAuditRecords(ids);
      refetch(); // Actualizar la lista
      setSelectedItems([]); // Limpiar selección
    } catch (error) {
      console.error('Error archivando elementos:', error);
    }
  };

  // Función para editar registro
  const handleEditRecord = async (record, newData) => {
    try {
      await editAuditRecord(record.id, newData);
      refetch(); // Actualizar la lista
      setShowDetailModal(false); // Cerrar modal
    } catch (error) {
      console.error('Error editando registro:', error);
    }
  };

  // Función para eliminar registro
  const handleDeleteRecord = async (record) => {
    if (window.confirm(`¿Estás seguro de eliminar el registro #${record.id}?`)) {
      try {
        await deleteAuditRecord(record.id);
        refetch(); // Actualizar la lista
        setShowDetailModal(false); // Cerrar modal
      } catch (error) {
        console.error('Error eliminando registro:', error);
      }
    }
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Auditoría del Sistema"
        subtitle="Registro completo de actividades y acciones del sistema"
        icon={FiActivity}
        actions={
          <div className="d-flex gap-2">
            <Dropdown>
              <Dropdown.Toggle variant="outline-success" size="sm">
                <FiDownload className="me-1" />
                Exportar
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleExport('excel')}>
                  <FiDownload className="me-2" />
                  Excel (.xlsx)
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleExport('pdf')}>
                  <FiDownload className="me-2" />
                  PDF
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleExport('csv')}>
                  <FiDownload className="me-2" />
                  CSV
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            
            <Button 
              variant="outline-info" 
              size="sm"
              onClick={() => setShowAnalytics(!showAnalytics)}
            >
              <FiBarChart className="me-1" />
              {showAnalytics ? 'Ocultar' : 'Analytics'}
            </Button>
            
            <Button 
              variant="outline-primary" 
              onClick={handleRefreshAll}
              disabled={isFetching}
            >
              {isFetching ? (
                <>
                  <Spinner animation="border" size="sm" className="me-1" />
                  Actualizando...
                </>
              ) : (
                <>
                  <FiRefreshCw className="me-1" />
                  Actualizar
                </>
              )}
            </Button>
          </div>
        }
      />

      {/* Analytics */}
      {showAnalytics && (
        <div className="mb-4">
          <AuditAnalytics 
            analyticsData={globalStats}
            isLoading={!globalStats}
          />
        </div>
      )}

      {/* Limpieza Automática */}
      <AuditCleanup />

      {/* Filtros Avanzados */}
      <AuditAdvancedFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        uniqueUsers={uniqueUsers}
        uniqueActions={uniqueActions}
      />

      {/* Acciones Masivas */}
      <AuditBulkActions
        selectedItems={selectedItems}
        onBulkExport={handleBulkExport}
        onBulkDelete={handleBulkDelete}
        onBulkArchive={handleBulkArchive}
        onClearSelection={() => setSelectedItems([])}
      />

      {/* Estadísticas rápidas */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center border-primary">
            <Card.Body>
              <FiActivity className="text-primary mb-2" size={24} />
              <h5 className="mb-1">{globalTotal}</h5>
              <small className="text-muted">Total de Acciones</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-success">
            <Card.Body>
              <FiUsers className="text-success mb-2" size={24} />
              <h5 className="mb-1">{globalUniqueUsers}</h5>
              <small className="text-muted">Usuarios Activos</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-info">
            <Card.Body>
              <FiSettings className="text-info mb-2" size={24} />
              <h5 className="mb-1">{globalUniqueActions}</h5>
              <small className="text-muted">Tipos de Acciones</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-warning">
            <Card.Body>
              <FiClock className="text-warning mb-2" size={24} />
              <h5 className="mb-1">{Math.ceil(total / limit)}</h5>
              <small className="text-muted">Páginas</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtros y búsqueda */}
      <Card className="mb-4">
        <Card.Header>
          <h6 className="mb-0">
            <FiFilter className="me-2" />
            Filtros y Búsqueda
          </h6>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Buscar en auditoría:</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FiSearch />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Buscar por acción, usuario, notas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Tipo de acción:</Form.Label>
                <Form.Select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                >
                  <option value="all">Todas las acciones</option>
                  {uniqueActions.map(action => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Usuario:</Form.Label>
                <Form.Select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                >
                  <option value="all">Todos los usuarios</option>
                  {uniqueUsers.map(user => (
                    <option key={user} value={user}>
                      {user}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Fecha:</Form.Label>
                <Form.Select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option value="all">Todas las fechas</option>
                  <option value="today">Hoy</option>
                  <option value="week">Esta semana</option>
                  <option value="month">Este mes</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <ButtonGroup className="w-100">
                <Button variant="outline-secondary" onClick={clearFilters}>
                  <FiFilter className="me-1" />
                  Limpiar
                </Button>
                <Button variant="outline-primary" onClick={() => refetch()}>
                  <FiRefreshCw className="me-1" />
                  Actualizar
                </Button>
              </ButtonGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabla de auditoría */}
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <FiActivity className="me-2" />
            Registro de Actividades
            <Badge bg="info" className="ms-2">
              {rows.length} de {total} registros
            </Badge>
          </h6>
          <div>
            <Button variant="outline-success" size="sm" onClick={handleExport}>
              <FiDownload className="me-1" />
              Exportar
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {isLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Cargando registros de auditoría...</p>
            </div>
          ) : rows.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th width="5%">
                      <Form.Check
                        type="checkbox"
                        checked={selectedItems.length === rows.length && rows.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
                    <th width="8%">ID</th>
                    <th width="20%">Acción</th>
                    <th width="15%">Usuario</th>
                    <th width="20%">Fecha y Hora</th>
                    <th width="25%">Notas</th>
                    <th width="12%">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedItems.some(item => item.id === row.id)}
                          onChange={(e) => handleSelectItem(row, e.target.checked)}
                        />
                      </td>
                      <td>
                        <Badge bg="secondary" className="fs-6">
                          #{row.id}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          {getActionIcon(row.action)}
                          <Badge 
                            bg={getActionBadgeColor(row.action)} 
                            className="ms-2 fs-6"
                          >
                            {formatActionThirdPerson(row.action)}
                          </Badge>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FiUser className="me-2 text-muted" />
                          <span className="fw-medium">
                            {getUserDisplayName(row)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FiClock className="me-2 text-muted" />
                          <small className="text-muted">
                            {formatDate(row.performed_at || row.created_at)}
                          </small>
                        </div>
                      </td>
                      <td>
                        <span className="text-muted">
                          {row.notes || 'Sin notas adicionales'}
                        </span>
                      </td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleShowDetails(row)}
                        >
                          <FiEye className="me-1" />
                          Ver
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <FiActivity size={48} className="text-muted mb-3" />
              <h6 className="text-muted">No hay registros de auditoría</h6>
              <p className="text-muted small">
                {searchQuery || actionFilter !== 'all' || userFilter !== 'all' || dateFilter !== 'all'
                  ? 'No se encontraron registros con los filtros aplicados.'
                  : 'Los registros de auditoría aparecerán aquí cuando se realicen acciones en el sistema.'
                }
              </p>
              {(searchQuery || actionFilter !== 'all' || userFilter !== 'all' || dateFilter !== 'all') && (
                <Button variant="outline-primary" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Paginación */}
      {totalPages > 1 && (
        <Card className="mt-3">
          <Card.Body className="py-2">
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-muted">
                Mostrando {((page - 1) * limit) + 1} a {Math.min(page * limit, total)} de {total} registros
              </div>
              <div className="btn-group">
                <Button 
                  variant="outline-secondary" 
                  disabled={page <= 1 || isLoading}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Anterior
                </Button>
                <Button variant="outline-secondary" disabled>
                  {page} de {totalPages}
                </Button>
                <Button 
                  variant="outline-secondary" 
                  disabled={page >= totalPages || isLoading}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Modal de Detalles */}
      <AuditDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        auditRecord={selectedRecord}
        onExport={(record) => handleExport('excel')}
        onEdit={handleEditRecord}
        onDelete={handleDeleteRecord}
      />
    </div>
  );
}
