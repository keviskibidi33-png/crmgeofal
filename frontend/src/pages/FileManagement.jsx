import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ProgressBar, Alert, Table, Badge, Tabs, Tab, Spinner } from 'react-bootstrap';
import { FiHardDrive, FiFolder, FiFile, FiAlertTriangle, FiCheckCircle, FiRefreshCw, FiArchive, FiUsers, FiCalendar, FiActivity, FiDownload, FiEye } from 'react-icons/fi';
import apiFetch from '../services/api';

const FileManagement = () => {
  const [storageStats, setStorageStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [monitoringActive, setMonitoringActive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');

  // Cargar estadísticas de almacenamiento
  const loadStorageStats = async () => {
    try {
      setLoading(true);
      const stats = await apiFetch('/api/attachments/storage/stats');
      setStorageStats(stats);
      setError(null);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
      setError('Error al cargar estadísticas de almacenamiento');
    } finally {
      setLoading(false);
    }
  };

  // Monitoreo automático
  useEffect(() => {
    let interval;
    if (monitoringActive) {
      interval = setInterval(() => {
        loadStorageStats();
      }, 30000); // Actualizar cada 30 segundos
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [monitoringActive]);

  // Crear carpetas anticipatorias
  const createAnticipatoryFolders = async () => {
    try {
      setActionLoading(true);
      const result = await apiFetch('/api/attachments/storage/create-folders', {
        method: 'POST'
      });
      await loadStorageStats();
      
      // Mostrar información detallada
      let message = `✅ ${result.message}`;
      if (result.createdFolders && result.createdFolders.length > 0) {
        message += `\n\n📁 Carpetas creadas:`;
        result.createdFolders.forEach(folder => {
          message += `\n• ${folder.path} (${folder.type})`;
        });
      }
      if (result.existingFolders && result.existingFolders.length > 0) {
        message += `\n\n✅ Carpetas existentes: ${result.existingFolders.length}`;
      }
      if (result.daysUntilMonthEnd !== undefined) {
        message += `\n\n📅 Días hasta fin de mes: ${result.daysUntilMonthEnd}`;
      }
      
      alert(message);
    } catch (err) {
      console.error('Error creando carpetas:', err);
      alert('❌ Error al crear carpetas anticipatorias');
    } finally {
      setActionLoading(false);
    }
  };

  // Comprimir carpetas antiguas
  const compressOldFolders = async () => {
    try {
      setActionLoading(true);
      await apiFetch('/api/attachments/storage/compress', {
        method: 'POST'
      });
      await loadStorageStats();
      alert('✅ Compresión de carpetas antiguas completada');
    } catch (err) {
      console.error('Error comprimiendo carpetas:', err);
      alert('❌ Error al comprimir carpetas');
    } finally {
      setActionLoading(false);
    }
  };

  // Obtener estadísticas por cliente
  const getClientStats = () => {
    if (!storageStats?.folders) return [];
    
    const clientStats = {};
    storageStats.folders.forEach(folder => {
      // Extraer información del cliente desde la ruta del proyecto
      const projectMatches = folder.path.match(/project_(\d+)/g);
      if (projectMatches) {
        projectMatches.forEach(match => {
          const projectId = match.replace('project_', '');
          if (!clientStats[projectId]) {
            clientStats[projectId] = {
              projectId,
              totalSize: 0,
              fileCount: 0,
              folders: []
            };
          }
          clientStats[projectId].totalSize += folder.size;
          clientStats[projectId].fileCount += folder.fileCount;
          clientStats[projectId].folders.push(folder);
        });
      }
    });
    
    return Object.values(clientStats).sort((a, b) => b.totalSize - a.totalSize);
  };

  // Obtener archivos comprimidos
  const getCompressedFiles = () => {
    if (!storageStats?.folders) return [];
    return storageStats.folders.filter(folder => 
      folder.path.includes('.zip') || folder.path.includes('.rar')
    );
  };

  useEffect(() => {
    loadStorageStats();
  }, []);

  // Formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Obtener color de alerta
  const getAlertColor = (level) => {
    switch (level) {
      case 'red': return 'danger';
      case 'orange': return 'warning';
      case 'yellow': return 'info';
      default: return 'success';
    }
  };

  // Obtener icono de alerta
  const getAlertIcon = (level) => {
    switch (level) {
      case 'red': return <FiAlertTriangle className="text-danger" />;
      case 'orange': return <FiAlertTriangle className="text-warning" />;
      case 'yellow': return <FiAlertTriangle className="text-info" />;
      default: return <FiCheckCircle className="text-success" />;
    }
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando estadísticas de almacenamiento...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <FiAlertTriangle className="me-2" />
          {error}
          <Button variant="outline-danger" size="sm" className="ms-2" onClick={loadStorageStats}>
            <FiRefreshCw className="me-1" />
            Reintentar
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <FiHardDrive className="me-2" />
                Gestión de Archivos
              </h2>
              <p className="text-muted">Sistema inteligente de organización y monitoreo de almacenamiento</p>
            </div>
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center">
                <FiActivity className={`me-2 ${monitoringActive ? 'text-success' : 'text-muted'}`} />
                <span className={monitoringActive ? 'text-success' : 'text-muted'}>
                  Monitoreo {monitoringActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <Button 
                variant={monitoringActive ? 'outline-danger' : 'outline-success'}
                size="sm"
                onClick={() => setMonitoringActive(!monitoringActive)}
              >
                {monitoringActive ? 'Pausar' : 'Activar'} Monitoreo
              </Button>
              <small className="text-muted">
                Última actualización: {lastUpdate.toLocaleTimeString()}
              </small>
            </div>
          </div>
        </Col>
      </Row>

      {/* Sistema de Tabs */}
      <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
        <Tab eventKey="overview" title={
          <span><FiHardDrive className="me-1" />Resumen</span>
        }>
          <Row className="mb-4">
            <Col md={8}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">
                    <FiHardDrive className="me-2" />
                    Estado del Almacenamiento
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Uso de almacenamiento</span>
                      <span className="fw-bold">
                        {formatFileSize(storageStats.totalSize)} / {formatFileSize(storageStats.maxSize)}
                        <Badge bg={getAlertColor(storageStats.alertLevel)} className="ms-2">
                          {storageStats.usagePercentage}%
                        </Badge>
                      </span>
                    </div>
                    <ProgressBar 
                      now={storageStats.usagePercentage} 
                      variant={getAlertColor(storageStats.alertLevel)}
                      style={{ height: '20px' }}
                    />
                  </div>
                  
                  <Row>
                    <Col md={6}>
                      <div className="text-center p-3 border rounded">
                        <FiFile className="h3 text-primary mb-2" />
                        <h6>Espacio Libre</h6>
                        <h4 className="text-success">{formatFileSize(storageStats.freeSpace)}</h4>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="text-center p-3 border rounded">
                        {getAlertIcon(storageStats.alertLevel)}
                        <h6>Estado</h6>
                        <h4 className={`text-${getAlertColor(storageStats.alertLevel)}`}>
                          {storageStats.alertLevel.toUpperCase()}
                        </h4>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Acciones</h5>
                </Card.Header>
                <Card.Body>
                  <div className="d-grid gap-2">
                    <Button 
                      variant="primary" 
                      onClick={loadStorageStats}
                      disabled={actionLoading}
                    >
                      <FiRefreshCw className="me-2" />
                      Actualizar Estadísticas
                    </Button>
                    
                    <Button 
                      variant="success" 
                      onClick={createAnticipatoryFolders}
                      disabled={actionLoading}
                    >
                      <FiFolder className="me-2" />
                      Crear Carpetas Anticipatorias
                    </Button>
                    
                    <Button 
                      variant="warning" 
                      onClick={compressOldFolders}
                      disabled={actionLoading}
                    >
                      <FiArchive className="me-2" />
                      Comprimir Carpetas Antiguas
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Alertas del sistema */}
          {storageStats.alertLevel !== 'green' && (
            <Row className="mb-4">
              <Col>
                <Alert variant={getAlertColor(storageStats.alertLevel)}>
                  <div className="d-flex align-items-center">
                    {getAlertIcon(storageStats.alertLevel)}
                    <div className="ms-2">
                      <strong>Alerta de Almacenamiento</strong>
                      <p className="mb-0">
                        {storageStats.alertLevel === 'red' && '⚠️ CRÍTICO: Almacenamiento al 95% o más. Se requiere acción inmediata.'}
                        {storageStats.alertLevel === 'orange' && '⚠️ ADVERTENCIA: Almacenamiento al 85% o más. Considere comprimir archivos antiguos.'}
                        {storageStats.alertLevel === 'yellow' && 'ℹ️ INFORMACIÓN: Almacenamiento al 70% o más. Monitoree el uso.'}
                      </p>
                    </div>
                  </div>
                </Alert>
              </Col>
            </Row>
          )}
        </Tab>

        <Tab eventKey="by-month" title={
          <span><FiCalendar className="me-1" />Por Mes</span>
        }>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FiCalendar className="me-2" />
                Carpetas por Mes
              </h5>
            </Card.Header>
            <Card.Body>
              <Table responsive striped>
                <thead>
                  <tr>
                    <th>Año</th>
                    <th>Mes</th>
                    <th>Tamaño</th>
                    <th>Archivos</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {storageStats.folders.map((folder, index) => (
                    <tr key={index}>
                      <td>{folder.year}</td>
                      <td>{folder.month}</td>
                      <td>{formatFileSize(folder.size)}</td>
                      <td>{folder.fileCount}</td>
                      <td>
                        <Badge bg={folder.size > 100 * 1024 * 1024 ? 'warning' : 'success'}>
                          {folder.size > 100 * 1024 * 1024 ? 'Grande' : 'Normal'}
                        </Badge>
                      </td>
                      <td>
                        <Button variant="outline-primary" size="sm">
                          <FiEye className="me-1" />
                          Ver
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="by-client" title={
          <span><FiUsers className="me-1" />Por Cliente</span>
        }>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FiUsers className="me-2" />
                Archivos por Cliente/Proyecto
              </h5>
            </Card.Header>
            <Card.Body>
              <Table responsive striped>
                <thead>
                  <tr>
                    <th>Proyecto ID</th>
                    <th>Tamaño Total</th>
                    <th>Archivos</th>
                    <th>Carpetas</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {getClientStats().map((client, index) => (
                    <tr key={index}>
                      <td>Proyecto #{client.projectId}</td>
                      <td>{formatFileSize(client.totalSize)}</td>
                      <td>{client.fileCount}</td>
                      <td>{client.folders.length}</td>
                      <td>
                        <Badge bg={client.totalSize > 50 * 1024 * 1024 ? 'warning' : 'success'}>
                          {client.totalSize > 50 * 1024 * 1024 ? 'Grande' : 'Normal'}
                        </Badge>
                      </td>
                      <td>
                        <Button variant="outline-primary" size="sm">
                          <FiEye className="me-1" />
                          Ver Detalles
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="compressed" title={
          <span><FiArchive className="me-1" />Comprimidos</span>
        }>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FiArchive className="me-2" />
                Archivos Comprimidos
              </h5>
            </Card.Header>
            <Card.Body>
              {getCompressedFiles().length > 0 ? (
                <Table responsive striped>
                  <thead>
                    <tr>
                      <th>Archivo</th>
                      <th>Tamaño</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getCompressedFiles().map((file, index) => (
                      <tr key={index}>
                        <td>{file.path.split('/').pop()}</td>
                        <td>{formatFileSize(file.size)}</td>
                        <td>{new Date().toLocaleDateString()}</td>
                        <td>
                          <Badge bg="success">Comprimido</Badge>
                        </td>
                        <td>
                          <Button variant="outline-success" size="sm">
                            <FiDownload className="me-1" />
                            Descargar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <FiArchive className="h1 text-muted mb-3" />
                  <h5>No hay archivos comprimidos</h5>
                  <p className="text-muted">Los archivos se comprimen automáticamente cuando el almacenamiento supera el 90%</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default FileManagement;
