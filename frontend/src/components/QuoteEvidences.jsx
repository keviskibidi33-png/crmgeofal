import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Spinner, Badge, Form, Modal } from 'react-bootstrap';
import { FiUpload, FiDownload, FiTrash2, FiFile, FiImage, FiFileText, FiCheckCircle, FiEye, FiPaperclip, FiXCircle, FiClock } from 'react-icons/fi';
import './QuoteEvidences.css';

const QuoteEvidences = ({ quoteId }) => {
  const [evidences, setEvidences] = useState({ primer_contacto: [], aceptacion: [], finalizacion: [] });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({ total: 0, primer_contacto: 0, aceptacion: 0, finalizacion: 0 });

  // Estados para el modal de subida
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadNotes, setUploadNotes] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewType, setViewType] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [evidenceToDelete, setEvidenceToDelete] = useState(null);

  useEffect(() => {
    if (quoteId) {
      loadEvidences();
      loadStats();
    }
  }, [quoteId]);

  const loadEvidences = async () => {
    try {
      setLoading(true);
      setError('');
      
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:4000';
      const baseUrl = apiUrl.replace(/\/api$/, '');
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/quotes/${quoteId}/evidences`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar evidencias');
      }

      const data = await response.json();
      setEvidences(data.grouped || { primer_contacto: [], aceptacion: [], finalizacion: [] });
    } catch (err) {
      console.error('Error cargando evidencias:', err);
      setError('No se pudieron cargar las evidencias: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:4000';
      const baseUrl = apiUrl.replace(/\/api$/, '');
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/quotes/${quoteId}/evidences/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats({
          total: parseInt(data.total) || 0,
          primer_contacto: parseInt(data.primer_contacto) || 0,
          aceptacion: parseInt(data.aceptacion) || 0,
          finalizacion: parseInt(data.finalizacion) || 0
        });
      }
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  };

  const handleUploadClick = (type) => {
    setUploadType(type);
    setUploadFile(null);
    setUploadNotes('');
    setShowUploadModal(true);
  };

  const handleViewClick = (type) => {
    setViewType(type);
    setShowViewModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = [
        'application/pdf',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/png',
        'image/jpeg',
        'image/jpg'
      ];

      if (!allowedTypes.includes(file.type)) {
        setError('Tipo de archivo no permitido. Solo se aceptan PDF, Excel (.xlsx) e imágenes (PNG, JPG)');
        e.target.value = '';
        return;
      }

      // Validar tamaño (10MB máximo)
      if (file.size > 10 * 1024 * 1024) {
        setError('El archivo es demasiado grande. Tamaño máximo: 10MB');
        e.target.value = '';
        return;
      }

      setUploadFile(file);
      setError('');
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) {
      setError('Por favor selecciona un archivo');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('evidence_type', uploadType);
      if (uploadNotes) {
        formData.append('notes', uploadNotes);
      }

      const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:4000';
      const baseUrl = apiUrl.replace(/\/api$/, '');
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/quotes/${quoteId}/evidences`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al subir evidencia');
      }

      setSuccess('Evidencia subida correctamente');
      setShowUploadModal(false);
      loadEvidences();
      loadStats();

      // Limpiar el mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error subiendo evidencia:', err);
      setError('Error al subir evidencia: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (evidenceId, fileName) => {
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:4000';
      const baseUrl = apiUrl.replace(/\/api$/, '');
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/quotes/evidences/${evidenceId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al descargar archivo');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error descargando evidencia:', err);
      setError('Error al descargar archivo: ' + err.message);
    }
  };

  const handleDeleteClick = (evidence) => {
    setEvidenceToDelete(evidence);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!evidenceToDelete) return;

    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:4000';
      const baseUrl = apiUrl.replace(/\/api$/, '');
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/quotes/evidences/${evidenceToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar evidencia');
      }

      setSuccess('Evidencia eliminada correctamente');
      setShowDeleteModal(false);
      setEvidenceToDelete(null);
      loadEvidences();
      loadStats();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error eliminando evidencia:', err);
      setError('Error al eliminar evidencia: ' + err.message);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setEvidenceToDelete(null);
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return <FiFileText className="text-danger" size={24} />;
    if (fileType.includes('image')) return <FiImage className="text-success" size={24} />;
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return <FiFile className="text-success" size={24} />;
    return <FiFile className="text-secondary" size={24} />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Desconocido';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderEvidenceSection = (title, type, icon, color, evidenceList) => {
    const count = evidenceList.length;

    return (
      <Card className="mb-3 shadow-sm">
        <Card.Header className={`bg-${color} text-dark d-flex justify-content-between align-items-center`}>
          <div className="d-flex align-items-center gap-2">
            {icon}
            <strong>{title}</strong>
            <Badge bg="light" text="dark">{count}</Badge>
          </div>
          <div className="d-flex gap-2">
            {count > 0 && (
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => handleViewClick(type)}
              >
                <FiEye className="me-1" />
                Ver evidencias
              </Button>
            )}
            <Button 
              variant="light" 
              size="sm"
              onClick={() => handleUploadClick(type)}
            >
              <FiUpload className="me-1" />
              Subir archivo
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {evidenceList.length === 0 ? (
            <div className="text-center text-muted py-3">
              <FiFile size={48} className="mb-2 opacity-25" />
              <p>No hay evidencias cargadas</p>
            </div>
          ) : (
            <div className="evidence-list">
              {evidenceList.map((evidence) => (
                <div key={evidence.id} className="evidence-item d-flex align-items-center justify-content-between p-3 border-bottom">
                  <div className="d-flex align-items-center gap-3 flex-grow-1">
                    {getFileIcon(evidence.file_type)}
                    <div className="flex-grow-1">
                      <div className="fw-bold">{evidence.file_name}</div>
                      <div className="text-muted small">
                        <span>{formatFileSize(evidence.file_size)}</span>
                        <span className="mx-2">•</span>
                        <span>{formatDate(evidence.uploaded_at)}</span>
                        {evidence.uploaded_by_name && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Por: {evidence.uploaded_by_name}</span>
                          </>
                        )}
                      </div>
                      {evidence.notes && (
                        <div className="text-muted small mt-1">
                          <em>Nota: {evidence.notes}</em>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleDownload(evidence.id, evidence.file_name)}
                      title="Descargar"
                    >
                      <FiDownload />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteClick(evidence)}
                      title="Eliminar"
                    >
                      <FiTrash2 />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando evidencias...</p>
      </div>
    );
  }

  return (
    <div className="quote-evidences">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">📋 Evidencias de la Cotización</h4>
        <Badge bg="info" className="fs-6">
          Total: {stats.total} archivo{stats.total !== 1 ? 's' : ''}
        </Badge>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {renderEvidenceSection(
        ' Evidencia de Primer Contacto',
        'primer_contacto',
        '📸',
        'primary',
        evidences.primer_contacto
      )}

      {renderEvidenceSection(
        'Evidencias de Aceptación',
        'aceptacion',
        '✅',
        'success',
        evidences.aceptacion
      )}

      {renderEvidenceSection(
        'Evidencias de Finalización',
        'finalizacion',
        '🏁',
        'warning',
        evidences.finalizacion
      )}

      {/* Modal de subida de archivos */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            Subir Evidencia
            {uploadType === 'primer_contacto' && ' - Primer Contacto 📸'}
            {uploadType === 'aceptacion' && ' - Aceptación ✅'}
            {uploadType === 'finalizacion' && ' - Finalización 🏁'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Archivo *</Form.Label>
              <Form.Control
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.xlsx,.xls,.png,.jpg,.jpeg"
              />
              <Form.Text className="text-muted">
                Formatos permitidos: PDF, Excel (.xlsx), imágenes (PNG, JPG). Tamaño máximo: 10MB
              </Form.Text>
            </Form.Group>

            {uploadFile && (
              <Alert variant="info">
                <FiCheckCircle className="me-2" />
                Archivo seleccionado: <strong>{uploadFile.name}</strong> ({formatFileSize(uploadFile.size)})
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Notas (opcional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={uploadNotes}
                onChange={(e) => setUploadNotes(e.target.value)}
                placeholder="Agrega notas o comentarios sobre esta evidencia..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleUploadSubmit}
            disabled={!uploadFile || uploading}
          >
            {uploading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Subiendo...
              </>
            ) : (
              <>
                <FiUpload className="me-2" />
                Subir Evidencia
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para visualizar evidencias */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Ver Evidencias
            {viewType === 'primer_contacto' && ' - Primer Contacto 📸'}
            {viewType === 'aceptacion' && ' - Aceptación ✅'}
            {viewType === 'finalizacion' && ' - Finalización 🏁'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {evidences[viewType] && evidences[viewType].length > 0 ? (
            <div className="evidences-view">
              {evidences[viewType].map((evidence) => (
                <div key={evidence.id} className="evidence-item-view border rounded p-3 mb-3">
                  <div className="d-flex align-items-start justify-content-between">
                    <div className="d-flex align-items-start gap-3 flex-grow-1">
                      {getFileIcon(evidence.file_type)}
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{evidence.file_name}</h6>
                        <div className="text-muted small mb-2">
                          <span className="me-3">📏 {formatFileSize(evidence.file_size)}</span>
                          <span className="me-3">📅 {formatDate(evidence.uploaded_at)}</span>
                          {evidence.uploaded_by_name && (
                            <span>👤 Por: {evidence.uploaded_by_name}</span>
                          )}
                        </div>
                        {evidence.notes && (
                          <div className="alert alert-light p-2 mb-0">
                            <strong className="small">Notas:</strong>
                            <div className="small mt-1">{evidence.notes}</div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleDownload(evidence.id, evidence.file_name)}
                        title="Descargar"
                      >
                        <FiDownload />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteClick(evidence)}
                        title="Eliminar"
                      >
                        <FiTrash2 />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <FiFile size={48} className="text-muted mb-3" />
              <p className="text-muted">No hay evidencias de este tipo</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmación para eliminar evidencia */}
      <Modal show={showDeleteModal} onHide={handleDeleteCancel} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">
            <FiTrash2 className="me-2" />
            Confirmar Eliminación
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <FiTrash2 size={48} className="text-danger mb-3" />
            <h5>¿Estás seguro de que quieres eliminar esta evidencia?</h5>
            {evidenceToDelete && (
              <div className="mt-3 p-3 bg-light rounded">
                <strong>Archivo:</strong> {evidenceToDelete.file_name}
                <br />
                <small className="text-muted">
                  Tamaño: {formatFileSize(evidenceToDelete.file_size)}
                </small>
                {evidenceToDelete.notes && (
                  <>
                    <br />
                    <small className="text-muted">
                      <strong>Notas:</strong> {evidenceToDelete.notes}
                    </small>
                  </>
                )}
              </div>
            )}
            <p className="text-muted mt-3">
              Esta acción no se puede deshacer.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteCancel}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            <FiTrash2 className="me-1" />
            Eliminar Evidencia
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default QuoteEvidences;

