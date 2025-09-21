import React, { useEffect, useMemo, useState } from 'react';
import ModuloBase from '../components/ModuloBase';
import Toolbar from '../components/Toolbar';
import Toast from '../components/Toast';
import TableEmpty from '../components/TableEmpty';
import { listServices } from '../services/services';
import { listSubservices, createSubservice, updateSubservice, deleteSubservice } from '../services/subservices';
import FloatingInput from '../components/FloatingInput';
import Modal from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';

export default function Subservicios() {
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState('');
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, variant: 'success', message: '' });
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [editModal, setEditModal] = useState({ open: false, id: null, name: '' });
  const [q, setQ] = useState('');
  const [confirmDel, setConfirmDel] = useState({ open: false, row: null });
  const { user } = useAuth();
  const canManage = ['admin','jefe_laboratorio','jefa_comercial'].includes(user?.role);

  useEffect(() => {
    (async () => {
      try {
        const resp = await listServices({ page: 1, limit: 200 });
        const data = Array.isArray(resp?.data) ? resp.data : (resp || []);
        setServices(data);
        if (data.length) setServiceId(String(data[0].id));
      } catch { /* ignore */ }
    })();
  }, []);

  const load = async () => {
    if (!serviceId) { setRows([]); setTotal(0); return; }
    try {
      setLoading(true);
  const resp = await listSubservices(serviceId, { page, limit, q: q || undefined });
      const data = Array.isArray(resp?.data) ? resp.data : (resp?.rows || resp || []);
      setRows(data);
      setTotal(resp?.total ?? data.length);
    } catch (err) {
      setToast({ show: true, variant: 'danger', message: err.message || 'No se pudo cargar' });
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, serviceId, q]);

  const onCreate = async (e) => {
    e.preventDefault();
    try {
      // validar duplicado local
      const exists = (rows || []).some(r => String(r.name).trim().toLowerCase() === String(name).trim().toLowerCase());
      if (exists) {
        setToast({ show: true, variant: 'warning', message: 'Ya existe un subservicio con ese nombre' });
        return;
      }
      await createSubservice({ service_id: serviceId, name });
      setToast({ show: true, variant: 'success', message: 'Subservicio creado' });
      setShowModal(false);
      setName('');
      load();
    } catch (err) {
      setToast({ show: true, variant: 'danger', message: err.message || 'Error al crear' });
    }
  };

  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));

  const onOpenEdit = (row) => {
    setEditModal({ open: true, id: row.id, name: row.name || '' });
  };
  const onSaveEdit = async () => {
    try {
      // validar duplicado local
      const exists = (rows || []).some(r => r.id !== editModal.id && String(r.name).trim().toLowerCase() === String(editModal.name).trim().toLowerCase());
      if (exists) {
        setToast({ show: true, variant: 'warning', message: 'Ya existe un subservicio con ese nombre' });
        return;
      }
      await updateSubservice(editModal.id, { name: editModal.name });
      setToast({ show: true, variant: 'success', message: 'Subservicio actualizado' });
      setEditModal({ open: false, id: null, name: '' });
      load();
    } catch (err) {
      setToast({ show: true, variant: 'danger', message: err.message || 'Error al actualizar' });
    }
  };
  const onDelete = (row) => setConfirmDel({ open: true, row });
  const confirmDelete = async () => {
    if (!confirmDel.row) return;
    try {
      await deleteSubservice(confirmDel.row.id);
      setToast({ show: true, variant: 'success', message: 'Subservicio eliminado' });
      setConfirmDel({ open: false, row: null });
      load();
    } catch (err) {
      setToast({ show: true, variant: 'danger', message: err.message || 'Error al eliminar' });
    }
  };

  const visibleRows = rows || [];

  return (
    <ModuloBase titulo="Gestión de Subservicios" descripcion="Aquí podrás ver, crear, editar y eliminar subservicios asociados a un servicio.">
      <Toolbar
        left={
          <div className="row g-2 w-100">
            <div className="col-sm-4">
              <label className="form-label">Servicio</label>
              <select className="form-select" value={serviceId} onChange={e=>{ setServiceId(e.target.value); setPage(1); }}>
                {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="col-sm-4">
              <label className="form-label">Buscar</label>
              <input className="form-control" placeholder="Buscar por nombre" value={q} onChange={e=>setQ(e.target.value)} />
            </div>
          </div>
        }
        right={<button className="btn btn-primary" onClick={()=>setShowModal(true)} disabled={!serviceId || !canManage}>+ Agregar subservicio</button>}
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
            {(visibleRows || []).map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.name}</td>
                <td className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-secondary" onClick={()=>onOpenEdit(r)} disabled={!canManage}>Editar</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={()=>onDelete(r)} disabled={!canManage}>Eliminar</button>
                </td>
              </tr>
            ))}
            {(!visibleRows || visibleRows.length === 0) && !loading && <TableEmpty colSpan={3} label="Sin subservicios" />}
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
                <h5 className="modal-title">Nuevo subservicio</h5>
                <button type="button" className="btn-close" onClick={()=>setShowModal(false)}></button>
              </div>
              <form onSubmit={onCreate}>
                <div className="modal-body">
                  <FloatingInput id="subservice-name" label="Nombre" value={name} onChange={e=>setName(e.target.value)} required />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={()=>setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Guardando...' : 'Crear'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {editModal.open && (
        <div className="modal fade show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar subservicio</h5>
                <button type="button" className="btn-close" onClick={()=>setEditModal({ open:false, id:null, name:'' })}></button>
              </div>
              <div className="modal-body">
                <FloatingInput id="edit-subservice-name" label="Nombre" value={editModal.name} onChange={e=>setEditModal(m=>({ ...m, name: e.target.value }))} required />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={()=>setEditModal({ open:false, id:null, name:'' })}>Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={onSaveEdit}>Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast show={toast.show} variant={toast.variant} onClose={()=>setToast({ ...toast, show: false })}>
        {toast.message}
      </Toast>

      {/* Modal confirmación */}
      <Modal open={confirmDel.open} onClose={()=>setConfirmDel({ open:false, row:null })}>
        <h5>Confirmar eliminación</h5>
        <p>¿Seguro que deseas eliminar el subservicio "{confirmDel.row?.name}"?</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-outline-secondary" onClick={()=>setConfirmDel({ open:false, row:null })}>Cancelar</button>
          <button className="btn btn-danger" onClick={confirmDelete} disabled={!canManage}>Eliminar</button>
        </div>
      </Modal>
    </ModuloBase>
  );
}
