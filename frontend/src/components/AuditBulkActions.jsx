import React, { useState } from 'react';
import { 
  Button, 
  Dropdown, 
  Modal, 
  Alert,
  ProgressBar,
  Badge
} from 'react-bootstrap';
import { 
  FiMoreVertical, 
  FiDownload, 
  FiTrash2, 
  FiArchive,
  FiCheck,
  FiX,
  FiAlertTriangle
} from 'react-icons/fi';

export default function AuditBulkActions({ 
  selectedItems = [], 
  onBulkExport,
  onBulkDelete,
  onBulkArchive,
  onClearSelection
}) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bulkAction, setBulkAction] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const selectedCount = selectedItems.length;

  const handleBulkAction = async (action) => {
    if (selectedCount === 0) return;
    
    setBulkAction(action);
    setShowConfirmModal(true);
  };

  const confirmBulkAction = async () => {
    if (!bulkAction) return;
    
    setIsProcessing(true);
    setProgress(0);
    
    try {
      // Simular progreso
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsProcessing(false);
            setShowConfirmModal(false);
            setBulkAction(null);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
      
      // Ejecutar acción masiva
      switch (bulkAction) {
        case 'export':
          await onBulkExport?.(selectedItems);
          break;
        case 'delete':
          await onBulkDelete?.(selectedItems);
          break;
        case 'archive':
          await onBulkArchive?.(selectedItems);
          break;
      }
      
      // Limpiar selección
      onClearSelection?.();
      
    } catch (error) {
      console.error('Error en acción masiva:', error);
      setIsProcessing(false);
    }
  };

  const getActionTitle = (action) => {
    switch (action) {
      case 'export':
        return 'Exportar Registros Seleccionados';
      case 'delete':
        return 'Eliminar Registros Seleccionados';
      case 'archive':
        return 'Archivar Registros Seleccionados';
      default:
        return 'Acción Masiva';
    }
  };

  const getActionDescription = (action) => {
    switch (action) {
      case 'export':
        return `Se exportarán ${selectedCount} registros de auditoría en formato Excel.`;
      case 'delete':
        return `Se eliminarán permanentemente ${selectedCount} registros de auditoría. Esta acción no se puede deshacer.`;
      case 'archive':
        return `Se archivarán ${selectedCount} registros de auditoría. Los registros archivados no aparecerán en las búsquedas normales.`;
      default:
        return '';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'export':
        return <FiDownload className="text-success" />;
      case 'delete':
        return <FiTrash2 className="text-danger" />;
      case 'archive':
        return <FiArchive className="text-warning" />;
      default:
        return <FiMoreVertical />;
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <div className="d-flex align-items-center gap-2 mb-3">
        <Badge bg="primary" className="fs-6">
          {selectedCount} seleccionado{selectedCount !== 1 ? 's' : ''}
        </Badge>
        
        <Dropdown>
          <Dropdown.Toggle variant="outline-primary" size="sm">
            <FiMoreVertical className="me-1" />
            Acciones Masivas
          </Dropdown.Toggle>
          
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => handleBulkAction('export')}>
              <FiDownload className="me-2" />
              Exportar Seleccionados
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleBulkAction('archive')}>
              <FiArchive className="me-2" />
              Archivar Seleccionados
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item 
              onClick={() => handleBulkAction('delete')}
              className="text-danger"
            >
              <FiTrash2 className="me-2" />
              Eliminar Seleccionados
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        
        <Button 
          variant="outline-secondary" 
          size="sm"
          onClick={onClearSelection}
        >
          <FiX className="me-1" />
          Limpiar Selección
        </Button>
      </div>

      {/* Modal de Confirmación */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {getActionIcon(bulkAction)}
            <span className="ms-2">{getActionTitle(bulkAction)}</span>
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          <Alert variant="info" className="mb-3">
            <FiAlertTriangle className="me-2" />
            {getActionDescription(bulkAction)}
          </Alert>
          
          {isProcessing && (
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-2">
                <span>Procesando...</span>
                <span>{progress}%</span>
              </div>
              <ProgressBar now={progress} animated />
            </div>
          )}
          
          <div className="text-muted small">
            <strong>Registros seleccionados:</strong>
            <ul className="mt-2 mb-0">
              {selectedItems.slice(0, 5).map((item, index) => (
                <li key={index}>
                  #{item.id} - {item.action} - {item.user_name || item.user_id}
                </li>
              ))}
              {selectedItems.length > 5 && (
                <li>... y {selectedItems.length - 5} más</li>
              )}
            </ul>
          </div>
        </Modal.Body>
        
        <Modal.Footer>
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowConfirmModal(false)}
            disabled={isProcessing}
          >
            <FiX className="me-1" />
            Cancelar
          </Button>
          
          <Button 
            variant={bulkAction === 'delete' ? 'danger' : 'primary'}
            onClick={confirmBulkAction}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="spinner-border spinner-border-sm me-1" role="status">
                  <span className="visually-hidden">Procesando...</span>
                </div>
                Procesando...
              </>
            ) : (
              <>
                <FiCheck className="me-1" />
                Confirmar
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
