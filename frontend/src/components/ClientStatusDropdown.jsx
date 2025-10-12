import React, { useState, useRef, useEffect } from 'react';
import { Dropdown, Button, Spinner, Alert } from 'react-bootstrap';
import { createPortal } from 'react-dom';
import { useQueryClient } from 'react-query';
import { FiChevronDown, FiCheck, FiSearch, FiHeart, FiClock, FiSend, FiMessageSquare, FiCheckCircle, FiX, FiMoreHorizontal } from 'react-icons/fi';
import { updateClientStatus } from '../services/companies';

// Estados de clientes con iconos y colores
const CLIENT_STATUSES = {
  prospeccion: {
    label: 'Prospección',
    icon: FiSearch,
    color: 'secondary',
    bgColor: '#6c757d'
  },
  interesado: {
    label: 'Interesado',
    icon: FiHeart,
    color: 'info',
    bgColor: '#17a2b8'
  },
  pendiente_cotizacion: {
    label: 'Pendiente de Cotización',
    icon: FiClock,
    color: 'warning',
    bgColor: '#ffc107'
  },
  cotizacion_enviada: {
    label: 'Cotización Enviada',
    icon: FiSend,
    color: 'info',
    bgColor: '#17a2b8'
  },
  negociacion: {
    label: 'Negociación',
    icon: FiMessageSquare,
    color: 'secondary',
    bgColor: '#6c757d'
  },
  ganado: {
    label: 'Ganado',
    icon: FiCheckCircle,
    color: 'success',
    bgColor: '#28a745'
  },
  perdido: {
    label: 'Perdido',
    icon: FiX,
    color: 'danger',
    bgColor: '#dc3545'
  },
  otro: {
    label: 'Otro',
    icon: FiMoreHorizontal,
    color: 'light',
    bgColor: '#f8f9fa'
  }
};

const ClientStatusDropdown = ({ 
  clientId, 
  currentStatus, 
  onStatusChange, 
  disabled = false,
  size = 'sm',
  showLabel = true 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const queryClient = useQueryClient();

  const handleToggle = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 5,
        left: rect.left
      });
    }
    setShow(!show);
  };

  const handleClickOutside = (event) => {
    if (show && menuRef.current && !menuRef.current.contains(event.target) && 
        buttonRef.current && !buttonRef.current.contains(event.target)) {
      setShow(false);
    }
  };

  useEffect(() => {
    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [show]);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus) return;
    
    console.log(`🔄 ClientStatusDropdown - Iniciando cambio de estado del cliente ${clientId} de '${currentStatus}' a '${newStatus}'`);
    
    // Actualización optimista inmediata - cambiar el estado visual al instante
    onStatusChange?.(newStatus);
    setShow(false);
    
    // Luego hacer la llamada a la API en segundo plano
    setLoading(true);
    setError('');
    
    try {
      console.log(`🔄 ClientStatusDropdown - Llamando a updateClientStatus...`);
      const result = await updateClientStatus(clientId, newStatus);
      console.log(`✅ ClientStatusDropdown - Estado actualizado exitosamente:`, result);
      
      // Invalidar queries para sincronizar con el servidor
      queryClient.invalidateQueries(['clients']);
      queryClient.invalidateQueries('companiesList');
      queryClient.invalidateQueries('clientStats');
      queryClient.invalidateQueries('companyStats');
    } catch (err) {
      console.error(`❌ ClientStatusDropdown - Error al actualizar estado:`, err);
      setError(err.message || 'Error al actualizar estado');
      // Revertir el cambio si falla la API
      console.log(`🔄 ClientStatusDropdown - Revirtiendo estado a '${currentStatus}'`);
      onStatusChange?.(currentStatus);
    } finally {
      setLoading(false);
    }
  };

  const currentStatusConfig = CLIENT_STATUSES[currentStatus] || CLIENT_STATUSES.prospeccion;
  const CurrentIcon = currentStatusConfig.icon;

  const dropdownMenu = show && createPortal(
    <div
      ref={menuRef}
      className="dropdown-menu show"
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 99999,
        minWidth: '200px',
        maxHeight: '300px',
        overflowY: 'auto',
        boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
        border: '1px solid rgba(0, 0, 0, 0.15)',
        borderRadius: '0.375rem',
        backgroundColor: 'white'
      }}
    >
      {Object.entries(CLIENT_STATUSES).map(([status, config]) => {
        const StatusIcon = config.icon;
        const isCurrentStatus = status === currentStatus;
        
        return (
          <button
            key={status}
            className={`dropdown-item d-flex align-items-center gap-2 ${isCurrentStatus ? 'active' : ''}`}
            onClick={() => handleStatusChange(status)}
            disabled={isCurrentStatus}
            style={{
              border: 'none',
              background: isCurrentStatus ? config.bgColor : 'transparent',
              color: isCurrentStatus ? 'white' : '#212529',
              width: '100%',
              textAlign: 'left',
              padding: '0.5rem 1rem',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!isCurrentStatus) {
                e.target.style.backgroundColor = '#f8f9fa';
              }
            }}
            onMouseLeave={(e) => {
              if (!isCurrentStatus) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <StatusIcon size={14} />
            <span>{config.label}</span>
            {isCurrentStatus && <FiCheck size={14} className="ms-auto" />}
          </button>
        );
      })}
    </div>,
    document.body
  );

  return (
    <>
      <div className="client-status-dropdown">
        {error && (
          <Alert variant="danger" className="mb-2" style={{ fontSize: '0.8rem' }}>
            {error}
          </Alert>
        )}
        
        <button
          ref={buttonRef}
          className={`btn btn-${currentStatusConfig.color} btn-${size} d-flex align-items-center gap-1`}
          onClick={handleToggle}
          disabled={disabled || loading}
          style={{ 
            backgroundColor: currentStatusConfig.bgColor,
            borderColor: currentStatusConfig.bgColor,
            minWidth: '140px'
          }}
        >
          {loading ? (
            <Spinner animation="border" size="sm" />
          ) : (
            <>
              <CurrentIcon size={14} />
              {showLabel && <span>{currentStatusConfig.label}</span>}
            </>
          )}
          <FiChevronDown size={12} />
        </button>
      </div>
      {dropdownMenu}
    </>
  );
};

export default ClientStatusDropdown;