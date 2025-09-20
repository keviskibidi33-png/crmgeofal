import React, { useState } from 'react';
import ModuloBase from '../components/ModuloBase';
import Toolbar from '../components/Toolbar';
import Toast from '../components/Toast';
import TableEmpty from '../components/TableEmpty';
import { listTickets, createTicket, updateTicketStatus } from '../services/tickets';
import { useQuery, useMutation, useQueryClient } from 'react-query';

export default function Tickets() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [toast, setToast] = useState({ show: false, variant: 'success', message: '' });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'media', file: null });

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ['tickets', { page, limit, status: filters.status, priority: filters.priority }],
    async () => {
      const resp = await listTickets({ page, limit, ...filters });
      const rows = Array.isArray(resp?.data) ? resp.data : (resp?.rows || resp || []);
      const total = Number(resp?.total || rows.length || 0);
      return { rows, total };
    },
    { keepPreviousData: true }
  );

  const createMutation = useMutation(createTicket, {
    onSuccess: () => {
      setToast({ show: true, variant: 'success', message: 'Ticket creado' });
      queryClient.invalidateQueries('tickets');
    },
    onError: (err) => setToast({ show: true, variant: 'danger', message: err.message || 'Error al crear' })
  });

  const statusMutation = useMutation(({ id, status }) => updateTicketStatus(id, status), {
    onSuccess: () => {
      setToast({ show: true, variant: 'success', message: 'Estado actualizado' });
      queryClient.invalidateQueries('tickets');
    },
    onError: (err) => setToast({ show: true, variant: 'danger', message: err.message || 'No se pudo actualizar' })
  });

  const rows = data?.rows || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const onCreate = async (e) => {
    e.preventDefault();
    await createMutation.mutateAsync(form);
    setShowModal(false);
    setForm({ title: '', description: '', priority: 'media', file: null });
  };

  return (
    <ModuloBase titulo="Gestión de Tickets" descripcion="Aquí podrás ver, crear y gestionar tickets de soporte.">
      <Toolbar
        left={
          <div className="row g-2 w-100">
            <div className="col-sm-3">
              <label className="form-label">Estado</label>
              <select className="form-select" value={filters.status} onChange={e=>{ setPage(1); setFilters({ ...filters, status: e.target.value }); }}>
                <option value="">Todos</option>
                <option value="abierto">Abierto</option>
                <option value="en_proceso">En proceso</option>
                <option value="resuelto">Resuelto</option>
                <option value="cerrado">Cerrado</option>
              </select>
            </div>
            <div className="col-sm-3">
              <label className="form-label">Prioridad</label>
              <select className="form-select" value={filters.priority} onChange={e=>{ setPage(1); setFilters({ ...filters, priority: e.target.value }); }}>
                <option value="">Todas</option>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>
          </div>
        }
        right={<button className="btn btn-primary" onClick={()=>setShowModal(true)}>+ Nuevo ticket</button>}
      />

      <div className="table-responsive mt-3">
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Prioridad</th>
              <th>Estado</th>
              <th>Creado</th>
            </tr>
          </thead>
          <tbody>
            {(rows || []).map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.title}</td>
                <td className="text-capitalize">{r.priority}</td>
                <td>
                  <select
                    className="form-select form-select-sm text-capitalize"
                    value={r.status || ''}
                    onChange={async (e)=>{
                      const val = e.target.value;
                      await statusMutation.mutateAsync({ id: r.id, status: val });
                    }}
                  >
                    <option value="abierto">Abierto</option>
                    <option value="en_proceso">En proceso</option>
                    <option value="resuelto">Resuelto</option>
                    <option value="cerrado">Cerrado</option>
                  </select>
                </td>
                <td>{r.created_at ? String(r.created_at).slice(0, 19).replace('T',' ') : ''}</td>
              </tr>
            ))}
            {(!rows || rows.length === 0) && !isLoading && <TableEmpty colSpan={5} label="Sin tickets" />}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between align-items-center">
        <div className="text-muted small">Total: {total}</div>
        <div className="btn-group">
          <button className="btn btn-outline-secondary" disabled={page<=1 || isLoading} onClick={()=>setPage(p=>Math.max(1,p-1))}>Anterior</button>
          <span className="btn btn-outline-secondary disabled">{page}/{totalPages}</span>
          <button className="btn btn-outline-secondary" disabled={page>=totalPages || isLoading} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Siguiente</button>
        </div>
      </div>

      {showModal && (
        <div className="modal fade show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nuevo ticket</h5>
                <button type="button" className="btn-close" onClick={()=>setShowModal(false)}></button>
              </div>
              <form onSubmit={onCreate}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Título</label>
                    <input className="form-control" value={form.title} onChange={e=>setForm({ ...form, title: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea className="form-control" rows={4} value={form.description} onChange={e=>setForm({ ...form, description: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Prioridad</label>
                    <select className="form-select" value={form.priority} onChange={e=>setForm({ ...form, priority: e.target.value })}>
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Adjunto (opcional)</label>
                    <input type="file" className="form-control" onChange={e=>setForm({ ...form, file: e.target.files?.[0] || null })} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={()=>setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={createMutation.isLoading}>{createMutation.isLoading ? 'Guardando...' : 'Crear'}</button>
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
