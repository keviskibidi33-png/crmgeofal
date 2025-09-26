import React, { useState, useEffect, useRef } from 'react';
import { Form, Dropdown, Badge, Spinner } from 'react-bootstrap';
import { FiSearch, FiX, FiCheck, FiDollarSign, FiFileText } from 'react-icons/fi';
import { useQuery } from 'react-query';
import { searchSubservices } from '../services/subservices';

const SubserviceAutocomplete = ({ 
  value = '', 
  onChange, 
  onSelect, 
  placeholder = 'Buscar por código, descripción o norma...',
  disabled = false,
  size = 'lg'
}) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Debounce para evitar muchas consultas
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Query para buscar subservicios
  const { data: searchResults, isLoading, error } = useQuery(
    ['subservices-search', debouncedSearchTerm],
    () => searchSubservices(debouncedSearchTerm),
    {
      enabled: debouncedSearchTerm.length >= 2,
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
    }
  );

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setShowDropdown(newValue.length >= 2);
    onChange?.(newValue);
    
    if (newValue.length < 2) {
      setSelectedItem(null);
      onSelect?.(null);
    }
  };

  const handleItemSelect = (item) => {
    setSearchTerm(item.display_text);
    setSelectedItem(item);
    setShowDropdown(false);
    onSelect?.(item);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedItem(null);
    setShowDropdown(false);
    onChange?.('');
    onSelect?.(null);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatPrice = (precio) => {
    if (precio === 0) return 'Sujeto a evaluación';
    return `S/ ${precio.toFixed(2)}`;
  };

  const getServiceColor = (serviceName) => {
    const colors = {
      'ENSAYO ESTÁNDAR': 'primary',
      'ENSAYOS ESPECIALES': 'success',
      'ENSAYOS DE CAMPO': 'info',
      'ENSAYO AGREGADO': 'warning',
      'ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO': 'secondary',
      'ENSAYO QUÍMICO AGREGADO': 'dark',
      'ENSAYO CONCRETO': 'primary',
      'ENSAYO ALBAÑILERÍA': 'success',
      'ENSAYO ROCA': 'info',
      'ENSAYO PAVIMENTO': 'warning',
      'ENSAYO ASFALTO': 'secondary',
      'ENSAYO MEZCLA ASFÁLTICO': 'dark',
      'EVALUACIONES ESTRUCTURALES': 'primary',
      'IMPLEMENTACIÓN LABORATORIO EN OBRA': 'success',
      'OTROS SERVICIOS': 'info'
    };
    return colors[serviceName] || 'light';
  };

  return (
    <div className="position-relative" ref={dropdownRef}>
      <Form.Group>
        <div className="position-relative">
          <Form.Control
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
            placeholder={placeholder}
            disabled={disabled}
            size={size}
            className="pe-5"
          />
          
          {/* Iconos */}
          <div className="position-absolute top-50 end-0 translate-middle-y pe-3 d-flex align-items-center gap-2">
            {isLoading && <Spinner animation="border" size="sm" variant="primary" />}
            {!isLoading && searchTerm && (
              <FiX 
                className="text-muted cursor-pointer" 
                onClick={handleClear}
                style={{ cursor: 'pointer' }}
              />
            )}
            {!isLoading && !searchTerm && <FiSearch className="text-muted" />}
          </div>
        </div>

        {/* Dropdown de resultados */}
        {showDropdown && (
          <div 
            className="position-absolute w-100 bg-white border rounded shadow-lg"
            style={{ 
              top: '100%', 
              zIndex: 1050,
              maxHeight: '300px',
              overflowY: 'auto'
            }}
          >
            {error && (
              <div className="p-3 text-danger">
                <small>Error al buscar subservicios</small>
              </div>
            )}

            {!error && searchResults?.data?.length === 0 && (
              <div className="p-3 text-muted">
                <small>No se encontraron subservicios</small>
              </div>
            )}

            {searchResults?.data?.map((item, index) => (
              <div
                key={item.id}
                className="p-3 border-bottom cursor-pointer hover-bg-light"
                onClick={() => handleItemSelect(item)}
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <Badge bg={getServiceColor(item.service_name)} className="small">
                        {item.codigo}
                      </Badge>
                      <Badge bg="outline-secondary" className="small">
                        {item.service_name}
                      </Badge>
                    </div>
                    <div className="fw-bold text-dark mb-1">
                      {item.descripcion}
                    </div>
                    {item.norma && item.norma !== '-' && (
                      <div className="text-muted small d-flex align-items-center gap-1">
                        <FiFileText size={12} />
                        {item.norma}
                      </div>
                    )}
                  </div>
                  <div className="text-end">
                    <div className="fw-bold text-success d-flex align-items-center gap-1">
                      <FiDollarSign size={14} />
                      {formatPrice(item.precio)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Item seleccionado */}
        {selectedItem && (
          <div className="mt-2 p-2 bg-light rounded border">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <Badge bg={getServiceColor(selectedItem.service_name)} className="me-2">
                  {selectedItem.codigo}
                </Badge>
                <span className="fw-bold">{selectedItem.descripcion}</span>
                {selectedItem.norma && selectedItem.norma !== '-' && (
                  <div className="text-muted small">
                    <FiFileText size={12} className="me-1" />
                    {selectedItem.norma}
                  </div>
                )}
              </div>
              <div className="text-end">
                <div className="fw-bold text-success">
                  {formatPrice(selectedItem.precio)}
                </div>
                <FiCheck className="text-success" />
              </div>
            </div>
          </div>
        )}
      </Form.Group>
    </div>
  );
};

export default SubserviceAutocomplete;
