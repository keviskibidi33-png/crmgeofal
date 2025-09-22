import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Button, Badge, Row, Col, Card, Container } from 'react-bootstrap';
import { FiPlus, FiEdit, FiTrash2, FiUser, FiHome, FiMail, FiPhone, FiMapPin, FiUsers, FiHome as FiBuilding } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import ModalForm from '../components/common/ModalForm';
import StatsCard from '../components/common/StatsCard';
import { listCompanies, createCompany, updateCompany, deleteCompany, getCompanyStats } from '../services/companies';

const emptyForm = {
  type: 'empresa',
  ruc: '',
  dni: '',
  name: '',
  address: '',
  email: '',
  phone: '',
  contact_name: '',
};

export default function Clientes() {
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deletingClient, setDeletingClient] = useState(null);
  
  // Estado para paginación y filtros
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery(
    ['clients', currentPage, searchTerm, selectedType],
    () => listCompanies({ 
      page: currentPage, 
      limit: 20, 
      search: searchTerm, 
      type: selectedType 
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
  const { data: statsData, isLoading: statsLoading } = useQuery(
    ['clientStats'],
    getCompanyStats,
    {
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      staleTime: 30000, // 30 segundos
      cacheTime: 60000  // 1 minuto
    }
  );

  const handleMutationSuccess = (message) => {
    queryClient.invalidateQueries('clients');
    queryClient.invalidateQueries('clientStats'); // Invalidar también las estadísticas
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
    setCurrentPage(1); // Resetear a la primera página
  };

  // Opciones de filtros específicas para clientes
  const clientFilterOptions = [
    {
      title: 'Por Tipo de Cliente',
      options: [
        { label: 'Empresas', filter: { type: 'empresa' } },
        { label: 'Personas Naturales', filter: { type: 'persona' } }
      ]
    },
    {
      title: 'Por Sector',
      options: [
        { label: 'Construcción', filter: { sector: 'construccion' } },
        { label: 'Minería', filter: { sector: 'mineria' } },
        { label: 'Ingeniería', filter: { sector: 'ingenieria' } },
        { label: 'Laboratorio', filter: { sector: 'laboratorio' } },
        { label: 'Consultoría', filter: { sector: 'consultoria' } },
        { label: 'Tecnología', filter: { sector: 'tecnologia' } },
        { label: 'Ambiental', filter: { sector: 'ambiental' } },
        { label: 'Geología', filter: { sector: 'geologia' } }
      ]
    },
    {
      title: 'Por Ciudad',
      options: [
        { label: 'Lima', filter: { ciudad: 'lima' } },
        { label: 'Arequipa', filter: { ciudad: 'arequipa' } },
        { label: 'Cusco', filter: { ciudad: 'cusco' } },
        { label: 'Trujillo', filter: { ciudad: 'trujillo' } },
        { label: 'Piura', filter: { ciudad: 'piura' } },
        { label: 'Chiclayo', filter: { ciudad: 'chiclayo' } },
        { label: 'Iquitos', filter: { ciudad: 'iquitos' } },
        { label: 'Huancayo', filter: { ciudad: 'huancayo' } }
      ]
    }
  ];

  const createMutation = useMutation(createCompany, {
    onSuccess: () => handleMutationSuccess('Cliente creado exitosamente'),
    onError: (error) => console.error('Error creating client:', error)
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
    }
  ];

  // Calcular estadísticas
  const stats = useMemo(() => {
    // Usar estadísticas reales del backend si están disponibles
    if (statsData) {
      console.log('📊 Stats - Usando estadísticas reales del backend:', statsData);
      return {
        total: statsData.total || 0,
        empresas: statsData.empresas || 0,
        personas: statsData.personas || 0,
        conEmail: statsData.withEmail || 0,
        conTelefono: statsData.withPhone || 0
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
            <Button variant="primary" onClick={handleCreate}>
              <FiPlus className="me-2" />
              Nuevo Cliente
            </Button>
          }
        />

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