import React, { useEffect, useMemo, useState } from 'react';
import ModuloBase from '../components/ModuloBase';
import Toolbar from '../components/Toolbar';
import Toast from '../components/Toast';
import TableEmpty from '../components/TableEmpty';
import { createEvidence, listEvidences } from '../services/evidences';
import { listProjects } from '../services/projects';
import { listCompanies } from '../services/companies';

export default function Evidencias() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ company_id: '', project_id: '', type: '' });
  const [companies, setCompanies] = useState([]);
  const [projects, setProjects] = useState([]);
  const [toast, setToast] = useState({ show: false, variant: 'success', message: '' });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ project_id: '', invoice_id: '', type: 'otro', file: null });

  useEffect(() => {
    (async () => {
      try {
        const [c, p] = await Promise.all([
          listCompanies({ page: 1, limit: 200 }),
          listProjects({ page: 1, limit: 500 }),
        ]);
        setCompanies(Array.isArray(c?.data) ? c.data : (c || []));
        setProjects(Array.isArray(p?.data) ? p.data : (p || []));
      } catch { /* ignore */ }
    })();
  }, []);

  const filteredProjects = useMemo(() => {
    if (!filters.company_id) return projects;
    const cid = Number(filters.company_id);
    return projects.filter(p => Number(p.company_id) === cid);
  }, [projects, filters.company_id]);
  const projectNameById = useMemo(() => {
    const map = new Map();
    for (const p of projects) map.set(Number(p.id), p.name);
    return map;
  }, [projects]);

  const load = async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (filters.project_id) params.project_id = filters.project_id;
      if (filters.type) params.type = filters.type;
      const resp = await listEvidences(params);
      const data = Array.isArray(resp?.data) ? resp.data : (resp?.rows || resp || []);
      setRows(data);
      const t = resp?.total ?? 0; setTotal(typeof t === 'number' ? t : 0);
    } catch (err) {
      setToast({ show: true, variant: 'danger', message: err.message || 'No se pudo cargar' });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, filters.project_id, filters.type]);

  const onUpload = async (e) => {
    e.preventDefault();
    try {
      await createEvidence(form);
      setToast({ show: true, variant: 'success', message: 'Evidencia subida' });
      setShowModal(false);
      setForm({ project_id: '', invoice_id: '', type: 'otro', file: null });
      load();
    } catch (err) {
      setToast({ show: true, variant: 'danger', message: err.message || 'Error al subir' });
    }
  };

  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));

  return (
    <ModuloBase titulo="Evidencias" descripcion="Aquí podrás ver y gestionar evidencias asociadas a proyectos o tickets.">
      <Toolbar
        left={
          <div className="row g-2 w-100">
            <div className="col-sm-4">
              <label className="form-label">Cliente</label>
              <select className="form-select" value={filters.company_id} onChange={e=>{ setFilters({ ...filters, company_id: e.target.value, project_id: '' }); setPage(1); }}>
                <option value="">Todos</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="col-sm-4">
              <label className="form-label">Proyecto</label>
              <select className="form-select" value={filters.project_id} onChange={e=>{ setFilters({ ...filters, project_id: e.target.value }); setPage(1); }}>
                <option value="">Todos</option>
                {filteredProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="col-sm-3">
              <label className="form-label">Tipo</label>
              <select className="form-select" value={filters.type} onChange={e=>{ setFilters({ ...filters, type: e.target.value }); setPage(1); }}>
                <option value="">Todos</option>
                <option value="informe">Informe</option>
                <option value="foto">Foto</option>
                <option value="certificado">Certificado</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>
        }
        right={<button className="btn btn-primary" onClick={()=>setShowModal(true)}>+ Subir evidencia</button>}
      />

      <div className="table-responsive mt-3">
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Proyecto</th>
              <th>Factura</th>
              <th>Tipo</th>
              <th>Archivo</th>
              <th>Subido por</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {(rows || []).map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{projectNameById.get(Number(r.project_id)) || r.project_id}</td>
                <td>{r.invoice_name || r.invoice_id || '—'}</td>
                <td className="text-capitalize">{r.type}</td>
                <td>{r.file_url ? <a href={r.file_url} target="_blank" rel="noreferrer">Ver</a> : '-'}</td>
                <td>{r.uploaded_by}</td>
                <td>{r.created_at ? String(r.created_at).slice(0, 19).replace('T',' ') : ''}</td>
              </tr>
            ))}
            {(!rows || rows.length === 0) && !loading && <TableEmpty colSpan={7} label="Sin evidencias" />}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between align-items-center">
        <div className="text-muted small">Total: {total}</div>
        <div className="btn-group">
          <button className="btn btn-outline-secondary" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Anterior</button>
          <span className="btn btn-outline-secondary disabled">{page}/{totalPages}</span>
          <button className="btn btn-outline-secondary" disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Siguiente</button>
        </div>
      </div>

      {showModal && (
        <div className="modal fade show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Subir evidencia</h5>
                <button type="button" className="btn-close" onClick={()=>setShowModal(false)}></button>
              </div>
              <form onSubmit={onUpload}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Proyecto</label>
                    <select className="form-select" value={form.project_id} onChange={e=>setForm({ ...form, project_id: e.target.value })} required>
                      <option value="">Seleccione</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tipo</label>
                    <select className="form-select" value={form.type} onChange={e=>setForm({ ...form, type: e.target.value })}>
                      <option value="informe">Informe</option>
                      <option value="foto">Foto</option>
                      <option value="certificado">Certificado</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Archivo</label>
                    <input type="file" className="form-control" onChange={e=>setForm({ ...form, file: e.target.files?.[0] || null })} required />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={()=>setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Subiendo...' : 'Subir'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Toast show={toast.show} variant={toast.variant} onClose={()=>setToast({ ...toast, show: false })}>
        {toast.message}
      </Toast>
    </ModuloBase>
  );
}
