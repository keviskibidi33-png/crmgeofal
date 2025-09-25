import React from 'react';
import { Card, Badge, Button, ListGroup, Spinner } from 'react-bootstrap';
import { 
  FiActivity, 
  FiUser, 
  FiClock, 
  FiEye,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSettings,
  FiCheckCircle,
  FiXCircle,
  FiDownload,
  FiRefreshCw
} from 'react-icons/fi';
import { useQuery } from 'react-query';
import { listAudit } from '../services/audit';
import { getUsersForAudit } from '../services/users';
import { Link } from 'react-router-dom';

export default function RecentActivities({ limit = 5, showViewAll = true }) {
  const { data, isLoading } = useQuery(['audit', { limit, page: 1 }], async () => {
    const resp = await listAudit({ page: 1, limit });
    const rows = Array.isArray(resp?.data) ? resp.data : (resp?.rows || resp || []);
    const total = Number(resp?.total || rows.length || 0);
    return { rows, total };
  }, {
    refetchOnWindowFocus: true, // Actualizar al enfocar la ventana
    refetchOnMount: true, // Actualizar al montar el componente
    staleTime: 1 * 60 * 1000, // 1 minuto
  });

  // Obtener usuarios para mapeo de nombres
  const { data: usersData } = useQuery(['users-for-audit'], getUsersForAudit, {
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
  });

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

  // Función para formatear la fecha relativa
  const formatRelativeTime = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Hace un momento';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
    
    return date.toLocaleDateString('es-ES');
  };

  const activities = data?.rows || [];

  return (
    <Card className="h-100 shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center py-2">
        <h6 className="mb-0">
          <FiActivity className="me-2 text-primary" />
          Actividades Recientes
        </h6>
        <div className="d-flex gap-1">
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={() => window.location.reload()}
            title="Actualizar"
          >
            <FiRefreshCw size={14} />
          </Button>
          {showViewAll && (
            <Button 
              variant="outline-primary" 
              size="sm"
              as={Link}
              to="/auditoria"
            >
              <FiEye className="me-1" size={14} />
              Ver todas
            </Button>
          )}
        </div>
      </Card.Header>
      <Card.Body className="p-0">
        {isLoading ? (
          <div className="text-center py-4">
            <Spinner animation="border" size="sm" className="text-primary" />
            <p className="mt-2 text-muted small">Cargando actividades...</p>
          </div>
        ) : activities.length > 0 ? (
          <ListGroup variant="flush">
            {activities.map((activity, index) => (
              <ListGroup.Item 
                key={activity.id} 
                className={`d-flex align-items-start py-2 px-3 ${index < activities.length - 1 ? 'border-bottom' : ''}`}
              >
                <div className="me-2 mt-1">
                  {getActionIcon(activity.action)}
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-1">
                    <Badge 
                      bg={getActionBadgeColor(activity.action)} 
                      className="me-2"
                      style={{ fontSize: '0.7rem' }}
                    >
                      {formatActionThirdPerson(activity.action)}
                    </Badge>
                    <small className="text-muted">
                      <FiClock className="me-1" size={12} />
                      {formatRelativeTime(activity.performed_at || activity.created_at)}
                    </small>
                  </div>
                  <div className="d-flex align-items-center">
                    <FiUser className="me-1 text-muted" size={12} />
                    <span className="fw-medium" style={{ fontSize: '0.8rem' }}>
                      {getUserDisplayName(activity)}
                    </span>
                  </div>
                  {activity.details && (
                    <div className="mt-1">
                      <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {activity.details.length > 40 
                          ? `${activity.details.substring(0, 40)}...`
                          : activity.details
                        }
                      </small>
                    </div>
                  )}
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <div className="text-center py-4">
            <FiActivity size={48} className="text-muted mb-3" />
            <h6 className="text-muted">No hay actividades recientes</h6>
            <p className="text-muted small mb-3">
              Aún no hay actividades registradas en el sistema.
            </p>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => window.location.reload()}
            >
              <FiRefreshCw className="me-1" size={14} />
              Actualizar
            </Button>
          </div>
        )}
      </Card.Body>
      {activities.length > 0 && (
        <Card.Footer className="text-center py-2">
          <small className="text-muted">
            Mostrando {activities.length} de {data?.total || 0} actividades
          </small>
        </Card.Footer>
      )}
    </Card>
  );
}
