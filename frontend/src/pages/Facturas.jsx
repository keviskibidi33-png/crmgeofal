import React, { useEffect, useMemo, useState } from 'react';
import ModuloBase from '../components/ModuloBase';
import Toolbar from '../components/Toolbar';
import TableEmpty from '../components/TableEmpty';
import { listInvoices, updateInvoiceStatus, createInvoice } from '../services/invoices';
import { listProjects } from '../services/projects';
import { listCompanies } from '../services/companies';
import { useQuery, useMutation, useQueryClient } from 'react-query';

const paymentStatusOptions = [
  { value: '', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'pagado', label: 'Pagado' },
  { value: 'vencido', label: 'Vencido' },
];

const statusBadgeClass = (s) => {
  const map = { pendiente: 'warning', pagado: 'success', vencido: 'danger' };
  return map[String(s || '').toLowerCase()] || 'secondary';
};

export default function Facturas() {
  const [filters, setFilters] = useState({ payment_status: '' });
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [error, setError] = useState('');
  const [companies, setCompanies] = useState([]);
  const [projects, setProjects] = useState([]);

  const projectById = useMemo(() => {
    const map = new Map();
    projects.forEach(p => map.set(p.id, p));
    return map;
  }, [projects]);

  useEffect(() => {
    (async () => {
      try {
        const [c, p] = await Promise.all([
          listCompanies({ page: 1, limit: 200 }),
          listProjects({ page: 1, limit: 500 }),
        ]);
        setCompanies(Array.isArray(c?.data) ? c.data : (c || []));
        setProjects(Array.isArray(p?.data) ? p.data : (p || []));
      } catch {}
    })();
  }, []);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ['invoices', { page, limit, payment_status: filters.payment_status || '' }],
    async () => {
      const resp = await listInvoices({ page, limit, payment_status: filters.payment_status || undefined });
      const rows = Array.isArray(resp?.data) ? resp.data : Array.isArray(resp) ? resp : [];
      const total = Number(resp?.total || rows.length || 0);
      return { rows, total };
    },
    { keepPreviousData: true }
  );

  const statusMutation = useMutation(({ id, payment_status }) => updateInvoiceStatus(id, payment_status), {
    onSuccess: () => queryClient.invalidateQueries('invoices')
  });

  // Modal simple de creación (mínimo viable)
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ project_id: '', quote_number: '', received_at: '', payment_due: '', payment_status: 'pendiente', amount: '' });
  const createDisabled = !form.project_id || !form.quote_number || !form.received_at || !form.payment_due || !form.amount;
  const createMutation = useMutation((payload) => createInvoice(payload), {
    onSuccess: () => {
      queryClient.invalidateQueries('invoices');
    }
  });
  const onCreate = async () => {
    try {
      await createMutation.mutateAsync({ ...form, amount: Number(form.amount) });
      setModalOpen(false);
      setForm({ project_id: '', quote_number: '', received_at: '', payment_due: '', payment_status: 'pendiente', amount: '' });
      setPage(1);
    } catch (e) {
      alert(e.message || 'No se pudo crear factura');
    }
  };

  return (
    <ModuloBase titulo="Gestión de Facturas" descripcion="Listado y gestión de facturas (jefa comercial/admin)">
      <Toolbar
        left={
          <>
            <div>
              <label className="form-label">Estado de pago</label>
              <select className="form-select" value={filters.payment_status} onChange={e=>{ setPage(1); setFilters(f=>({ ...f, payment_status: e.target.value })); }}>
                {paymentStatusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </>
        }
        right={
          <>
            <button className="btn btn-primary" onClick={()=>setModalOpen(true)}>Nueva factura</button>
          </>
        }
      />

  {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive mt-2">
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Proyecto</th>
              <th>Quote #</th>
              <th>Recibida</th>
              <th>Vence</th>
              <th>Monto</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {(data?.rows || []).map(inv => (
              <tr key={inv.id}>
                <td>{inv.id}</td>
                <td>{projectById.get(inv.project_id)?.name || inv.project_id}</td>
                <td>{inv.quote_number}</td>
                <td>{inv.received_at?.slice(0,10)}</td>
                <td>{inv.payment_due?.slice(0,10)}</td>
                <td>S/ {Number(inv.amount||0).toFixed(2)}</td>
                <td>
                  <select className={`form-select form-select-sm badge-select text-bg-${statusBadgeClass(inv.payment_status)}`}
                    value={inv.payment_status || ''}
                    onChange={e=>statusMutation.mutate({ id: inv.id, payment_status: e.target.value })}
                  >
                    {paymentStatusOptions.filter(o=>o.value!=='').map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {(!data?.rows || data.rows.length === 0) && !isLoading && <TableEmpty colSpan={7} label="Sin facturas" />}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-2">
        <button className="btn btn-outline-secondary" disabled={page===1 || isLoading} onClick={()=>setPage(p=>p-1)}>Anterior</button>
        <span>Página {page} de {Math.max(1, Math.ceil((data?.total||0)/limit))}</span>
        <button className="btn btn-outline-secondary" disabled={page*limit>=(data?.total||0) || isLoading} onClick={()=>setPage(p=>p+1)}>Siguiente</button>
      </div>

      {/* Modal simple */}
      {modalOpen && (
        <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.35)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nueva Factura</h5>
                <button type="button" className="btn-close" onClick={()=>setModalOpen(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-2">
                  <label className="form-label">Proyecto</label>
                  <select className="form-select" value={form.project_id} onChange={e=>setForm(f=>({...f, project_id: e.target.value }))}>
                    <option value="">Seleccione</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="row g-2">
                  <div className="col">
                    <label className="form-label">Quote #</label>
                    <input className="form-control" value={form.quote_number} onChange={e=>setForm(f=>({...f, quote_number: e.target.value }))} />
                  </div>
                  <div className="col">
                    <label className="form-label">Monto</label>
                    <input type="number" className="form-control" value={form.amount} onChange={e=>setForm(f=>({...f, amount: e.target.value }))} />
                  </div>
                </div>
                <div className="row g-2 mt-1">
                  <div className="col">
                    <label className="form-label">Recibida</label>
                    <input type="date" className="form-control" value={form.received_at} onChange={e=>setForm(f=>({...f, received_at: e.target.value }))} />
                  </div>
                  <div className="col">
                    <label className="form-label">Vence</label>
                    <input type="date" className="form-control" value={form.payment_due} onChange={e=>setForm(f=>({...f, payment_due: e.target.value }))} />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="form-label">Estado</label>
                  <select className="form-select" value={form.payment_status} onChange={e=>setForm(f=>({...f, payment_status: e.target.value }))}>
                    {paymentStatusOptions.filter(o=>o.value!=='').map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={()=>setModalOpen(false)}>Cancelar</button>
                <button className="btn btn-primary" disabled={createDisabled} onClick={onCreate}>Crear</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ModuloBase>
  );
}

