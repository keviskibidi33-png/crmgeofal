import React, { useEffect, useState } from 'react';
import ModuloBase from '../components/ModuloBase';
import Modal from '../components/Modal';
import Toolbar from '../components/Toolbar';
import Toast from '../components/Toast';
import TableEmpty from '../components/TableEmpty';
import { listCompanies, createCompany, updateCompany, deleteCompany } from '../services/companies';

const PAGE_LIMIT = 20;

const emptyForm = {
  type: 'empresa', // 'empresa' | 'persona_natural'
  ruc: '',
  dni: '',
  name: '',
  address: '',
  email: '',
  phone: '',
  contact_name: '',
};

const Clientes = () => {
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
      const data = await listCompanies({ page, limit: PAGE_LIMIT, search });
      setRows(data?.data || []);
      setTotal(Number(data?.total || 0));
    } catch (e) {
      setError(e.message || 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, search]);

  const onNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };
  const onEdit = (c) => {
    setEditing(c);
    setForm({
      type: c.type || 'empresa',
      ruc: c.ruc || '',
      dni: c.dni || '',
      name: c.name || '',
      address: c.address || '',
      email: c.email || '',
      phone: c.phone || '',
      contact_name: c.contact_name || '',
    });
    setShowForm(true);
  };
  const onDelete = async (c) => {
    const conf = window.prompt(`Para eliminar al cliente "${c.name}", escribe ELIMINAR`);
    if (conf !== 'ELIMINAR') return;
    try {
      await deleteCompany(c.id);
      await load();
    } catch (e) {
      alert(e.message || 'Error al eliminar cliente');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (payload.type === 'empresa') {
      if (!payload.ruc) return alert('RUC es obligatorio para empresa');
      payload.dni = '';
    } else {
      if (!payload.dni) return alert('DNI es obligatorio para persona natural');
      payload.ruc = '';
    }
    try {
      setSaving(true);
      if (editing) await updateCompany(editing.id, payload);
      else await createCompany(payload);
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      await load();
      setToast({ message: editing ? 'Cliente actualizado' : 'Cliente creado', type: 'success' });
    } catch (e) {
      setToast({ message: e.message || 'Error al guardar', type: 'error' });
    }
    finally { setSaving(false); }
  };

  return (
    <ModuloBase titulo="Gestión de Clientes" descripcion="Administra clientes: empresas o personas naturales, contactos y datos de facturación.">
      <Toolbar
        left={(
          <>
            <input
              placeholder="Buscar por nombre, RUC o DNI"
              value={search}
              onChange={(e)=>{ setSearch(e.target.value); setPage(1); }}
              style={{ padding:'0.6rem 0.8rem', border:'1px solid #ddd', borderRadius:8, minWidth:260 }}
            />
            {loading && <span style={{ color:'#888' }}>Cargando...</span>}
            {error && <span style={{ color:'red' }}>{error}</span>}
          </>
        )}
        right={<button onClick={onNew} className="btn btn-primary">+ Agregar cliente</button>}
      />

      <div className="table-responsive">
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>RUC/DNI</th>
              <th>Nombre</th>
              <th>Contacto</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (<TableEmpty colSpan={9} message="Sin clientes" />)}
            {rows.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.type}</td>
                <td>{c.type === 'empresa' ? (c.ruc || '-') : (c.dni || '-')}</td>
                <td>{c.name}</td>
                <td>{c.contact_name || '-'}</td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td style={{ maxWidth: 260 }}>{c.address}</td>
                <td>
                  <button className="btn btn-sm btn-secondary me-1" onClick={()=>onEdit(c)}>Editar</button>
                  <button className="btn btn-sm btn-danger" onClick={()=>onDelete(c)}>Eliminar</button>
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
            <h3 style={{ marginBottom: 8 }}>{editing ? 'Editar cliente' : 'Nuevo cliente'}</h3>
            <div style={{ color:'#888', marginBottom: 16 }}>{editing ? 'Actualiza los datos del cliente.' : 'Completa los datos del nuevo cliente.'}</div>

            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Tipo</label>
                <select className="form-select" value={form.type} onChange={(e)=>setForm({ ...form, type: e.target.value })}>
                  <option value="empresa">Empresa</option>
                  <option value="persona_natural">Persona Natural</option>
                </select>
              </div>
              {form.type === 'empresa' ? (
                <div className="col-md-4">
                  <label className="form-label">RUC</label>
                  <input className="form-control" value={form.ruc} onChange={(e)=>setForm({ ...form, ruc: e.target.value })} required />
                </div>
              ) : (
                <div className="col-md-4">
                  <label className="form-label">DNI</label>
                  <input className="form-control" value={form.dni} onChange={(e)=>setForm({ ...form, dni: e.target.value })} required />
                </div>
              )}
              <div className="col-md-8">
                <label className="form-label">Nombre / Razón Social</label>
                <input className="form-control" value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="col-md-12">
                <label className="form-label">Dirección</label>
                <input className="form-control" value={form.address} onChange={(e)=>setForm({ ...form, address: e.target.value })} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Correo</label>
                <input type="email" className="form-control" value={form.email} onChange={(e)=>setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Teléfono</label>
                <input className="form-control" value={form.phone} onChange={(e)=>setForm({ ...form, phone: e.target.value })} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Contacto</label>
                <input className="form-control" value={form.contact_name} onChange={(e)=>setForm({ ...form, contact_name: e.target.value })} required />
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

export default Clientes;
