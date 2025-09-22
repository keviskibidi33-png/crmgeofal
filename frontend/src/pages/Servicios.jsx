import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Button, Badge, Alert } from 'react-bootstrap';
import { 
  FiPlus, FiEdit, FiTrash2, FiSettings, FiPackage, FiHome, 
  FiUsers, FiShield, FiCheckCircle, FiAlertTriangle
} from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import ModalForm from '../components/common/ModalForm';
import { listServices, createService, updateService, deleteService } from '../services/services';
import { useAuth } from '../contexts/AuthContext';

const emptyForm = { name: '', area: 'laboratorio' };

const AREAS = [
  { value: 'laboratorio', label: 'Laboratorio' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'soporte', label: 'Soporte' },
  { value: 'sistemas', label: 'Sistemas' },
  { value: 'gerencia', label: 'Gerencia' }
];

export default function Servicios() {
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deletingService, setDeletingService] = useState(null);
  const { user } = useAuth();
  const canManage = ['admin', 'jefe_laboratorio', 'jefa_comercial'].includes(user?.role);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ['services'],
    () => listServices(),
    { keepPreviousData: true }
  );

  const handleMutationSuccess = (message) => {
    queryClient.invalidateQueries('services');
    setShowModal(false);
    setEditingService(null);
    setDeletingService(null);
  };

  const createMutation = useMutation(createService, {
    onSuccess: () => handleMutationSuccess('Servicio creado exitosamente'),
    onError: (error) => console.error('Error creating service:', error)
  });

  const updateMutation = useMutation(updateService, {
    onSuccess: () => handleMutationSuccess('Servicio actualizado exitosamente'),
    onError: (error) => console.error('Error updating service:', error)
  });

  const deleteMutation = useMutation(deleteService, {
    onSuccess: () => handleMutationSuccess('Servicio eliminado exitosamente'),
    onError: (error) => console.error('Error deleting service:', error)
  });

  const handleCreate = () => {
    setEditingService(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setShowModal(true);
  };

  const handleDelete = (service) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el servicio "${service.name}"?`)) {
      deleteMutation.mutate(service.id);
    }
  };

  const handleSubmit = async (formData) => {
    if (editingService.id) {
      await updateMutation.mutateAsync({ id: editingService.id, ...formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const getAreaBadge = (area) => {
    const areaConfig = {
      'laboratorio': { bg: 'primary', text: 'Laboratorio', icon: FiSettings },
      'comercial': { bg: 'success', text: 'Comercial', icon: FiUsers },
      'soporte': { bg: 'info', text: 'Soporte', icon: FiShield },
      'sistemas': { bg: 'warning', text: 'Sistemas', icon: FiPackage },
      'gerencia': { bg: 'danger', text: 'Gerencia', icon: FiHome }
    };
    
    const config = areaConfig[area] || { bg: 'secondary', text: area, icon: FiSettings };
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
      header: 'Nombre del Servicio',
      accessor: 'name',
      render: (value) => (
        <div className="fw-medium">{value}</div>
      )
    },
    {
      header: 'Área',
      accessor: 'area',
      render: (value) => getAreaBadge(value)
    },
    {
      header: 'Estado',
      accessor: 'status',
      render: (value) => (
        <Badge bg="success" className="status-badge d-flex align-items-center">
          <FiCheckCircle size={12} className="me-1" />
          Activo
        </Badge>
      )
    }
  ];

  const formFields = [
    {
      name: 'name',
      label: 'Nombre del Servicio',
      type: 'text',
      required: true,
      placeholder: 'Ingresa el nombre del servicio'
    },
    {
      name: 'area',
      label: 'Área',
      type: 'select',
      required: true,
      options: AREAS
    }
  ];

  if (!canManage) {
    return (
      <div className="fade-in">
        <PageHeader
          title="Gestión de Servicios"
          subtitle="Visualiza los servicios disponibles en el sistema"
          icon={FiSettings}
        />
        <Alert variant="warning" className="d-flex align-items-center">
          <FiAlertTriangle className="me-2" />
          No tienes permisos para gestionar servicios. Contacta al administrador.
        </Alert>
        <DataTable
          data={data?.services || []}
          columns={columns}
          loading={isLoading}
          emptyMessage="No hay servicios registrados"
        />
      </div>
    );
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Gestión de Servicios"
        subtitle="Crear, editar y gestionar servicios del sistema"
        icon={FiSettings}
        actions={
          <Button variant="primary" onClick={handleCreate}>
            <FiPlus className="me-2" />
            Nuevo Servicio
          </Button>
        }
      />

      <DataTable
        data={data?.services || []}
        columns={columns}
        loading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No hay servicios registrados"
      />

      <ModalForm
        show={showModal}
        onHide={() => setShowModal(false)}
        title={editingService?.id ? 'Editar Servicio' : 'Nuevo Servicio'}
        data={editingService || emptyForm}
        fields={formFields}
        onSubmit={handleSubmit}
        loading={createMutation.isLoading || updateMutation.isLoading}
        submitText={editingService?.id ? 'Actualizar' : 'Crear'}
      />
        </div>
  );
}
