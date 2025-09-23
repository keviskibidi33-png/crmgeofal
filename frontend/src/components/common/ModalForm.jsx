import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { FiSave, FiX } from 'react-icons/fi';
import '../../styles/autocomplete.css';

const ModalForm = ({
  show,
  onHide,
  title,
  data = {},
  fields = [],
  onSubmit,
  loading = false,
  size = 'lg',
  submitText = 'Guardar',
  cancelText = 'Cancelar',
  validation = {},
  className = ""
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [suggestions, setSuggestions] = useState({});
  const [showSuggestions, setShowSuggestions] = useState({});

  useEffect(() => {
    if (show) {
      setFormData(data);
      setErrors({});
      setTouched({});
    }
  }, [show, data]);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // Manejar autocompletado
    const field = fields.find(f => f.name === name);
    if (field && field.autocomplete && field.suggestions && value.length > 0) {
      const filteredSuggestions = field.suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(prev => ({
        ...prev,
        [name]: filteredSuggestions.slice(0, 5) // Mostrar máximo 5 sugerencias
      }));
      setShowSuggestions(prev => ({
        ...prev,
        [name]: true
      }));
    } else {
      setShowSuggestions(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Ocultar sugerencias al perder el foco
    setTimeout(() => {
      setShowSuggestions(prev => ({
        ...prev,
        [name]: false
      }));
    }, 200);

    // Validar campo
    if (validation[name]) {
      const error = validation[name](formData[name], formData);
      if (error) {
        setErrors(prev => ({
          ...prev,
          [name]: error
        }));
      }
    }
  };

  const handleSuggestionClick = (name, suggestion) => {
    setFormData(prev => ({
      ...prev,
      [name]: suggestion
    }));
    setShowSuggestions(prev => ({
      ...prev,
      [name]: false
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    fields.forEach(field => {
      if (field.required && (!formData[field.name] || formData[field.name] === '')) {
        newErrors[field.name] = `${field.label} es requerido`;
        isValid = false;
      } else if (validation[field.name]) {
        const error = validation[field.name](formData[field.name], formData);
        if (error) {
          newErrors[field.name] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await onSubmit(formData);
        onHide();
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    }
  };

  const renderField = (field) => {
    const hasError = touched[field.name] && errors[field.name];
    const value = formData[field.name] || '';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
        return (
          <Form.Group key={field.name} className="mb-3 position-relative">
            <Form.Label>
              {field.label}
              {field.required && <span className="text-danger ms-1">*</span>}
            </Form.Label>
            <Form.Control
              type={field.type}
              name={field.name}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              onBlur={() => handleBlur(field.name)}
              isInvalid={hasError}
              placeholder={field.placeholder}
              disabled={field.disabled}
            />
            {hasError && (
              <Form.Control.Feedback type="invalid">
                {errors[field.name]}
              </Form.Control.Feedback>
            )}
            {field.help && (
              <Form.Text className="text-muted">
                {field.help}
              </Form.Text>
            )}
            {/* Sugerencias de autocompletado */}
            {field.autocomplete && showSuggestions[field.name] && suggestions[field.name] && suggestions[field.name].length > 0 && (
              <div className="autocomplete-suggestions position-absolute w-100" style={{ zIndex: 1000, top: '100%' }}>
                <div className="list-group">
                  {suggestions[field.name].map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      className="list-group-item list-group-item-action"
                      onClick={() => handleSuggestionClick(field.name, suggestion)}
                      style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Form.Group>
        );

      case 'textarea':
        return (
          <Form.Group key={field.name} className="mb-3">
            <Form.Label>
              {field.label}
              {field.required && <span className="text-danger ms-1">*</span>}
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={field.rows || 3}
              name={field.name}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              onBlur={() => handleBlur(field.name)}
              isInvalid={hasError}
              placeholder={field.placeholder}
            />
            {hasError && (
              <Form.Control.Feedback type="invalid">
                {errors[field.name]}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        );

      case 'select':
        return (
          <Form.Group key={field.name} className="mb-3">
            <Form.Label>
              {field.label}
              {field.required && <span className="text-danger ms-1">*</span>}
            </Form.Label>
            <Form.Select
              name={field.name}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              onBlur={() => handleBlur(field.name)}
              isInvalid={hasError}
            >
              <option value="">Seleccionar...</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
            {hasError && (
              <Form.Control.Feedback type="invalid">
                {errors[field.name]}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        );

      case 'number':
        return (
          <Form.Group key={field.name} className="mb-3">
            <Form.Label>
              {field.label}
              {field.required && <span className="text-danger ms-1">*</span>}
            </Form.Label>
            <Form.Control
              type="number"
              name={field.name}
              value={value}
              onChange={(e) => handleInputChange(field.name, parseFloat(e.target.value) || '')}
              onBlur={() => handleBlur(field.name)}
              isInvalid={hasError}
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
              step={field.step}
            />
            {hasError && (
              <Form.Control.Feedback type="invalid">
                {errors[field.name]}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        );

      case 'checkbox':
        return (
          <Form.Group key={field.name} className="mb-3">
            <Form.Check
              type="checkbox"
              name={field.name}
              checked={!!value}
              onChange={(e) => handleInputChange(field.name, e.target.checked)}
              label={field.label}
            />
          </Form.Group>
        );

      case 'custom':
        return (
          <div key={field.name} className="mb-3">
            {field.render && field.render(formData)}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal show={show} onHide={onHide} size={size} className={className}>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">{title}</Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="pt-0">
          <Row>
            {fields.map(field => (
              <Col key={field.name} md={field.col || 12}>
                {renderField(field)}
              </Col>
            ))}
          </Row>
        </Modal.Body>
        
        <Modal.Footer className="border-0 pt-0">
          <Button 
            variant="outline-secondary" 
            onClick={onHide}
            disabled={loading}
          >
            <FiX className="me-1" />
            {cancelText}
          </Button>
          
          <Button 
            type="submit" 
            variant="primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="me-1" />
                Guardando...
              </>
            ) : (
              <>
                <FiSave className="me-1" />
                {submitText}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ModalForm;
