import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FiCheckCircle, FiX } from 'react-icons/fi';
import './SuccessModal.css';

const SuccessModal = ({ show, onHide, data, buttonText = "Aceptar" }) => {
  const isEdit = data?.isEdit;
  const title = isEdit ? "✅ Cotización Actualizada" : "✅ Cotización Creada";
  const message = data?.message || (isEdit ? "La cotización ha sido actualizada exitosamente" : "La cotización ha sido creada exitosamente");
  
  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered 
      className="success-modal"
      backdrop="static"
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="success-modal-body">
        <div className="success-content">
          <div className="success-icon">
            <FiCheckCircle />
          </div>
          <div className="success-text">
            <h4 className="success-title">{message}</h4>
            {data && (
              <div className="quote-success-details">
                <div className="success-item">
                  <strong>Código:</strong> {data.code}
                </div>
                <div className="success-item">
                  <strong>Categoría:</strong> {data.category}
                </div>
                <div className="success-item">
                  <strong>Ítems:</strong> {data.itemsCount} servicio(s)
                </div>
                <div className="success-item total-highlight">
                  <strong>Total:</strong> S/ {data.total}
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="primary" 
          onClick={onHide}
          className="success-button"
        >
          {buttonText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SuccessModal;
