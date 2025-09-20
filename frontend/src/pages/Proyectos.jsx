import React, { useEffect, useState } from 'react';
import ModuloBase from '../components/ModuloBase';
import Modal from '../components/Modal';
import Toolbar from '../components/Toolbar';
import Toast from '../components/Toast';
import TableEmpty from '../components/TableEmpty';
import CompanySelect from '../components/CompanySelect';
import { listProjects, createProject, updateProject, deleteProject } from '../services/projects';

const PAGE_LIMIT = 20;
const emptyForm = { company_id: '', name: '', location: '' };

const Proyectos = () => {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listProjects({ page, limit: PAGE_LIMIT, search });
      setRows(data?.data || []);
      setTotal(Number(data?.total || 0));
    } catch (e) {
      setError(e.message || 'Error al cargar proyectos');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [page, search]);

  const onNew = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const onEdit = (p) => { setEditing(p); setForm({ company_id: p.company_id || '', name: p.name || '', location: p.location || '' }); setShowForm(true); };
  const onDelete = async (p) => {
    const conf = window.prompt(`Para eliminar el proyecto "${p.name}", escribe ELIMINAR`);
    if (conf !== 'ELIMINAR') return;
    try { await deleteProject(p.id); await load(); } catch (e) { alert(e.message || 'Error al eliminar proyecto'); }
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form };
    try {
      setSaving(true);
      if (editing) await updateProject(editing.id, { name: payload.name, location: payload.location });
      else await createProject(payload);
      setShowForm(false); setEditing(null); setForm(emptyForm); await load();
      setToast({ message: editing ? 'Proyecto actualizado' : 'Proyecto creado', type: 'success' });
    } catch (e) { setToast({ message: e.message || 'Error al guardar', type: 'error' }); }
    finally { setSaving(false); }
  };

  return (
    <ModuloBase titulo="Gestión de Proyectos" descripcion="Administra los proyectos por cliente, ubicación y responsables.">
      <Toolbar
        left={(
          <>
            <input
              placeholder="Buscar por nombre o ubicación"
              value={search}
              onChange={(e)=>{ setSearch(e.target.value); setPage(1); }}
              style={{ padding:'0.6rem 0.8rem', border:'1px solid #ddd', borderRadius:8, minWidth:260 }}
            />
            {loading && <span style={{ color:'#888' }}>Cargando...</span>}
            {error && <span style={{ color:'red' }}>{error}</span>}
          </>
        )}
        right={<button onClick={onNew} className="btn btn-primary">+ Agregar proyecto</button>}
      />

      <div className="table-responsive">
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Nombre</th>
              <th>Ubicación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <TableEmpty colSpan={5} message="Sin proyectos" />}
            {rows.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.company_name || p.company_id}</td>
                <td>{p.name}</td>
                <td>{p.location}</td>
                <td>
                  <button className="btn btn-sm btn-secondary me-1" onClick={()=>onEdit(p)}>Editar</button>
                  <button className="btn btn-sm btn-danger" onClick={()=>onDelete(p)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <button className="btn btn-outline-secondary" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Anterior</button>
        <span>Página {page} de {Math.ceil((total||0)/PAGE_LIMIT)||1}</span>
        <button className="btn btn-outline-secondary" disabled={page*PAGE_LIMIT>=total} onClick={()=>setPage(p=>p+1)}>Siguiente</button>
      </div>

      {showForm && (
        <Modal open={showForm} onClose={()=>setShowForm(false)}>
          <form onSubmit={onSubmit}>
            <h3 style={{ marginBottom: 8 }}>{editing ? 'Editar proyecto' : 'Nuevo proyecto'}</h3>
            <div style={{ color:'#888', marginBottom: 16 }}>{editing ? 'Actualiza los datos del proyecto.' : 'Completa los datos del nuevo proyecto.'}</div>

            <div className="row g-3">
              {!editing && (
                <div className="col-md-6">
                  <label className="form-label">Cliente</label>
                  <CompanySelect value={form.company_id} onChange={(id)=>setForm({ ...form, company_id: id })} />
                </div>
              )}
              <div className="col-md-6">
                <label className="form-label">Nombre del proyecto</label>
                <input className="form-control" value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Ubicación</label>
                <input className="form-control" value={form.location} onChange={(e)=>setForm({ ...form, location: e.target.value })} required />
              </div>
            </div>

            <div className="mt-3 d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-outline-secondary" onClick={()=>setShowForm(false)} disabled={saving}>Cancelar</button>
              <button type="submit" className="btn btn-success" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </form>
        </Modal>
      )}

      <Toast message={toast.message} type={toast.type} onClose={()=>setToast({ message:'', type:'success' })} />
    </ModuloBase>
  );
};

export default Proyectos;
