import React, { useState } from 'react';
import { 
  Card, 
  Button, 
  Alert, 
  ProgressBar,
  Badge,
  Row,
  Col
} from 'react-bootstrap';
import { 
  FiTrash2, 
  FiClock, 
  FiAlertTriangle,
  FiCheckCircle,
  FiRefreshCw
} from 'react-icons/fi';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { cleanupOldRecords, getCleanupStats } from '../services/auditActions';

export default function AuditCleanup() {
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanupProgress, setCleanupProgress] = useState(0);
  const queryClient = useQueryClient();

  // Obtener estadísticas de limpieza
  const { data: cleanupStats, isLoading: statsLoading } = useQuery(
    ['cleanup-stats'], 
    getCleanupStats,
    {
      refetchInterval: 30000, // Actualizar cada 30 segundos
      staleTime: 0
    }
  );

  // Mutación para limpiar registros
  const cleanupMutation = useMutation(cleanupOldRecords, {
    onSuccess: () => {
      queryClient.invalidateQueries(['audit']);
      queryClient.invalidateQueries(['audit-stats-global']);
      setIsCleaning(false);
      setCleanupProgress(0);
    },
    onError: (error) => {
      console.error('Error en limpieza:', error);
      setIsCleaning(false);
      setCleanupProgress(0);
    }
  });

  const handleCleanup = async (hours = 24) => {
    setIsCleaning(true);
    setCleanupProgress(0);
    
    // Simular progreso
    const interval = setInterval(() => {
      setCleanupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    
    try {
      await cleanupMutation.mutateAsync(hours);
    } catch (error) {
      console.error('Error en limpieza:', error);
    }
  };

  const stats = cleanupStats?.data || {};

  return (
    <Card className="mb-4">
      <Card.Header>
        <h6 className="mb-0">
          <FiTrash2 className="me-2" />
          Limpieza Automática de Registros
        </h6>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={6}>
            <div className="mb-3">
              <h6>Estado del Sistema</h6>
              {statsLoading ? (
                <div className="text-center">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="d-flex justify-content-between mb-2">
                      <span>Registros antiguos (&gt;24h):</span>
                    <Badge bg="warning">{stats.oldRecords || 0}</Badge>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Registros totales:</span>
                    <Badge bg="info">{stats.totalRecords || 0}</Badge>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Última limpieza:</span>
                    <Badge bg="secondary">
                      {stats.lastCleanup ? new Date(stats.lastCleanup).toLocaleString() : 'Nunca'}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </Col>
          
          <Col md={6}>
            <div className="mb-3">
              <h6>Acciones de Limpieza</h6>
              <div className="d-grid gap-2">
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => handleCleanup(24)}
                  disabled={isCleaning}
                >
                  {isCleaning ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-1" role="status">
                        <span className="visually-hidden">Limpiando...</span>
                      </div>
                      Limpiando...
                    </>
                  ) : (
                    <>
                      <FiTrash2 className="me-1" />
                        Limpiar registros &gt;24h
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline-warning" 
                  size="sm"
                  onClick={() => handleCleanup(168)} // 7 días
                  disabled={isCleaning}
                >
                  <FiClock className="me-1" />
                    Limpiar registros &gt;7 días
                </Button>
                
                <Button 
                  variant="outline-info" 
                  size="sm"
                  onClick={() => handleCleanup(720)} // 30 días
                  disabled={isCleaning}
                >
                  <FiClock className="me-1" />
                    Limpiar registros &gt;30 días
                </Button>
              </div>
            </div>
          </Col>
        </Row>
        
        {isCleaning && (
          <Alert variant="info" className="mt-3">
            <div className="d-flex align-items-center mb-2">
              <FiRefreshCw className="me-2" />
              <strong>Limpiando registros antiguos...</strong>
            </div>
            <ProgressBar now={cleanupProgress} animated />
            <small className="text-muted mt-1">
              {cleanupProgress}% completado
            </small>
          </Alert>
        )}
        
        <Alert variant="warning" className="mt-3">
          <FiAlertTriangle className="me-2" />
          <strong>Nota:</strong> La limpieza automática elimina permanentemente los registros antiguos. 
          Esta acción no se puede deshacer. Se recomienda hacer una copia de seguridad antes de proceder.
        </Alert>
        
        <div className="mt-3">
          <small className="text-muted">
            <FiCheckCircle className="me-1" />
            La limpieza automática se ejecuta cada 24 horas para mantener el sistema optimizado.
          </small>
        </div>
      </Card.Body>
    </Card>
  );
}
