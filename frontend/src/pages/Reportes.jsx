import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Row, Col, Card, Button, Form, InputGroup, Badge, Alert } from 'react-bootstrap';
import { 
  FiBarChart2, FiDownload, FiCalendar, FiUsers, FiDollarSign, 
  FiArrowUp, FiFileText, FiFilter, FiRefreshCw, FiEye,
  FiHome, FiCheckCircle, FiClock, FiX
} from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import StatsCard from '../components/common/StatsCard';
import { getVentasPorVendedor } from '../services/reports';

const VentasPorVendedorReport = () => {
  const { data, isLoading, error } = useQuery('ventasPorVendedor', getVentasPorVendedor);

  const columns = [
    {
      header: 'Vendedor',
      accessor: 'name',
      render: (value, row) => (
        <div>
          <div className="fw-medium">{row.name}</div>
          <small className="text-muted">{row.email}</small>
        </div>
      )
    },
    {
      header: 'Período',
      accessor: 'period',
      render: (value, row) => (
        <div>
          <div className="fw-medium">{row.month}/{row.year}</div>
          <small className="text-muted">Mes/Año</small>
        </div>
      )
    },
    {
      header: 'Total Proyectos',
      accessor: 'total_proyectos',
      render: (value) => (
        <Badge bg="primary" className="status-badge">
          {value} proyectos
        </Badge>
      )
    },
    {
      header: 'Acciones',
      accessor: 'actions',
      render: (value, row) => (
        <Button variant="outline-primary" size="sm">
          <FiEye className="me-1" />
          Ver Detalles
        </Button>
      )
    }
  ];

  if (isLoading) return <Alert variant="info">Cargando reporte...</Alert>;
  if (error) return <Alert variant="danger">Error al cargar el reporte: {error.message}</Alert>;

  return (
    <DataTable
      data={data || []}
      columns={columns}
      loading={isLoading}
      emptyMessage="No hay datos de ventas disponibles"
    />
  );
};

const ProyectosPorEstadoReport = () => {
  // Simulamos datos para el reporte
  const mockData = [
    { estado: 'activo', cantidad: 45, porcentaje: 60 },
    { estado: 'pendiente', cantidad: 20, porcentaje: 27 },
    { estado: 'completado', cantidad: 8, porcentaje: 11 },
    { estado: 'cancelado', cantidad: 2, porcentaje: 2 }
  ];

  const getStatusBadge = (estado) => {
    const statusConfig = {
      'activo': { bg: 'success', text: 'Activo', icon: FiCheckCircle },
      'pendiente': { bg: 'warning', text: 'Pendiente', icon: FiClock },
      'completado': { bg: 'primary', text: 'Completado', icon: FiCheckCircle },
      'cancelado': { bg: 'danger', text: 'Cancelado', icon: FiX }
    };
    
    const config = statusConfig[estado] || { bg: 'secondary', text: estado, icon: FiCheckCircle };
    const Icon = config.icon;
    
    return (
      <Badge bg={config.bg} className="status-badge d-flex align-items-center">
        <Icon size={12} className="me-1" />
        {config.text}
      </Badge>
    );
  };

  const columns = [
    {
      header: 'Estado',
      accessor: 'estado',
      render: (value) => getStatusBadge(value)
    },
    {
      header: 'Cantidad',
      accessor: 'cantidad',
      render: (value) => (
        <div className="fw-bold text-primary">{value}</div>
      )
    },
    {
      header: 'Porcentaje',
      accessor: 'porcentaje',
      render: (value) => (
        <div className="d-flex align-items-center">
          <div className="progress flex-grow-1 me-2" style={{ height: '8px' }}>
            <div 
              className="progress-bar bg-primary" 
              style={{ width: `${value}%` }}
            ></div>
          </div>
          <span className="fw-medium">{value}%</span>
        </div>
      )
    }
  ];

  return (
    <DataTable
      data={mockData}
      columns={columns}
      loading={false}
      emptyMessage="No hay datos de proyectos disponibles"
    />
  );
};

