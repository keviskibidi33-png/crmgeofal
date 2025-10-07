import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  FiClock, FiUser, FiActivity, FiFilter, FiSearch, 
  FiRefreshCw, FiEye, FiCalendar, FiTrendingUp,
  FiCheckCircle, FiAlertCircle, FiInfo, FiEdit3
} from 'react-icons/fi';
import { apiFetch } from '../services/api';
import './HistorialProyectos.css';

const HistorialProyectos = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const [projectId, setProjectId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // Obtener proyectos para el selector
  const { data: projectsData } = useQuery(
    'projects-list',
    () => apiFetch('/api/projects?limit=500'),
    { staleTime: 5 * 60 * 1000 }
  );

  // Obtener historial del proyecto
  const { data: historyData, isLoading, error } = useQuery(
    ['project-history', projectId, page, limit, searchTerm, filterAction, filterDate],
    () => getProjectHistory(projectId, { page, limit, search: searchTerm, action: filterAction, date: filterDate }),
    {
      enabled: !!projectId,
      keepPreviousData: true,
    }
  );

  const getProjectHistory = async (projectId, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page);
    if (params.limit) queryParams.set('limit', params.limit);
    if (params.search) queryParams.set('search', params.search);
    if (params.action && params.action !== 'all') queryParams.set('action', params.action);
    if (params.date && params.date !== 'all') queryParams.set('date', params.date);
    
    const queryString = queryParams.toString();
    const url = `/api/project-history/project/${projectId}${queryString ? `?${queryString}` : ''}`;
    
    return apiFetch(url);
  };

  const history = historyData?.data || [];
  const total = historyData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Acciones disponibles para filtro
  const actionTypes = [
    { value: 'all', label: 'Todas las acciones', icon: FiActivity },
    { value: 'created', label: 'Proyecto creado', icon: FiCheckCircle },
    { value: 'updated', label: 'Proyecto actualizado', icon: FiEdit3 },
    { value: 'status_changed', label: 'Estado cambiado', icon: FiTrendingUp },
    { value: 'assigned', label: 'Asignado', icon: FiUser },
    { value: 'completed', label: 'Completado', icon: FiCheckCircle },
    { value: 'cancelled', label: 'Cancelado', icon: FiAlertCircle },
  ];

  // Obtener icono según el tipo de acción
  const getActionIcon = (action) => {
    const actionType = actionTypes.find(type => type.value === action);
    return actionType ? actionType.icon : FiInfo;
  };

  // Obtener color según el tipo de acción
  const getActionColor = (action) => {
    const colors = {
      created: '#10b981',
      updated: '#3b82f6',
      status_changed: '#f59e0b',
      assigned: '#8b5cf6',
      completed: '#10b981',
      cancelled: '#ef4444',
    };
    return colors[action] || '#6b7280';
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-ES'),
      time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Obtener nombre del usuario
  const getUserName = (entry) => {
    if (entry.performed_by_name) {
      return entry.performed_by_name;
    }
    return `Usuario ${entry.performed_by}`;
  };

  const handleProjectChange = (newProjectId) => {
    setProjectId(newProjectId);
    setPage(1);
  };

  const handleSearch = () => {
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterAction('all');
    setFilterDate('all');
    setPage(1);
  };

  return (
    <div className="historial-proyectos">
      {/* Header */}
      <div className="historial-header">
        <div className="historial-title">
          <FiClock className="title-icon" />
          <div>
            <h1>Historial de Proyectos</h1>
            <p>Seguimiento completo de cambios y eventos en proyectos</p>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="historial-filters">
        <div className="filter-group">
          <label className="filter-label">Proyecto</label>
          <select 
            className="filter-select"
            value={projectId}
            onChange={(e) => handleProjectChange(e.target.value)}
          >
            <option value="">Seleccionar proyecto</option>
            {projectsData?.data?.map(project => (
              <option key={project.id} value={project.id}>
                #{project.id} - {project.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Buscar</label>
          <div className="search-input-group">
            <FiSearch className="search-icon" />
              <input
              type="text"
              className="search-input"
              placeholder="Buscar en historial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

        <div className="filter-group">
          <label className="filter-label">Acción</label>
          <select 
            className="filter-select"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
          >
            {actionTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Período</label>
          <select 
            className="filter-select"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          >
            <option value="all">Todos los períodos</option>
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="quarter">Este trimestre</option>
          </select>
        </div>

        <div className="filter-actions">
          <button 
            className="btn-search"
            onClick={handleSearch}
            disabled={!projectId}
          >
            <FiSearch />
            Buscar
          </button>
          <button 
            className="btn-clear"
            onClick={handleClearFilters}
          >
            <FiFilter />
            Limpiar
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      {!projectId ? (
        <div className="historial-empty">
          <FiActivity className="empty-icon" />
          <h3>Selecciona un proyecto</h3>
          <p>Elige un proyecto de la lista para ver su historial completo</p>
        </div>
      ) : isLoading ? (
        <div className="historial-loading">
          <FiRefreshCw className="loading-icon" />
          <p>Cargando historial...</p>
        </div>
      ) : error ? (
        <div className="historial-error">
          <FiAlertCircle className="error-icon" />
          <h3>Error al cargar historial</h3>
          <p>No se pudo obtener el historial del proyecto</p>
        </div>
      ) : history.length === 0 ? (
        <div className="historial-empty">
          <FiClock className="empty-icon" />
          <h3>Sin historial</h3>
          <p>Este proyecto no tiene registros en el historial</p>
        </div>
      ) : (
        <>
          {/* Estadísticas */}
          <div className="historial-stats">
            <div className="stat-card">
              <FiActivity className="stat-icon" />
              <div>
                <span className="stat-number">{total}</span>
                <span className="stat-label">Registros totales</span>
              </div>
            </div>
            <div className="stat-card">
              <FiCalendar className="stat-icon" />
              <div>
                <span className="stat-number">{history.length}</span>
                <span className="stat-label">En esta página</span>
              </div>
            </div>
          </div>

          {/* Lista de historial */}
          <div className="historial-list">
            {history.map((entry, index) => {
              const ActionIcon = getActionIcon(entry.action);
              const actionColor = getActionColor(entry.action);
              const { date, time } = formatDate(entry.performed_at);
              
              return (
                <div key={entry.id} className="historial-item">
                  <div className="historial-item-icon" style={{ backgroundColor: actionColor }}>
                    <ActionIcon />
                  </div>
                  <div className="historial-item-content">
                    <div className="historial-item-header">
                      <h4 className="historial-item-title">{entry.action.replace('_', ' ').toUpperCase()}</h4>
                      <div className="historial-item-meta">
                        <span className="historial-item-user">
                          <FiUser />
                          {getUserName(entry)}
                        </span>
                        <span className="historial-item-date">
                          <FiCalendar />
                          {date} a las {time}
                        </span>
                      </div>
                    </div>
                    {entry.notes && (
                      <div className="historial-item-notes">
                        <p>{entry.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="historial-pagination">
              <div className="pagination-info">
                Mostrando {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} de {total} registros
              </div>
              <div className="pagination-controls">
                <button 
                  className="pagination-btn"
                  onClick={() => setPage(p => p - 1)}
                  disabled={page <= 1}
                >
                  Anterior
                </button>
                <span className="pagination-page">
                  Página {page} de {totalPages}
                </span>
                <button 
                  className="pagination-btn"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= totalPages}
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HistorialProyectos;