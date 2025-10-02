import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, Modal, Form, Table } from 'react-bootstrap';
import { FiUpload, FiCheck, FiX, FiEye, FiDownload, FiRefreshCw, FiDollarSign, FiFileText, FiHome, FiArchive } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const ComprobantesPago = () => {
  const { user } = useAuth();
  const [pendingProofs, setPendingProofs] = useState([]);
  const [approvedProofs, setApprovedProofs] = useState([]);
  const [archivedProofs, setArchivedProofs] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedProof, setSelectedProof] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  // ✅ NUEVO: Estado para monto real pagado
  const [realAmountPaid, setRealAmountPaid] = useState('');
  const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());
  const [archivingProofs, setArchivingProofs] = useState(new Set());

  // Formulario de subida completo
  const [uploadForm, setUploadForm] = useState({
    quote_id: '',
    quote_file: null,
    project_files: [],
    description: '',
    amount_paid: '',
    payment_date: '',
    payment_method: '',
    payment_proof: null,
    client_name: '',
    client_email: '',
    project_description: ''
  });

  // ✅ NUEVO: Estados para selección inteligente de cotizaciones
  const [myQuotes, setMyQuotes] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);

  useEffect(() => {
    fetchData();
    // ✅ NUEVO: Cargar cotizaciones del vendedor
    if (user.role === 'vendedor_comercial' || user.role === 'jefa_comercial') {
      fetchMyQuotes();
    }
  }, []);

  // ✅ NUEVO: Función para cargar cotizaciones del vendedor
  const fetchMyQuotes = async () => {
    try {
      setLoadingQuotes(true);
      const quotes = await api('/api/quotes/my-quotes');
      setMyQuotes(quotes || []);
      console.log('📋 Cotizaciones cargadas:', quotes?.length || 0);
    } catch (err) {
      console.error('Error fetching quotes:', err);
      setError('Error al cargar las cotizaciones: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoadingQuotes(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (user.role === 'facturacion' || user.role === 'admin') {
        // Para facturación: ver todos los comprobantes
        const [pendingData, approvedData, archivedData] = await Promise.all([
          api('/api/payment-proofs/pending'),
          api('/api/payment-proofs/approved'),
          api('/api/payment-proofs/archived')
        ]);

        setPendingProofs(pendingData || []);
        setApprovedProofs(approvedData || []);
        setArchivedProofs(archivedData || []);
      } else if (user.role === 'vendedor_comercial' || user.role === 'jefa_comercial') {
        // Para vendedores: ver sus propios envíos
        const myData = await api('/api/payment-proofs/my-submissions');
        setMySubmissions(myData || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error al cargar los datos: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadForm({ ...uploadForm, payment_proof: file });
    }
  };

  const handleUpload = async () => {
    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('quote_id', uploadForm.quote_id);
      formData.append('description', uploadForm.description);
      formData.append('amount_paid', uploadForm.amount_paid);
      formData.append('payment_date', uploadForm.payment_date);
      formData.append('payment_method', uploadForm.payment_method);
      formData.append('payment_proof', uploadForm.payment_proof);

      await api('/api/payment-proofs/upload', {
        method: 'POST',
        body: formData
      });

      setShowUploadModal(false);
      setUploadForm({
        quote_id: '',
        description: '',
        amount_paid: '',
        payment_date: '',
        payment_method: '',
        payment_proof: null
      });
      fetchData();
    } catch (err) {
      console.error('Error uploading proof:', err);
      setError('Error al subir el comprobante: ' + (err.message || 'Error desconocido'));
    } finally {
      setUploading(false);
    }
  };

  const handleApprove = async () => {
    try {
      // 1. Aprobar el comprobante de pago
      await api('/api/payment-proofs/approve', {
        method: 'POST',
        body: JSON.stringify({ 
          proofId: selectedProof.id, 
          notes: approvalNotes 
        })
      });

      // 2. ✅ NUEVO: Alimentar el embudo de ventas
      if (selectedProof.quote_id && realAmountPaid) {
        try {
          console.log('🍯 Alimentando embudo de ventas...', {
            quoteId: selectedProof.quote_id,
            realAmountPaid: parseFloat(realAmountPaid)
          });

          const embudoResponse = await api('/api/funnel/alimentar-embudo', {
            method: 'POST',
            body: JSON.stringify({
              quoteId: selectedProof.quote_id,
              realAmountPaid: parseFloat(realAmountPaid)
            })
          });

          console.log('✅ Embudo alimentado exitosamente:', embudoResponse);
          
          // Mostrar mensaje de éxito
          alert(`✅ Comprobante aprobado y embudo alimentado exitosamente!\n📊 Procesados: ${embudoResponse.itemsProcessed} ítems\n🏷️ Categoría: ${embudoResponse.category}\n📋 Código: ${embudoResponse.quoteCode}`);
          
        } catch (embudoError) {
          console.error('❌ Error alimentando embudo:', embudoError);
          alert('⚠️ Comprobante aprobado pero hubo un error alimentando el embudo. Contacta al administrador.');
        }
      } else {
        console.warn('⚠️ No se pudo alimentar el embudo: quote_id o realAmountPaid faltante');
        alert('✅ Comprobante aprobado (embudo no alimentado - datos faltantes)');
      }
      
      fetchData();
      setShowApprovalModal(false);
      setApprovalNotes('');
      setRealAmountPaid('');
    } catch (err) {
      console.error('Error approving proof:', err);
      setError('Error al aprobar el comprobante: ' + (err.message || 'Error desconocido'));
    }
  };

  const handleReject = async () => {
    try {
      await api('/api/payment-proofs/reject', {
        method: 'POST',
        body: JSON.stringify({ 
          proofId: selectedProof.id, 
          reason: rejectionReason 
        })
      });
      
      fetchData();
      setShowRejectionModal(false);
      setRejectionReason('');
    } catch (err) {
      console.error('Error rejecting proof:', err);
      setError('Error al rechazar el comprobante: ' + (err.message || 'Error desconocido'));
    }
  };

  const handleDownload = async (proofId) => {
    try {
      // Obtener información del comprobante
      const proofData = await api(`/api/payment-proofs/${proofId}`);
      const proof = proofData.data || proofData;
      
      if (!proof) {
        setError('No se encontró el comprobante');
        return;
      }

      // Crear modal para seleccionar qué descargar
      setSelectedProof(proof);
      setShowDownloadModal(true);
      
    } catch (err) {
      console.error('Error getting proof data:', err);
      setError('Error al obtener información del comprobante: ' + (err.message || 'Error desconocido'));
    }
  };

  // Función para descargar archivo específico
  const downloadFile = async (filePath, fileName, fileType = 'attachment') => {
    try {
      const response = await fetch(`/api/payment-proofs/download-file?path=${encodeURIComponent(filePath)}&type=${fileType}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Error al descargar el archivo');
      }
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Error al descargar el archivo: ' + (err.message || 'Error desconocido'));
    }
  };


  // Función para manejar la expansión de descripciones
  const toggleDescription = (proofId) => {
    const newExpanded = new Set(expandedDescriptions);
    if (newExpanded.has(proofId)) {
      newExpanded.delete(proofId);
    } else {
      newExpanded.add(proofId);
    }
    setExpandedDescriptions(newExpanded);
  };

  // Función para truncar texto
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Función para archivar comprobante
  const handleArchive = async (proofId) => {
    if (window.confirm('¿Estás seguro de que quieres archivar este comprobante? Se moverá al archivo y no aparecerá en la lista principal.')) {
      try {
        // Marcar como procesando
        setArchivingProofs(prev => new Set([...prev, proofId]));
        
        const response = await api(`/api/payment-proofs/${proofId}/archive`, {
          method: 'PUT'
        });
        
        // Actualizar estado local inmediatamente
        const proofToArchive = approvedProofs.find(proof => proof.id === proofId);
        if (proofToArchive) {
          // Remover de comprobantes aprobados
          setApprovedProofs(prev => prev.filter(proof => proof.id !== proofId));
          
          // Agregar a comprobantes archivados con datos actualizados
          const archivedProof = {
            ...proofToArchive,
            archived: true,
            archived_at: new Date().toISOString(),
            archived_by_name: user.name
          };
          setArchivedProofs(prev => [archivedProof, ...prev]);
        }
        
        setSuccess('Comprobante archivado exitosamente');
      } catch (err) {
        console.error('Error archiving proof:', err);
        setError('Error al archivar el comprobante: ' + (err.message || 'Error desconocido'));
      } finally {
        // Remover del estado de procesando
        setArchivingProofs(prev => {
          const newSet = new Set(prev);
          newSet.delete(proofId);
          return newSet;
        });
      }
    }
  };

  // Función para desarchivar comprobante
  const handleUnarchive = async (proofId) => {
    if (window.confirm('¿Estás seguro de que quieres desarchivar este comprobante? Volverá a aparecer en la lista de comprobantes aprobados.')) {
      try {
        // Marcar como procesando
        setArchivingProofs(prev => new Set([...prev, proofId]));
        
        const response = await api(`/api/payment-proofs/${proofId}/unarchive`, {
          method: 'PUT'
        });
        
        // Actualizar estado local inmediatamente
        const proofToUnarchive = archivedProofs.find(proof => proof.id === proofId);
        if (proofToUnarchive) {
          // Remover de comprobantes archivados
          setArchivedProofs(prev => prev.filter(proof => proof.id !== proofId));
          
          // Agregar a comprobantes aprobados con datos actualizados
          const unarchivedProof = {
            ...proofToUnarchive,
            archived: false,
            archived_at: null,
            archived_by_name: null
          };
          setApprovedProofs(prev => [unarchivedProof, ...prev]);
        }
        
        setSuccess('Comprobante desarchivado exitosamente');
      } catch (err) {
        console.error('Error unarchiving proof:', err);
        setError('Error al desarchivar el comprobante: ' + (err.message || 'Error desconocido'));
      } finally {
        // Remover del estado de procesando
        setArchivingProofs(prev => {
          const newSet = new Set(prev);
          newSet.delete(proofId);
          return newSet;
        });
      }
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" />
        <div className="ms-3">
          <p>Cargando comprobantes de pago...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2>💳 Sistema de Comprobantes de Pago</h2>
          <p className="text-muted">
            {user.role === 'facturacion' || user.role === 'admin' 
              ? 'Revisar y aprobar comprobantes de pago enviados por vendedores'
              : 'Enviar cotizaciones, comprobantes de pago y archivos del proyecto'
            }
          </p>
        </Col>
        <Col xs="auto">
          {(user.role === 'vendedor_comercial' || user.role === 'jefa_comercial') && (
            <Button variant="success" onClick={() => setShowUploadModal(true)} className="me-2">
              <FiUpload className="me-2" />
              Subir Comprobante
            </Button>
          )}
          <Button variant="outline-primary" onClick={fetchData}>
            <FiRefreshCw className="me-2" />
            Actualizar
          </Button>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Row>
        {/* Para Vendedores: Mis Envíos */}
        {(user.role === 'vendedor_comercial' || user.role === 'jefa_comercial') && (
          <Col lg={12} className="mb-4">
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <FiFileText className="me-2" />
                  Mis Envíos ({mySubmissions.length})
                </h5>
              </Card.Header>
              <Card.Body>
                {mySubmissions.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">No has enviado ningún comprobante aún</p>
                    <Button variant="success" onClick={() => setShowUploadModal(true)}>
                      <FiUpload className="me-2" />
                      Subir Primer Comprobante
                    </Button>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {mySubmissions.map((submission) => (
                      <div key={submission.id} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1">Cotización: {submission.quote_number}</h6>
                            <p className="mb-1 text-muted">
                              <strong>Cliente:</strong> {submission.client_name}<br/>
                              <strong>Monto:</strong> ${submission.amount_paid?.toLocaleString()}<br/>
                              <strong>Estado:</strong> 
                              <Badge bg={submission.status === 'approved' ? 'success' : submission.status === 'rejected' ? 'danger' : 'warning'} className="ms-2">
                                {submission.status === 'approved' ? 'Aprobado' : 
                                 submission.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                              </Badge>
                              {submission.status === 'rejected' && submission.rejection_reason && (
                                <div className="mt-2">
                                  <strong className="text-danger">Motivo del rechazo:</strong>
                                  <div className="text-danger small mt-1">
                                    {submission.rejection_reason}
                                  </div>
                                </div>
                              )}
                            </p>
                            <small className="text-muted">
                              Enviado: {new Date(submission.created_at).toLocaleDateString()}
                            </small>
                          </div>
                          <div className="d-flex flex-column gap-2">
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => handleDownload(submission.id)}
                            >
                              <FiDownload className="me-1" />
                              Ver
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        )}

        {/* Para Facturación: Comprobantes Pendientes */}
        {(user.role === 'facturacion' || user.role === 'admin') && (
          <Col lg={6}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <FiFileText className="me-2" />
                  Comprobantes Pendientes ({pendingProofs.length})
                </h5>
              </Card.Header>
              <Card.Body>
                {pendingProofs.length === 0 ? (
                  <p className="text-muted text-center">No hay comprobantes pendientes</p>
                ) : (
                  <div className="list-group list-group-flush">
                    {pendingProofs.map((proof) => (
                      <div key={proof.id} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1">Cotización: {proof.quote_number}</h6>
                            <p className="mb-1 text-muted">
                              <strong>Empresa:</strong> {proof.company_name}<br/>
                              <strong>Monto:</strong> ${proof.amount_paid?.toLocaleString()}<br/>
                              <strong>Método:</strong> {proof.payment_method}<br/>
                              <strong>Fecha:</strong> {new Date(proof.payment_date).toLocaleDateString()}<br/>
                              <strong>Subido por:</strong> {proof.uploaded_by_name}
                            </p>
                            <div className="mt-2">
                              <strong>Archivos adjuntos:</strong>
                              <div className="d-flex flex-wrap gap-2 mt-1">
                                <Badge bg="primary" className="d-flex align-items-center">
                                  <FiFileText className="me-1" />
                                  Comprobante
                                </Badge>
                                {proof.quote_file_name && (
                                  <Badge bg="info" className="d-flex align-items-center">
                                    <FiFileText className="me-1" />
                                    Cotización
                                  </Badge>
                                )}
                                {proof.project_name && (
                                  <Badge bg="success" className="d-flex align-items-center">
                                    <FiHome className="me-1" />
                                    {proof.project_name}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {proof.description && (
                              <div className="mb-1 text-muted">
                                <strong>Descripción:</strong> 
                                <div className="mt-1">
                                  {expandedDescriptions.has(proof.id) ? (
                                    <div>
                                      <div className="text-break" style={{ wordBreak: 'break-word' }}>
                                        {proof.description}
                                      </div>
                                      <Button 
                                        variant="link" 
                                        size="sm" 
                                        className="p-0 text-primary"
                                        onClick={() => toggleDescription(proof.id)}
                                      >
                                        Ver menos
                                      </Button>
                                    </div>
                                  ) : (
                                    <div>
                                      <div className="text-break" style={{ wordBreak: 'break-word' }}>
                                        {truncateText(proof.description, 150)}
                                      </div>
                                      {proof.description.length > 150 && (
                                        <Button 
                                          variant="link" 
                                          size="sm" 
                                          className="p-0 text-primary"
                                          onClick={() => toggleDescription(proof.id)}
                                        >
                                          Ver descripción completa
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="d-flex flex-column gap-2">
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => handleDownload(proof.id)}
                            >
                              <FiDownload className="me-1" />
                              Ver
                            </Button>
                            <Button 
                              variant="success" 
                              size="sm"
                              onClick={() => {
                                setSelectedProof(proof);
                                setShowApprovalModal(true);
                              }}
                            >
                              <FiCheck className="me-1" />
                              Aprobar
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => {
                                setSelectedProof(proof);
                                setShowRejectionModal(true);
                              }}
                            >
                              <FiX className="me-1" />
                              Rechazar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        )}

        {/* Comprobantes Aprobados */}
        {(user.role === 'facturacion' || user.role === 'admin') && (
          <Col lg={6}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <FiCheck className="me-2" />
                  Comprobantes Aprobados ({approvedProofs.length})
                </h5>
              </Card.Header>
              <Card.Body>
                {approvedProofs.length === 0 ? (
                  <p className="text-muted text-center">No hay comprobantes aprobados</p>
                ) : (
                  <div className="list-group list-group-flush">
                    {approvedProofs.map((proof) => (
                      <div key={proof.id} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1">Cotización: {proof.quote_number}</h6>
                            <p className="mb-1 text-muted">
                              <strong>Empresa:</strong> {proof.company_name}<br/>
                              <strong>Monto:</strong> ${proof.amount_paid?.toLocaleString()}<br/>
                              <strong>Método:</strong> {proof.payment_method}<br/>
                              <strong>Fecha de pago:</strong> {new Date(proof.payment_date).toLocaleDateString()}<br/>
                              <strong>Aprobado por:</strong> {proof.approved_by_name}<br/>
                              <strong>Fecha de aprobación:</strong> {new Date(proof.approved_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="d-flex flex-column gap-2">
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => handleDownload(proof.id)}
                            >
                              <FiDownload className="me-1" />
                              Descargar
                            </Button>
                            <Button 
                              variant="outline-warning" 
                              size="sm"
                              onClick={() => handleArchive(proof.id)}
                              disabled={archivingProofs.has(proof.id)}
                            >
                              {archivingProofs.has(proof.id) ? (
                                <>
                                  <Spinner animation="border" size="sm" className="me-1" />
                                  Archivando...
                                </>
                              ) : (
                                <>
                                  <FiArchive className="me-1" />
                                  Archivar
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Comprobantes Archivados */}
      {(user.role === 'facturacion' || user.role === 'admin') && (
        <Row className="mt-4">
          <Col>
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <FiArchive className="me-2" />
                  Comprobantes Archivados ({archivedProofs.length})
                </h5>
              </Card.Header>
              <Card.Body>
                {archivedProofs.length === 0 ? (
                  <p className="text-muted text-center">No hay comprobantes archivados</p>
                ) : (
                  <div className="list-group list-group-flush">
                    {archivedProofs.map((proof) => (
                      <div key={proof.id} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1">Cotización: {proof.quote_number}</h6>
                            <p className="mb-1 text-muted">
                              <strong>Empresa:</strong> {proof.company_name}<br/>
                              <strong>Monto:</strong> ${proof.amount_paid?.toLocaleString()}<br/>
                              <strong>Método:</strong> {proof.payment_method}<br/>
                              <strong>Fecha de pago:</strong> {new Date(proof.payment_date).toLocaleDateString()}<br/>
                              <strong>Archivado por:</strong> {proof.archived_by_name}<br/>
                              <strong>Fecha de archivado:</strong> {new Date(proof.archived_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="d-flex flex-column gap-2">
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => handleDownload(proof.id)}
                            >
                              <FiDownload className="me-1" />
                              Descargar
                            </Button>
                              <Button 
                                variant="outline-success" 
                                size="sm"
                                onClick={() => handleUnarchive(proof.id)}
                                disabled={archivingProofs.has(proof.id)}
                              >
                                {archivingProofs.has(proof.id) ? (
                                  <>
                                    <Spinner animation="border" size="sm" className="me-1" />
                                    Desarchivando...
                                  </>
                                ) : (
                                  <>
                                    <FiRefreshCw className="me-1" />
                                    Desarchivar
                                  </>
                                )}
                              </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Modal de Subida */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Subir Comprobante de Pago</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Seleccionar Cotización *</Form.Label>
              <Form.Select
                value={uploadForm.quote_id}
                onChange={(e) => {
                  const selectedQuote = myQuotes.find(q => q.id === parseInt(e.target.value));
                  setUploadForm({ 
                    ...uploadForm, 
                    quote_id: e.target.value,
                    client_name: selectedQuote?.company_name || '',
                    client_email: selectedQuote?.client_email || ''
                  });
                }}
                required
                disabled={loadingQuotes}
              >
                <option value="">
                  {loadingQuotes ? 'Cargando cotizaciones...' : 'Seleccione una cotización'}
                </option>
                {myQuotes.map(quote => (
                  <option key={quote.id} value={quote.id}>
                    {quote.quote_code || `COT-${quote.id}`} - {quote.company_name} - S/ {quote.total?.toLocaleString() || '0.00'}
                  </option>
                ))}
              </Form.Select>
              {myQuotes.length === 0 && !loadingQuotes && (
                <Form.Text className="text-warning">
                  No tienes cotizaciones disponibles. Crea una cotización primero.
                </Form.Text>
              )}
            </Form.Group>

            {/* ✅ NUEVO: Mostrar información de la cotización seleccionada */}
            {uploadForm.quote_id && (
              <div className="mb-3 p-3 bg-light rounded">
                <h6 className="text-primary mb-2">📋 Información de la Cotización</h6>
                {(() => {
                  const selectedQuote = myQuotes.find(q => q.id === parseInt(uploadForm.quote_id));
                  return selectedQuote ? (
                    <div>
                      <p className="mb-1"><strong>Código:</strong> {selectedQuote.quote_code || `COT-${selectedQuote.id}`}</p>
                      <p className="mb-1"><strong>Cliente:</strong> {selectedQuote.company_name}</p>
                      <p className="mb-1"><strong>Total:</strong> S/ {selectedQuote.total?.toLocaleString() || '0.00'}</p>
                      <p className="mb-1"><strong>Categoría:</strong> 
                        <span className={`badge ms-2 ${selectedQuote.category_main === 'laboratorio' ? 'bg-info' : 'bg-warning'}`}>
                          {selectedQuote.category_main === 'laboratorio' ? '🧪 Laboratorio' : '⚙️ Ingeniería'}
                        </span>
                      </p>
                      <p className="mb-0"><strong>Estado:</strong> 
                        <span className={`badge ms-2 ${selectedQuote.status === 'borrador' ? 'bg-secondary' : 'bg-success'}`}>
                          {selectedQuote.status === 'borrador' ? 'Borrador' : 'Aprobada'}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted">Cargando información...</p>
                  );
                })()}
              </div>
            )}
            
            <Form.Group className="mb-3">
              <Form.Label>Monto Pagado *</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={uploadForm.amount_paid}
                onChange={(e) => setUploadForm({ ...uploadForm, amount_paid: e.target.value })}
                placeholder="0.00"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Fecha de Pago *</Form.Label>
              <Form.Control
                type="date"
                value={uploadForm.payment_date}
                onChange={(e) => setUploadForm({ ...uploadForm, payment_date: e.target.value })}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Método de Pago *</Form.Label>
              <Form.Select
                value={uploadForm.payment_method}
                onChange={(e) => setUploadForm({ ...uploadForm, payment_method: e.target.value })}
                required
              >
                <option value="">Seleccione método</option>
                <option value="Transferencia bancaria">Transferencia bancaria</option>
                <option value="Depósito bancario">Depósito bancario</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Cheque">Cheque</option>
                <option value="Tarjeta de crédito">Tarjeta de crédito</option>
                <option value="Otro">Otro</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                placeholder="Descripción adicional del pago..."
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Comprobante de Pago *</Form.Label>
              <Form.Control
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                required
              />
              <Form.Text className="text-muted">
                Formatos permitidos: JPG, PNG, PDF, DOC, DOCX (máximo 10MB)
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpload}
            disabled={uploading || !uploadForm.quote_id || !uploadForm.amount_paid || !uploadForm.payment_date || !uploadForm.payment_method || !uploadForm.payment_proof}
          >
            {uploading ? <Spinner size="sm" className="me-2" /> : <FiUpload className="me-1" />}
            {uploading ? 'Subiendo...' : 'Subir Comprobante'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Aprobación */}
      <Modal show={showApprovalModal} onHide={() => setShowApprovalModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Aprobación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Está seguro de que desea aprobar el comprobante de pago?</p>
          <p><strong>Cotización:</strong> {selectedProof?.quote_number}</p>
          <p><strong>Monto Reportado:</strong> S/ {selectedProof?.amount_paid?.toLocaleString()}</p>
          
          {/* ✅ NUEVO: Campo para monto real pagado */}
          <Form.Group className="mb-3">
            <Form.Label>Monto Real Pagado por el Cliente *</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              value={realAmountPaid}
              onChange={(e) => setRealAmountPaid(e.target.value)}
              placeholder="Ingrese el monto real pagado por el cliente"
              required
            />
            <Form.Text className="text-muted">
              Este monto se usará para alimentar el embudo de ventas y análisis de métricas.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Notas de aprobación:</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="Notas adicionales sobre la aprobación..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApprovalModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="success" 
            onClick={handleApprove}
            disabled={!realAmountPaid || parseFloat(realAmountPaid) <= 0}
          >
            <FiCheck className="me-1" />
            Aprobar y Alimentar Embudo
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Rechazo */}
      <Modal show={showRejectionModal} onHide={() => setShowRejectionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Rechazar Comprobante</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Está seguro de que desea rechazar el comprobante de pago?</p>
          <p><strong>Cotización:</strong> {selectedProof?.quote_number}</p>
          <Form.Group className="mb-3">
            <Form.Label>Motivo del rechazo:</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ingrese el motivo del rechazo..."
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectionModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleReject} disabled={!rejectionReason.trim()}>
            <FiX className="me-1" />
            Rechazar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Descarga */}
      <Modal show={showDownloadModal} onHide={() => setShowDownloadModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FiDownload className="me-2" />
            Descargar Archivos
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProof && (
            <div>
              <div className="mb-4">
                <h6>Información del Comprobante</h6>
                <p><strong>Cotización:</strong> {selectedProof.quote_number}</p>
                <p><strong>Empresa:</strong> {selectedProof.company_name}</p>
                <p><strong>Monto:</strong> ${selectedProof.amount_paid?.toLocaleString()}</p>
                <p><strong>Fecha:</strong> {new Date(selectedProof.created_at).toLocaleDateString()}</p>
              </div>

              <div className="mb-4">
                <h6>Documentos Disponibles</h6>
                
                {/* Sección de Comprobante de Pago */}
                <div className="mb-3">
                  <h6 className="text-primary mb-2">
                    <FiDollarSign className="me-2" />
                    Comprobante de Pago
                  </h6>
                  {selectedProof.file_path ? (
                    <Button 
                      variant="primary" 
                      onClick={() => downloadFile(selectedProof.file_path, selectedProof.file_name || `comprobante-${selectedProof.id}.pdf`, 'payment_proof')}
                      className="d-flex align-items-center justify-content-between w-100"
                    >
                      <span>
                        <FiFileText className="me-2" />
                        Descargar Comprobante de Pago
                      </span>
                      <FiDownload />
                    </Button>
                  ) : (
                    <Alert variant="warning" className="mb-0">
                      <FiFileText className="me-2" />
                      No hay comprobante de pago disponible
                    </Alert>
                  )}
                </div>

                {/* Sección de Cotización */}
                <div className="mb-3">
                  <h6 className="text-success mb-2">
                    <FiFileText className="me-2" />
                    Cotización
                  </h6>
                  <div className="d-grid gap-2">
                    {/* Cotización Original (si existe archivo adjunto) */}
                    {selectedProof.quote_file_path && (
                      <Button 
                        variant="outline-secondary" 
                        onClick={() => downloadFile(selectedProof.quote_file_path, `cotizacion-original-${selectedProof.id}.pdf`, 'quote_file')}
                        className="d-flex align-items-center justify-content-between"
                      >
                        <span>
                          <FiFileText className="me-2" />
                          Cotización Original (Archivo Adjunto)
                        </span>
                        <FiDownload />
                      </Button>
                    )}

                  </div>
                </div>

                {/* Archivos del Proyecto */}
                {selectedProof.project_files && selectedProof.project_files.length > 0 && (
                  <div className="mb-3">
                    <h6 className="text-info mb-2">
                      <FiHome className="me-2" />
                      Archivos del Proyecto
                    </h6>
                    <div className="d-grid gap-1">
                      {selectedProof.project_files.map((file, index) => (
                        <Button 
                          key={index}
                          variant="outline-info" 
                          size="sm"
                          onClick={() => downloadFile(file.path, file.name, 'project_file')}
                          className="d-flex align-items-center justify-content-between"
                        >
                          <span>
                            <FiHome className="me-2" />
                            {file.name}
                          </span>
                          <FiDownload />
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {(!selectedProof.payment_proof_path && !selectedProof.quote_file_path && (!selectedProof.project_files || selectedProof.project_files.length === 0)) && (
                <Alert variant="warning">
                  <FiFileText className="me-2" />
                  No hay archivos adjuntos disponibles para este comprobante.
                </Alert>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDownloadModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ComprobantesPago;

// 