import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { listCompanies } from '../services/companies';
import { createProject, listProjects, updateProject } from '../services/projects';

// Lightweight picker: select existing company and define minimal project data
export default function CompanyProjectPicker({ value, onChange }) {
  const [companies, setCompanies] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ company_id: '', project_id: '', project_name: '', location: '' });
  const [error, setError] = useState('');
  
  // Estados para el modal de proyectos
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Efecto para controlar el scroll del body cuando el modal está abierto
  useEffect(() => {
    if (showProjectModal) {
      // Prevenir scroll del body
      document.body.style.overflow = 'hidden';
      
      // Agregar listener para tecla Escape
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          closeProjectModal();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    } else {
      // Restaurar scroll del body
      document.body.style.overflow = 'unset';
    }

    // Cleanup al desmontar el componente
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showProjectModal]);
  const [projectForm, setProjectForm] = useState({
    name: '',
    location: '',
    sector: '',
    status: 'activo',
    description: '',
    start_date: '',
    end_date: '',
    priority: 'media'
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // Solo cargar empresas inicialmente
        const companiesRes = await listCompanies({ page: 1, limit: 50 });
        const companiesData = Array.isArray(companiesRes?.data) ? companiesRes.data : companiesRes;
        setCompanies(companiesData || []);
      } catch (e) {
        setError('No se pudo cargar empresas');
      } finally { setLoading(false); }
    })();
  }, []);

  // Cargar proyectos cuando se selecciona un cliente (con debounce)
  useEffect(() => {
    if (!form.company_id) {
      setProjects([]);
      return;
    }

    // Debounce para evitar llamadas excesivas
    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        setError('');
        console.log('🔍 Cargando proyectos para company_id:', form.company_id);
        
        const projectsRes = await listProjects({ 
          page: 1, 
          limit: 50,
          company_id: form.company_id
        });
        
        const projectsData = Array.isArray(projectsRes?.data) ? projectsRes.data : projectsRes;
        setProjects(projectsData || []);
        console.log('✅ Proyectos cargados:', projectsData?.length || 0);
      } catch (e) {
        console.error('❌ Error cargando proyectos:', e);
        setError('No se pudo cargar proyectos del cliente');
        setProjects([]);
      } finally { 
        setLoading(false); 
      }
    }, 300); // 300ms de debounce

    return () => clearTimeout(timeoutId);
  }, [form.company_id]);

  const selectedCompany = useMemo(() => companies.find(c => String(c.id) === String(form.company_id)), [companies, form.company_id]);
  const selectedProject = useMemo(() => projects.find(p => String(p.id) === String(form.project_id)), [projects, form.project_id]);
  
  // Filtrar proyectos por empresa seleccionada
  const filteredProjects = useMemo(() => {
    if (!form.company_id) return [];
    return projects.filter(p => String(p.company_id) === String(form.company_id));
  }, [projects, form.company_id]);

  useEffect(() => {
    if (typeof onChange === 'function') {
      const newValue = {
        company_id: form.company_id ? Number(form.company_id) : null,
        company: selectedCompany || null,
        project_id: form.project_id ? Number(form.project_id) : null,
        project: selectedProject || null,
        project_name: form.project_name,
        location: form.location,
      };
      
      // Solo llamar onChange si los valores realmente cambiaron
      const currentValue = JSON.stringify(value);
      const newValueStr = JSON.stringify(newValue);
      
      if (currentValue !== newValueStr) {
        console.log('🔄 CompanyProjectPicker - onChange:', newValue);
        onChange(newValue);
      }
    }
  }, [form.company_id, form.project_id, form.project_name, form.location, selectedCompany, selectedProject, onChange, value]);

  const createQuickProject = async () => {
    if (!form.company_id || !form.project_name || !form.location) return;
    try {
      setLoading(true);
      const payload = { 
        company_id: Number(form.company_id), 
        name: form.project_name, 
        location: form.location 
      };
      const prj = await createProject(payload);
      
      // Actualizar la lista de proyectos localmente
      setProjects(prev => [...prev, prj]);
      
      // bubble up created project id
      if (typeof onChange === 'function') {
        onChange({ 
          ...value, 
          project_id: prj.id, 
          project: prj,
          project_name: prj.name,
          location: prj.location
        });
      }
      
      // Limpiar el formulario
      setForm(prev => ({ ...prev, project_id: prj.id, project_name: '', location: '' }));
      setError('');
    } catch (e) {
      setError(e.message || 'No se pudo crear proyecto');
    } finally {
      setLoading(false);
    }
  };

  // Funciones para el modal de proyectos
  const openProjectModal = (project = null) => {
    console.log('🔍 openProjectModal llamado con:', project);
    console.log('🔍 showProjectModal actual:', showProjectModal);
    console.log('🔍 modalLoading actual:', modalLoading);
    
    // Si el modal está cargando, no hacer nada
    if (modalLoading) {
      console.log('⚠️ Modal está cargando, esperando...');
      return;
    }

    // Si el modal ya está abierto, permitir cambio de modo
    if (showProjectModal) {
      console.log('🔄 Modal ya abierto, cambiando modo...');
    } else {
      console.log('🔍 Abriendo modal para proyecto:', project?.name || 'nuevo');
      setShowProjectModal(true);
    }
    
    if (project) {
      console.log('🔍 Configurando modo edición para:', project.name);
      setEditingProject(project);
      setProjectForm({
        name: project.name || '',
        location: project.location || '',
        sector: project.sector || '',
        status: project.status || 'activo',
        description: project.description || '',
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        priority: project.priority || 'media'
      });
    } else {
      console.log('🔍 Configurando modo creación');
      setEditingProject(null);
      setProjectForm({
        name: '',
        location: '',
        sector: '',
        status: 'activo',
        description: '',
        start_date: '',
        end_date: '',
        priority: 'media'
      });
    }
    console.log('✅ Modal configurado correctamente');
  };

  const closeProjectModal = () => {
    console.log('🔍 Cerrando modal de proyectos');
    setShowProjectModal(false);
    setEditingProject(null);
    setModalLoading(false);
    setProjectForm({
      name: '',
      location: '',
      sector: '',
      status: 'activo',
      description: '',
      start_date: '',
      end_date: '',
      priority: 'media'
    });
  };

  const saveProject = async () => {
    if (!form.company_id || !projectForm.name || !projectForm.location) {
      setError('Nombre y ubicación son requeridos');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        company_id: Number(form.company_id),
        ...projectForm
      };

      let savedProject;
      if (editingProject) {
        savedProject = await updateProject(editingProject.id, payload);
        // Actualizar en la lista local
        setProjects(prev => prev.map(p => p.id === editingProject.id ? savedProject : p));
      } else {
        savedProject = await createProject(payload);
        // Agregar a la lista local
        setProjects(prev => [...prev, savedProject]);
      }

      // Seleccionar el proyecto guardado
      setForm(prev => ({ ...prev, project_id: savedProject.id }));
      
      // Notificar al componente padre
      if (typeof onChange === 'function') {
        onChange({ 
          ...value, 
          project_id: savedProject.id, 
          project: savedProject,
          project_name: savedProject.name,
          location: savedProject.location
        });
      }

      closeProjectModal();
      setError('');
    } catch (e) {
      setError(e.message || 'No se pudo guardar el proyecto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded p-3">
      <h6>Cliente y Proyecto</h6>
      {error && <div className="alert alert-warning py-1 my-2">{error}</div>}
      <div className="row g-2 align-items-end">
        <div className="col-md-4">
          <label className="form-label">Cliente</label>
          <select className="form-select" value={form.company_id} disabled={loading}
                  onChange={(e)=>setForm({ ...form, company_id: e.target.value, project_id: '' })}>
            <option value="">Seleccione...</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name} {c.ruc ? `(RUC ${c.ruc})` : ''}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Proyecto</label>
          <div className="d-flex gap-2">
            <input 
              className="form-control" 
              value={selectedProject ? `${selectedProject.name} | ${selectedProject.location}` : 'Seleccionar proyecto...'}
              readOnly
              style={{ backgroundColor: '#f8f9fa', cursor: 'pointer' }}
              onClick={() => form.company_id && openProjectModal()}
            />
            <button 
              type="button" 
              className="btn btn-outline-primary"
              onClick={() => form.company_id && openProjectModal()}
              disabled={!form.company_id || loading}
              title="Gestionar proyectos"
            >
              📋
            </button>
          </div>
          {selectedProject && (
            <div className="small text-muted mt-1">
              Sector: {selectedProject.sector || 'Sin sector'} | Estado: {selectedProject.status || 'Sin estado'}
            </div>
          )}
        </div>
        {form.project_id === 'new' && (
          <>
            <div className="col-md-3">
              <label className="form-label">Nombre del proyecto</label>
              <input className="form-control" value={form.project_name}
                     onChange={e=>setForm({ ...form, project_name: e.target.value })}
                     placeholder="Ej. Control de calidad de mezclas" />
            </div>
            <div className="col-md-3">
              <label className="form-label">Ubicación</label>
              <input className="form-control" value={form.location}
                     onChange={e=>setForm({ ...form, location: e.target.value })}
                     placeholder="Ej. Lima, Perú" />
            </div>
            <div className="col-md-2 d-grid">
              <button type="button" className="btn btn-outline-secondary" onClick={createQuickProject}
                      disabled={!form.company_id || !form.project_name || !form.location}>Crear</button>
            </div>
          </>
        )}
        {form.project_id && form.project_id !== 'new' && (
          <div className="col-md-4">
            <label className="form-label">Ubicación</label>
            <input className="form-control" value={selectedProject?.location || ''} readOnly />
          </div>
        )}
        {selectedCompany && (
          <div className="small text-muted mt-2">
            Contacto: {selectedCompany.contact_name} · Tel: {selectedCompany.phone} · Email: {selectedCompany.email}
          </div>
        )}
      </div>

      {/* Modal de Gestión de Proyectos - RENDERIZADO CON PORTAL */}
      {showProjectModal && createPortal(
        <div 
          className="modal show d-block" 
          style={{ 
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999
          }}
          onClick={(e) => {
            // Cerrar modal al hacer clic fuera del contenido
            if (e.target === e.currentTarget) {
              closeProjectModal();
            }
          }}
        >
          <div className="modal-dialog modal-lg" style={{ margin: '2rem auto' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingProject ? 'Editar Proyecto' : 'Gestionar Proyectos'}
                </h5>
                <button type="button" className="btn-close" onClick={closeProjectModal}></button>
              </div>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {!editingProject ? (
                  // Lista de proyectos existentes
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6>Proyectos de {selectedCompany?.name}</h6>
                      <button 
                        type="button" 
                        className="btn btn-primary btn-sm"
                        onClick={() => openProjectModal()}
                      >
                        + Nuevo Proyecto
                      </button>
                    </div>
                    {loading ? (
                      <div className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Cargando...</span>
                        </div>
                        <p className="mt-2 text-muted">Cargando proyectos...</p>
                      </div>
                    ) : filteredProjects.length > 0 ? (
                      <div className="list-group">
                        {filteredProjects.map(project => (
                          <div key={project.id} className="list-group-item">
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <h6 className="mb-1">{project.name}</h6>
                                <p className="mb-1 text-muted">
                                  📍 {project.location} | 🏢 {project.sector || 'Sin sector'} | 📊 {project.status || 'Sin estado'}
                                </p>
                                {project.description && (
                                  <small className="text-muted">{project.description}</small>
                                )}
                              </div>
                              <div className="d-flex gap-1">
                                <button 
                                  type="button" 
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() => {
                                    setForm(prev => ({ ...prev, project_id: project.id }));
                                    if (typeof onChange === 'function') {
                                      onChange({ 
                                        ...value, 
                                        project_id: project.id, 
                                        project: project,
                                        project_name: project.name,
                                        location: project.location
                                      });
                                    }
                                    closeProjectModal();
                                  }}
                                >
                                  Seleccionar
                                </button>
                                <button 
                                  type="button" 
                                  className="btn btn-outline-secondary btn-sm"
                                  onClick={() => {
                                    console.log('🔍 Botón editar clickeado para proyecto:', project);
                                    openProjectModal(project);
                                  }}
                                  title="Editar proyecto"
                                >
                                  ✏️
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted">No hay proyectos para este cliente</p>
                        <button 
                          type="button" 
                          className="btn btn-primary"
                          onClick={() => openProjectModal()}
                        >
                          Crear Primer Proyecto
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  // Formulario de proyecto
                  <div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Nombre del Proyecto *</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={projectForm.name}
                          onChange={e => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Ubicación *</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={projectForm.location}
                          onChange={e => setProjectForm(prev => ({ ...prev, location: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Sector</label>
                        <select 
                          className="form-select" 
                          value={projectForm.sector}
                          onChange={e => setProjectForm(prev => ({ ...prev, sector: e.target.value }))}
                        >
                          <option value="">Seleccionar sector...</option>
                          <option value="Construcción">Construcción</option>
                          <option value="Geotécnico">Geotécnico</option>
                          <option value="Laboratorio">Laboratorio</option>
                          <option value="Consultoría">Consultoría</option>
                          <option value="Capacitación">Capacitación</option>
                          <option value="Auditoría">Auditoría</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Estado</label>
                        <select 
                          className="form-select" 
                          value={projectForm.status}
                          onChange={e => setProjectForm(prev => ({ ...prev, status: e.target.value }))}
                        >
                          <option value="activo">Activo</option>
                          <option value="en_proceso">En Proceso</option>
                          <option value="completado">Completado</option>
                          <option value="pausado">Pausado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Fecha de Inicio</label>
                        <input 
                          type="date" 
                          className="form-control" 
                          value={projectForm.start_date}
                          onChange={e => setProjectForm(prev => ({ ...prev, start_date: e.target.value }))}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Fecha de Fin</label>
                        <input 
                          type="date" 
                          className="form-control" 
                          value={projectForm.end_date}
                          onChange={e => setProjectForm(prev => ({ ...prev, end_date: e.target.value }))}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Prioridad</label>
                        <select 
                          className="form-select" 
                          value={projectForm.priority}
                          onChange={e => setProjectForm(prev => ({ ...prev, priority: e.target.value }))}
                        >
                          <option value="baja">Baja</option>
                          <option value="media">Media</option>
                          <option value="alta">Alta</option>
                          <option value="urgente">Urgente</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label">Descripción</label>
                        <textarea 
                          className="form-control" 
                          rows="3"
                          value={projectForm.description}
                          onChange={e => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Descripción detallada del proyecto..."
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                {editingProject ? (
                  <>
                    <button type="button" className="btn btn-outline-secondary" onClick={() => openProjectModal()}>
                      ← Volver a Lista
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={closeProjectModal}>
                      Cancelar
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-primary" 
                      onClick={saveProject}
                      disabled={loading || !projectForm.name || !projectForm.location}
                    >
                      {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </>
                ) : (
                  <button type="button" className="btn btn-secondary" onClick={closeProjectModal}>
                    Cerrar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body // Renderizar directamente en el body
      )}
    </div>
  );
}
