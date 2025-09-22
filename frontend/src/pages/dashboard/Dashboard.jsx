import React from 'react';
import { Row, Col, Card, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
  FiUsers, FiHome, FiFileText, FiMessageSquare, 
  FiArrowUp, FiDollarSign, FiCalendar, FiCheckCircle,
  FiArrowDown, FiEye, FiTrendingUp, FiActivity
} from 'react-icons/fi';
import { useQuery } from 'react-query';
import PageHeader from '../../components/common/PageHeader';
import StatsCard from '../../components/common/StatsCard';
import { listUsers } from '../../services/users';
import { listProjects } from '../../services/projects';
import { listQuotes } from '../../services/quotes';
import { listTickets } from '../../services/tickets';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Consultas para obtener estadísticas
  const { data: usersData } = useQuery(['users'], listUsers);
  const { data: projectsData } = useQuery(['projects'], listProjects);
  const { data: quotesData } = useQuery(['quotes'], listQuotes);
  const { data: ticketsData } = useQuery(['tickets'], listTickets);

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

  // Datos de ejemplo para gráficos (en un proyecto real vendrían del backend)
  const recentActivities = [
    {
      id: 1,
      type: 'quote',
      title: 'Nueva cotización creada',
      description: 'Cotización #2024-001 para Proyecto ABC',
      time: 'Hace 2 horas',
      icon: FiFileText,
      color: 'primary'
    },
    {
      id: 2,
      type: 'project',
      title: 'Proyecto completado',
      description: 'Proyecto XYZ finalizado exitosamente',
      time: 'Hace 4 horas',
      icon: FiCheckCircle,
      color: 'success'
    },
    {
      id: 3,
      type: 'ticket',
      title: 'Nuevo ticket de soporte',
      description: 'Solicitud de soporte técnico',
      time: 'Hace 6 horas',
      icon: FiMessageSquare,
      color: 'warning'
    },
    {
      id: 4,
      type: 'user',
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
              <h5 className="mb-0">Actividades Recientes</h5>
              <Button variant="outline-primary" size="sm">
                <FiEye className="me-1" />
                Ver todas
              </Button>
            </Card.Header>
            <Card.Body>
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
                        <small className="text-muted">{activity.time}</small>
                      </div>
                    </div>
                  );
                })}
              </div>
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