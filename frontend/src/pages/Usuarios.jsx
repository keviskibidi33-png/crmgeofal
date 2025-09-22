import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Button, Badge, Row, Col, Card, Container } from 'react-bootstrap';
import { FiPlus, FiEdit, FiTrash2, FiLock, FiUser, FiUsers, FiShield, FiSettings, FiRefreshCw } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import ModalForm from '../components/common/ModalForm';
import StatsCard from '../components/common/StatsCard';
import { listUsers, createUser, updateUser, deleteUser, resetPassword } from '../services/users';

const emptyForm = { name: '', apellido: '', email: '', role: 'vendedor_comercial', area: 'Comercial', password: '' };

const ROLES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'jefa_comercial', label: 'Jefa Comercial' },
  { value: 'vendedor_comercial', label: 'Vendedor Comercial' },
  { value: 'jefe_laboratorio', label: 'Jefe Laboratorio' },
  { value: 'usuario_laboratorio', label: 'Usuario Laboratorio' },
  { value: 'laboratorio', label: 'Laboratorio' },
  { value: 'soporte', label: 'Soporte' },
  { value: 'gerencia', label: 'Gerencia' },
];

const AREAS = [
  { value: 'Comercial', label: 'Comercial' },
  { value: 'Laboratorio', label: 'Laboratorio' },
  { value: 'Sistemas', label: 'Sistemas' },
  { value: 'Gerencia', label: 'Gerencia' },
  { value: 'Soporte', label: 'Soporte' },
];

export default function Usuarios() {
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [resettingUser, setResettingUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery(
    ['users'],
    () => listUsers(),
    { 
      keepPreviousData: true,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      staleTime: 0, // Siempre considerar los datos como obsoletos
      cacheTime: 0  // No mantener en caché
    }
  );

  const handleMutationSuccess = (message) => {
    queryClient.invalidateQueries('users');
    setShowModal(false);
    setEditingUser(null);
    setDeletingUser(null);
    setResettingUser(null);
    setNewPassword('');
  };

  const createMutation = useMutation(createUser, {
    onSuccess: () => handleMutationSuccess('Usuario creado exitosamente'),
    onError: (error) => console.error('Error creating user:', error)
  });

  const updateMutation = useMutation(updateUser, {
    onSuccess: () => handleMutationSuccess('Usuario actualizado exitosamente'),
    onError: (error) => console.error('Error updating user:', error)
  });

  const deleteMutation = useMutation(deleteUser, {
    onSuccess: () => handleMutationSuccess('Usuario eliminado exitosamente'),
    onError: (error) => console.error('Error deleting user:', error)
  });

  const resetPasswordMutation = useMutation(resetPassword, {
    onSuccess: () => handleMutationSuccess('Contraseña restablecida exitosamente'),
    onError: (error) => console.error('Error resetting password:', error)
  });

  const handleCreate = () => {
    setEditingUser(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDelete = (user) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar al usuario ${user.name}?`)) {
      deleteMutation.mutate(user.id);
    }
  };

  const handleResetPassword = (user) => {
    setResettingUser(user);
    setNewPassword('');
  };

  const handleSubmit = async (formData) => {
    if (editingUser.id) {
      await updateMutation.mutateAsync({ id: editingUser.id, ...formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handlePasswordReset = async () => {
    if (newPassword && resettingUser) {
      await resetPasswordMutation.mutateAsync({ 
        id: resettingUser.id, 
        password: newPassword 
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
      header: 'Fecha Creación',
      accessor: 'created_at',
      type: 'date'
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

  const actions = [
    {
      label: 'Editar',
      icon: FiEdit,
      onClick: handleEdit,
      variant: 'outline-primary'
    },
    {
      label: 'Eliminar',
      icon: FiTrash2,
      onClick: handleDelete,
      variant: 'outline-danger'
    }
  ];

  // Calcular estadísticas
  const stats = useMemo(() => {
    const users = data?.users || [];
    return {
      total: users.length,
      admins: users.filter(u => u.role === 'admin').length,
      vendedores: users.filter(u => u.role === 'vendedor_comercial').length,
      laboratorio: users.filter(u => ['jefe_laboratorio', 'usuario_laboratorio', 'laboratorio'].includes(u.role)).length,
      activos: users.filter(u => u.active !== false).length
    };
  }, [data]);

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
            />
          </Col>
          <Col md={6} lg={3}>
            <StatsCard
              title="Administradores"
              value={stats.admins}
              icon={FiShield}
              color="danger"
              subtitle="Usuarios con privilegios"
            />
          </Col>
          <Col md={6} lg={3}>
            <StatsCard
              title="Vendedores"
              value={stats.vendedores}
              icon={FiUser}
              color="success"
              subtitle="Equipo comercial"
            />
          </Col>
          <Col md={6} lg={3}>
            <StatsCard
              title="Laboratorio"
              value={stats.laboratorio}
              icon={FiSettings}
              color="info"
              subtitle="Personal técnico"
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
              data={data?.users || []}
              columns={columns}
              loading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              emptyMessage="No hay usuarios registrados"
              actions={[
                {
                  label: 'Restablecer Contraseña',
                  icon: FiLock,
                  onClick: handleResetPassword,
                  variant: 'outline-warning'
                }
              ]}
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

      {/* Modal para restablecer contraseña */}
      {resettingUser && (
        <ModalForm
          show={!!resettingUser}
          onHide={() => setResettingUser(null)}
          title="Restablecer Contraseña"
          data={{ password: newPassword }}
          fields={[
            {
              name: 'password',
              label: 'Nueva Contraseña',
              type: 'password',
              required: true,
              placeholder: 'Mínimo 6 caracteres'
            }
          ]}
          onSubmit={handlePasswordReset}
          loading={resetPasswordMutation.isLoading}
          submitText="Restablecer"
        />
      )}
      </div>
    </Container>
  );
};