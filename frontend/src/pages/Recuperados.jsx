import React, { useEffect, useMemo, useState } from 'react';
import ModuloBase from '../components/ModuloBase';
import Toolbar from '../components/Toolbar';
import DataTable from '../components/DataTable';
import Toast from '../components/Toast';
import { listRecuperados } from '../services/recuperados';

export default function Recuperados() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [months, setMonths] = useState(3);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, variant: 'success', message: '' });

  const load = async () => {
    try {
      setLoading(true);
      const resp = await listRecuperados({ page, limit, months });
      const data = Array.isArray(resp?.data) ? resp.data : (resp?.rows || resp || []);
      setRows(data);
      setTotal(resp?.total ?? data.length);
    } catch (err) {
      setToast({ show: true, variant: 'danger', message: err.message || 'No se pudo cargar' });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, months]);

  const columns = useMemo(() => ([
    { header: 'ID', key: 'id', width: 80 },
    { header: 'Cliente', key: 'name' },
    { header: 'RUC', key: 'ruc', width: 140 },
    { header: 'Dirección', key: 'address' },
    { header: 'Creado', key: 'created_at', render: r => (r.created_at ? String(r.created_at).slice(0,10) : '—'), width: 120 },
  ]), []);

  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));

  return (
    <ModuloBase titulo="Clientes Recuperados" descripcion="Empresas sin proyectos en los últimos meses (seguimiento comercial)">
      <Toolbar
        compact
        left={
          <div className="row g-2 w-100">
            <div className="col-6 col-md-3">
              <label className="form-label">Meses sin proyectos</label>
              <select className="form-select" value={months} onChange={e=>{ setMonths(parseInt(e.target.value)||3); setPage(1); }}>
                <option value={1}>1 mes</option>
                <option value={3}>3 meses</option>
                <option value={6}>6 meses</option>
                <option value={12}>12 meses</option>
              </select>
            </div>
          </div>
        }
        right={
          <div className="d-flex gap-2">
            <button className="btn btn-outline-primary" onClick={()=>{ setPage(1); load(); }} disabled={loading}>{loading ? 'Cargando...' : 'Refrescar'}</button>
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
