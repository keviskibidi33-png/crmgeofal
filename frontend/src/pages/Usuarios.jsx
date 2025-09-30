import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Button, Badge, Row, Col, Card, Container, Dropdown, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { FiPlus, FiEdit, FiTrash2, FiLock, FiUser, FiUsers, FiShield, FiSettings, FiRefreshCw, FiMoreVertical, FiUserX, FiUserCheck } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import ModalForm from '../components/common/ModalForm';
import StatsCard from '../components/common/StatsCard';
import ConfirmModal from '../components/common/ConfirmModal';
import { listUsers, createUser, updateUser, deleteUser, getUserStats } from '../services/users';

const emptyForm = { name: '', apellido: '', email: '', role: 'vendedor_comercial', area: 'Comercial', password: '' };

const ROLES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'jefa_comercial', label: 'Jefa Comercial' },
  { value: 'vendedor_comercial', label: 'Vendedor Comercial' },
  { value: 'jefe_laboratorio', label: 'Jefe Laboratorio' },
  { value: 'usuario_laboratorio', label: 'Usuario Laboratorio' },
  { value: 'facturacion', label: 'Facturación' },
  // Eliminado rol 'laboratorio'. Usar 'usuario_laboratorio'
  { value: 'soporte', label: 'Soporte' },
  { value: 'gerencia', label: 'Gerencia' },
];

const AREAS = [
  { value: 'Comercial', label: 'Comercial' },
  { value: 'Laboratorio', label: 'Laboratorio' },
  { value: 'Facturación', label: 'Facturación' },
  { value: 'Sistemas', label: 'Sistemas' },
  { value: 'Gerencia', label: 'Gerencia' },
  { value: 'Soporte', label: 'Soporte' },
];

