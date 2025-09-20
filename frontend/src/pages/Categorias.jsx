import React, { useEffect, useState } from 'react';
import ModuloBase from '../components/ModuloBase';
import Toolbar from '../components/Toolbar';
import Toast from '../components/Toast';
import TableEmpty from '../components/TableEmpty';
import { listCategories, createCategory, updateCategory, deleteCategory } from '../services/categories';
import FloatingInput from '../components/FloatingInput';

export default function Categorias() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ show: false, variant: 'success', message: '' });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const resp = await listCategories({ page, limit, q: search || undefined });
      const data = Array.isArray(resp?.data) ? resp.data : (resp?.rows || resp || []);
      setRows(data);
      setTotal(resp?.total ?? data.length);
    } catch (err) {
      setToast({ show: true, variant: 'danger', message: err.message || 'No se pudo cargar' });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, search]);

  const openNew = () => { setEditing(null); setName(''); setShowModal(true); };
  const openEdit = (r) => { setEditing(r); setName(r.name || ''); setShowModal(true); };
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await updateCategory(editing.id, { name }); else await createCategory({ name });
      setToast({ show: true, variant: 'success', message: editing ? 'Categoría actualizada' : 'Categoría creada' });
      setShowModal(false);
      load();
    } catch (err) {
      setToast({ show: true, variant: 'danger', message: err.message || 'Error al guardar' });
    }
  };
  const onDelete = async (r) => {
    if (!window.confirm('¿Eliminar categoría?')) return;
    try { await deleteCategory(r.id); setToast({ show: true, variant: 'success', message: 'Eliminado' }); load(); }
    catch (err) { setToast({ show: true, variant: 'danger', message: err.message || 'Error al eliminar' }); }
  };

  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));

  return (
    <ModuloBase titulo="Gestión de Categorías" descripcion="Aquí podrás ver, crear, editar y eliminar categorías de proyectos o cotizaciones.">
      <Toolbar
        left={
          <div className="row g-2 w-100">
            <div className="col-sm-4">
              <label className="form-label">Buscar</label>
              <input className="form-control" placeholder="Nombre" value={search} onChange={e=>{ setSearch(e.target.value); setPage(1); }} />
            </div>
          </div>
        }
        right={<button className="btn btn-primary" onClick={openNew}>+ Agregar categoría</button>}
      />

      <div className="table-responsive mt-3">
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th style={{width:140}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(rows || []).map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.name}</td>
                <td className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-secondary" onClick={()=>openEdit(r)}>Editar</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={()=>onDelete(r)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {(!rows || rows.length === 0) && !loading && <TableEmpty colSpan={3} label="Sin categorías" />}
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
                <h5 className="modal-title">{editing ? 'Editar' : 'Nueva'} categoría</h5>
                <button type="button" className="btn-close" onClick={()=>setShowModal(false)}></button>
              </div>
              <form onSubmit={onSubmit}>
                <div className="modal-body">
                  <FloatingInput id="cat-name" label="Nombre" value={name} onChange={e=>setName(e.target.value)} required />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={()=>setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
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
