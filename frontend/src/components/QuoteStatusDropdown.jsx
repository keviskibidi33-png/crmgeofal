import React, { useState } from 'react';
import { Dropdown, Button, Spinner, Alert } from 'react-bootstrap';
import { FiChevronDown, FiCheck, FiClock, FiSend, FiMessageSquare, FiTrendingUp, FiCheckCircle, FiX } from 'react-icons/fi';
import { updateQuoteStatus } from '../services/quotes';

// Estados de cotizaciones con iconos y colores
const QUOTE_STATUSES = {
  nuevo: {
    label: 'Nuevo',
    icon: FiClock,
    color: 'primary',
    bgColor: '#007bff'
  },
  cotizacion_enviada: {
    label: 'Cotización Enviada',
    icon: FiSend,
    color: 'info',
    bgColor: '#17a2b8'
  },
  pendiente_cotizacion: {
    label: 'Pendiente de Cotización',
    icon: FiClock,
    color: 'warning',
    bgColor: '#ffc107'
  },
  en_negociacion: {
    label: 'En Negociación',
    icon: FiMessageSquare,
    color: 'secondary',
    bgColor: '#6c757d'
  },
  seguimiento: {
    label: 'Seguimiento',
    icon: FiTrendingUp,
    color: 'info',
    bgColor: '#17a2b8'
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
  }
};

const QuoteStatusDropdown = ({ 
  quoteId, 
  currentStatus, 
  onStatusChange, 
  disabled = false,
  size = 'sm',
  showLabel = true 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus) return;
    
    setLoading(true);
    setError('');
    
    try {
      await updateQuoteStatus(quoteId, newStatus);
      onStatusChange?.(newStatus);
    } catch (err) {
      setError(err.message || 'Error al actualizar estado');
      console.error('Error updating quote status:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentStatusConfig = QUOTE_STATUSES[currentStatus] || QUOTE_STATUSES.nuevo;
  const CurrentIcon = currentStatusConfig.icon;

  return (
    <div className="quote-status-dropdown">
      {error && (
        <Alert variant="danger" className="mb-2" style={{ fontSize: '0.8rem' }}>
          {error}
        </Alert>
      )}
      
      <Dropdown>
        <Dropdown.Toggle 
          variant={currentStatusConfig.color}
          size={size}
          disabled={disabled || loading}
          className="d-flex align-items-center gap-1"
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
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {Object.entries(QUOTE_STATUSES).map(([status, config]) => {
            const StatusIcon = config.icon;
            const isCurrentStatus = status === currentStatus;
            
            return (
              <Dropdown.Item
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={isCurrentStatus}
                className={`d-flex align-items-center gap-2 ${isCurrentStatus ? 'active' : ''}`}
                style={{ 
                  backgroundColor: isCurrentStatus ? config.bgColor : 'transparent',
                  color: isCurrentStatus ? 'white' : 'inherit'
                }}
              >
                <StatusIcon size={14} />
                <span>{config.label}</span>
                {isCurrentStatus && <FiCheck size={14} className="ms-auto" />}
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default QuoteStatusDropdown;