export default function Reportes() {
  const [activeReport, setActiveReport] = useState('ventas');
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().slice(0, 7), // YYYY-MM
    end: new Date().toISOString().slice(0, 7)
  });

  const reportTypes = [
    {
      id: 'ventas',
      title: 'Ventas por Vendedor',
      description: 'Análisis de ventas y proyectos por vendedor',
      icon: FiUsers,
      color: 'primary'
    },
    {
      id: 'proyectos',
      title: 'Proyectos por Estado',
      description: 'Distribución de proyectos según su estado',
      icon: FiHome,
      color: 'info'
    },
    {
      id: 'cotizaciones',
      title: 'Cotizaciones',
      description: 'Reporte de cotizaciones generadas',
      icon: FiFileText,
      color: 'success'
    },
    {
      id: 'clientes',
      title: 'Clientes',
      description: 'Análisis de clientes y empresas',
      icon: FiUsers,
      color: 'warning'
    }
  ];

  const renderReport = () => {
    switch (activeReport) {
      case 'ventas':
        return <VentasPorVendedorReport />;
      case 'proyectos':
        return <ProyectosPorEstadoReport />;
      case 'cotizaciones':
        return (
          <Alert variant="info">
            <FiFileText className="me-2" />
            Reporte de cotizaciones en desarrollo
          </Alert>
        );
      case 'clientes':
        return (
          <Alert variant="info">
            <FiUsers className="me-2" />
            Reporte de clientes en desarrollo
          </Alert>
        );
      default:
        return <VentasPorVendedorReport />;
    }
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Reportes y Análisis"
        subtitle="Visualiza estadísticas y genera reportes del sistema"
        icon={FiBarChart2}
        actions={
          <div className="d-flex gap-2">
            <Button variant="outline-primary">
              <FiDownload className="me-2" />
              Exportar
            </Button>
            <Button variant="primary">
              <FiRefreshCw className="me-2" />
              Actualizar
            </Button>
          </div>
        }
      />

      {/* Filtros de fecha */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={3}>
              <Form.Label>Período de Análisis</Form.Label>
              <InputGroup>
                <InputGroup.Text><FiCalendar /></InputGroup.Text>
                <Form.Control
                  type="month"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Label>Hasta</Form.Label>
              <InputGroup>
                <InputGroup.Text><FiCalendar /></InputGroup.Text>
                <Form.Control
                  type="month"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                />
              </InputGroup>
            </Col>
            <Col md={6} className="d-flex align-items-end">
              <Button variant="outline-secondary" className="me-2">
                <FiFilter className="me-2" />
                Aplicar Filtros
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Estadísticas generales */}
      <Row className="g-4 mb-4">
        <Col md={6} lg={3}>
          <StatsCard
            title="Total Proyectos"
            value="75"
            icon={FiHome}
            trend="up"
            trendValue="+12% este mes"
            variant="primary"
          />
        </Col>
        <Col md={6} lg={3}>
          <StatsCard
            title="Cotizaciones Enviadas"
            value="45"
            icon={FiFileText}
            trend="up"
            trendValue="+8% esta semana"
            variant="success"
          />
        </Col>
        <Col md={6} lg={3}>
          <StatsCard
            title="Clientes Activos"
            value="120"
            icon={FiUsers}
            trend="up"
            trendValue="+5% este trimestre"
            variant="info"
          />
        </Col>
        <Col md={6} lg={3}>
          <StatsCard
            title="Ventas del Mes"
            value="S/ 85,000"
            icon={FiDollarSign}
            trend="up"
            trendValue="+15% respecto al mes anterior"
            variant="warning"
          />
        </Col>
      </Row>

      {/* Selector de reportes */}
      <Card className="mb-4">
        <Card.Body>
          <h5 className="mb-3">Seleccionar Tipo de Reporte</h5>
          <Row className="g-3">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              return (
                <Col md={6} lg={3} key={report.id}>
                  <Card 
                    className={`h-100 cursor-pointer ${activeReport === report.id ? 'border-primary' : ''}`}
                    onClick={() => setActiveReport(report.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Card.Body className="text-center">
                      <Icon size={32} className={`text-${report.color} mb-2`} />
                      <h6 className="fw-medium">{report.title}</h6>
                      <small className="text-muted">{report.description}</small>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Card.Body>
      </Card>

      {/* Contenido del reporte */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">
            {reportTypes.find(r => r.id === activeReport)?.title}
          </h5>
        </Card.Header>
        <Card.Body>
          {renderReport()}
        </Card.Body>
      </Card>
    </div>
  );
}