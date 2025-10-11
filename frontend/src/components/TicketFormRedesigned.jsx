import React, { useState, useEffect } from 'react';
import { FiMessageSquare, FiUser, FiCalendar, FiFlag, FiLayers, FiTag, FiClock, FiFileText, FiX, FiSave, FiShield, FiBriefcase } from 'react-icons/fi';
import './TicketFormRedesigned.css';

const MODULES = [
  { value: 'sistema', label: 'Sistema' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'laboratorio', label: 'Laboratorio' },
  { value: 'facturacion', label: 'Facturación' },
  { value: 'soporte', label: 'Soporte' },
  { value: 'gerencia', label: 'Gerencia' }
];

const CATEGORIES = [
  { value: 'tecnico', label: 'Técnico' },
  { value: 'funcional', label: 'Funcional' },
  { value: 'usuario', label: 'Usuario' },
  { value: 'sistema', label: 'Sistema' },
  { value: 'reporte', label: 'Reporte' },
  { value: 'integracion', label: 'Integración' }
];

const TYPES = [
  { value: 'bug', label: 'Bug/Error' },
  { value: 'mejora', label: 'Mejora' },
  { value: 'consulta', label: 'Consulta' },
  { value: 'solicitud', label: 'Solicitud' },
  { value: 'incidente', label: 'Incidente' }
];

const PRIORITIES = [
  { value: 'baja', label: 'Baja', color: 'success' },
  { value: 'media', label: 'Media', color: 'warning' },
  { value: 'alta', label: 'Alta', color: 'danger' },
  { value: 'critica', label: 'Crítica', color: 'dark' }
];

const STATUSES = [
  { value: 'abierto', label: 'Abierto', color: 'warning' },
  { value: 'en_progreso', label: 'En Progreso', color: 'info' },
  { value: 'resuelto', label: 'Resuelto', color: 'success' },
  { value: 'cerrado', label: 'Cerrado', color: 'secondary' },
  { value: 'cancelado', label: 'Cancelado', color: 'danger' }
];

