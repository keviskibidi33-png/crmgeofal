import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { Button, Badge, Row, Col, Card, Container } from 'react-bootstrap';
import { FiPlus, FiEdit, FiTrash2, FiUser, FiHome, FiMail, FiPhone, FiMapPin, FiUsers, FiHome as FiBuilding, FiFolderPlus, FiClock, FiUserCheck } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import ModalForm from '../components/common/ModalForm';
import ClientFormRedesigned from '../components/ClientFormRedesigned';
import StatsCard from '../components/common/StatsCard';
import ConfirmModal from '../components/common/ConfirmModal';
import PermissionDeniedModal from '../components/common/PermissionDeniedModal';
import ClientStatusDropdown from '../components/ClientStatusDropdown';
import ClientHistoryModal from '../components/ClientHistoryModal';
import { listCompanies, createCompany, updateCompany, deleteCompany, getCompanyStats, getCompanyFilterOptions } from '../services/companies';
import { getCurrentUser, canCreateClient, canEditClient, canDeleteClient, canViewClientHistory, canCreateProject, logUserInfo } from '../utils/authHelper';
import './Clientes.css';

const emptyForm = {
  id: null,
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
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedClientForHistory, setSelectedClientForHistory] = useState(null);
  const [showPermissionDeniedModal, setShowPermissionDeniedModal] = useState(false);
  const [permissionDeniedInfo, setPermissionDeniedInfo] = useState({});
  
  // Información del usuario actual
  const currentUser = getCurrentUser();
  const userCanCreateClient = canCreateClient();
  const userCanEditClient = canEditClient();
  const userCanDeleteClient = canDeleteClient();
  const userCanViewClientHistory = canViewClientHistory();
  const userCanCreateProject = canCreateProject();
  
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
    if (!userCanCreateClient) {
      setPermissionDeniedInfo({
        action: "crear clientes",
        requiredRole: "administrador, jefe comercial o vendedor comercial",
        currentRole: currentUser?.role || "no autenticado"
      });
      setShowPermissionDeniedModal(true);
      return;
    }
    setEditingClient(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (client) => {
    if (!userCanEditClient) {
      setPermissionDeniedInfo({
        action: "editar clientes",
        requiredRole: "administrador, jefe comercial o vendedor comercial",
        currentRole: currentUser?.role || "no autenticado"
      });
      setShowPermissionDeniedModal(true);
      return;
    }
    setEditingClient(client);
    setShowModal(true);
  };

  const handleDelete = (client) => {
    console.log('🔍 handleDelete - Verificando permisos:', {
      userCanDeleteClient,
      currentUserRole: currentUser?.role,
      currentUser: currentUser
    });
    
    if (!userCanDeleteClient) {
      console.log('🚫 handleDelete - Permisos insuficientes, mostrando modal');
      setPermissionDeniedInfo({
        action: "eliminar clientes",
        requiredRole: "administrador",
        currentRole: currentUser?.role || "no autenticado"
      });
      setShowPermissionDeniedModal(true);
      return;
    }
    console.log('✅ handleDelete - Permisos OK, procediendo con eliminación');
    setDeletingClient(client);
  };

  const confirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(deletingClient.id);
      setDeletingClient(null);
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      setDeletingClient(null);
    }
  };

  const handleCreateProject = (client) => {
    if (!userCanCreateProject) {
      setPermissionDeniedInfo({
        action: "crear cotizaciones",
        requiredRole: "administrador, jefe comercial o vendedor comercial",
        currentRole: currentUser?.role || "no autenticado"
      });
      setShowPermissionDeniedModal(true);
      return;
    }
    // Navegar a cotización inteligente con el cliente pre-seleccionado
    navigate('/cotizaciones/inteligente', { 
      state: { 
        selectedClient: {
          id: client.id,
          name: client.name,
          type: client.type,
          sector: client.sector,
          city: client.city,
          ruc: client.ruc,
          dni: client.dni,
          email: client.email,
          phone: client.phone,
          contact_name: client.contact_name,
          address: client.address
        }
      } 
    });
  };

  const handleShowHistory = (client) => {
    if (!userCanViewClientHistory) {
      setPermissionDeniedInfo({
        action: "ver historial de clientes",
        requiredRole: "administrador, jefe comercial o vendedor comercial",
        currentRole: currentUser?.role || "no autenticado"
      });
      setShowPermissionDeniedModal(true);
      return;
    }
    setSelectedClientForHistory(client);
    setShowHistoryModal(true);
  };

  const handleStatusChange = (clientId, newStatus) => {
    // La actualización se maneja automáticamente por react-query
    console.log(`Estado del cliente ${clientId} cambiado a: ${newStatus}`);
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
      width: '50px'
    },
    {
      header: 'Cliente',
      accessor: 'name',
      width: '180px',
      render: (value, row) => (
        <div>
          <div className="fw-medium" style={{fontSize: '0.8rem'}}>{row.name}</div>
          <div className="d-flex align-items-center gap-1 mt-1">
            {getTypeBadge(row.type)}
            {row.ruc && (
              <small className="text-muted" style={{fontSize: '0.7rem'}}>RUC: {row.ruc}</small>
            )}
            {row.dni && (
              <small className="text-muted" style={{fontSize: '0.7rem'}}>DNI: {row.dni}</small>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'Contacto',
      accessor: 'contact',
      width: '150px',
      render: (value, row) => (
        <div>
          {row.contact_name && (
            <div className="fw-medium" style={{fontSize: '0.8rem'}}>{row.contact_name}</div>
          )}
          {row.email && (
            <div className="d-flex align-items-center mt-1">
              <FiMail size={10} className="me-1 text-muted" />
              <small className="text-muted" style={{fontSize: '0.7rem'}}>{row.email}</small>
            </div>
          )}
          {row.phone && (
            <div className="d-flex align-items-center mt-1">
              <FiPhone size={10} className="me-1 text-muted" />
              <small className="text-muted" style={{fontSize: '0.7rem'}}>{row.phone}</small>
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Ciudad',
      accessor: 'city',
      width: '80px',
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
          <Badge bg={cityColor} className="px-1 py-0" style={{fontSize: '0.65rem'}}>
            {city}
          </Badge>
        );
      }
    },
    {
      header: 'Sector',
      accessor: 'sector',
      width: '80px',
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
          <Badge bg={sectorColor} className="px-1 py-0" style={{fontSize: '0.65rem'}}>
            {sector}
          </Badge>
        );
      }
    },
    {
      header: 'Estado',
      accessor: 'status',
      width: '120px',
      render: (value, row) => (
        <ClientStatusDropdown
          clientId={row.id}
          currentStatus={row.status || 'prospeccion'}
          onStatusChange={(newStatus) => handleStatusChange(row.id, newStatus)}
          size="sm"
          showLabel={true}
        />
      )
    },
    {
      header: 'Gestor',
      accessor: 'managed_by',
      width: '100px',
      render: (value, row) => (
        <div className="d-flex align-items-center">
          {row.managed_by_name ? (
            <>
              <FiUserCheck size={12} className="me-1 text-success" />
              <div>
                <div className="fw-medium" style={{fontSize: '0.8rem'}}>{row.managed_by_name}</div>
                <small className="text-muted" style={{fontSize: '0.7rem'}}>{row.managed_by_role}</small>
              </div>
            </>
          ) : (
            <span className="text-muted" style={{fontSize: '0.8rem'}}>Sin asignar</span>
          )}
        </div>
      )
    },
    {
      header: 'Dirección',
      accessor: 'address',
      width: '120px',
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
          {userCanEditClient && (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => handleEdit(row)}
              title="Editar cliente"
            >
              <FiEdit size={14} />
            </Button>
          )}
          {userCanViewClientHistory && (
            <Button
              variant="outline-info"
              size="sm"
              onClick={() => handleShowHistory(row)}
              title="Ver historial de cotizaciones y proyectos"
            >
              <FiClock size={14} />
            </Button>
          )}
          {userCanCreateProject && (
            <Button
              variant="outline-success"
              size="sm"
              onClick={() => handleCreateProject(row)}
              title="Crear cotización para este cliente"
            >
              <FiFolderPlus size={14} />
            </Button>
          )}
          {userCanDeleteClient && (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => handleDelete(row)}
              title="Eliminar cliente"
            >
              <FiTrash2 size={14} />
            </Button>
          )}
          {!userCanDeleteClient && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => {
                console.log('🚫 Botón eliminar clickeado sin permisos');
                setPermissionDeniedInfo({
                  action: "eliminar clientes",
                  requiredRole: "administrador",
                  currentRole: currentUser?.role || "no autenticado"
                });
                setShowPermissionDeniedModal(true);
              }}
              title="No tienes permisos para eliminar clientes"
            >
              <FiTrash2 size={14} />
            </Button>
          )}
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
    <div className="clientes-page">
      <Container fluid className="h-100 d-flex flex-column p-0">
        {/* Header compacto */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="mb-0 fw-bold">Gestión de Clientes</h4>
            <small className="text-muted">Crear, editar y gestionar clientes del sistema</small>
          </div>
            <Button 
              variant="primary" 
            size="sm"
              onClick={handleCreate}
              disabled={!userCanCreateClient}
              title={!userCanCreateClient ? `No tienes permisos para crear clientes. Rol actual: ${currentUser?.role || 'No autenticado'}` : 'Crear nuevo cliente'}
            >
            <FiPlus className="me-1" />
              Nuevo Cliente
            </Button>
        </div>

        {/* Información de depuración */}
        {!userCanCreateClient && (
          <div className="alert alert-warning py-1 mb-1" role="alert">
            <small><strong>⚠️ Permisos insuficientes:</strong> Tu rol actual ({currentUser?.role || 'No autenticado'}) no tiene permisos para crear clientes.</small>
          </div>
        )}

        {/* Estadísticas ultra compactas */}
        <Row className="g-0 mb-3">
          <Col md={6} lg={3}>
            <div className="bg-primary bg-opacity-10 rounded p-2 text-center">
              <div className="d-flex align-items-center justify-content-center">
                <FiUsers className="text-primary me-2" size={16} />
                <div>
                  <div className="fw-bold text-primary">{statsLoading ? '...' : stats.total}</div>
                  <small className="text-muted">Total</small>
                </div>
              </div>
            </div>
          </Col>
          <Col md={6} lg={3}>
            <div className="bg-success bg-opacity-10 rounded p-2 text-center">
              <div className="d-flex align-items-center justify-content-center">
                <FiBuilding className="text-success me-2" size={16} />
                <div>
                  <div className="fw-bold text-success">{statsLoading ? '...' : stats.empresas}</div>
                  <small className="text-muted">Empresas</small>
                </div>
              </div>
            </div>
          </Col>
          <Col md={6} lg={3}>
            <div className="bg-info bg-opacity-10 rounded p-2 text-center">
              <div className="d-flex align-items-center justify-content-center">
                <FiUser className="text-info me-2" size={16} />
                <div>
                  <div className="fw-bold text-info">{statsLoading ? '...' : stats.personas}</div>
                  <small className="text-muted">Personas</small>
                </div>
              </div>
            </div>
          </Col>
          <Col md={6} lg={3}>
            <div className="bg-warning bg-opacity-10 rounded p-2 text-center">
              <div className="d-flex align-items-center justify-content-center">
                <FiMail className="text-warning me-2" size={16} />
                <div>
                  <div className="fw-bold text-warning">{statsLoading ? '...' : stats.conEmail}</div>
                  <small className="text-muted">Con Email</small>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Tabla de clientes */}
        <Card className="shadow-sm border-0 flex-grow-1 d-flex flex-column">
          <Card.Header className="bg-white border-bottom flex-shrink-0 py-2">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <FiUsers className="me-1 text-primary" size={16} />
                Lista de Clientes
              </h6>
              <Badge bg="light" text="dark" className="px-2 py-1">
                {stats.total} clientes
              </Badge>
            </div>
          </Card.Header>
          <Card.Body className="p-0 flex-grow-1 d-flex flex-column">
            <div className="client-table flex-grow-1 d-flex flex-column">
              <DataTable
                data={data?.data || []}
                columns={columns}
                loading={isLoading || isSearching}
                onEdit={handleEdit}
                onDelete={handleDelete}
                emptyMessage="No hay clientes registrados"
                // Props para paginación del backend
                totalItems={data?.pagination?.total || 0}
                itemsPerPage={data?.pagination?.limit || 20}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onSearch={handleSearch}
                onFilter={handleFilter}
                // Filtros específicos para clientes
                filterOptions={clientFilterOptions}
                // Deshabilitar ordenamiento automático para mantener posición
                sortable={false}
                // Usar flexbox para ajustar altura
                useFlexbox={true}
              />
            </div>
          </Card.Body>
        </Card>

      <ClientFormRedesigned
        show={showModal}
        onHide={() => setShowModal(false)}
        data={editingClient || emptyForm}
        onSubmit={handleSubmit}
        loading={createMutation.isLoading || updateMutation.isLoading}
        isEditing={!!editingClient?.id}
      />

      {/* Modal de confirmación para eliminar cliente */}
      <ConfirmModal
        show={!!deletingClient}
        onHide={() => setDeletingClient(null)}
        onConfirm={confirmDelete}
        title="Eliminar Cliente"
        message={`¿Estás seguro de que quieres eliminar el cliente "${deletingClient?.name}"?`}
        confirmText="Eliminar"
        variant="danger"
        isLoading={deleteMutation.isLoading}
        alertMessage="Esta acción eliminará permanentemente el cliente y todos sus datos asociados (proyectos, cotizaciones, etc.)."
        alertVariant="danger"
      />

      {/* Modal de historial del cliente */}
      <ClientHistoryModal
        show={showHistoryModal}
        onHide={() => setShowHistoryModal(false)}
        clientId={selectedClientForHistory?.id}
        clientName={selectedClientForHistory?.name}
      />

      {/* Modal de permisos denegados */}
      <PermissionDeniedModal
        show={showPermissionDeniedModal}
        onHide={() => setShowPermissionDeniedModal(false)}
        action={permissionDeniedInfo.action}
        requiredRole={permissionDeniedInfo.requiredRole}
        currentRole={permissionDeniedInfo.currentRole}
      />
      </Container>
      </div>
  );
};