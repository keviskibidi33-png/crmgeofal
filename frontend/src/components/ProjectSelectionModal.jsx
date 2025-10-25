import React, { useState, useEffect } from 'react';
import { Modal, Button, ListGroup, Badge, Alert, Spinner } from 'react-bootstrap';
import { FiFolder, FiPlus, FiCalendar, FiUser, FiMapPin, FiEdit3 } from 'react-icons/fi';
import { searchProjectsByName } from '../services/projects';

const ProjectSelectionModal = ({ 
  show, 
  onHide, 
  projectName, 
  companyId, 
  onSelectExisting, 
  onCreateNew 
}) => {
  const [existingProjects, setExistingProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (show && projectName && projectName.trim().length >= 2) {
      searchExistingProjects();
    }
  }, [show, projectName, companyId]);

  const searchExistingProjects = async () => {
    try {
      console.log('🔍 ProjectSelectionModal - Iniciando búsqueda:', { projectName, companyId });
      setLoading(true);
      setError(null);
      const projects = await searchProjectsByName(projectName, companyId);
      console.log('✅ ProjectSelectionModal - Proyectos encontrados:', projects);
      setExistingProjects(projects || []);
    } catch (err) {
      console.error('❌ ProjectSelectionModal - Error searching projects:', err);
      setError('Error al buscar proyectos existentes');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExisting = (project) => {
    onSelectExisting(project);
    onHide();
  };

  const handleCreateNew = () => {
    onCreateNew();
    onHide();
  };

  const handleCreateDifferentiated = () => {
    // Calcular el siguiente número para diferenciación
    const nextNumber = existingProjects.length + 1;
    const differentiatedName = `${projectName} (${nextNumber})`;
    
    // Llamar a la función con el nombre diferenciado
    onCreateNew(differentiatedName);
    onHide();
  };

  const handleEditProject = (project) => {
    // Permitir editar el nombre del proyecto para unificación
    const newName = prompt(`Editar nombre del proyecto "${project.name}":`, project.name);
    if (newName && newName.trim() !== project.name) {
      // Aquí podrías implementar la lógica para actualizar el proyecto
      console.log('Editar proyecto:', project.id, 'nuevo nombre:', newName);
      alert(`Funcionalidad de edición en desarrollo. Proyecto: ${project.name} → ${newName}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-PE');
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered style={{ zIndex: 9999 }}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FiFolder className="me-2" />
          Proyectos Existentes: "{projectName}"
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {loading && (
          <div className="text-center py-4">
            <Spinner animation="border" />
            <p className="mt-2">Buscando proyectos existentes...</p>
          </div>
        )}

        {error && (
          <Alert variant="danger">
            {error}
          </Alert>
        )}

        {!loading && !error && existingProjects.length > 0 && (
          <>
            <Alert variant="warning" className="mb-3">
              <div>
                <strong>⚠️ Se encontraron {existingProjects.length} proyecto(s) con el nombre "{projectName}" en esta empresa.</strong>
                <br />
                Para evitar confusiones, el sistema sugiere diferenciarlos automáticamente.
              </div>
            </Alert>
            
            <Alert variant="info" className="mb-3">
              <div>
                <strong>💡 Opciones disponibles:</strong>
                <ul className="mb-0 mt-2">
                  <li><strong>Continuar con proyecto existente:</strong> Usar uno de los proyectos listados</li>
                  <li><strong>Crear nuevo diferenciado:</strong> El sistema agregará automáticamente "(2)", "(3)", etc.</li>
                  <li><strong>Editar manualmente:</strong> Puedes cambiar el nombre después de crear el proyecto</li>
                </ul>
              </div>
            </Alert>

            <ListGroup>
              {existingProjects.map((project) => (
                <ListGroup.Item 
                  key={project.id}
                  className="d-flex justify-content-between align-items-start"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSelectExisting(project)}
                >
                  <div className="ms-2 me-auto">
                    <div className="fw-bold">
                      <FiFolder className="me-1" />
                      {project.name}
                    </div>
                    <div className="text-muted small">
                      <strong>Empresa:</strong> {project.company_name} (RUC: {project.company_ruc})
                    </div>
                    <div className="text-muted small">
                      <FiMapPin className="me-1" />
                      {project.location || 'Sin ubicación'}
                    </div>
                    <div className="text-muted small">
                      <FiUser className="me-1" />
                      Vendedor: {project.vendedor_name || 'No asignado'}
                    </div>
                    <div className="text-muted small">
                      <FiCalendar className="me-1" />
                      Creado: {formatDate(project.created_at)}
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="mb-2">
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProject(project);
                        }}
                        title="Editar nombre para unificar proyectos"
                      >
                        <FiEdit3 className="me-1" />
                        Editar
                      </Button>
                    </div>
                    <div>
                      <Badge bg="secondary" className="me-2">
                        {project.quotes_count} cotización(es)
                      </Badge>
                      <Badge bg={project.status === 'activo' ? 'success' : 'warning'}>
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </>
        )}

        {!loading && !error && existingProjects.length === 0 && (
          <Alert variant="success">
            <strong>No se encontraron proyectos con ese nombre.</strong>
            <br />
            Puedes crear un nuevo proyecto sin problemas.
          </Alert>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="warning" onClick={handleCreateDifferentiated}>
          <FiPlus className="me-1" />
          Crear "{projectName} ({existingProjects.length + 1})"
        </Button>
        <Button variant="primary" onClick={handleCreateNew}>
          <FiPlus className="me-1" />
          Crear Nuevo (Nombre Original)
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProjectSelectionModal;
