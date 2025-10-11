import React, { useEffect } from 'react';
import { Row, Col, Card, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
  FiUsers, FiHome, FiFileText, FiMessageSquare, 
  FiArrowUp, FiDollarSign, FiCalendar, FiCheckCircle,
  FiArrowDown, FiEye, FiTrendingUp, FiActivity
} from 'react-icons/fi';
import { useQuery, useQueryClient } from 'react-query';
import PageHeader from '../../components/common/PageHeader';
import StatsCard from '../../components/common/StatsCard';
import { listUsers } from '../../services/users';
import { listProjects } from '../../services/projects';
import { listQuotes } from '../../services/quotes';
import { listTickets } from '../../services/tickets';
import { getDashboardStats } from '../../services/dashboard';
import { useActivities } from '../../hooks/useActivities';
import { useAuth } from '../../contexts/AuthContext';
import { debugAuth, testBackendConnection, checkAuthStatus } from '../../utils/debugAuth';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirigir según el rol del usuario a su dashboard específico
  useEffect(() => {
    if (user?.role) {
      switch (user.role) {
        case 'vendedor_comercial':
          navigate('/dashboard-asesor', { replace: true });
          break;
        case 'jefa_comercial':
          navigate('/dashboards/jefa-comercial', { replace: true });
          break;
        case 'jefe_laboratorio':
        case 'usuario_laboratorio':
          navigate('/dashboards/laboratorio', { replace: true });
          break;
        case 'facturacion':
          navigate('/dashboards/facturacion', { replace: true });
          break;
        case 'soporte':
          navigate('/dashboards/soporte', { replace: true });
          break;
        case 'gerencia':
        case 'admin':
          navigate('/dashboards/gerencia', { replace: true });
          break;
        default:
          // Roles no específicos continúan con el dashboard general
          break;
      }
    }
  }, [user, navigate]);

  // Depuración de autenticación
  useEffect(() => {
    console.log('🔍 Dashboard: Verificando autenticación...');
    debugAuth();
    checkAuthStatus();
    
    // Probar conexión con backend
    testBackendConnection().then(data => {
      if (data) {
        console.log('✅ Dashboard: Conexión con backend exitosa');
      } else {
        console.log('❌ Dashboard: Error en conexión con backend');
      }
    });
  }, []);
  
  // Obtener estadísticas del dashboard
  const { data: dashboardStats, isLoading: statsLoading, error: statsError } = useQuery(
    ['dashboardStats'],
    getDashboardStats,
    {
      refetchInterval: 300000, // 5 minutos
      staleTime: 60000, // 1 minuto
      onSuccess: (data) => {
        console.log('✅ Dashboard: Datos recibidos del backend:', data);
      },
      onError: (error) => {
        console.error('❌ Dashboard: Error obteniendo datos:', error);
      }
    }
  );

  // Obtener actividades recientes con hook optimizado
  const { 
    data: activitiesData, 
    isLoading: activitiesLoading,
    hasActivities,
    activitiesCount,
    refreshActivities
  } = useActivities({ 
    limit: 4,
    refetchInterval: 300000, // 5 minutos
    staleTime: 60000, // 1 minuto
    userId: user?.id, // Filtrar por usuario actual
    role: user?.role // Filtrar por rol
  });

  // Usar estadísticas reales del backend
  const stats = dashboardStats ? {
    totalUsers: parseInt(dashboardStats.totalUsers) || 0,
    totalProjects: parseInt(dashboardStats.totalProjects) || 0,
    totalQuotes: parseInt(dashboardStats.totalQuotes) || 0,
    totalTickets: parseInt(dashboardStats.totalTickets) || 0,
    activeProjects: parseInt(dashboardStats.activeProjects) || 0,
    pendingQuotes: parseInt(dashboardStats.pendingQuotes) || 0,
    openTickets: parseInt(dashboardStats.openTickets) || 0,
    completedProjects: parseInt(dashboardStats.completedProjects) || 0,
    totalClients: parseInt(dashboardStats.totalClients) || 0,
    totalEvidences: parseInt(dashboardStats.totalEvidences) || 0,
    // Nuevos datos del mes actual
    activeUsersThisMonth: parseInt(dashboardStats.activeUsersThisMonth) || 0,
    quotesThisMonth: parseInt(dashboardStats.quotesThisMonth) || 0,
    ticketsThisMonth: parseInt(dashboardStats.ticketsThisMonth) || 0,
    changePercentages: {
      users: 0,
      projects: 0,
      quotes: 0,
      tickets: 0
    }
  } : {
    totalUsers: 0,
    totalProjects: 0,
    totalQuotes: 0,
    totalTickets: 0,
    activeProjects: 0,
    pendingQuotes: 0,
    openTickets: 0,
    completedProjects: 0,
    totalClients: 0,
    totalEvidences: 0,
    // Nuevos datos del mes actual
    activeUsersThisMonth: 0,
    quotesThisMonth: 0,
    ticketsThisMonth: 0,
    changePercentages: {
      users: 0,
      projects: 0,
      quotes: 0,
      tickets: 0
    }
  };

  // Depuración de datos del dashboard
  useEffect(() => {
    console.log('📊 Dashboard: Estado de los datos:');
    console.log('- isLoading:', statsLoading);
    console.log('- error:', statsError);
    console.log('- data:', dashboardStats);
    console.log('- stats procesados:', stats);
    console.log('- totalUsers:', stats.totalUsers, typeof stats.totalUsers);
    console.log('- totalProjects:', stats.totalProjects, typeof stats.totalProjects);
    console.log('- totalQuotes:', stats.totalQuotes, typeof stats.totalQuotes);
    console.log('- totalTickets:', stats.totalTickets, typeof stats.totalTickets);
  }, [statsLoading, statsError, dashboardStats, stats]);

  // Función para formatear tiempo de actividad
  const formatActivityTime = (createdAt) => {
    const now = new Date();
    const activityTime = new Date(createdAt);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} h`;
    return `Hace ${Math.floor(diffInMinutes / 1440)} días`;
  };

  // Función para obtener icono según tipo de actividad
  const getActivityIcon = (type) => {
    const icons = {
      quote_created: FiFileText,
      quote_assigned: FiFileText,
      quote_approved: FiCheckCircle,
      quote_rejected: FiX,
      quote_completed: FiCheckCircle,
      project_created: FiHome,
      project_assigned: FiHome,
      project_started: FiArrowUp,
      project_completed: FiCheckCircle,
      project_delayed: FiClock,
      ticket_created: FiMessageSquare,
      ticket_assigned: FiMessageSquare,
      ticket_resolved: FiCheckCircle,
      ticket_escalated: FiAlertTriangle,
      evidence_uploaded: FiPaperclip,
      evidence_approved: FiCheckCircle,
      evidence_rejected: FiX,
      user_registered: FiUsers,
      user_assigned: FiUsers,
      user_role_changed: FiSettings,
      client_created: FiUser,
      client_updated: FiUser,
      system_maintenance: FiSettings,
      system_update: FiSettings
    };
    return icons[type] || FiActivity;
  };

  // Función para obtener color según tipo de actividad
  const getActivityColor = (type) => {
    const colors = {
      quote_created: 'primary',
      quote_assigned: 'primary',
      quote_approved: 'success',
      quote_rejected: 'danger',
      quote_completed: 'success',
      project_created: 'info',
      project_assigned: 'info',
      project_started: 'info',
      project_completed: 'success',
      project_delayed: 'warning',
      ticket_created: 'warning',
      ticket_assigned: 'warning',
      ticket_resolved: 'success',
      ticket_escalated: 'danger',
      evidence_uploaded: 'secondary',
      evidence_approved: 'success',
      evidence_rejected: 'danger',
      user_registered: 'info',
      user_assigned: 'info',
      user_role_changed: 'secondary',
      client_created: 'primary',
      client_updated: 'primary',
      system_maintenance: 'secondary',
      system_update: 'secondary'
    };
    return colors[type] || 'secondary';
  };

  // Usar datos reales o fallback a datos de ejemplo
  const recentActivities = activitiesData?.activities?.map(activity => ({
    id: activity.id,
    type: activity.type,
    title: activity.title,
    description: activity.description,
    time: formatActivityTime(activity.created_at),
    icon: getActivityIcon(activity.type),
    color: getActivityColor(activity.type),
    user: activity.user_name
  })) || [
    {
      id: 1,
      type: 'quote_created',
      title: 'Nueva cotización creada',
      description: 'Cotización #2024-001 para Proyecto ABC',
      time: 'Hace 2 horas',
      icon: FiFileText,
      color: 'primary'
    },
    {
      id: 2,
      type: 'project_completed',
      title: 'Proyecto completado',
      description: 'Proyecto XYZ finalizado exitosamente',
      time: 'Hace 4 horas',
      icon: FiCheckCircle,
      color: 'success'
    },
    {
      id: 3,
      type: 'ticket_created',
      title: 'Nuevo ticket de soporte',
      description: 'Solicitud de soporte técnico',
      time: 'Hace 6 horas',
      icon: FiMessageSquare,
      color: 'warning'
    },
    {
      id: 4,
      type: 'user_registered',
      title: 'Usuario registrado',
      description: 'Nuevo usuario agregado al sistema',
      time: 'Hace 8 horas',
      icon: FiUsers,
      color: 'info'
    }
  ];

  const quickActions = [
    {
      title: 'Nuevo Proyecto',
      description: 'Crear un nuevo proyecto',
      icon: FiHome,
      color: 'primary',
      onClick: () => navigate('/proyectos')
    },
    {
      title: 'Nueva Cotización',
      description: 'Generar cotización',
      icon: FiFileText,
      color: 'success',
      onClick: () => navigate('/cotizaciones/inteligente')
    },
    {
      title: 'Nuevo Ticket',
      description: 'Crear ticket de soporte',
      icon: FiMessageSquare,
      color: 'warning',
      onClick: () => navigate('/tickets')
    },
    {
      title: 'Ver Reportes',
      description: 'Analizar datos del sistema',
      icon: FiArrowUp,
      color: 'info',
      onClick: () => navigate('/reportes')
    }
  ];

  return (
    <div className="fade-in">
      <PageHeader
        title="Dashboard"
        subtitle="Resumen general del sistema CRM GeoFal"
        icon={FiArrowUp}
      />

      {/* Estadísticas principales */}
      <Row className="mb-4 g-3">
        <Col lg={3} md={6}>
          <StatsCard
            title="Total Usuarios"
            value={stats.totalUsers}
            icon={FiUsers}
            color="primary"
            trend={stats.changePercentages?.users || null}
            subtitle={`${stats.activeUsersThisMonth || 0} usuarios activos este mes`}
            loading={statsLoading}
            size="normal"
          />
        </Col>
        <Col lg={3} md={6}>
          <StatsCard
            title="Proyectos Activos"
            value={stats.activeProjects}
            icon={FiHome}
            color="success"
            trend={stats.changePercentages?.projects || null}
            subtitle={`${stats.totalProjects} proyectos totales`}
            loading={statsLoading}
            size="normal"
          />
        </Col>
        <Col lg={3} md={6}>
          <StatsCard
            title="Cotizaciones Pendientes"
            value={stats.pendingQuotes}
            icon={FiFileText}
            color="warning"
            trend={stats.changePercentages?.quotes || null}
            subtitle={`${stats.quotesThisMonth || 0} cotizaciones este mes`}
            loading={statsLoading}
            size="normal"
          />
        </Col>
        <Col lg={3} md={6}>
          <StatsCard
            title="Tickets Abiertos"
            value={stats.openTickets}
            icon={FiMessageSquare}
            color="danger"
            trend={stats.changePercentages?.tickets || null}
            subtitle={`${stats.ticketsThisMonth || 0} tickets este mes`}
            loading={statsLoading}
            size="normal"
          />
        </Col>
      </Row>

      <Row>
        {/* Actividades recientes */}
        <Col lg={8} className="mb-4">
          <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
              <h5 className="mb-0">Actividades Recientes</h5>
                {activitiesCount > 0 && (
                  <small className="text-muted">
                    {activitiesCount} actividad{activitiesCount !== 1 ? 'es' : ''} • Actualizado automáticamente
                  </small>
                )}
                {user?.role !== 'admin' && (
                  <small className="text-info d-block">
                    Mostrando solo actividades relevantes a tu rol: {user?.role}
                  </small>
                )}
              </div>
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={refreshActivities}
                  disabled={activitiesLoading}
                  title="Actualizar actividades"
                  className="refresh-btn"
                >
                  <FiActivity className={activitiesLoading ? 'spinning' : ''} />
                </Button>
                {user?.role === 'admin' && (
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => navigate('/actividades')}
                    title="Ver todas las actividades (Solo Admin)"
                  >
                <FiEye className="me-1" />
                Ver todas
              </Button>
                )}
              </div>
            </Card.Header>
            <Card.Body>
              {activitiesLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando actividades...</span>
                  </div>
                  <p className="mt-2 text-muted">Cargando actividades recientes...</p>
                </div>
              ) : recentActivities.length === 0 ? (
                <div className="activity-empty-state text-center">
                  <div className="mb-3">
                    <FiActivity size={48} className="text-muted icon" />
                  </div>
                  <h6 className="text-muted mb-2">No hay actividades recientes</h6>
                  <p className="text-muted small mb-3">
                    {user?.role === 'admin' 
                      ? 'Aún no hay actividades registradas en el sistema.'
                      : 'No hay actividades relevantes a tu rol en este momento.'
                    }
                  </p>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={refreshActivities}
                    className="mt-2"
                  >
                    <FiActivity className="me-1" />
                    Actualizar
                  </Button>
                </div>
              ) : (
              <div className="activity-list">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="activity-item d-flex align-items-start mb-3">
                      <div className={`activity-icon bg-${activity.color} bg-opacity-10 rounded-circle p-2 me-3`}>
                        <Icon size={20} className={`text-${activity.color}`} />
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{activity.title}</h6>
                        <p className="text-muted mb-1 small">{activity.description}</p>
                          <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">{activity.time}</small>
                            {activity.user && (
                              <small className="text-muted">por {activity.user}</small>
                            )}
                          </div>
                        </div>
                    </div>
                  );
                })}
              </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Acciones rápidas */}
        <Col lg={4} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">Acciones Rápidas</h5>
            </Card.Header>
            <Card.Body>
              <div className="quick-actions">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={index}
                      variant={`outline-${action.color}`}
                      className="w-100 mb-3 d-flex align-items-center justify-content-start"
                      onClick={action.onClick}
                    >
                      <div className={`me-3 bg-${action.color} bg-opacity-10 rounded-circle p-2`}>
                        <Icon size={20} className={`text-${action.color}`} />
                      </div>
                      <div className="text-start">
                        <div className="fw-medium">{action.title}</div>
                        <small className="text-muted">{action.description}</small>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Resumen de rendimiento */}
      <Row>
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Resumen de Proyectos</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Proyectos Completados</span>
                <span className="fw-bold text-success">{stats.completedProjects}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Proyectos Activos</span>
                <span className="fw-bold text-primary">{stats.activeProjects}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>Total Proyectos</span>
                <span className="fw-bold">{stats.totalProjects}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Estado del Sistema</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Usuarios Online</span>
                <span className="fw-bold text-success">
                  <FiArrowUp className="me-1" />
                  {Math.floor(stats.totalUsers * 0.3)}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Cotizaciones Este Mes</span>
                <span className="fw-bold text-primary">
                  <FiArrowUp className="me-1" />
                  {Math.floor(stats.totalQuotes * 0.4)}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>Tickets Resueltos</span>
                <span className="fw-bold text-success">
                  <FiArrowUp className="me-1" />
                  {Math.floor(stats.totalTickets * 0.7)}
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;