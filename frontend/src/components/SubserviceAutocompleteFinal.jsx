import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Form, Badge, Spinner } from 'react-bootstrap';
import { FiSearch, FiX, FiDollarSign, FiFileText, FiLink, FiPlus } from 'react-icons/fi';
import { useQuery } from 'react-query';
import { searchSubservices } from '../services/subservices';
import { extractDependenciesFromComment, formatDependenciesForDisplay } from '../utils/ensayoDependencies';
import { apiFetch } from '../services/api';

const SubserviceAutocompleteFinal = ({ 
  value = '', 
  onChange, 
  onSelect, 
  onDependenciesSelect,
  placeholder = 'Buscar servicio...',
  disabled = false,
  size = 'sm'
}) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Debounce
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Query
  const { data, isLoading } = useQuery(
    ['subservices', debouncedTerm],
    () => searchSubservices(debouncedTerm),
    {
      enabled: debouncedTerm.length >= 2,
      staleTime: 10 * 60 * 1000,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const results = data?.data || [];

  // Actualizar posición del dropdown
  const updatePosition = () => {
    if (inputRef.current && isOpen) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 2,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      
      const handleScroll = () => {
        if (isOpen) updatePosition();
      };
      
      const handleResize = () => {
        if (isOpen) updatePosition();
      };

      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isOpen]);

  // Handlers
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange?.(newValue);
    
    if (newValue.length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleFocus = () => {
    if (searchTerm.length >= 2) {
      setIsOpen(true);
      updatePosition();
    }
  };

  const handleItemSelect = async (item) => {
    console.log('🎯 Item seleccionado:', item);
    console.log('📊 Datos completos del item:', JSON.stringify(item, null, 2));
    
    setSearchTerm(item.display_text);
    setIsOpen(false);
    onSelect?.(item);
    
    // Manejar dependencias si existen
    console.log('🔍 Verificando dependencias...');
    console.log('onDependenciesSelect existe?', !!onDependenciesSelect);
    console.log('item.comentarios existe?', !!item.comentarios);
    console.log('item.comentarios valor:', item.comentarios);
    
    if (onDependenciesSelect && item.comentarios) {
      console.log('🔍 Analizando dependencias para:', item.codigo);
      console.log('📝 Comentario:', item.comentarios);
      
      const dependencies = extractDependenciesFromComment(item.comentarios);
      console.log('🔗 Dependencias encontradas:', dependencies);
      
      if (dependencies.length > 0) {
        // Buscar los ensayos dependientes haciendo búsquedas individuales
        console.log('🔍 Buscando ensayos dependientes individualmente...');
        
        const dependencyItems = [];
        
        for (const depCode of dependencies) {
          try {
            console.log(`🔍 Buscando: ${depCode}`);
            const response = await apiFetch(`/subservices/search?q=${depCode}&limit=1`);
            
            if (response.data && response.data.length > 0) {
              const foundItem = response.data[0];
              console.log(`✅ Encontrado: ${depCode}`, foundItem);
              dependencyItems.push(foundItem);
            } else {
              console.log(`❌ No encontrado: ${depCode}`);
            }
          } catch (error) {
            console.error(`❌ Error buscando ${depCode}:`, error);
          }
        }
        
        console.log('📋 Items dependientes encontrados:', dependencyItems);
        
        if (dependencyItems.length > 0) {
          onDependenciesSelect(dependencyItems);
        }
      }
    } else {
      console.log('❌ No se pueden procesar dependencias:', {
        hasOnDependenciesSelect: !!onDependenciesSelect,
        hasComentarios: !!item.comentarios,
        comentariosValue: item.comentarios
      });
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setIsOpen(false);
    onChange?.('');
    onSelect?.(null);
  };

  // Click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        inputRef.current && !inputRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

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
    };
    return colors[serviceName] || 'secondary';
  };

  // Dropdown Portal
  const dropdownContent = isOpen && searchTerm.length >= 2 && (
    <div 
      ref={dropdownRef}
      style={{ 
        position: 'absolute',
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: `${dropdownPosition.width}px`,
        zIndex: 999999,
        maxHeight: '300px',
        overflowY: 'auto',
        backgroundColor: 'white',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {isLoading && (
        <div className="p-3 text-center text-muted">
          <Spinner animation="border" size="sm" className="me-2" />
          <small>Buscando...</small>
        </div>
      )}

      {!isLoading && results.length === 0 && (
        <div className="p-3 text-center text-muted">
          <small>No se encontraron resultados</small>
        </div>
      )}

      {!isLoading && results.length > 0 && results.map((item) => {
        // Extraer dependencias del comentario
        const dependencies = extractDependenciesFromComment(item.comentarios);
        const hasDependencies = dependencies.length > 0;
        
        return (
          <div
            key={item.id}
            className="p-2 border-bottom"
            onClick={() => handleItemSelect(item)}
            style={{ 
              cursor: 'pointer',
              transition: 'background-color 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <Badge bg={getServiceColor(item.service_name)} className="small">
                    {item.codigo}
                  </Badge>
                  {hasDependencies && (
                    <Badge bg="warning" text="dark" className="small">
                      <FiLink size={10} className="me-1" />
                      Con dependencias
                    </Badge>
                  )}
                </div>
                <div className="fw-bold small text-dark">
                  {item.descripcion}
                </div>
                {item.norma && item.norma !== '-' && (
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                    <FiFileText size={10} className="me-1" />
                    {item.norma}
                  </div>
                )}
                {hasDependencies && (
                  <div className="text-info mt-1" style={{ fontSize: '0.7rem' }}>
                    <FiPlus size={8} className="me-1" />
                    {formatDependenciesForDisplay(dependencies.map(code => ({ codigo: code })))}
                  </div>
                )}
              </div>
              <div className="text-end ms-2">
                <div className="fw-bold text-success small">
                  <FiDollarSign size={12} />
                  {formatPrice(item.precio)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <div className="position-relative">
        <Form.Group className="mb-0">
          <div className="position-relative">
            <Form.Control
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={handleFocus}
              placeholder={placeholder}
              disabled={disabled}
              size={size}
              className="pe-5"
              autoComplete="off"
            />
            
            <div className="position-absolute top-50 end-0 translate-middle-y pe-3 d-flex align-items-center gap-2">
              {isLoading && <Spinner animation="border" size="sm" variant="primary" />}
              {!isLoading && searchTerm && (
                <FiX 
                  className="text-muted" 
                  onClick={handleClear}
                  onMouseDown={(e) => e.preventDefault()}
                  style={{ cursor: 'pointer' }}
                />
              )}
              {!isLoading && !searchTerm && <FiSearch className="text-muted" />}
            </div>
          </div>
        </Form.Group>
      </div>

      {/* Renderizar dropdown usando Portal para evitar overflow de tabla */}
      {typeof document !== 'undefined' && dropdownContent && ReactDOM.createPortal(
        dropdownContent,
        document.body
      )}
    </>
  );
};

export default SubserviceAutocompleteFinal;