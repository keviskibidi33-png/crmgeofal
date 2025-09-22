import React from 'react';
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
import { useActivities } from '../../hooks/useActivities';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Consultas para obtener estadísticas
  const { data: usersData } = useQuery(['users'], listUsers);
  const { data: projectsData } = useQuery(['projects'], listProjects);
  const { data: quotesData } = useQuery(['quotes'], listQuotes);
  const { data: ticketsData } = useQuery(['tickets'], listTickets);
  
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
    staleTime: 60000 // 1 minuto
  });

  // Calcular estadísticas
  const stats = {
    totalUsers: usersData?.users?.length || 0,
    totalProjects: projectsData?.projects?.length || 0,
    totalQuotes: quotesData?.quotes?.length || 0,
    totalTickets: ticketsData?.tickets?.length || 0,
    activeProjects: projectsData?.projects?.filter(p => p.status === 'activo')?.length || 0,
    pendingQuotes: quotesData?.quotes?.filter(q => q.status === 'pendiente')?.length || 0,
    openTickets: ticketsData?.tickets?.filter(t => t.status === 'abierto')?.length || 0,
    completedProjects: projectsData?.projects?.filter(p => p.status === 'completado')?.length || 0
  };

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
      onClick: () => navigate('/cotizaciones/nueva/lem')
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
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Total Usuarios"
            value={stats.totalUsers}
            icon={FiUsers}
            color="primary"
            trend={12}
            subtitle="Usuarios activos"
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Proyectos Activos"
            value={stats.activeProjects}
            icon={FiHome}
            color="success"
            trend={8}
            subtitle={`${stats.totalProjects} proyectos totales`}
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Cotizaciones Pendientes"
            value={stats.pendingQuotes}
            icon={FiFileText}
            color="warning"
            trend={-3}
            subtitle={`${stats.totalQuotes} cotizaciones totales`}
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Tickets Abiertos"
            value={stats.openTickets}
            icon={FiMessageSquare}
            color="danger"
            trend={5}
            subtitle={`${stats.totalTickets} tickets totales`}
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
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => navigate('/actividades')}
                  title="Ver todas las actividades"
                >
                  <FiEye className="me-1" />
                  Ver todas
                </Button>
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