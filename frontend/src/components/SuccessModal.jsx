import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FiCheckCircle, FiX } from 'react-icons/fi';
import './SuccessModal.css';

const SuccessModal = ({ show, onHide, title, message, buttonText = "Aceptar" }) => {
  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered 
      className="success-modal"
      backdrop="static"
    >
      <Modal.Body className="success-modal-body">
        <div className="success-content">
          <div className="success-icon">
            <FiCheckCircle />
          </div>
          <div className="success-text">
            <h4 className="success-title">{title}</h4>
            <p className="success-message">{message}</p>
          </div>
        </div>
        <div className="success-actions">
          <Button 
            variant="primary" 
            onClick={onHide}
            className="success-button"
          >
            {buttonText}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default SuccessModal;
