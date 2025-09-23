import React from 'react';
import { useQuery } from 'react-query';
import { Badge, Alert, Button } from 'react-bootstrap';
import { FiAlertTriangle, FiCheckCircle, FiClock, FiX, FiEye } from 'react-icons/fi';
import DataTable from '../common/DataTable';
import { 
  getVentasPorVendedor, 
  getProyectosPorEstado, 
  getCotizacionesPorPeriodo, 
  getClientesActivos 
} from '../../services/reports';

export const VentasPorVendedorReport = ({ dateRange, selectedVendedor, sortBy }) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 20;

  // Función para obtener el último día del mes
  const getLastDayOfMonth = (yearMonth) => {
    const [year, month] = yearMonth.split('-');
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    return `${yearMonth}-${lastDay.toString().padStart(2, '0')}`;
  };

  const { data, isLoading, error } = useQuery(
    ['ventasPorVendedor', dateRange, selectedVendedor, currentPage, sortBy],
    () => getVentasPorVendedor({
      start_date: `${dateRange.start}-01`,
      end_date: getLastDayOfMonth(dateRange.end),
      vendedor_id: selectedVendedor || undefined,
      page: currentPage,
      limit: itemsPerPage,
      sort_by: sortBy
    }),
    { staleTime: 30000 }
  );

  // Resetear página cuando cambien los filtros
  React.useEffect(() => {
    setCurrentPage(1);
  }, [dateRange, selectedVendedor, sortBy]);

  const columns = [
    {
      header: 'Vendedor',
      accessor: 'name',
      render: (value, row) => (
        <div>
          <div className="fw-medium">{row.name}</div>
          <small className="text-muted">{row.email} - {row.role}</small>
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
      accessor: 'total_projects',
      render: (value) => (
        <Badge bg="primary" className="status-badge">
          {value} proyectos
        </Badge>
      )
    },
    {
      header: 'Total Ventas',
      accessor: 'total_sales',
      render: (value) => (
        <div className="fw-bold text-success">
          S/ {Number(value).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      )
    },
    {
      header: 'Cotizaciones',
      accessor: 'total_quotes',
      render: (value, row) => (
        <div>
          <div className="fw-medium">{value} total</div>
          <small className="text-muted">{row.approved_quotes} aprobadas</small>
        </div>
      )
    },
    {
      header: 'Tasa Aprobación',
      accessor: 'approval_rate',
      render: (value) => (
        <Badge bg={value >= 50 ? 'success' : value >= 30 ? 'warning' : 'danger'}>
          {value}%
        </Badge>
      )
    },
    {
      header: 'Acciones',
      accessor: 'actions',
      render: (value, row) => (
        <Button variant="outline-primary" size="sm">
          <FiEye className="me-1" />
          Ver Detalle
        </Button>
      )
    }
  ];

  if (error) {
    return (
      <Alert variant="danger">
        <FiAlertTriangle className="me-2" />
        Error al cargar el reporte: {error.message}
      </Alert>
    );
  }

  return (
    <DataTable
      data={data?.data || []}
      columns={columns}
      loading={isLoading}
      emptyMessage="No hay datos de ventas disponibles para los vendedores en el período seleccionado"
      totalItems={data?.pagination?.totalRecords || 0}
      itemsPerPage={data?.pagination?.itemsPerPage || 20}
      currentPage={data?.pagination?.currentPage || 1}
      onPageChange={(page) => {
        setCurrentPage(page);
      }}
    />
  );
};

export const ProyectosPorEstadoReport = ({ dateRange }) => {
  // Función para obtener el último día del mes
  const getLastDayOfMonth = (yearMonth) => {
    const [year, month] = yearMonth.split('-');
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    return `${yearMonth}-${lastDay.toString().padStart(2, '0')}`;
  };

  const { data, isLoading, error } = useQuery(
    ['proyectosPorEstado', dateRange],
    () => getProyectosPorEstado({
      start_date: `${dateRange.start}-01`,
      end_date: getLastDayOfMonth(dateRange.end)
    }),
    { staleTime: 30000 }
  );

  const getStatusBadge = (status) => {
    const statusConfig = {
      'activo': { bg: 'success', text: 'Activo', icon: FiCheckCircle },
      'pendiente': { bg: 'warning', text: 'Pendiente', icon: FiClock },
      'completado': { bg: 'info', text: 'Completado', icon: FiCheckCircle },
      'cancelado': { bg: 'danger', text: 'Cancelado', icon: FiX }
    };
    
    const config = statusConfig[status] || { bg: 'secondary', text: status, icon: FiCheckCircle };
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

  if (error) {
    return (
      <Alert variant="danger">
        <FiAlertTriangle className="me-2" />
        Error al cargar el reporte: {error.message}
      </Alert>
    );
  }

  return (
    <DataTable
      data={data?.data || []}
      columns={columns}
      loading={isLoading}
      emptyMessage="No hay datos de proyectos disponibles"
      totalItems={data?.data?.length || 0}
      itemsPerPage={20}
      currentPage={1}
      onPageChange={(page) => {
        console.log('Cambio de página:', page);
      }}
    />
  );
};

export const CotizacionesReport = ({ dateRange, selectedVendedor }) => {
  // Función para obtener el último día del mes
  const getLastDayOfMonth = (yearMonth) => {
    const [year, month] = yearMonth.split('-');
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    return `${yearMonth}-${lastDay.toString().padStart(2, '0')}`;
  };

  const { data, isLoading, error } = useQuery(
    ['cotizacionesPorPeriodo', dateRange, selectedVendedor],
    () => getCotizacionesPorPeriodo({
      start_date: `${dateRange.start}-01`,
      end_date: getLastDayOfMonth(dateRange.end),
      vendedor_id: selectedVendedor || undefined
    }),
    { staleTime: 30000 }
  );

  const getStatusBadge = (status) => {
    const statusConfig = {
      'enviada': { bg: 'info', text: 'Enviada' },
      'aprobada': { bg: 'success', text: 'Aprobada' },
      'rechazada': { bg: 'danger', text: 'Rechazada' },
      'pendiente': { bg: 'warning', text: 'Pendiente' }
    };
    
    const config = statusConfig[status] || { bg: 'secondary', text: status };
    
    return (
      <Badge bg={config.bg} className="status-badge">
        {config.text}
      </Badge>
    );
  };

  const columns = [
    {
      header: 'Número',
      accessor: 'quote_number',
      render: (value) => (
        <div className="fw-medium">{value}</div>
      )
    },
    {
      header: 'Cliente',
      accessor: 'company_name',
      render: (value, row) => (
        <div>
          <div className="fw-medium">{value}</div>
          <small className="text-muted">{row.project_name}</small>
        </div>
      )
    },
    {
      header: 'Vendedor',
      accessor: 'vendedor_name',
      render: (value, row) => (
        <div>
          <div className="fw-medium">{value}</div>
          <small className="text-muted">{row.vendedor_email}</small>
        </div>
      )
    },
    {
      header: 'Total',
      accessor: 'total',
      render: (value) => (
        <div className="fw-bold text-success">
          S/ {Number(value).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      )
    },
    {
      header: 'Estado',
      accessor: 'status',
      render: (value) => getStatusBadge(value)
    },
    {
      header: 'Fecha',
      accessor: 'created_at',
      render: (value) => (
        <div>
          {new Date(value).toLocaleDateString('es-PE')}
        </div>
      )
    }
  ];

  if (error) {
    return (
      <Alert variant="danger">
        <FiAlertTriangle className="me-2" />
        Error al cargar el reporte: {error.message}
      </Alert>
    );
  }

  return (
    <DataTable
      data={data?.data || []}
      columns={columns}
      loading={isLoading}
      emptyMessage="No hay cotizaciones disponibles"
      totalItems={data?.data?.length || 0}
      itemsPerPage={20}
      currentPage={1}
      onPageChange={(page) => {
        console.log('Cambio de página:', page);
      }}
    />
  );
};

export const ClientesReport = ({ dateRange }) => {
  // Función para obtener el último día del mes
  const getLastDayOfMonth = (yearMonth) => {
    const [year, month] = yearMonth.split('-');
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    return `${yearMonth}-${lastDay.toString().padStart(2, '0')}`;
  };

  const { data, isLoading, error } = useQuery(
    ['clientesActivos', dateRange],
    () => getClientesActivos({
      start_date: `${dateRange.start}-01`,
      end_date: getLastDayOfMonth(dateRange.end)
    }),
    { staleTime: 30000 }
  );

  const columns = [
    {
      header: 'Cliente',
      accessor: 'name',
      render: (value, row) => (
        <div>
          <div className="fw-medium">{value}</div>
          <small className="text-muted">{row.email}</small>
        </div>
      )
    },
    {
      header: 'Ubicación',
      accessor: 'city',
      render: (value, row) => (
        <div>
          <div>{value}</div>
          <small className="text-muted">{row.sector}</small>
        </div>
      )
    },
    {
      header: 'Proyectos',
      accessor: 'total_projects',
      render: (value, row) => (
        <div>
          <div className="fw-medium">{value} total</div>
          <small className="text-muted">{row.active_projects} activos</small>
        </div>
      )
    },
    {
      header: 'Cotizaciones',
      accessor: 'total_quotes',
      render: (value) => (
        <Badge bg="info" className="status-badge">
          {value} cotizaciones
        </Badge>
      )
    },
    {
      header: 'Valor Total',
      accessor: 'total_value',
      render: (value) => (
        <div className="fw-bold text-success">
          S/ {Number(value).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      )
    }
  ];

  if (error) {
    return (
      <Alert variant="danger">
        <FiAlertTriangle className="me-2" />
        Error al cargar el reporte: {error.message}
      </Alert>
    );
  }

  return (
    <DataTable
      data={data?.data || []}
      columns={columns}
      loading={isLoading}
      emptyMessage="No hay clientes activos disponibles"
      totalItems={data?.data?.length || 0}
      itemsPerPage={20}
      currentPage={1}
      onPageChange={(page) => {
        console.log('Cambio de página:', page);
      }}
    />
  );
};
