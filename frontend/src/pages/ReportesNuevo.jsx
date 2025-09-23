import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Row, Col, Card, Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import { 
  FiBarChart2, FiDownload, FiCalendar, FiUsers, FiDollarSign, 
  FiFileText, FiFilter, FiRefreshCw, FiHome
} from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import StatsCard from '../components/common/StatsCard';
import { 
  getSystemStats, 
  getVendedores,
  exportReport 
} from '../services/reports';
import { 
  VentasPorVendedorReport, 
  ProyectosPorEstadoReport, 
  CotizacionesReport, 
  ClientesReport 
} from '../components/reports/ReportComponents';

export default function Reportes() {
  const [activeReport, setActiveReport] = useState('ventas');
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().slice(0, 7), // YYYY-MM
    end: new Date().toISOString().slice(0, 7)
  });
  const [selectedVendedor, setSelectedVendedor] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Consultas de datos reales
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useQuery(
    ['systemStats', dateRange],
    () => getSystemStats({
      start_date: `${dateRange.start}-01`,
      end_date: `${dateRange.end}-31`
    }),
    { staleTime: 30000 }
  );

  const { data: vendedoresData } = useQuery('vendedores', getVendedores, { staleTime: 300000 });

  // Función para actualizar todos los datos
  const handleRefresh = () => {
    refetchStats();
  };

  // Función para exportar reporte
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportReport(activeReport, {
        start_date: `${dateRange.start}-01`,
        end_date: `${dateRange.end}-31`,
        vendedor_id: selectedVendedor || undefined
      });
    } catch (error) {
      console.error('Error al exportar:', error);
    } finally {
      setIsExporting(false);
    }
  };

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
        return <VentasPorVendedorReport dateRange={dateRange} selectedVendedor={selectedVendedor} />;
      case 'proyectos':
        return <ProyectosPorEstadoReport dateRange={dateRange} />;
      case 'cotizaciones':
        return <CotizacionesReport dateRange={dateRange} selectedVendedor={selectedVendedor} />;
      case 'clientes':
        return <ClientesReport dateRange={dateRange} />;
      default:
        return <VentasPorVendedorReport dateRange={dateRange} selectedVendedor={selectedVendedor} />;
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
            <Button variant="primary" onClick={handleRefresh}>
              <FiRefreshCw className="me-2" />
              Actualizar
            </Button>
            <Button 
              variant="outline-success" 
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Exportando...
                </>
              ) : (
                <>
                  <FiDownload className="me-2" />
                  Exportar
                </>
              )}
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
            <Col md={3}>
              <Form.Label>Vendedor</Form.Label>
              <Form.Select
                value={selectedVendedor}
                onChange={(e) => setSelectedVendedor(e.target.value)}
              >
                <option value="">Todos los vendedores</option>
                {vendedoresData?.data?.map((vendedor) => (
                  <option key={vendedor.id} value={vendedor.id}>
                    {vendedor.name} ({vendedor.role})
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3} className="d-flex align-items-end">
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
            value={statsLoading ? <Spinner size="sm" /> : (statsData?.data?.total_projects || 0)}
            icon={FiHome}
            trend="up"
            trendValue={`${statsData?.data?.active_projects || 0} activos`}
            variant="primary"
          />
        </Col>
        <Col md={6} lg={3}>
          <StatsCard
            title="Cotizaciones Enviadas"
            value={statsLoading ? <Spinner size="sm" /> : (statsData?.data?.total_quotes || 0)}
            icon={FiFileText}
            trend="up"
            trendValue={`${statsData?.data?.approved_quotes || 0} aprobadas`}
            variant="success"
          />
        </Col>
        <Col md={6} lg={3}>
          <StatsCard
            title="Clientes Activos"
            value={statsLoading ? <Spinner size="sm" /> : (statsData?.data?.total_clients || 0)}
            icon={FiUsers}
            trend="up"
            trendValue={`${statsData?.data?.active_clients || 0} con proyectos`}
            variant="info"
          />
        </Col>
        <Col md={6} lg={3}>
          <StatsCard
            title="Ventas del Mes"
            value={statsLoading ? <Spinner size="sm" /> : `S/ ${Number(statsData?.data?.monthly_sales || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={FiDollarSign}
            trend="up"
            trendValue={`S/ ${Number(statsData?.data?.total_quotes_value || 0).toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} total`}
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
