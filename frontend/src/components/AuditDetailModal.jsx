import React from 'react';
import { 
  Modal, 
  Card, 
  Row, 
  Col, 
  Badge, 
  Button,
  ListGroup,
  Alert
} from 'react-bootstrap';
import { 
  FiActivity, 
  FiUser, 
  FiClock, 
  FiMapPin,
  FiInfo,
  FiX,
  FiEdit,
  FiTrash2,
  FiDownload,
  FiEye
} from 'react-icons/fi';

export default function AuditDetailModal({ 
  show, 
  onHide, 
  auditRecord,
  onExport,
  onEdit,
  onDelete
}) {
  if (!auditRecord) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'crear':
      case 'create':
        return <FiEdit className="text-success" />;
      case 'actualizar':
      case 'update':
        return <FiEdit className="text-primary" />;
      case 'eliminar':
      case 'delete':
        return <FiTrash2 className="text-danger" />;
      case 'login':
        return <FiUser className="text-info" />;
      case 'logout':
        return <FiUser className="text-secondary" />;
      case 'actualizar_estado':
        return <FiActivity className="text-warning" />;
      case 'actualizar_categorias':
        return <FiActivity className="text-info" />;
      default:
        return <FiActivity className="text-muted" />;
    }
  };

  const getActionBadgeColor = (action) => {
    switch (action) {
      case 'crear':
      case 'create':
        return 'success';
      case 'actualizar':
      case 'update':
        return 'primary';
      case 'eliminar':
      case 'delete':
        return 'danger';
      case 'login':
        return 'info';
      case 'logout':
        return 'secondary';
      case 'actualizar_estado':
        return 'warning';
      case 'actualizar_categorias':
        return 'info';
      default:
        return 'dark';
    }
  };

  const formatActionThirdPerson = (action) => {
    const actionMap = {
      'crear': 'creó',
      'create': 'creó',
      'actualizar': 'actualizó',
      'update': 'actualizó',
      'eliminar': 'eliminó',
      'delete': 'eliminó',
      'login': 'inició sesión',
      'logout': 'cerró sesión',
      'actualizar_estado': 'actualizó el estado',
      'actualizar_categorias': 'actualizó las categorías',
      'marcar_proyecto': 'marcó el proyecto',
      'exportar': 'exportó',
      'importar': 'importó',
      'configurar': 'configuró',
      'asignar': 'asignó',
      'desasignar': 'desasignó'
    };
    return actionMap[action] || action;
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FiEye className="me-2" />
          Detalles de Auditoría
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <Row>
          {/* Información Principal */}
          <Col md={8}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">
                  <FiInfo className="me-2" />
                  Información del Registro
                </h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong>ID del Registro:</strong>
                      <div className="text-muted">#{auditRecord.id}</div>
                    </div>
                    
                    <div className="mb-3">
                      <strong>Acción Realizada:</strong>
                      <div className="d-flex align-items-center mt-1">
                        {getActionIcon(auditRecord.action)}
                        <Badge 
                          bg={getActionBadgeColor(auditRecord.action)} 
                          className="ms-2"
                        >
                          {formatActionThirdPerson(auditRecord.action)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <strong>Usuario:</strong>
                      <div className="d-flex align-items-center mt-1">
                        <FiUser className="me-2 text-muted" />
                        <span>{auditRecord.user_name || auditRecord.performed_by || auditRecord.user_id || 'Sistema'}</span>
                      </div>
                    </div>
                  </Col>
                  
                  <Col md={6}>
                    <div className="mb-3">
                      <strong>Fecha y Hora:</strong>
                      <div className="d-flex align-items-center mt-1">
                        <FiClock className="me-2 text-muted" />
                        <span>{formatDate(auditRecord.performed_at || auditRecord.created_at)}</span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <strong>IP del Usuario:</strong>
                      <div className="text-muted">{auditRecord.ip_address || 'No disponible'}</div>
                    </div>
                    
                    <div className="mb-3">
                      <strong>User Agent:</strong>
                      <div className="text-muted small">
                        {auditRecord.user_agent || 'No disponible'}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
          
          {/* Información Adicional */}
          <Col md={4}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">
                  <FiMapPin className="me-2" />
                  Contexto
                </h6>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Módulo:</span>
                    <Badge bg="info">{auditRecord.module || 'Sistema'}</Badge>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Entidad:</span>
                    <Badge bg="secondary">{auditRecord.entity || 'N/A'}</Badge>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>ID Entidad:</span>
                    <Badge bg="light" text="dark">{auditRecord.entity_id || 'N/A'}</Badge>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Estado:</span>
                    <Badge bg="success">Completado</Badge>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {/* Notas y Detalles */}
        <Card>
          <Card.Header>
            <h6 className="mb-0">
              <FiActivity className="me-2" />
              Detalles Adicionales
            </h6>
          </Card.Header>
          <Card.Body>
            {auditRecord.notes ? (
              <div>
                <strong>Notas:</strong>
                <div className="mt-2 p-3 bg-light rounded">
                  {auditRecord.notes}
                </div>
              </div>
            ) : (
              <Alert variant="info" className="mb-0">
                <FiInfo className="me-2" />
                No hay notas adicionales para este registro.
              </Alert>
            )}
            
            {auditRecord.changes && (
              <div className="mt-3">
                <strong>Cambios Realizados:</strong>
                <div className="mt-2">
                  <pre className="bg-light p-3 rounded small">
                    {JSON.stringify(auditRecord.changes, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          <FiX className="me-1" />
          Cerrar
        </Button>
        
        <Button variant="outline-primary" onClick={() => onExport && onExport(auditRecord)}>
          <FiDownload className="me-1" />
          Exportar
        </Button>
        
        {onEdit && (
          <Button variant="outline-warning" onClick={() => onEdit(auditRecord)}>
            <FiEdit className="me-1" />
            Editar
          </Button>
        )}
        
        {onDelete && (
          <Button variant="outline-danger" onClick={() => onDelete(auditRecord)}>
            <FiTrash2 className="me-1" />
            Eliminar
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
