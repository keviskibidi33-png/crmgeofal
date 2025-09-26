import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { Button, Badge, Row, Col, Card, Container } from 'react-bootstrap';
import { FiPlus, FiEdit, FiTrash2, FiUser, FiHome, FiMail, FiPhone, FiMapPin, FiUsers, FiHome as FiBuilding, FiFolderPlus } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import ModalForm from '../components/common/ModalForm';
import StatsCard from '../components/common/StatsCard';
import { listCompanies, createCompany, updateCompany, deleteCompany, getCompanyStats, getCompanyFilterOptions } from '../services/companies';
import { getCurrentUser, canCreateClient, logUserInfo } from '../utils/authHelper';

const emptyForm = {
  type: 'empresa',
  ruc: '',
  dni: '',
  name: '',
  address: '',
  email: '',
  phone: '',
  contact_name: '',
  city: '',
  sector: '',
};

export default function Clientes() {
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deletingClient, setDeletingClient] = useState(null);
  
  // Información del usuario actual
  const currentUser = getCurrentUser();
  const userCanCreateClient = canCreateClient();
  
  // Log de información de usuario al cargar el componente
  React.useEffect(() => {
    logUserInfo();
  }, []);
  
  // Estado para paginación y filtros
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useQuery(
    ['clients', currentPage, searchTerm, selectedType, selectedCity, selectedSector],
    () => listCompanies({ 
      page: currentPage, 
      limit: 20, 
      search: searchTerm, 
      type: selectedType,
      city: selectedCity,
      sector: selectedSector
    }),
    { 
      keepPreviousData: true,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      staleTime: 0,
      cacheTime: 0
    }
  );

  // Consulta separada para estadísticas reales
  const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery(
    ['clientStats'],
    getCompanyStats,
    {
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      staleTime: 30000, // 30 segundos
      cacheTime: 60000  // 1 minuto
    }
  );

  // Debug: Log de estadísticas (simplificado)
  React.useEffect(() => {
    if (statsData && statsData.data) {
      console.log('✅ Estadísticas cargadas correctamente:', {
        total: statsData.data.total,
        empresas: statsData.data.empresas,
        personas: statsData.data.personas
      });
    }
  }, [statsData]);

  // Consulta para opciones de filtros dinámicos
  const { data: filterOptionsData, isLoading: filterOptionsLoading } = useQuery(
    ['clientFilterOptions'],
    getCompanyFilterOptions,
    {
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      staleTime: 60000, // 1 minuto
      cacheTime: 300000  // 5 minutos
    }
  );

  const handleMutationSuccess = (message) => {
    queryClient.invalidateQueries('clients');
    queryClient.invalidateQueries('clientStats'); // Invalidar también las estadísticas
    queryClient.invalidateQueries('clientFilterOptions'); // Invalidar también las opciones de filtros
    setShowModal(false);
    setEditingClient(null);
    setDeletingClient(null);
  };

  // Función para manejar búsqueda
  const handleSearch = (searchValue) => {
    console.log('🔍 handleSearch - Búsqueda:', searchValue);
    setSearchTerm(searchValue);
    setCurrentPage(1); // Resetear a la primera página
    setIsSearching(true);
    
    // La consulta se actualizará automáticamente por el useQuery
    setTimeout(() => setIsSearching(false), 1000);
  };

  // Función para manejar filtros
  const handleFilter = (filters) => {
    console.log('🔍 handleFilter - Filtros:', filters);
    setSelectedType(filters.type || '');
    setSelectedCity(filters.city || '');
    setSelectedSector(filters.sector || '');
    setCurrentPage(1); // Resetear a la primera página
  };

  // Opciones de filtros dinámicas basadas en datos reales
  const clientFilterOptions = useMemo(() => {
    if (!filterOptionsData) {
      return [
        {
          title: 'Por Tipo de Cliente',
          options: [
            { label: 'Empresas', filter: { type: 'empresa' } },
            { label: 'Personas Naturales', filter: { type: 'persona' } }
          ]
        }
      ];
    }

    return [
      {
        title: 'Por Tipo de Cliente',
        options: filterOptionsData.types?.map(type => ({
          label: `${type.label} (${type.count})`,
          filter: { type: type.value }
        })) || []
      },
      {
        title: 'Por Sector',
        options: filterOptionsData.sectors?.map(sector => ({
          label: `${sector.label} (${sector.count})`,
          filter: { sector: sector.value }
        })) || []
      },
      {
        title: 'Por Ciudad',
        options: filterOptionsData.cities?.map(city => ({
          label: `${city.label} (${city.count})`,
          filter: { city: city.value }
        })) || []
      }
    ];
  }, [filterOptionsData]);

  const createMutation = useMutation(createCompany, {
    onSuccess: () => handleMutationSuccess('Cliente creado exitosamente'),
    onError: (error) => {
      console.error('Error creating client:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        body: error.body
      });
    }
  });

  const updateMutation = useMutation(updateCompany, {
    onSuccess: () => handleMutationSuccess('Cliente actualizado exitosamente'),
    onError: (error) => console.error('Error updating client:', error)
  });

  const deleteMutation = useMutation(deleteCompany, {
    onSuccess: () => handleMutationSuccess('Cliente eliminado exitosamente'),
    onError: (error) => console.error('Error deleting client:', error)
  });

  const handleCreate = () => {
    setEditingClient(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setShowModal(true);
  };

  const handleDelete = (client) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el cliente "${client.name}"?`)) {
      deleteMutation.mutate(client.id);
    }
  };

  const handleCreateProject = (client) => {
    // Navegar al módulo de proyectos con el cliente pre-seleccionado
    navigate('/proyectos', { 
      state: { 
        selectedClient: {
          id: client.id,
          name: client.name,
          type: client.type,
          sector: client.sector,
          city: client.city
        }
      } 
    });
  };

  const handleSubmit = async (formData) => {
    if (editingClient.id) {
      await updateMutation.mutateAsync({ id: editingClient.id, ...formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      'empresa': { bg: 'primary', text: 'Empresa', icon: FiHome },
      'persona': { bg: 'info', text: 'Persona Natural', icon: FiUser }
    };
    
    const config = typeConfig[type] || { bg: 'secondary', text: type, icon: FiUser };
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
      header: 'ID',
      accessor: 'id',
      width: '80px'
    },
    {
      header: 'Cliente',
      accessor: 'name',
      render: (value, row) => (
        <div>
          <div className="fw-medium">{row.name}</div>
          <div className="d-flex align-items-center gap-2 mt-1">
            {getTypeBadge(row.type)}
            {row.ruc && (
              <small className="text-muted">RUC: {row.ruc}</small>
            )}
            {row.dni && (
              <small className="text-muted">DNI: {row.dni}</small>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'Contacto',
      accessor: 'contact',
      render: (value, row) => (
        <div>
          {row.contact_name && (
            <div className="fw-medium">{row.contact_name}</div>
          )}
          {row.email && (
            <div className="d-flex align-items-center mt-1">
              <FiMail size={12} className="me-1 text-muted" />
              <small className="text-muted">{row.email}</small>
            </div>
          )}
          {row.phone && (
            <div className="d-flex align-items-center mt-1">
              <FiPhone size={12} className="me-1 text-muted" />
              <small className="text-muted">{row.phone}</small>
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Ciudad',
      accessor: 'city',
      render: (value) => {
        const city = value || 'No especificada';
        let cityColor = 'secondary';
        
        // Asignar colores según la ciudad
        switch (city) {
          case 'Lima':
            cityColor = 'primary';
            break;
          case 'Arequipa':
            cityColor = 'info';
            break;
          case 'Cusco':
            cityColor = 'success';
            break;
          case 'Trujillo':
            cityColor = 'warning';
            break;
          case 'Piura':
            cityColor = 'danger';
            break;
          case 'Chiclayo':
            cityColor = 'info';
            break;
          case 'Iquitos':
            cityColor = 'success';
            break;
          case 'Huancayo':
            cityColor = 'warning';
            break;
          default:
            cityColor = 'secondary';
        }
        
        return (
          <Badge bg={cityColor} className="px-2 py-1">
            {city}
          </Badge>
        );
      }
    },
    {
      header: 'Sector',
      accessor: 'sector',
      render: (value) => {
        const sector = value || 'General';
        let sectorColor = 'secondary';
        
        // Asignar colores según el sector
        switch (sector) {
          case 'Construcción':
            sectorColor = 'warning';
            break;
          case 'Minería':
            sectorColor = 'dark';
            break;
          case 'Ingeniería':
            sectorColor = 'primary';
            break;
          case 'Laboratorio':
            sectorColor = 'info';
            break;
          case 'Consultoría':
            sectorColor = 'success';
            break;
          case 'Tecnología':
            sectorColor = 'primary';
            break;
          case 'Ambiental':
            sectorColor = 'success';
            break;
          case 'Geología':
            sectorColor = 'info';
            break;
          default:
            sectorColor = 'secondary';
        }
        
        return (
          <Badge bg={sectorColor} className="px-2 py-1">
            {sector}
          </Badge>
        );
      }
    },
    {
      header: 'Dirección',
      accessor: 'address',
      render: (value) => (
        value ? (
          <div className="d-flex align-items-center">
            <FiMapPin size={12} className="me-1 text-muted" />
            <small className="text-muted">{value}</small>
          </div>
        ) : (
          <small className="text-muted">Sin dirección</small>
        )
      )
    },
    {
      header: 'Fecha Registro',
      accessor: 'created_at',
      type: 'date'
    },
    {
      header: 'Acciones',
      accessor: 'actions',
      render: (value, row) => (
        <div className="d-flex gap-1">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => handleEdit(row)}
            title="Editar cliente"
          >
            <FiEdit size={14} />
          </Button>
          <Button
            variant="outline-success"
            size="sm"
            onClick={() => handleCreateProject(row)}
            title="Crear proyecto para este cliente"
          >
            <FiFolderPlus size={14} />
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => handleDelete(row)}
            title="Eliminar cliente"
          >
            <FiTrash2 size={14} />
          </Button>
        </div>
      )
    }
  ];

  const formFields = [
    {
      name: 'type',
      label: 'Tipo de Cliente',
      type: 'select',
      required: true,
      options: [
        { value: 'empresa', label: 'Empresa' },
        { value: 'persona', label: 'Persona Natural' }
      ]
    },
    {
      name: 'name',
      label: 'Nombre/Razón Social',
      type: 'text',
      required: true,
      placeholder: 'Ingresa el nombre o razón social'
    },
    {
      name: 'ruc',
      label: 'RUC',
      type: 'text',
      placeholder: 'Ingresa el RUC (solo para empresas)',
      help: 'Solo para empresas'
    },
    {
      name: 'dni',
      label: 'DNI',
      type: 'text',
      placeholder: 'Ingresa el DNI (solo para personas)',
      help: 'Solo para personas naturales'
    },
    {
      name: 'contact_name',
      label: 'Nombre de Contacto',
      type: 'text',
      placeholder: 'Ingresa el nombre del contacto'
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'contacto@empresa.com'
    },
    {
      name: 'phone',
      label: 'Teléfono',
      type: 'text',
      placeholder: '+51 999 999 999'
    },
    {
      name: 'address',
      label: 'Dirección',
      type: 'textarea',
      placeholder: 'Ingresa la dirección completa'
    },
    {
      name: 'city',
      label: 'Ciudad',
      type: 'text',
      placeholder: 'Escribe la ciudad (ej: Lima, Arequipa, Cusco...)',
      autocomplete: true,
      suggestions: [
        'Lima', 'Arequipa', 'Cusco', 'Trujillo', 'Piura', 'Chiclayo', 'Iquitos', 'Huancayo',
        'Tacna', 'Cajamarca', 'Ayacucho', 'Puno', 'Juliaca', 'Chimbote', 'Huaraz', 'Abancay',
        'Andahuaylas', 'Tumbes', 'Pucallpa', 'Tarapoto', 'Moyobamba', 'Cerro de Pasco', 'Huánuco',
        'Ica', 'Nazca', 'Chincha', 'Cañete', 'Barranca', 'Huaral', 'Callao', 'Ventanilla',
        'San Juan de Miraflores', 'Villa El Salvador', 'San Martín de Porres', 'Comas',
        'Los Olivos', 'San Miguel', 'Pueblo Libre', 'Jesús María', 'Magdalena', 'San Isidro',
        'Miraflores', 'Surco', 'La Molina', 'Ate', 'Santa Anita', 'El Agustino', 'San Juan de Lurigancho',
        'Lurigancho', 'Chosica', 'Chaclacayo', 'Cieneguilla', 'Pachacámac', 'Punta Hermosa',
        'Punta Negra', 'San Bartolo', 'Santa María del Mar', 'Pucusana', 'Asia', 'Mala',
        'San Vicente de Cañete', 'Imperial', 'Nuevo Imperial', 'Quilmaná', 'San Luis',
        'San Pedro de Lloc', 'Pacasmayo', 'Guadalupe', 'Jequetepeque', 'Chepén', 'Cascas',
        'Contumazá', 'Cupisnique', 'Guzmango', 'San Benito', 'San Diego', 'San José',
        'San Pablo', 'Tembladera', 'Yonán', 'Zaña', 'Cajabamba', 'Cajamarca', 'Celendín',
        'Chota', 'Contumazá', 'Cutervo', 'Hualgayoc', 'Jaén', 'San Ignacio', 'San Marcos',
        'San Miguel', 'San Pablo', 'Santa Cruz', 'Bagua', 'Bongará', 'Condorcanqui',
        'Luya', 'Rodríguez de Mendoza', 'Utcubamba', 'Chachapoyas', 'Asunción', 'Balsas',
        'Cheto', 'Chiliquín', 'Chuquibamba', 'Granada', 'Huancas', 'La Jalca', 'Leimebamba',
        'Levanto', 'Magdalena', 'Mariscal Castilla', 'Molinopampa', 'Montevideo', 'Olleros',
        'Quinjalca', 'San Francisco de Daguas', 'San Isidro de Maino', 'Soloco', 'Sonche',
        'Abancay', 'Andahuaylas', 'Antabamba', 'Aymaraes', 'Chincheros', 'Cotabambas',
        'Grau', 'Huancarama', 'Huancaray', 'Huanipaca', 'Kishuara', 'Lambrama', 'Pacobamba',
        'Pacucha', 'Pampachiri', 'Pomacocha', 'San Antonio de Cachi', 'San Jerónimo',
        'San Miguel de Chaccrampa', 'Santa María de Chicmo', 'Talavera', 'Tamburco',
        'Andahuaylas', 'Antabamba', 'Aymaraes', 'Chincheros', 'Cotabambas', 'Grau',
        'Huancarama', 'Huancaray', 'Huanipaca', 'Kishuara', 'Lambrama', 'Pacobamba',
        'Pacucha', 'Pampachiri', 'Pomacocha', 'San Antonio de Cachi', 'San Jerónimo',
        'San Miguel de Chaccrampa', 'Santa María de Chicmo', 'Talavera', 'Tamburco'
      ]
    },
    {
      name: 'sector',
      label: 'Sector',
      type: 'text',
      placeholder: 'Escribe el sector (ej: Construcción, Minería, Tecnología...)',
      autocomplete: true,
      suggestions: [
        'General', 'Construcción', 'Minería', 'Ingeniería', 'Laboratorio', 'Consultoría', 
        'Tecnología', 'Ambiental', 'Geología', 'Agricultura', 'Ganadería', 'Pesca',
        'Manufactura', 'Textil', 'Alimentario', 'Farmacéutico', 'Químico', 'Petroquímico',
        'Energía', 'Electricidad', 'Gas', 'Agua', 'Saneamiento', 'Transporte', 'Logística',
        'Comercio', 'Retail', 'Mayorista', 'Distribución', 'Servicios Financieros', 'Banca',
        'Seguros', 'Inversiones', 'Bienes Raíces', 'Inmobiliaria', 'Turismo', 'Hotelería',
        'Restaurantes', 'Entretenimiento', 'Medios', 'Comunicaciones', 'Telecomunicaciones',
        'Software', 'Hardware', 'Sistemas', 'Internet', 'E-commerce', 'Marketing', 'Publicidad',
        'Educación', 'Capacitación', 'Investigación', 'Desarrollo', 'Salud', 'Medicina',
        'Farmacéutica', 'Biotecnología', 'Gobierno', 'Público', 'Defensa', 'Seguridad',
        'Legal', 'Jurídico', 'Contable', 'Auditoría', 'Recursos Humanos', 'Administración',
        'Gestión', 'Consultoría Empresarial', 'Outsourcing', 'Servicios Profesionales',
        'Arquitectura', 'Diseño', 'Arte', 'Cultura', 'Deportes', 'Recreación', 'ONG',
        'Fundaciones', 'Religioso', 'Espiritual', 'Otro'
      ]
    }
  ];

  // Calcular estadísticas
  const stats = useMemo(() => {
    // Usar estadísticas reales del backend si están disponibles
    if (statsData && statsData.data) {
      console.log('📊 Stats - Usando estadísticas reales del backend:', statsData);
      console.log('📊 Stats - Datos extraídos:', statsData.data);
      return {
        total: statsData.data.total || 0,
        empresas: statsData.data.empresas || 0,
        personas: statsData.data.personas || 0,
        conEmail: statsData.data.withEmail || 0,
        conTelefono: statsData.data.withPhone || 0
      };
    }
    
    // Fallback: calcular desde los datos de la página actual
    const companies = data?.data || [];
    console.log('📊 Stats - Fallback: calculando desde página actual:', companies);
    return {
      total: companies.length,
      empresas: companies.filter(c => c.type === 'empresa').length,
      personas: companies.filter(c => c.type === 'persona').length,
      conEmail: companies.filter(c => c.email).length,
      conTelefono: companies.filter(c => c.phone).length
    };
  }, [statsData, data]);

  return (
    <Container fluid className="py-4">
      <div className="fade-in">
        <PageHeader
          title="Gestión de Clientes"
          subtitle="Crear, editar y gestionar clientes del sistema"
          icon={FiUsers}
          actions={
            <Button 
              variant="primary" 
              onClick={handleCreate}
              disabled={!userCanCreateClient}
              title={!userCanCreateClient ? `No tienes permisos para crear clientes. Rol actual: ${currentUser?.role || 'No autenticado'}` : 'Crear nuevo cliente'}
            >
              <FiPlus className="me-2" />
              Nuevo Cliente
            </Button>
          }
        />

        {/* Información de depuración */}
        {!userCanCreateClient && (
          <div className="alert alert-warning mb-4" role="alert">
            <strong>⚠️ Permisos insuficientes:</strong> Tu rol actual ({currentUser?.role || 'No autenticado'}) no tiene permisos para crear clientes. 
            Solo los roles <code>admin</code>, <code>jefa_comercial</code> y <code>vendedor_comercial</code> pueden crear clientes.
          </div>
        )}

        {/* Estadísticas */}
        <Row className="g-4 mb-4">
          <Col md={6} lg={3}>
            <StatsCard
              title="Total Clientes"
              value={stats.total}
              icon={FiUsers}
              color="primary"
              subtitle="Clientes registrados"
              loading={statsLoading}
            />
          </Col>
          <Col md={6} lg={3}>
            <StatsCard
              title="Empresas"
              value={stats.empresas}
              icon={FiBuilding}
              color="success"
              subtitle="Clientes corporativos"
              loading={statsLoading}
            />
          </Col>
          <Col md={6} lg={3}>
            <StatsCard
              title="Personas"
              value={stats.personas}
              icon={FiUser}
              color="info"
              subtitle="Clientes individuales"
              loading={statsLoading}
            />
          </Col>
          <Col md={6} lg={3}>
            <StatsCard
              title="Con Contacto"
              value={stats.conEmail}
              icon={FiMail}
              color="warning"
              subtitle="Con email registrado"
              loading={statsLoading}
            />
          </Col>
        </Row>

        {/* Tabla de clientes */}
        <Card className="shadow-sm border-0">
          <Card.Header className="bg-white border-bottom">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FiUsers className="me-2 text-primary" />
                Lista de Clientes
              </h5>
              <Badge bg="light" text="dark" className="px-3 py-2">
                {stats.total} clientes
              </Badge>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            <DataTable
              data={data?.data || []}
              columns={columns}
              loading={isLoading || isSearching}
              onEdit={handleEdit}
              onDelete={handleDelete}
              emptyMessage="No hay clientes registrados"
              // Props para paginación del backend
              totalItems={data?.total || 0}
              itemsPerPage={20}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onSearch={handleSearch}
              onFilter={handleFilter}
              // Filtros específicos para clientes
              filterOptions={clientFilterOptions}
            />
          </Card.Body>
        </Card>

      <ModalForm
        show={showModal}
        onHide={() => setShowModal(false)}
        title={editingClient?.id ? 'Editar Cliente' : 'Nuevo Cliente'}
        data={editingClient || emptyForm}
        fields={formFields}
        onSubmit={handleSubmit}
        loading={createMutation.isLoading || updateMutation.isLoading}
        submitText={editingClient?.id ? 'Actualizar' : 'Crear'}
      />
      </div>
    </Container>
  );
};