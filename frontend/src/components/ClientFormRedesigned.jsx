import React, { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiHome, FiUserCheck, FiX, FiSave } from 'react-icons/fi';
import './ClientFormRedesigned.css';

const CLIENT_TYPES = [
  { value: 'empresa', label: 'Empresa' },
  { value: 'persona', label: 'Persona Natural' }
];

const SECTORS = [
  { value: 'construccion', label: 'Construcción' },
  { value: 'mineria', label: 'Minería' },
  { value: 'servicios', label: 'Servicios' },
  { value: 'comercio', label: 'Comercio' },
  { value: 'industria', label: 'Industria' },
  { value: 'gobierno', label: 'Gobierno' },
  { value: 'otro', label: 'Otro' }
];

const CITIES = [
  { value: 'lima', label: 'Lima' },
  { value: 'arequipa', label: 'Arequipa' },
  { value: 'trujillo', label: 'Trujillo' },
  { value: 'chiclayo', label: 'Chiclayo' },
  { value: 'piura', label: 'Piura' },
  { value: 'cusco', label: 'Cusco' },
  { value: 'otro', label: 'Otra' }
];

const ClientFormRedesigned = ({ 
  show, 
  onHide, 
  data = {}, 
  onSubmit, 
  loading = false, 
  isEditing = false 
}) => {
  const [formData, setFormData] = useState({
    type: data.type || 'empresa',
    name: data.name || '',
    ruc: data.ruc || '',
    dni: data.dni || '',
    contact_name: data.contact_name || '',
    email: data.email || '',
    phone: data.phone || '',
    address: data.address || '',
    city: data.city || 'lima',
    sector: data.sector || 'servicios'
  });

  const [errors, setErrors] = useState({});

  // Resetear formulario cuando cambien los datos o se abra/cierre el modal
  React.useEffect(() => {
    if (show) {
      // Si es un nuevo cliente (no hay ID), usar valores vacíos
      const isNewClient = !data.id;
      
      setFormData({
        type: data.type || 'empresa',
        name: isNewClient ? '' : (data.name || ''),
        ruc: isNewClient ? '' : (data.ruc || ''),
        dni: isNewClient ? '' : (data.dni || ''),
        contact_name: isNewClient ? '' : (data.contact_name || ''),
        email: isNewClient ? '' : (data.email || ''),
        phone: isNewClient ? '' : (data.phone || ''),
        address: isNewClient ? '' : (data.address || ''),
        city: data.city || 'lima',
        sector: data.sector || 'servicios'
      });
      setErrors({});
    }
  }, [show, data, isEditing]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validación en tiempo real para RUC y DNI
    if (field === 'ruc' && formData.type === 'empresa') {
      if (value && !validateRUC(value)) {
        setErrors(prev => ({ ...prev, ruc: 'El RUC debe empezar con 20 y tener 11 dígitos' }));
      } else {
        setErrors(prev => ({ ...prev, ruc: '' }));
      }
    }
    
    if (field === 'dni' && formData.type === 'persona') {
      if (value && !validateDNI(value)) {
        setErrors(prev => ({ ...prev, dni: 'El DNI debe tener exactamente 8 dígitos' }));
      } else {
        setErrors(prev => ({ ...prev, dni: '' }));
      }
    }
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field] && field !== 'ruc' && field !== 'dni') {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Función para validar RUC peruano
  const validateRUC = (ruc) => {
    if (!ruc) return false;
    // RUC debe empezar con 20 y tener 11 dígitos
    const rucRegex = /^20\d{9}$/;
    return rucRegex.test(ruc);
  };

  // Función para validar DNI peruano
  const validateDNI = (dni) => {
    if (!dni) return false;
    // DNI debe tener exactamente 8 dígitos
    const dniRegex = /^\d{8}$/;
    return dniRegex.test(dni);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre/razón social es requerido';
    }

    if (formData.type === 'empresa') {
      if (!formData.ruc.trim()) {
        newErrors.ruc = 'El RUC es requerido para empresas';
      } else if (!validateRUC(formData.ruc)) {
        newErrors.ruc = 'El RUC debe empezar con 20 y tener 11 dígitos';
      }
    }

    if (formData.type === 'persona') {
      if (!formData.dni.trim()) {
        newErrors.dni = 'El DNI es requerido para personas naturales';
      } else if (!validateDNI(formData.dni)) {
        newErrors.dni = 'El DNI debe tener exactamente 8 dígitos';
      }
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const submitData = { ...formData };
      
      // Limpiar campos según el tipo de cliente
      if (submitData.type === 'empresa') {
        delete submitData.dni;
      } else {
        delete submitData.ruc;
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
    <div className="client-form-backdrop" onClick={onHide}>
      <div className="client-form-modal" onClick={e => e.stopPropagation()}>
        <div className="client-form-header">
          <h4>
            <FiUser className="client-form-icon" />
            {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h4>
          <button className="close-btn" onClick={onHide}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="client-form-body">
          {/* Información Básica */}
          <div className="client-form-section">
            <div className="client-form-section-title">
              <FiUser className="client-form-icon" />
              Información Básica
            </div>
            
            <div className="client-form-row">
              <div className="client-form-group">
                <label className="client-form-label">
                  <FiHome className="client-form-icon" />
                  Tipo de Cliente <span className="required">*</span>
                </label>
                <select
                  className="client-form-select"
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                >
                  {CLIENT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="client-form-group">
                <label className="client-form-label">
                  <FiUserCheck className="client-form-icon" />
                  Nombre/Razón Social <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={`client-form-input ${errors.name ? 'error' : ''}`}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ingresa el nombre o razón social"
                />
                {errors.name && <div className="client-form-error">{errors.name}</div>}
              </div>
            </div>

            <div className="client-form-row">
              {formData.type === 'empresa' ? (
                <div className="client-form-group">
                  <label className="client-form-label">
                    <FiHome className="client-form-icon" />
                    RUC <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`client-form-input ${errors.ruc ? 'error' : (formData.ruc && validateRUC(formData.ruc) ? 'valid' : '')}`}
                    value={formData.ruc}
                    onChange={(e) => handleInputChange('ruc', e.target.value)}
                    placeholder="20123456789"
                    maxLength="11"
                  />
                  {errors.ruc && <div className="client-form-error">{errors.ruc}</div>}
                  <div className="client-form-help">Solo para empresas - Debe empezar con 20 y tener 11 dígitos</div>
                </div>
              ) : (
                <div className="client-form-group">
                  <label className="client-form-label">
                    <FiUser className="client-form-icon" />
                    DNI <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`client-form-input ${errors.dni ? 'error' : (formData.dni && validateDNI(formData.dni) ? 'valid' : '')}`}
                    value={formData.dni}
                    onChange={(e) => handleInputChange('dni', e.target.value)}
                    placeholder="12345678"
                    maxLength="8"
                  />
                  {errors.dni && <div className="client-form-error">{errors.dni}</div>}
                  <div className="client-form-help">Solo para personas naturales - Debe tener exactamente 8 dígitos</div>
                </div>
              )}

              <div className="client-form-group">
                <label className="client-form-label">
                  <FiUser className="client-form-icon" />
                  Nombre de Contacto
                </label>
                <input
                  type="text"
                  className="client-form-input"
                  value={formData.contact_name}
                  onChange={(e) => handleInputChange('contact_name', e.target.value)}
                  placeholder="Ingresa el nombre del contacto"
                />
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="client-form-section">
            <div className="client-form-section-title">
              <FiMail className="client-form-icon" />
              Información de Contacto
            </div>
            
            <div className="client-form-row">
              <div className="client-form-group">
                <label className="client-form-label">
                  <FiMail className="client-form-icon" />
                  Email
                </label>
                <input
                  type="email"
                  className={`client-form-input ${errors.email ? 'error' : ''}`}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contacto@empresa.com"
                />
                {errors.email && <div className="client-form-error">{errors.email}</div>}
              </div>

              <div className="client-form-group">
                <label className="client-form-label">
                  <FiPhone className="client-form-icon" />
                  Teléfono
                </label>
                <input
                  type="tel"
                  className="client-form-input"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+51 999 999 999"
                />
              </div>
            </div>
          </div>

          {/* Información de Ubicación */}
          <div className="client-form-section">
            <div className="client-form-section-title">
              <FiMapPin className="client-form-icon" />
              Información de Ubicación
            </div>
            
            <div className="client-form-row">
              <div className="client-form-group">
                <label className="client-form-label">
                  <FiMapPin className="client-form-icon" />
                  Dirección
                </label>
                <input
                  type="text"
                  className="client-form-input"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Ingresa la dirección"
                />
              </div>

              <div className="client-form-group">
                <label className="client-form-label">
                  <FiHome className="client-form-icon" />
                  Ciudad
                </label>
                <select
                  className="client-form-select"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                >
                  {CITIES.map(city => (
                    <option key={city.value} value={city.value}>
                      {city.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="client-form-row single">
              <div className="client-form-group">
                <label className="client-form-label">
                  <FiHome className="client-form-icon" />
                  Sector
                </label>
                <select
                  className="client-form-select"
                  value={formData.sector}
                  onChange={(e) => handleInputChange('sector', e.target.value)}
                >
                  {SECTORS.map(sector => (
                    <option key={sector.value} value={sector.value}>
                      {sector.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </form>

        <div className="client-form-actions">
          <button
            type="button"
            className="client-form-btn client-form-btn-cancel"
            onClick={onHide}
            disabled={loading}
          >
            <FiX />
            Cancelar
          </button>
          <button
            type="submit"
            className="client-form-btn client-form-btn-create"
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

export default ClientFormRedesigned;