export default function Usuarios() {
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  // Eliminado flujo de restablecer contraseña
  const [deactivatingUser, setDeactivatingUser] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery(
    ['users', currentPage, searchTerm, selectedRole, selectedArea],
    () => listUsers({ 
      page: currentPage, 
      limit: 20, 
      search: searchTerm, 
      role: selectedRole, 
      area: selectedArea 
    }),
    { 
      keepPreviousData: true,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      staleTime: 0, // Siempre considerar los datos como obsoletos
      cacheTime: 0  // No mantener en caché
    }
  );

  // Consulta separada para estadísticas reales
  const { data: statsData, isLoading: statsLoading } = useQuery(
    ['userStats'],
    getUserStats,
    {
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      staleTime: 30000, // 30 segundos
      cacheTime: 60000  // 1 minuto
    }
  );

  const handleMutationSuccess = (message) => {
    queryClient.invalidateQueries('users');
    queryClient.invalidateQueries('userStats'); // Invalidar también las estadísticas
    setShowModal(false);
    setEditingUser(null);
    setDeletingUser(null);
    // Eliminado flujo de restablecer contraseña
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
    setSelectedRole(filters.role || '');
    setSelectedArea(filters.area || '');
    setCurrentPage(1); // Resetear a la primera página
  };

  const createMutation = useMutation(createUser, {
    onSuccess: () => handleMutationSuccess('Usuario creado exitosamente'),
    onError: (error) => console.error('Error creating user:', error)
  });

  const updateMutation = useMutation(
    ({ id, ...userData }) => updateUser(id, userData),
    {
      onSuccess: () => handleMutationSuccess('Usuario actualizado exitosamente'),
      onError: (error) => console.error('Error updating user:', error)
    }
  );

  const deleteMutation = useMutation(deleteUser, {
    onSuccess: () => handleMutationSuccess('Usuario eliminado exitosamente'),
    onError: (error) => console.error('Error deleting user:', error)
  });

  // Eliminado resetPasswordMutation

  const deactivateUserMutation = useMutation(
    ({ id, userData }) => {
      console.log('🔍 deactivateUserMutation - Llamando updateUser con:', { id, userData });
      return updateUser(id, userData);
    },
    {
      onSuccess: (data) => {
        console.log('✅ deactivateUserMutation - Éxito:', data);
        setSuccess('Usuario desactivado exitosamente');
        setDeactivatingUser(null);
        queryClient.invalidateQueries('users');
        queryClient.invalidateQueries('userStats');
      },
      onError: (error) => {
        console.error('❌ deactivateUserMutation - Error:', error);
        setError('Error al desactivar usuario: ' + (error.message || 'Error desconocido'));
      }
    }
  );

  const activateUserMutation = useMutation(
    ({ id, userData }) => updateUser(id, userData),
    {
      onSuccess: () => {
        setSuccess('Usuario activado exitosamente');
        setDeactivatingUser(null);
        queryClient.invalidateQueries('users');
        queryClient.invalidateQueries('userStats');
      },
      onError: (error) => {
        setError('Error al activar usuario: ' + (error.message || 'Error desconocido'));
        console.error('Error activating user:', error);
      }
    }
  );


  const handleCreate = () => {
    setEditingUser(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (user, event) => {
    event?.stopPropagation();
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDelete = (user, event) => {
    event?.stopPropagation();
    setDeletingUser(user);
  };

  const confirmDelete = async () => {
    try {
      console.log('🔍 confirmDelete - Eliminando usuario:', deletingUser.id);
      await deleteMutation.mutateAsync(deletingUser.id);
      console.log('✅ confirmDelete - Usuario eliminado exitosamente');
      setDeletingUser(null);
    } catch (error) {
      console.error('❌ confirmDelete - Error:', error);
      setError('Error al eliminar usuario: ' + error.message);
      setDeletingUser(null);
    }
  };

  // Eliminado handleResetPassword

  const handleSubmit = async (formData) => {
    if (editingUser.id) {
      await updateMutation.mutateAsync({ id: editingUser.id, ...formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  // Eliminado handlePasswordReset

  const handleDeactivateUser = (user, event) => {
    event?.stopPropagation();
    setDeactivatingUser(user);
  };

  const confirmDeactivate = async () => {
    if (deactivatingUser) {
      console.log('🔍 confirmDeactivate - Desactivando usuario:', deactivatingUser.id);
      try {
        const result = await deactivateUserMutation.mutateAsync({
          id: deactivatingUser.id,
          userData: { active: false }
        });
        console.log('✅ confirmDeactivate - Usuario desactivado exitosamente:', result);
      } catch (error) {
        console.error('❌ confirmDeactivate - Error:', error);
      }
    }
  };


  const handleActivateUser = (user, event) => {
    event?.stopPropagation();
    setDeactivatingUser(user);
  };

  const confirmActivate = async () => {
    if (deactivatingUser) {
      await activateUserMutation.mutateAsync({
        id: deactivatingUser.id,
        userData: { active: true }
      });
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'danger',
      jefa_comercial: 'warning',
      vendedor_comercial: 'primary',
      jefe_laboratorio: 'info',
      usuario_laboratorio: 'secondary',
      laboratorio: 'secondary',
      soporte: 'success',
      gerencia: 'dark'
    };
    return colors[role] || 'secondary';
  };

  const getRoleLabel = (role) => {
    const roleObj = ROLES.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      width: '80px'
    },
    {
      header: 'Nombre',
      accessor: 'name',
      render: (value, row) => (
        <div>
          <div className="fw-medium">{row.name} {row.apellido}</div>
          <small className="text-muted">{row.email}</small>
        </div>
      )
    },
    {
      header: 'Rol',
      accessor: 'role',
      render: (value) => (
        <Badge bg={getRoleBadgeColor(value)} className="status-badge">
          {getRoleLabel(value)}
        </Badge>
      )
    },
    {
      header: 'Área',
      accessor: 'area',
      render: (value) => (
        <Badge bg="light" text="dark" className="status-badge">
          {value}
        </Badge>
      )
    },
    {
      header: 'Estado',
      accessor: 'active',
      render: (value, row) => (
        <Badge bg={value !== false ? 'success' : 'danger'} className="status-badge">
          {value !== false ? 'Activo' : 'Inactivo'}
        </Badge>
      )
    },
    {
      header: 'Fecha Creación',
      accessor: 'created_at',
      type: 'date'
    },
    {
      header: 'Acciones',
      accessor: 'actions',
      render: (value, row) => (
        <Dropdown>
          <Dropdown.Toggle variant="outline-secondary" size="sm" id={`dropdown-${row.id}`}>
            <FiMoreVertical />
          </Dropdown.Toggle>
          <Dropdown.Menu>
                <Dropdown.Item onClick={(e) => handleEdit(row, e)}>
                  <FiEdit className="me-2" />
                  Editar Usuario
                </Dropdown.Item>
            <Dropdown.Divider />
            {row.active !== false ? (
              <Dropdown.Item onClick={(e) => handleDeactivateUser(row, e)} className="text-warning">
                <FiUserX className="me-2" />
                Desactivar Usuario
              </Dropdown.Item>
            ) : (
              <Dropdown.Item onClick={(e) => handleActivateUser(row, e)} className="text-success">
                <FiUserCheck className="me-2" />
                Activar Usuario
              </Dropdown.Item>
            )}
            <Dropdown.Item onClick={(e) => handleDelete(row, e)} className="text-danger">
              <FiTrash2 className="me-2" />
              Eliminar Usuario
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      )
    }
  ];

  const formFields = [
    {
      name: 'name',
      label: 'Nombre',
      type: 'text',
      required: true,
      placeholder: 'Ingresa el nombre'
    },
    {
      name: 'apellido',
      label: 'Apellido',
      type: 'text',
      required: true,
      placeholder: 'Ingresa el apellido'
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      placeholder: 'usuario@ejemplo.com'
    },
    {
      name: 'role',
      label: 'Rol',
      type: 'select',
      required: true,
      options: ROLES
    },
    {
      name: 'area',
      label: 'Área',
      type: 'select',
      required: true,
      options: AREAS
    },
    {
      name: 'password',
      label: 'Contraseña',
      type: 'password',
      required: !editingUser?.id,
      placeholder: 'Mínimo 6 caracteres',
      help: editingUser?.id ? 'Dejar vacío para mantener la contraseña actual' : 'Mínimo 6 caracteres'
    }
  ];

  // Removemos las acciones antiguas ya que ahora usamos el menú desplegable

  // Calcular estadísticas
  const stats = useMemo(() => {
    // Usar estadísticas reales del backend si están disponibles
    if (statsData) {
      console.log('📊 Stats - Usando estadísticas reales del backend:', statsData);
      return {
        total: statsData.total || 0,
        admins: statsData.admins || 0,
        vendedores: statsData.vendedores || 0,
        laboratorio: statsData.laboratorio || 0,
        activos: statsData.active || 0
      };
    }
    
    // Fallback: calcular desde los datos de la página actual
    const users = data?.data || [];
    console.log('📊 Stats - Fallback: calculando desde página actual:', users);
    return {
      total: users.length,
      admins: users.filter(u => u.role === 'admin').length,
      vendedores: users.filter(u => u.role === 'vendedor_comercial').length,
      laboratorio: users.filter(u => ['jefe_laboratorio', 'usuario_laboratorio'].includes(u.role)).length,
      activos: users.filter(u => u.active !== false).length
    };
  }, [statsData, data]);

  return (
    <Container fluid className="py-4">
      <div className="fade-in">
        <PageHeader
          title="Gestión de Usuarios"
          subtitle="Crear, editar, eliminar y gestionar usuarios del sistema"
          icon={FiUsers}
          actions={
            <Button variant="primary" onClick={handleCreate}>
              <FiPlus className="me-2" />
              Nuevo Usuario
            </Button>
          }
        />

        {/* Estadísticas */}
        <Row className="g-4 mb-4">
          <Col md={6} lg={3}>
            <StatsCard
              title="Total Usuarios"
              value={stats.total}
              icon={FiUsers}
              color="primary"
              subtitle="Usuarios registrados"
              loading={statsLoading}
            />
          </Col>
          <Col md={6} lg={3}>
            <StatsCard
              title="Administradores"
              value={stats.admins}
              icon={FiShield}
              color="danger"
              subtitle="Usuarios con privilegios"
              loading={statsLoading}
            />
          </Col>
          <Col md={6} lg={3}>
            <StatsCard
              title="Vendedores"
              value={stats.vendedores}
              icon={FiUser}
              color="success"
              subtitle="Equipo comercial"
              loading={statsLoading}
            />
          </Col>
          <Col md={6} lg={3}>
            <StatsCard
              title="Laboratorio"
              value={stats.laboratorio}
              icon={FiSettings}
              color="info"
              subtitle="Personal técnico"
              loading={statsLoading}
            />
          </Col>
        </Row>

        {/* Tabla de usuarios */}
        <Card className="shadow-sm border-0">
          <Card.Header className="bg-white border-bottom">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FiUsers className="me-2 text-primary" />
                Lista de Usuarios
              </h5>
              <div className="d-flex align-items-center gap-2">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isLoading}
                  className="refresh-btn"
                >
                  <FiRefreshCw className={isLoading ? 'spinning' : ''} />
                </Button>
                <Badge bg="light" text="dark" className="px-3 py-2">
                  {stats.total} usuarios
                </Badge>
              </div>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            <DataTable
              data={data?.data || []}
              columns={columns}
              loading={isLoading || isSearching}
              emptyMessage="No hay usuarios registrados"
              // Props para paginación del backend
              totalItems={data?.total || 0}
              itemsPerPage={20}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onSearch={handleSearch}
              onFilter={handleFilter}
            />
          </Card.Body>
        </Card>

      <ModalForm
        show={showModal}
        onHide={() => setShowModal(false)}
        title={editingUser?.id ? 'Editar Usuario' : 'Nuevo Usuario'}
        data={editingUser || emptyForm}
        fields={formFields}
        onSubmit={handleSubmit}
        loading={createMutation.isLoading || updateMutation.isLoading}
        submitText={editingUser?.id ? 'Actualizar' : 'Crear'}
      />

      {/* Modal de restablecer contraseña eliminado */}

      {/* Modal para desactivar usuario */}
      <Modal show={!!deactivatingUser} onHide={() => setDeactivatingUser(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FiUserX className="me-2 text-warning" />
            {deactivatingUser?.active !== false ? 'Desactivar Usuario' : 'Activar Usuario'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            ¿Estás seguro de que quieres {deactivatingUser?.active !== false ? 'desactivar' : 'activar'} al usuario{' '}
            <strong>{deactivatingUser?.name} {deactivatingUser?.apellido}</strong>?
          </p>
          {deactivatingUser?.active !== false ? (
            <Alert variant="warning">
              <strong>Nota:</strong> Al desactivar el usuario, no podrá acceder al sistema hasta que sea reactivado.
            </Alert>
          ) : (
            <Alert variant="info">
              <strong>Nota:</strong> Al activar el usuario, podrá acceder nuevamente al sistema.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeactivatingUser(null)}>
            Cancelar
          </Button>
          <Button 
            variant={deactivatingUser?.active !== false ? 'warning' : 'success'}
            onClick={deactivatingUser?.active !== false ? confirmDeactivate : confirmActivate}
            disabled={deactivatingUser?.active !== false ? deactivateUserMutation.isLoading : activateUserMutation.isLoading}
          >
            {(deactivatingUser?.active !== false ? deactivateUserMutation.isLoading : activateUserMutation.isLoading) ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Procesando...
              </>
            ) : (
              <>
                {deactivatingUser?.active !== false ? (
                  <>
                    <FiUserX className="me-2" />
                    Desactivar
                  </>
                ) : (
                  <>
                    <FiUserCheck className="me-2" />
                    Activar
                  </>
                )}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para eliminar usuario */}
      <ConfirmModal
        show={!!deletingUser}
        onHide={() => setDeletingUser(null)}
        onConfirm={confirmDelete}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que quieres eliminar al usuario ${deletingUser?.name} ${deletingUser?.apellido}?`}
        confirmText="Eliminar"
        variant="danger"
        isLoading={deleteMutation.isLoading}
        alertMessage="¡Advertencia! Esta acción es irreversible. Se eliminarán todos los datos asociados al usuario."
        alertVariant="danger"
      />


      {/* Alertas de éxito y error */}
      {success && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
          <Alert variant="success" dismissible onClose={() => setSuccess('')}>
            {success}
          </Alert>
        </div>
      )}
      
      {error && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        </div>
      )}
      </div>
    </Container>
  );
};