import React, { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiShield, FiBriefcase, FiLock, FiX, FiSave } from 'react-icons/fi';
import './UserFormRedesigned.css';

const ROLES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'jefa_comercial', label: 'Jefa Comercial' },
  { value: 'vendedor_comercial', label: 'Vendedor Comercial' },
  { value: 'jefe_laboratorio', label: 'Jefe Laboratorio' },
  { value: 'usuario_laboratorio', label: 'Usuario Laboratorio' },
  { value: 'facturacion', label: 'Facturación' },
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

const UserFormRedesigned = ({ 
  show, 
  onHide, 
  data = {}, 
  onSubmit, 
  loading = false, 
  isEditing = false 
}) => {
  const [formData, setFormData] = useState({
    name: data.name || '',
    apellido: data.apellido || '',
    email: data.email || '',
    phone: data.phone || '',
    role: data.role || 'vendedor_comercial',
    area: data.area || 'Comercial',
    password: ''
  });

  const [errors, setErrors] = useState({});

  // Resetear formulario cuando cambien los datos o se abra/cierre el modal
  React.useEffect(() => {
    if (show) {
      // Si es un nuevo usuario (no hay ID), usar valores vacíos
      const isNewUser = !data.id;
      
      setFormData({
        name: isNewUser ? '' : (data.name || ''),
        apellido: isNewUser ? '' : (data.apellido || ''),
        email: isNewUser ? '' : (data.email || ''),
        phone: isNewUser ? '' : (data.phone || ''),
        role: data.role || 'vendedor_comercial',
        area: data.area || 'Comercial',
        password: ''
      });
      setErrors({});
    }
  }, [show, data, isEditing]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!isEditing && !formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const submitData = { ...formData };
      
      // Si está editando y no hay contraseña, no enviar el campo password
      if (isEditing && !submitData.password) {
        delete submitData.password;
      }
      
      onSubmit(submitData);
    }
  };

  // Manejar errores del servidor
  React.useEffect(() => {
    if (data.error) {
      if (data.error.includes('email') || data.error.includes('Email')) {
        setErrors(prev => ({ ...prev, email: 'Este email ya está registrado' }));
      }
    }
  }, [data.error]);

  if (!show) return null;

  return (
    <div className="user-form-backdrop" onClick={onHide}>
      <div className="user-form-modal" onClick={e => e.stopPropagation()}>
        <div className="user-form-header">
          <h4>
            <FiUser className="user-form-icon" />
            {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h4>
          <button className="close-btn" onClick={onHide}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="user-form-body">
          {/* Información Personal */}
          <div className="user-form-section">
            <div className="user-form-section-title">
              <FiUser className="user-form-icon" />
              Información Personal
            </div>
            
            <div className="user-form-row">
              <div className="user-form-group">
                <label className="user-form-label">
                  Nombre <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={`user-form-input ${errors.name ? 'error' : ''}`}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ingresa el nombre"
                />
                {errors.name && <div className="user-form-error">{errors.name}</div>}
              </div>

              <div className="user-form-group">
                <label className="user-form-label">
                  Apellido <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={`user-form-input ${errors.apellido ? 'error' : ''}`}
                  value={formData.apellido}
                  onChange={(e) => handleInputChange('apellido', e.target.value)}
                  placeholder="Ingresa el apellido"
                />
                {errors.apellido && <div className="user-form-error">{errors.apellido}</div>}
              </div>
            </div>

            <div className="user-form-row">
              <div className="user-form-group">
                <label className="user-form-label">
                  <FiMail className="user-form-icon" />
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  className={`user-form-input ${errors.email ? 'error' : ''}`}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="usuario@ejemplo.com"
                />
                {errors.email && <div className="user-form-error">{errors.email}</div>}
              </div>

              <div className="user-form-group">
                <label className="user-form-label">
                  <FiPhone className="user-form-icon" />
                  Teléfono
                </label>
                <input
                  type="tel"
                  className="user-form-input"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Número de teléfono"
                />
              </div>
            </div>
          </div>

          {/* Configuración del Sistema */}
          <div className="user-form-section">
            <div className="user-form-section-title">
              <FiShield className="user-form-icon" />
              Configuración del Sistema
            </div>
            
            <div className="user-form-row">
              <div className="user-form-group">
                <label className="user-form-label">
                  <FiShield className="user-form-icon" />
                  Rol <span className="required">*</span>
                </label>
                <select
                  className="user-form-select"
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                >
                  {ROLES.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="user-form-group">
                <label className="user-form-label">
                  <FiBriefcase className="user-form-icon" />
                  Área <span className="required">*</span>
                </label>
                <select
                  className="user-form-select"
                  value={formData.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                >
                  {AREAS.map(area => (
                    <option key={area.value} value={area.value}>
                      {area.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Seguridad */}
          <div className="user-form-section">
            <div className="user-form-section-title">
              <FiLock className="user-form-icon" />
              Seguridad
            </div>
            
            <div className="user-form-row single">
              <div className="user-form-group">
                <label className="user-form-label">
                  <FiLock className="user-form-icon" />
                  Contraseña {!isEditing && <span className="required">*</span>}
                </label>
                <input
                  type="password"
                  className={`user-form-input ${errors.password ? 'error' : ''}`}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder={isEditing ? 'Dejar vacío para mantener la contraseña actual' : 'Mínimo 6 caracteres'}
                />
                {errors.password && <div className="user-form-error">{errors.password}</div>}
                <div className="user-form-help">
                  {isEditing ? 'Dejar vacío para mantener la contraseña actual' : 'Mínimo 6 caracteres'}
                </div>
              </div>
            </div>
          </div>
        </form>

        <div className="user-form-actions">
          <button
            type="button"
            className="user-form-btn user-form-btn-cancel"
            onClick={onHide}
            disabled={loading}
          >
            <FiX />
            Cancelar
          </button>
          <button
            type="submit"
            className="user-form-btn user-form-btn-create"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                {isEditing ? 'Actualizando...' : 'Creando...'}
              </>
            ) : (
              <>
                <FiSave />
                {isEditing ? 'Actualizar' : 'Crear'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserFormRedesigned;
