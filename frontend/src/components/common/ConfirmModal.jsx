import React from 'react';
import { Modal, Button, Alert, Spinner } from 'react-bootstrap';
import { FiAlertTriangle, FiTrash2, FiCheck, FiX, FiInfo } from 'react-icons/fi';

const ConfirmModal = ({ 
  show, 
  onHide, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'primary', // primary, danger, warning, success
  icon,
  isLoading = false,
  alertVariant,
  alertMessage
}) => {
  const getIcon = () => {
    if (icon) return icon;
    
    switch (variant) {
      case 'danger':
        return <FiTrash2 className="me-2 text-danger" />;
      case 'warning':
        return <FiAlertTriangle className="me-2 text-warning" />;
      case 'success':
        return <FiCheck className="me-2 text-success" />;
      default:
        return <FiInfo className="me-2 text-primary" />;
    }
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'danger':
        return 'text-danger';
      case 'warning':
        return 'text-warning';
      case 'success':
        return 'text-success';
      default:
        return 'text-primary';
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className={getVariantClass()}>
          {getIcon()}
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message}</p>
        {alertMessage && (
          <Alert variant={alertVariant || variant}>
            {alertMessage}
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isLoading}>
          <FiX className="me-1" />
          {cancelText}
        </Button>
        <Button 
          variant={variant} 
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Procesando...
            </>
          ) : (
            <>
              {getIcon()}
              {confirmText}
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;