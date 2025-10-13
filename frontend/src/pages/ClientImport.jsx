import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Alert, 
  ProgressBar, 
  Table,
  Badge,
  Modal,
  Form
} from 'react-bootstrap';
import { 
  FiUpload, 
  FiTrash2, 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertTriangle,
  FiFileText,
  FiUsers,
  FiDatabase,
  FiRefreshCw
} from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import { getCurrentUser } from '../utils/authHelper';
import { clientImportService } from '../services/clientImportService';
import './ClientImport.css';

export default function ClientImport() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResults, setImportResults] = useState(null);
  const [showCleanModal, setShowCleanModal] = useState(false);
  const [cleanConfirmText, setCleanConfirmText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const currentUser = getCurrentUser();
  const queryClient = useQueryClient();

  // Verificar si el usuario es administrador
  const isAdmin = currentUser?.role === 'admin';

  // Consulta para estadísticas actuales
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useQuery(
    ['clientImportStats'],
    clientImportService.getStats,
    {
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      staleTime: 30000
    }
  );

  // Mutación para limpiar datos
  const cleanMutation = useMutation(clientImportService.cleanData, {
    onSuccess: (data) => {
      console.log('✅ Datos limpiados exitosamente:', data);
      setShowCleanModal(false);
      setCleanConfirmText('');
      refetchStats();
      queryClient.invalidateQueries('clients');
      queryClient.invalidateQueries('clientStats');
    },
    onError: (error) => {
      console.error('❌ Error limpiando datos:', error);
    }
  });

  // Mutación para importar clientes
  const importMutation = useMutation(clientImportService.importClients, {
    onSuccess: (data) => {
      console.log('✅ Importación completada:', data);
      setImportResults(data.data);
      setSelectedFile(null);
      setUploadProgress(0);
      refetchStats();
      queryClient.invalidateQueries('clients');
      queryClient.invalidateQueries('clientStats');
    },
    onError: (error) => {
      console.error('❌ Error en importación:', error);
      setUploadProgress(0);
    }
  });

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.name.toLowerCase().endsWith('.csv')) {
        alert('Por favor selecciona un archivo CSV válido');
        return;
      }
      
      // Validar tamaño (10MB máximo)
      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 10MB');
        return;
      }
      
      setSelectedFile(file);
      setImportResults(null);
    }
  };

  const handleCleanData = () => {
    if (cleanConfirmText === 'CONFIRMAR') {
      setIsProcessing(true);
      cleanMutation.mutate();
    } else {
      alert('Por favor escribe "CONFIRMAR" para proceder con la limpieza');
    }
  };

  const handleImport = () => {
    if (!selectedFile) {
      alert('Por favor selecciona un archivo CSV');
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);
    
    // Simular progreso de carga
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    const formData = new FormData();
    formData.append('file', selectedFile);

    importMutation.mutate(formData, {
      onSettled: () => {
        clearInterval(progressInterval);
        setUploadProgress(100);
        setIsProcessing(false);
        setTimeout(() => setUploadProgress(0), 2000);
      }
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'prospeccion': { bg: 'secondary', text: 'Prospección' },
      'interesado': { bg: 'info', text: 'Interesado' },
      'pendiente_cotizacion': { bg: 'warning', text: 'Pendiente Cotización' },
      'cotizacion_enviada': { bg: 'primary', text: 'Cotización Enviada' },
      'negociacion': { bg: 'warning', text: 'Negociación' },
      'ganado': { bg: 'success', text: 'Ganado' },
      'perdido': { bg: 'danger', text: 'Perdido' }
    };
    
    const config = statusConfig[status] || { bg: 'secondary', text: status };
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const getTypeBadge = (type) => {
    return (
      <Badge bg={type === 'empresa' ? 'primary' : 'info'}>
        {type === 'empresa' ? 'Empresa' : 'Persona'}
      </Badge>
    );
  };

  if (!isAdmin) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <FiAlertTriangle className="me-2" />
          <strong>Acceso Denegado</strong>
          <br />
          Solo los administradores pueden acceder al módulo de importación de clientes.
        </Alert>
      </Container>
    );
  }

  return (
    <div className="client-import-page">
      <Container fluid>
        <PageHeader
          title="Importación de Clientes"
          subtitle="Importar datos de clientes desde archivo CSV de seguimiento"
          icon={FiDatabase}
        />

        {/* Estadísticas actuales */}
        <Row className="mb-4">
          <Col md={12}>
            <Card className="shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h6 className="mb-0">
                  <FiUsers className="me-2" />
                  Estadísticas Actuales
                </h6>
              </Card.Header>
              <Card.Body>
                {statsLoading ? (
                  <div className="text-center py-3">
                    <FiRefreshCw className="spinning" />
                    <span className="ms-2">Cargando estadísticas...</span>
                  </div>
                ) : statsData ? (
                  <Row>
                    <Col md={3}>
                      <div className="text-center">
                        <h4 className="text-primary mb-1">{statsData.data?.total || 0}</h4>
                        <small className="text-muted">Total Clientes</small>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="text-center">
                        <h4 className="text-success mb-1">{statsData.data?.empresas || 0}</h4>
                        <small className="text-muted">Empresas</small>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="text-center">
                        <h4 className="text-info mb-1">{statsData.data?.personas || 0}</h4>
                        <small className="text-muted">Personas</small>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="text-center">
                        <h4 className="text-warning mb-1">{statsData.data?.conEmail || 0}</h4>
                        <small className="text-muted">Con Email</small>
                      </div>
                    </Col>
                  </Row>
                ) : (
                  <Alert variant="warning">No se pudieron cargar las estadísticas</Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Panel de limpieza */}
        <Row className="mb-4">
          <Col md={12}>
            <Card className="shadow-sm border-warning">
              <Card.Header className="bg-warning text-dark">
                <h6 className="mb-0">
                  <FiTrash2 className="me-2" />
                  Limpieza de Datos Existentes
                </h6>
              </Card.Header>
              <Card.Body>
                <Alert variant="warning" className="mb-3">
                  <FiAlertTriangle className="me-2" />
                  <strong>Advertencia:</strong> Esta acción eliminará TODOS los datos existentes 
                  (usuarios, proyectos, clientes) excepto los usuarios administradores. 
                  Esta acción no se puede deshacer.
                </Alert>
                <Button 
                  variant="outline-warning" 
                  onClick={() => setShowCleanModal(true)}
                  disabled={cleanMutation.isLoading || isProcessing}
                >
                  {cleanMutation.isLoading ? (
                    <>
                      <FiRefreshCw className="spinning me-2" />
                      Limpiando...
                    </>
                  ) : (
                    <>
                      <FiTrash2 className="me-2" />
                      Limpiar Datos Existentes
                    </>
                  )}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Panel de importación */}
        <Row className="mb-4">
          <Col md={12}>
            <Card className="shadow-sm">
              <Card.Header className="bg-success text-white">
                <h6 className="mb-0">
                  <FiUpload className="me-2" />
                  Importar Clientes desde CSV
                </h6>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Seleccionar archivo CSV</Form.Label>
                  <Form.Control
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    disabled={isProcessing}
                  />
                  <Form.Text className="text-muted">
                    Archivo CSV con formato de seguimiento de clientes (máximo 10MB)
                  </Form.Text>
                </Form.Group>

                {selectedFile && (
                  <Alert variant="info" className="mb-3">
                    <FiFileText className="me-2" />
                    <strong>Archivo seleccionado:</strong> {selectedFile.name} 
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </Alert>
                )}

                {uploadProgress > 0 && (
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <small>Procesando archivo...</small>
                      <small>{uploadProgress}%</small>
                    </div>
                    <ProgressBar now={uploadProgress} animated />
                  </div>
                )}

                <Button 
                  variant="success" 
                  onClick={handleImport}
                  disabled={!selectedFile || isProcessing || importMutation.isLoading}
                  className="me-2"
                >
                  {importMutation.isLoading ? (
                    <>
                      <FiRefreshCw className="spinning me-2" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <FiUpload className="me-2" />
                      Importar Clientes
                    </>
                  )}
                </Button>

                <Button 
                  variant="outline-secondary" 
                  onClick={() => {
                    setSelectedFile(null);
                    setImportResults(null);
                    setUploadProgress(0);
                  }}
                  disabled={isProcessing}
                >
                  Limpiar
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Resultados de importación */}
        {importResults && (
          <Row className="mb-4">
            <Col md={12}>
              <Card className="shadow-sm">
                <Card.Header className="bg-info text-white">
                  <h6 className="mb-0">
                    <FiCheckCircle className="me-2" />
                    Resultados de Importación
                  </h6>
                </Card.Header>
                <Card.Body>
                  <Row className="mb-3">
                    <Col md={3}>
                      <div className="text-center">
                        <h4 className="text-success mb-1">{importResults.successful}</h4>
                        <small className="text-muted">Importados</small>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="text-center">
                        <h4 className="text-danger mb-1">{importResults.failed}</h4>
                        <small className="text-muted">Fallaron</small>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="text-center">
                        <h4 className="text-primary mb-1">{importResults.totalProcessed}</h4>
                        <small className="text-muted">Procesados</small>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="text-center">
                        <h4 className="text-warning mb-1">{importResults.errors?.length || 0}</h4>
                        <small className="text-muted">Errores</small>
                      </div>
                    </Col>
                  </Row>

                  {importResults.errors && importResults.errors.length > 0 && (
                    <Alert variant="warning" className="mb-3">
                      <h6>Errores encontrados:</h6>
                      <ul className="mb-0">
                        {importResults.errors.slice(0, 5).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                        {importResults.errors.length > 5 && (
                          <li>... y {importResults.errors.length - 5} errores más</li>
                        )}
                      </ul>
                    </Alert>
                  )}

                  {importResults.importedClients && importResults.importedClients.length > 0 && (
                    <div>
                      <h6>Clientes importados:</h6>
                      <Table striped bordered hover size="sm">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Tipo</th>
                            <th>Estado</th>
                            <th>Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importResults.importedClients.slice(0, 10).map((client, index) => (
                            <tr key={index}>
                              <td>{client.id}</td>
                              <td>{client.name}</td>
                              <td>{getTypeBadge(client.type)}</td>
                              <td>{getStatusBadge(client.status)}</td>
                              <td>
                                <Badge bg={client.action === 'created' ? 'success' : 'info'}>
                                  {client.action === 'created' ? 'Creado' : 'Actualizado'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                      {importResults.importedClients.length > 10 && (
                        <small className="text-muted">
                          Mostrando los primeros 10 de {importResults.importedClients.length} clientes
                        </small>
                      )}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Modal de confirmación para limpieza */}
        <Modal show={showCleanModal} onHide={() => setShowCleanModal(false)} centered>
          <Modal.Header closeButton className="bg-warning text-dark">
            <Modal.Title>
              <FiAlertTriangle className="me-2" />
              Confirmar Limpieza de Datos
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert variant="danger">
              <strong>¡ADVERTENCIA!</strong>
              <br />
              Esta acción eliminará PERMANENTEMENTE:
              <ul className="mt-2 mb-0">
                <li>Todos los clientes/empresas</li>
                <li>Todos los proyectos</li>
                <li>Todas las cotizaciones</li>
                <li>Todos los usuarios (excepto administradores)</li>
              </ul>
            </Alert>
            <p>Esta acción NO se puede deshacer.</p>
            <Form.Group>
              <Form.Label>
                Para confirmar, escribe <strong>CONFIRMAR</strong> en el campo de abajo:
              </Form.Label>
              <Form.Control
                type="text"
                value={cleanConfirmText}
                onChange={(e) => setCleanConfirmText(e.target.value)}
                placeholder="Escribe CONFIRMAR aquí"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCleanModal(false)}>
              Cancelar
            </Button>
            <Button 
              variant="danger" 
              onClick={handleCleanData}
              disabled={cleanConfirmText !== 'CONFIRMAR' || cleanMutation.isLoading}
            >
              {cleanMutation.isLoading ? (
                <>
                  <FiRefreshCw className="spinning me-2" />
                  Limpiando...
                </>
              ) : (
                <>
                  <FiTrash2 className="me-2" />
                  Limpiar Datos
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}
