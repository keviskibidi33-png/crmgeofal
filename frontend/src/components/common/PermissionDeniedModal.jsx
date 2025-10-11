import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FiAlertTriangle, FiShield, FiX } from 'react-icons/fi';

const PermissionDeniedModal = ({ 
  show, 
  onHide, 
  action = "realizar esta acción",
  requiredRole = "administrador",
  currentRole = "usuario"
}) => {
  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header className="bg-danger text-white border-0">
        <Modal.Title className="d-flex align-items-center">
          <FiShield className="me-2" size={20} />
          Acceso Denegado
        </Modal.Title>
        <Button 
          variant="link" 
          className="text-white p-0 border-0"
          onClick={onHide}
          style={{ fontSize: '1.5rem', lineHeight: 1 }}
        >
          <FiX />
        </Button>
      </Modal.Header>
      
      <Modal.Body className="py-4">
        <div className="text-center">
          <div className="mb-3">
            <FiAlertTriangle 
              size={48} 
              className="text-warning"
            />
          </div>
          
          <h5 className="text-danger mb-3">
            No tienes permisos para {action}
          </h5>
          
          <div className="alert alert-warning border-0 mb-3">
            <div className="d-flex align-items-center">
              <FiShield className="me-2 text-warning" size={16} />
              <div>
                <strong>Rol requerido:</strong> {requiredRole}
                <br />
                <strong>Tu rol actual:</strong> {currentRole}
              </div>
            </div>
          </div>
          
          <p className="text-muted mb-0">
            Contacta al administrador del sistema si necesitas acceso a esta funcionalidad.
          </p>
        </div>
      </Modal.Body>
      
      <Modal.Footer className="border-0 justify-content-center">
        <Button 
          variant="secondary" 
          onClick={onHide}
          className="px-4"
        >
          Entendido
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PermissionDeniedModal;
