import React, { useMemo, useState } from 'react';
import ModuloBase from '../components/ModuloBase';
import DataTable from '../components/DataTable';
import Toolbar from '../components/Toolbar';
import { useQuery } from 'react-query';
import { listAudit } from '../services/audit';

export default function Auditoria() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const { data, isLoading } = useQuery(['audit', { page, limit }], async () => {
    const resp = await listAudit({ page, limit });
    const rows = Array.isArray(resp?.data) ? resp.data : (resp?.rows || resp || []);
    const total = Number(resp?.total || rows.length || 0);
    return { rows, total };
  }, { keepPreviousData: true });

  const columns = useMemo(() => ([
    { header: 'ID', key: 'id', width: 80 },
    { header: 'Acción', key: 'action' },
    { header: 'Usuario', key: 'user_name', render: r => r.user_name || r.performed_by || r.user_id },
    { header: 'Fecha', key: 'performed_at', render: r => (r.performed_at ? String(r.performed_at).slice(0,19).replace('T',' ') : (r.created_at ? String(r.created_at).slice(0,19).replace('T',' ') : '—')), width: 160 },
    { header: 'Notas', key: 'notes' },
  ]), []);

  const total = data?.total || 0;
  const rows = data?.rows || [];
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <ModuloBase titulo="Auditoría" descripcion="Registro de acciones relevantes del sistema.">
      <Toolbar
        compact
        left={<div className="text-muted">Total: {total}</div>}
        right={
          <div className="btn-group">
            <button className="btn btn-outline-secondary" disabled={page<=1 || isLoading} onClick={()=>setPage(p=>Math.max(1,p-1))}>Anterior</button>
            <span className="btn btn-outline-secondary disabled">{page}/{totalPages}</span>
            <button className="btn btn-outline-secondary" disabled={page>=totalPages || isLoading} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Siguiente</button>
          </div>
        }
      />
      <DataTable columns={columns} rows={rows} loading={isLoading} />
    </ModuloBase>
  );
}
