import React, { useEffect, useMemo, useState } from 'react';
import ModuloBase from '../components/ModuloBase';
import Toolbar from '../components/Toolbar';
import DataTable from '../components/DataTable';
import Toast from '../components/Toast';

export default function Adjuntos() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, variant: 'success', message: '' });

  const load = async () => {
    try {
      setLoading(true);
      // TODO: conectar a /api/project-attachments cuando se confirme formato
      setRows([]);
      setTotal(0);
    } catch (err) {
      setToast({ show: true, variant: 'danger', message: err.message || 'No se pudo cargar' });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, q]);

  const columns = useMemo(() => ([
    { header: 'ID', key: 'id', width: 80 },
    { header: 'Proyecto', key: 'project_name' },
    { header: 'Archivo', key: 'filename' },
    { header: 'Subido por', key: 'uploaded_by' },
    { header: 'Fecha', key: 'created_at', render: r => (r.created_at ? String(r.created_at).slice(0,19).replace('T',' ') : '—'), width: 160 },
    { header: 'Acciones', key: 'actions', width: 160, render: r => (
      <div className="d-flex gap-2">
        <a className="btn btn-sm btn-outline-primary" href={r.url} target="_blank" rel="noreferrer">Ver</a>
        <button className="btn btn-sm btn-outline-danger" onClick={()=>{/* eliminar */}}>Eliminar</button>
      </div>
    ) },
  ]), []);

  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));

  return (
    <ModuloBase titulo="Gestión de Adjuntos" descripcion="Archivos relacionados a proyectos y cotizaciones">
      <Toolbar
        compact
        left={
          <div className="row g-2 w-100">
            <div className="col-12 col-md-4">
              <label className="form-label">Buscar</label>
              <input className="form-control" placeholder="Nombre de archivo o proyecto" value={q} onChange={e=>{ setQ(e.target.value); setPage(1); }} />
            </div>
          </div>
        }
        right={
          <div className="d-flex gap-2">
            <button className="btn btn-outline-primary" onClick={()=>{ setPage(1); load(); }} disabled={loading}>{loading ? 'Cargando...' : 'Refrescar'}</button>
            <button className="btn btn-primary">Subir archivo</button>
          </div>
        }
      />

      <DataTable columns={columns} rows={rows} loading={loading} />

      <div className="d-flex justify-content-between align-items-center">
        <div className="text-muted small">Total: {total}</div>
        <div className="btn-group">
          <button className="btn btn-outline-secondary" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Anterior</button>
          <span className="btn btn-outline-secondary disabled">{page}/{totalPages}</span>
          <button className="btn btn-outline-secondary" disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Siguiente</button>
        </div>
      </div>

      <Toast show={toast.show} variant={toast.variant} onClose={()=>setToast({ ...toast, show: false })}>
        {toast.message}
      </Toast>
    </ModuloBase>
  );
}