const TicketFormRedesigned = ({ 
  show, 
  onHide, 
  data = {}, 
  onSubmit, 
  loading = false, 
  isEditing = false,
  users = [],
  modules = [],
  categories = [],
  types = []
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'media',
    status: 'abierto',
    module: 'sistema',
    category: 'tecnico',
    type: 'solicitud',
    assigned_to: '',
    estimated_time: '',
    tags: '',
    additional_notes: ''
  });

  const [errors, setErrors] = useState({});

  // Resetear formulario cuando cambien los datos o se abra/cierre el modal
  useEffect(() => {
    if (show) {
      // Si es un nuevo ticket (no hay ID), usar valores vacíos
      const isNewTicket = !data.id;
      
      setFormData({
        title: isNewTicket ? '' : (data.title || ''),
        description: isNewTicket ? '' : (data.description || ''),
        priority: data.priority || 'media',
        status: data.status || 'abierto',
        module: data.module || 'sistema',
        category: data.category || 'tecnico',
        type: data.type || 'solicitud',
        assigned_to: data.assigned_to || '',
        estimated_time: data.estimated_time || '',
        tags: data.tags || '',
        additional_notes: data.additional_notes || ''
      });
      
      setErrors({});
    }
  }, [show, data]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }
    
    if (!formData.module) {
      newErrors.module = 'El módulo es requerido';
    }
    
    if (!formData.category) {
      newErrors.category = 'La categoría es requerida';
    }
    
    if (!formData.type) {
      newErrors.type = 'El tipo es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!show) return null;

  // Función para obtener opciones de módulos
  const getModuleOptions = () => {
    return Array.isArray(modules) && modules.length > 0 ? modules : MODULES;
  };

  // Función para obtener opciones de categorías
  const getCategoryOptions = () => {
    return Array.isArray(categories) && categories.length > 0 ? categories : CATEGORIES;
  };

  // Función para obtener opciones de tipos
  const getTypeOptions = () => {
    return Array.isArray(types) && types.length > 0 ? types : TYPES;
  };

  return (
    <div className="user-form-backdrop" onClick={onHide}>
      <div className="user-form-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="user-form-header">
          <div className="user-form-header-content">
            <div className="user-form-header-icon">
              <FiMessageSquare />
            </div>
            <div className="user-form-header-text">
              <h3 className="user-form-title">
                {isEditing ? 'Editar Ticket' : 'Nuevo Ticket'}
              </h3>
              <p className="user-form-subtitle">
                {isEditing ? 'Modifica la información del ticket' : 'Crea un nuevo ticket de soporte'}
              </p>
            </div>
          </div>
          <button className="user-form-close" onClick={onHide}>
            <FiX />
          </button>
        </div>

        {/* Body */}
        <div className="user-form-body">
          <form onSubmit={handleSubmit} className="user-form-content">
            {/* Información del Ticket */}
            <div className="user-form-section">
              <div className="user-form-section-title">
                <FiMessageSquare className="user-form-section-icon" />
                Información del Ticket
              </div>
              <div className="user-form-row">
                <div className="user-form-field">
                  <label className="user-form-label">
                    <FiMessageSquare className="user-form-label-icon" />
                    Título del Ticket *
                  </label>
                  <input
                    type="text"
                    className={`user-form-input ${errors.title ? 'error' : ''}`}
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Describe brevemente el problema o solicitud"
                  />
                  {errors.title && <span className="user-form-error">{errors.title}</span>}
                </div>
              </div>

              <div className="user-form-row">
                <div className="user-form-field">
                  <label className="user-form-label">
                    <FiFileText className="user-form-label-icon" />
                    Descripción Detallada *
                  </label>
                  <textarea
                    className={`user-form-textarea ${errors.description ? 'error' : ''}`}
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Proporciona todos los detalles necesarios para resolver el ticket"
                    rows={4}
                  />
                  {errors.description && <span className="user-form-error">{errors.description}</span>}
                </div>
              </div>
            </div>

            {/* Clasificación del Ticket */}
            <div className="user-form-section">
              <div className="user-form-section-title">
                <FiLayers className="user-form-section-icon" />
                Clasificación del Ticket
              </div>
              <div className="user-form-row">
                <div className="user-form-field">
                  <label className="user-form-label">
                    <FiLayers className="user-form-label-icon" />
                    Módulo *
                  </label>
                  <select
                    className={`user-form-select ${errors.module ? 'error' : ''}`}
                    value={formData.module}
                    onChange={(e) => handleChange('module', e.target.value)}
                  >
                    <option value="">Seleccionar módulo</option>
                    {getModuleOptions().map(module => (
                      <option key={module.value} value={module.value}>
                        {module.label}
                      </option>
                    ))}
                  </select>
                  {errors.module && <span className="user-form-error">{errors.module}</span>}
                </div>

                <div className="user-form-field">
                  <label className="user-form-label">
                    <FiTag className="user-form-label-icon" />
                    Categoría *
                  </label>
                  <select
                    className={`user-form-select ${errors.category ? 'error' : ''}`}
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                  >
                    <option value="">Seleccionar categoría</option>
                    {getCategoryOptions().map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && <span className="user-form-error">{errors.category}</span>}
                </div>
              </div>

              <div className="user-form-row">
                <div className="user-form-field">
                  <label className="user-form-label">
                    <FiFlag className="user-form-label-icon" />
                    Tipo *
                  </label>
                  <select
                    className={`user-form-select ${errors.type ? 'error' : ''}`}
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                  >
                    <option value="">Seleccionar tipo</option>
                    {getTypeOptions().map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.type && <span className="user-form-error">{errors.type}</span>}
                </div>

                <div className="user-form-field">
                  <label className="user-form-label">
                    <FiFlag className="user-form-label-icon" />
                    Prioridad
                  </label>
                  <select
                    className="user-form-select"
                    value={formData.priority}
                    onChange={(e) => handleChange('priority', e.target.value)}
                  >
                    {PRIORITIES.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isEditing && (
                <div className="user-form-row">
                  <div className="user-form-field">
                    <label className="user-form-label">
                      <FiShield className="user-form-label-icon" />
                      Estado
                    </label>
                    <select
                      className="user-form-select"
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                    >
                      {STATUSES.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Asignación y Tiempo */}
            <div className="user-form-section">
              <div className="user-form-section-title">
                <FiUser className="user-form-section-icon" />
                Asignación y Tiempo
              </div>
              <div className="user-form-row">
                <div className="user-form-field">
                  <label className="user-form-label">
                    <FiUser className="user-form-label-icon" />
                    Asignado a
                  </label>
                  <select
                    className="user-form-select"
                    value={formData.assigned_to}
                    onChange={(e) => handleChange('assigned_to', e.target.value)}
                  >
                    <option value="">Seleccionar responsable</option>
                    {Array.isArray(users) && users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} {user.apellido} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="user-form-field">
                  <label className="user-form-label">
                    <FiClock className="user-form-label-icon" />
                    Tiempo Estimado
                  </label>
                  <input
                    type="text"
                    className="user-form-input"
                    value={formData.estimated_time}
                    onChange={(e) => handleChange('estimated_time', e.target.value)}
                    placeholder="Ej: 2 horas, 1 día"
                  />
                </div>
              </div>
            </div>

            {/* Metadatos Adicionales */}
            <div className="user-form-section">
              <div className="user-form-section-title">
                <FiTag className="user-form-section-icon" />
                Metadatos Adicionales
              </div>
              <div className="user-form-row">
                <div className="user-form-field">
                  <label className="user-form-label">
                    <FiTag className="user-form-label-icon" />
                    Tags
                  </label>
                  <input
                    type="text"
                    className="user-form-input"
                    value={formData.tags}
                    onChange={(e) => handleChange('tags', e.target.value)}
                    placeholder="urgente, bug, frontend"
                  />
                </div>
              </div>

              <div className="user-form-row">
                <div className="user-form-field">
                  <label className="user-form-label">
                    <FiFileText className="user-form-label-icon" />
                    Notas Adicionales
                  </label>
                  <textarea
                    className="user-form-textarea"
                    value={formData.additional_notes}
                    onChange={(e) => handleChange('additional_notes', e.target.value)}
                    placeholder="Información adicional, contexto, o comentarios especiales"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="user-form-footer">
          <button 
            type="button" 
            className="user-form-cancel" 
            onClick={onHide}
            disabled={loading}
          >
            <FiX className="user-form-button-icon" />
            Cancelar
          </button>
          <button 
            type="submit" 
            className="user-form-save" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="user-form-spinner"></div>
                {isEditing ? 'Actualizando...' : 'Creando...'}
              </>
            ) : (
              <>
                <FiSave className="user-form-button-icon" />
                {isEditing ? 'Actualizar Ticket' : 'Crear Ticket'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketFormRedesigned;