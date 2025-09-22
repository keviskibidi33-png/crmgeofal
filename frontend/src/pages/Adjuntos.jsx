import React, { useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import ModuloBase from '../components/ModuloBase';
import DataTable from '../components/DataTable';
import Toolbar from '../components/Toolbar';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { listAttachments, createAttachment, deleteAttachment } from '../services/attachments';
import { listProjects } from '../services/projects';

const emptyForm = { project_id: '', description: '', file: null };

export default function Adjuntos() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filters, setFilters] = useState({ q: '' });
  const [toast, setToast] = useState({ message: '', type: 'success', show: false });
  const location = useLocation();

  // State for modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState(emptyForm);
  const [deletingAttachment, setDeletingAttachment] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (location.state?.search) {
      setFilters(f => ({ ...f, q: location.state.search }));
    }
  }, [location.state]);

  const { data, isLoading } = useQuery(
    ['attachments', { page, limit, q: filters.q }],
    () => listAttachments({ page, limit, q: filters.q }),
    { keepPreviousData: true }
  );

  const { data: projectsData } = useQuery('projectsList', () => listProjects({ page: 1, limit: 500 }), { staleTime: Infinity });
  const projects = useMemo(() => projectsData?.data || [], [projectsData]);

  const handleMutationSuccess = (message) => {
    setToast({ message, type: 'success', show: true });
    queryClient.invalidateQueries('attachments');
    setShowUploadModal(false);
    setUploadForm(emptyForm);
    setDeletingAttachment(null);
  };

  const handleMutationError = (error, defaultMessage) => {
    setToast({ message: error?.message || defaultMessage, type: 'error', show: true });
  };

  const createMutation = useMutation(createAttachment, {
    onSuccess: () => handleMutationSuccess('Archivo subido correctamente.'),
    onError: (err) => handleMutationError(err, 'Error al subir archivo.'),
  });

  const deleteMutation = useMutation(deleteAttachment, {
    onSuccess: () => handleMutationSuccess('Adjunto eliminado correctamente.'),
    onError: (err) => handleMutationError(err, 'Error al eliminar adjunto.'),
  });

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.project_id) {
      setToast({ message: 'Debe seleccionar un proyecto y un archivo.', type: 'error', show: true });
      return;
    }
    createMutation.mutate(uploadForm);
  };

  const handleDeleteConfirm = () => {
    if (deletingAttachment) {
      deleteMutation.mutate(deletingAttachment.id);
    }
  };

  const columns = useMemo(() => [
    { header: 'ID', key: 'id', width: 60 },
    { header: 'Proyecto', key: 'project_name' },
    { header: 'Archivo', key: 'file_url', render: (att) => (
      <a href={att.file_url} target="_blank" rel="noreferrer noopener">
        {att.file_url.split('/').pop()}
      </a>
    )},
    { header: 'Descripción', key: 'description' },
    { header: 'Subido por', key: 'uploaded_by_name' },
    { header: 'Fecha', key: 'created_at', render: (att) => new Date(att.created_at).toLocaleString(), width: 200 },
    { header: 'Acciones', key: 'actions', width: 120, render: (att) => (
      <button className="btn btn-sm btn-outline-danger" onClick={() => setDeletingAttachment(att)}>Eliminar</button>
    )},
  ], []);

  const rows = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <ModuloBase titulo="Gestión de Adjuntos" descripcion="Archivos relacionados a proyectos y cotizaciones.">
      <Toolbar
        left={
          <input
            className="form-control"
            style={{ maxWidth: '300px' }}
            placeholder="Buscar por archivo, proyecto..."
            value={filters.q}
            onChange={e => { setPage(1); setFilters({ q: e.target.value }); }}
          />
        }
        right={
          <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>+ Subir Archivo</button>
        }
      />

      <DataTable columns={columns} rows={rows} loading={isLoading} />

      <div className="d-flex justify-content-between align-items-center mt-3">
        <span className="text-muted">Total: {total}</span>
        <div className="btn-group">
          <button className="btn btn-outline-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Anterior</button>
          <span className="btn btn-outline-secondary disabled">{page} / {totalPages}</span>
          <button className="btn btn-outline-secondary" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Siguiente</button>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <Modal open={showUploadModal} onClose={() => setShowUploadModal(false)}>
          <form onSubmit={handleUploadSubmit}>
            <h4>Subir Archivo Adjunto</h4>
            <div className="row g-3 mt-2">
              <div className="col-12">
                <label className="form-label">Proyecto</label>
                <select
                  className="form-select"
                  value={uploadForm.project_id}
                  onChange={(e) => setUploadForm(f => ({ ...f, project_id: e.target.value }))}
                  required
                >
                  <option value="">Seleccione un proyecto...</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">Descripción (Opcional)</label>
                <input
                  className="form-control"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="col-12">
                <label className="form-label">Archivo</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) => setUploadForm(f => ({ ...f, file: e.target.files[0] }))}
                  required
                />
              </div>
            </div>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <button type="button" className="btn btn-outline-secondary" onClick={() => setShowUploadModal(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={createMutation.isLoading}>
                {createMutation.isLoading ? 'Subiendo...' : 'Subir'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingAttachment && (
        <Modal open={!!deletingAttachment} onClose={() => setDeletingAttachment(null)}>
          <h4>Confirmar Eliminación</h4>
          <p>¿Estás seguro de que quieres eliminar el archivo <strong>{deletingAttachment.file_url.split('/').pop()}</strong>? Esta acción no se puede deshacer.</p>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <button type="button" className="btn btn-outline-secondary" onClick={() => setDeletingAttachment(null)}>Cancelar</button>
            <button type="button" className="btn btn-danger" onClick={handleDeleteConfirm} disabled={deleteMutation.isLoading}>
              Eliminar
            </button>
          </div>
        </Modal>
      )}

      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast(prev => ({ ...prev, show: false }))} 
      />
    </ModuloBase>
  );
}