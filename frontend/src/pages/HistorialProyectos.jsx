import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from 'react-query';
import ModuloBase from '../components/ModuloBase';
import DataTable from '../components/DataTable';
import Toolbar from '../components/Toolbar';
import { getProjectHistory } from '../services/projectHistory';

export default function HistorialProyectos() {
  const [projectId, setProjectId] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.projectId) {
      setProjectId(location.state.projectId);
    }
  }, [location.state]);

  const { data, isLoading, isFetching } = useQuery(
    ['projectHistory', projectId, page, limit],
    () => getProjectHistory(projectId, { page, limit }),
    {
      enabled: !!projectId, // Only run query if projectId is set
      keepPreviousData: true,
    }
  );

  const rows = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const columns = React.useMemo(() => [
    { header: 'ID', key: 'id', width: 80 },
    { header: 'Acción', key: 'action' },
    { header: 'Realizado por', key: 'performed_by' },
    { header: 'Fecha', key: 'created_at', render: (r) => new Date(r.created_at).toLocaleString() },
    { header: 'Notas', key: 'notes' },
  ], []);

  return (
    <ModuloBase titulo="Historial de Proyectos" descripcion="Consulta el historial de cambios y eventos de cada proyecto.">
      <Toolbar
        left={
          <div className="d-flex align-items-end gap-2">
            <div style={{ minWidth: '200px' }}>
              <label htmlFor="project-id-input" className="form-label">ID del Proyecto</label>
              <input
                id="project-id-input"
                type="number"
                className="form-control"
                placeholder="Ingrese ID del proyecto"
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  setPage(1); // Reset page when project changes
                }}
              />
            </div>
          </div>
        }
      />

      {projectId ? (
        <>
          <DataTable columns={columns} rows={rows} loading={isLoading || isFetching} />
          <div className="d-flex justify-content-between align-items-center mt-3">
            <span className="text-muted">Total: {total}</span>
            <div className="btn-group">
              <button className="btn btn-outline-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Anterior</button>
              <span className="btn btn-outline-secondary disabled">{page} / {totalPages}</span>
              <button className="btn btn-outline-secondary" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Siguiente</button>
            </div>
          </div>
        </>
      ) : (
        <div className="alert alert-info mt-3">
          Por favor, ingrese un ID de proyecto para ver su historial, o navegue desde la lista de proyectos.
        </div>
      )}
    </ModuloBase>
  );
}