import React, { useState } from 'react';
import { FiUser, FiMessageSquare, FiFlag, FiTag, FiFileText, FiUpload, FiX, FiSave } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import './TicketFormUnified.css';

const TicketFormUnified = ({ show, onHide, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'media',
    module: 'sistema',
    category: '',
    type: '',
    assigned_to: '',
    estimated_time: '',
    tags: '',
    additional_notes: '',
    file: null
  });

  const [errors, setErrors] = useState({});
  const { user } = useAuth();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'media',
        module: 'sistema',
        category: '',
        type: '',
        assigned_to: '',
        estimated_time: '',
        tags: '',
        additional_notes: '',
        file: null
      });
      setErrors({});
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'media',
      module: 'sistema',
      category: '',
      type: '',
      assigned_to: '',
      estimated_time: '',
      tags: '',
      additional_notes: '',
      file: null
    });
    setErrors({});
    onHide();
  };

  if (!show) return null;

  return (
    <div className="user-form-backdrop" onClick={handleClose}>
      <div className="user-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="user-form-header">
          <h4>
            <FiMessageSquare />
            Nuevo Ticket
          </h4>
          <button className="close-btn" onClick={handleClose}>
            <FiX />
          </button>
        </div>

        <div className="user-form-body">
          <form onSubmit={handleSubmit}>
            {/* Información básica */}
            <div className="user-form-section">
              <h5 className="user-form-section-title">
                <FiFileText />
                Información Básica
              </h5>
              
              <div className="user-form-row">
                <div className="user-form-group">
                  <label className="user-form-label">Título del Ticket *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Describe brevemente el problema o solicitud"
                    className={`user-form-input ${errors.title ? 'error' : ''}`}
                  />
                  {errors.title && <span className="user-form-error">{errors.title}</span>}
                </div>
                
                <div className="user-form-group">
                  <label className="user-form-label">Prioridad *</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="user-form-input"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="user-form-group">
                <label className="user-form-label">Descripción Detallada *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe en detalle el problema, solicitud o consulta..."
                  className={`user-form-input ${errors.description ? 'error' : ''}`}
                  rows={4}
                />
                {errors.description && <span className="user-form-error">{errors.description}</span>}
              </div>
            </div>


            {/* Clasificación */}
            <div className="user-form-section">
              <h5 className="user-form-section-title">
                <FiTag />
                Clasificación
              </h5>
              
              <div className="user-form-row">
                <div className="user-form-group">
                  <label className="user-form-label">Módulo</label>
                  <select
                    name="module"
                    value={formData.module}
                    onChange={handleChange}
                    className="user-form-input"
                  >
                    <option value="sistema">Sistema</option>
                    <option value="comercial">Comercial</option>
                    <option value="laboratorio">Laboratorio</option>
                    <option value="soporte">Soporte</option>
                    <option value="facturacion">Facturación</option>
                  </select>
                </div>
                
                <div className="user-form-group">
                  <label className="user-form-label">Categoría</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Ej: Técnico, Comercial, Laboratorio"
                    className="user-form-input"
                  />
                </div>
                
                <div className="user-form-group">
                  <label className="user-form-label">Tipo</label>
                  <input
                    type="text"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    placeholder="Ej: Solicitud, Consulta, Problema"
                    className="user-form-input"
                  />
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="user-form-section">
              <h5 className="user-form-section-title">
                <FiFlag />
                Información Adicional
              </h5>
              
              <div className="user-form-row">
                <div className="user-form-group">
                  <label className="user-form-label">Tiempo Estimado</label>
                  <input
                    type="text"
                    name="estimated_time"
                    value={formData.estimated_time}
                    onChange={handleChange}
                    placeholder="Ej: 2 horas, 1 día, 3 días"
                    className="user-form-input"
                  />
                </div>
                
                <div className="user-form-group">
                  <label className="user-form-label">Tags</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="Ej: urgente, cliente-vip, cotización"
                    className="user-form-input"
                  />
                </div>
              </div>

              <div className="user-form-group">
                <label className="user-form-label">Notas Adicionales</label>
                <textarea
                  name="additional_notes"
                  value={formData.additional_notes}
                  onChange={handleChange}
                  placeholder="Información adicional que pueda ser útil para el equipo de soporte..."
                  className="user-form-input"
                  rows={3}
                />
              </div>
            </div>

            {/* Archivo adjunto */}
            <div className="user-form-section">
              <h5 className="user-form-section-title">
                <FiUpload />
                Archivo Adjunto
              </h5>
              
              <div className="user-form-group">
                <label className="user-form-label">Subir Archivo</label>
                <input
                  type="file"
                  name="file"
                  onChange={handleChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  className="user-form-input"
                />
                <small className="user-form-help">
                  Formatos permitidos: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (máx. 10MB)
                </small>
              </div>
            </div>

            {Object.keys(errors).length > 0 && (
              <div className="user-form-error-message">
                <strong>Por favor corrige los siguientes errores:</strong>
                <ul>
                  {Object.values(errors).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="user-form-actions">
              <button type="button" className="user-form-btn user-form-btn-secondary" onClick={handleClose} disabled={isLoading}>
                <FiX />
                Cancelar
              </button>
              <button type="submit" className="user-form-btn user-form-btn-primary" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="spinner-small"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <FiSave />
                    Crear Ticket
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TicketFormUnified;
