import React from 'react';
import ModuloBase from '../components/ModuloBase';
import DataTable from '../components/DataTable';
import Toolbar from '../components/Toolbar';
import Toast from '../components/Toast';
import { listUsers, createUser } from '../services/users';
import { useQuery } from 'react-query';

export default function Usuarios() {
  const [q, setQ] = React.useState('');
  const [role, setRole] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10);
  const [toast, setToast] = React.useState({ show: false, variant: 'success', message: '' });
  const [createOpen, setCreateOpen] = React.useState(false);
  const [form, setForm] = React.useState({ name: '', email: '', password: '', role: '' });
  const { data, isLoading, isError, error } = useQuery(
    ['users', { page, limit, q, role }],
    async () => {
      const resp = await listUsers({ page, limit, search: q, role });
      const rows = Array.isArray(resp?.data) ? resp.data : (resp?.rows || resp || []);
      const total = resp?.total ?? rows.length;
      return { rows, total };
    }
  );

  React.useEffect(() => {
    if (isError && error) {
      setToast({ show: true, variant: 'danger', message: error.message || 'No se pudo cargar usuarios' });
    }
  }, [isError, error]);

  const onCreate = () => {
    // TODO: abrir modal crear usuario
    alert('Crear usuario (pendiente)');
  };
  const onClear = () => { setQ(''); setRole(''); setPage(1); };

  const total = data?.total || 0;
  const rows = data?.rows || [];
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <ModuloBase titulo="Gestión de Usuarios" descripcion="Crear, editar y eliminar usuarios del sistema.">
      <Toolbar
        compact
        left={(
          <>
            <input
              className="form-control"
              style={{ minWidth: 220 }}
              placeholder="Buscar por nombre o email"
              value={q}
              onChange={e => { setQ(e.target.value); setPage(1); }}
            />
            <select className="form-select" value={role} onChange={e => { setRole(e.target.value); setPage(1); }}>
              <option value="">Todos los roles</option>
              <option value="admin">Admin</option>
              <option value="soporte">Soporte</option>
              <option value="jefa_comercial">Jefa Comercial</option>
              <option value="vendedor_comercial">Vendedor</option>
              <option value="laboratorio">Laboratorio</option>
              <option value="gerencia">Gerencia</option>
            </select>
          </>
        )}
        right={(
          <>
            <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>Crear Usuario</button>
            <button className="btn btn-outline-secondary" onClick={onClear}>Limpiar</button>
          </>
        )}
      />
      <DataTable
        columns={[
          { header: 'ID', key: 'id', width: 80 },
          { header: 'Nombre', key: 'name' },
          { header: 'Email', key: 'email' },
          { header: 'Rol', key: 'role' },
          { header: 'Acciones', key: 'actions', render: () => null, width: 120 },
        ]}
        rows={rows}
        loading={isLoading}
      />

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

      {createOpen && (
        <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.35)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Crear Usuario</h5>
                <button type="button" className="btn-close" onClick={()=>setCreateOpen(false)}></button>
              </div>
              <form onSubmit={async (e)=>{
                e.preventDefault();
                try {
                  await createUser(form);
                  setToast({ show: true, variant: 'success', message: 'Usuario creado' });
                  setCreateOpen(false);
                  setForm({ name: '', email: '', password: '', role: '' });
                } catch (err) {
                  setToast({ show: true, variant: 'danger', message: err.message || 'Error al crear usuario' });
                }
              }}>
                <div className="modal-body">
                  <div className="mb-2">
                    <label className="form-label">Nombre</label>
                    <input className="form-control" value={form.name} onChange={e=>setForm(f=>({ ...f, name: e.target.value }))} required />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={form.email} onChange={e=>setForm(f=>({ ...f, email: e.target.value }))} required />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Contraseña</label>
                    <input type="password" className="form-control" value={form.password} onChange={e=>setForm(f=>({ ...f, password: e.target.value }))} required />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Rol</label>
                    <select className="form-select" value={form.role} onChange={e=>setForm(f=>({ ...f, role: e.target.value }))} required>
                      <option value="">Seleccione</option>
                      <option value="admin">Admin</option>
                      <option value="soporte">Soporte</option>
                      <option value="jefa_comercial">Jefa Comercial</option>
                      <option value="vendedor_comercial">Vendedor</option>
                      <option value="laboratorio">Laboratorio</option>
                      <option value="gerencia">Gerencia</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={()=>setCreateOpen(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Crear</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </ModuloBase>
  );
}
