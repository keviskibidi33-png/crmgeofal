import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Dropdown, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { FiMenu, FiBell, FiUser, FiLogOut, FiSettings, FiCheck, FiX, FiWifi, FiWifiOff } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { getNotifications, getNotificationStats, markNotificationAsRead, markAllNotificationsAsRead } from '../services/notifications';
import { useSocket, useSocketNotification } from '../hooks/useSocket';

const Header = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [realTimeNotifications, setRealTimeNotifications] = useState([]);
  const [realTimeUnreadCount, setRealTimeUnreadCount] = useState(0);

  // WebSocket connection
  const { isConnected, connectionError } = useSocket();

  // Obtener notificaciones del usuario (solo carga inicial)
  const { data: notificationsData, isLoading: notificationsLoading } = useQuery(
    ['notifications', user?.id],
    () => getNotifications({ limit: 5, unreadOnly: false }),
    {
      enabled: !!user,
      refetchInterval: false, // ❌ Deshabilitado: ya no necesitamos polling
      staleTime: Infinity, // Los datos se actualizan via WebSocket
      onSuccess: (data) => {
        setRealTimeNotifications(data.notifications || []);
        setRealTimeUnreadCount(data.unreadCount || 0);
      }
    }
  );

  // Obtener estadísticas de notificaciones (solo carga inicial)
  const { data: statsData } = useQuery(
    ['notificationStats', user?.id],
    getNotificationStats,
    {
      enabled: !!user,
      refetchInterval: false, // ❌ Deshabilitado: ya no necesitamos polling
      staleTime: Infinity,
      onSuccess: (data) => {
        setRealTimeUnreadCount(data.unreadCount || 0);
      }
    }
  );

  // WebSocket listeners para notificaciones en tiempo real
  useSocketNotification(
    // Nueva notificación recibida
    (notification) => {
      console.log('Nueva notificación en tiempo real:', notification);
      setRealTimeNotifications(prev => [notification, ...prev.slice(0, 4)]);
      setRealTimeUnreadCount(prev => prev + 1);
      
      // Invalidar queries para sincronizar datos
      queryClient.invalidateQueries(['notifications', user?.id]);
      queryClient.invalidateQueries(['notificationStats', user?.id]);
    },
    // Actualización de contador
    (data) => {
      console.log('Actualización de contador en tiempo real:', data);
      setRealTimeUnreadCount(data.count);
    }
  );

  // Mutaciones para marcar notificaciones
  const markAsReadMutation = useMutation(markNotificationAsRead, {
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications', user?.id]);
      queryClient.invalidateQueries(['notificationStats', user?.id]);
    }
  });

  const markAllAsReadMutation = useMutation(markAllNotificationsAsRead, {
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications', user?.id]);
      queryClient.invalidateQueries(['notificationStats', user?.id]);
    }
  });

  const handleLogout = () => {
    logout();
  };

  const handleProfileClick = () => {
    navigate('/ajustes');
  };

  const handleSettingsClick = () => {
    navigate('/ajustes');
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read_at) {
      markAsReadMutation.mutate(notification.id);
    }
    
    // Navegar según el tipo de notificación
    if (notification.data) {
      const data = typeof notification.data === 'string' ? JSON.parse(notification.data) : notification.data;
      if (data.projectId) navigate(`/proyectos`);
      if (data.quoteId) navigate(`/cotizaciones`);
      if (data.ticketId) navigate(`/tickets`);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const formatNotificationTime = (createdAt) => {
    const now = new Date();
    const notificationTime = new Date(createdAt);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} h`;
    return `Hace ${Math.floor(diffInMinutes / 1440)} días`;
  };

  const getNotificationIcon = (type) => {
    const icons = {
      quote_assigned: '📄',
      quote_approved: '✅',
      quote_rejected: '❌',
      quote_completed: '🎉',
      project_assigned: '🏠',
      project_started: '🚀',
      project_completed: '✅',
      project_delayed: '⏰',
      ticket_created: '🎫',
      ticket_assigned: '👤',
      ticket_resolved: '✅',
      ticket_escalated: '⚠️',
      evidence_uploaded: '📎',
      evidence_approved: '✅',
      evidence_rejected: '❌',
      user_assigned: '👥',
      user_role_changed: '🔄',
      system_maintenance: '🔧',
      system_update: '🆕'
    };
    return icons[type] || '🔔';
  };

  // Usar datos en tiempo real o fallback a datos de la query
  const notifications = realTimeNotifications.length > 0 ? realTimeNotifications : (notificationsData?.notifications || []);
  const unreadCount = realTimeUnreadCount > 0 ? realTimeUnreadCount : (statsData?.unreadCount || 0);

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'danger',
      jefa_comercial: 'warning',
      vendedor_comercial: 'primary',
      jefe_laboratorio: 'info',
      usuario_laboratorio: 'info',
      laboratorio: 'info',
      soporte: 'secondary',
      gerencia: 'dark',
      default: 'secondary'
    };
    return colors[role] || colors.default;
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Administrador',
      jefa_comercial: 'Jefa Comercial',
      vendedor_comercial: 'Vendedor Comercial',
      jefe_laboratorio: 'Jefe Laboratorio',
      usuario_laboratorio: 'Usuario Laboratorio',
      laboratorio: 'Laboratorio',
      soporte: 'Soporte Técnico',
      gerencia: 'Gerencia',
      default: role
    };
    return labels[role] || labels.default;
  };

  return (
    <Navbar bg="white" expand="lg" className="main-header border-bottom shadow-sm">
      <div className="container-fluid">
        {/* Botón del menú para móvil */}
        <Button
          variant="outline-secondary"
          className="d-lg-none me-3"
          onClick={onToggleSidebar}
        >
          <FiMenu />
        </Button>

        {/* Logo */}
        <Navbar.Brand href="/" className="fw-bold text-primary">
          <span className="text-gradient">CRMGeoFal</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            {/* Indicador de conexión WebSocket */}
            <div className="me-3 d-flex align-items-center">
              {isConnected ? (
                <FiWifi className="text-success" size={16} title="Conectado en tiempo real" />
              ) : (
                <FiWifiOff className="text-warning" size={16} title="Modo offline - notificaciones limitadas" />
              )}
            </div>

            {/* Notificaciones */}
            <Dropdown className="me-3">
              <Dropdown.Toggle variant="outline-secondary" size="sm" className="position-relative">
                <FiBell size={18} />
                {unreadCount > 0 && (
                  <Badge 
                    bg="danger" 
                    className="position-absolute top-0 start-100 translate-middle rounded-pill"
                    style={{ fontSize: '0.6rem' }}
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Dropdown.Toggle>
              <Dropdown.Menu align="end" className="shadow" style={{ minWidth: '320px' }}>
                <Dropdown.Header className="d-flex justify-content-between align-items-center">
                  <span>Notificaciones</span>
                  {unreadCount > 0 && (
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 text-primary"
                      onClick={handleMarkAllAsRead}
                      disabled={markAllAsReadMutation.isLoading}
                    >
                      <FiCheck size={14} />
                    </Button>
                  )}
                </Dropdown.Header>
                
                {notificationsLoading ? (
                  <Dropdown.Item className="text-center">
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                    Cargando notificaciones...
                  </Dropdown.Item>
                ) : notifications.length === 0 ? (
                  <Dropdown.Item className="text-center text-muted">
                    No hay notificaciones
                  </Dropdown.Item>
                ) : (
                  <>
                    {notifications.slice(0, 5).map((notification) => (
                      <Dropdown.Item
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`${!notification.read_at ? 'bg-light' : ''}`}
                        style={{ cursor: 'pointer' }}
                      >
                  <div className="d-flex align-items-start">
                    <div className="me-2">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-1">
                              <span style={{ fontSize: '12px' }}>
                                {getNotificationIcon(notification.type)}
                              </span>
                      </div>
                    </div>
                          <div className="flex-grow-1">
                            <div className={`fw-medium ${!notification.read_at ? 'text-dark' : 'text-muted'}`}>
                              {notification.title}
                    </div>
                            <div className="text-muted small">
                              {notification.message}
                  </div>
                            <small className="text-muted">
                              {formatNotificationTime(notification.created_at)}
                            </small>
                      </div>
                          {!notification.read_at && (
                            <div className="ms-2">
                              <div className="bg-primary rounded-circle" style={{ width: '8px', height: '8px' }}></div>
                    </div>
                          )}
                  </div>
                </Dropdown.Item>
                    ))}
                <Dropdown.Divider />
                    <Dropdown.Item className="text-center text-primary" onClick={() => navigate('/notificaciones')}>
                  Ver todas las notificaciones
                </Dropdown.Item>
                  </>
                )}
              </Dropdown.Menu>
            </Dropdown>

            {/* Perfil de usuario */}
            {user && (
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" className="d-flex align-items-center">
                  <div className="me-2">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                      <FiUser size={16} className="text-primary" />
                    </div>
                  </div>
                  <div className="text-start d-none d-md-block">
                    <div className="fw-medium">{user.name}</div>
                    <Badge bg={getRoleBadgeColor(user.role)} className="status-badge">
                      {getRoleLabel(user.role)}
                    </Badge>
                  </div>
                </Dropdown.Toggle>
                <Dropdown.Menu align="end" className="shadow">
                  <Dropdown.Header>
                    <div className="fw-medium">{user.name}</div>
                    <small className="text-muted">{user.email}</small>
                    <div className="mt-1">
                      <Badge bg={getRoleBadgeColor(user.role)} className="status-badge">
                        {getRoleLabel(user.role)}
                      </Badge>
                    </div>
                  </Dropdown.Header>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleProfileClick}>
                    <FiUser className="me-2" />
                    Mi Perfil
                  </Dropdown.Item>
                  <Dropdown.Item onClick={handleSettingsClick}>
                    <FiSettings className="me-2" />
                    Configuración
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="text-danger">
                    <FiLogOut className="me-2" />
                    Cerrar Sesión
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
};

export default Header;
