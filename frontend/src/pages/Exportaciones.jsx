import React from 'react';
import ModuloBase from '../components/ModuloBase';
import DataTable from '../components/DataTable';
import Toolbar from '../components/Toolbar';
import { exportExcel, exportPDF } from '../services/exports';
import { useQuery } from 'react-query';
import { listExportHistory } from '../services/exportsHistory';

export default function Exportaciones() {
  const [q, setQ] = React.useState('');
  const [type, setType] = React.useState('');
  const [range, setRange] = React.useState('30');
  const [downloading, setDownloading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10);
  const { data, isLoading } = useQuery(['export-history', { page, limit, q, type, range }], async () => {
    const resp = await listExportHistory({ page, limit, q, type, range });
    const rows = Array.isArray(resp?.data) ? resp.data : (resp?.rows || resp || []);
    const total = Number(resp?.total || rows.length || 0);
    return { rows, total };
  }, { keepPreviousData: true });
  const rows = data?.rows || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const onClear = () => { setQ(''); setType(''); setRange('30'); setPage(1); };

  return (
    <ModuloBase titulo="Exportaciones" descripcion="Historial de exportaciones realizadas (PDF/Excel/CSV).">
      <Toolbar
        compact
        left={(
          <>
            <input
              className="form-control"
              style={{ minWidth: 220 }}
              placeholder="Buscar por recurso o usuario"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
            <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
              <option value="">Todos los tipos</option>
              <option value="pdf">PDF</option>
              <option value="xlsx">Excel</option>
              <option value="csv">CSV</option>
            </select>
            <select className="form-select" value={range} onChange={e => setRange(e.target.value)}>
              <option value="7">Últimos 7 días</option>
              <option value="30">Últimos 30 días</option>
              <option value="90">Últimos 90 días</option>
              <option value="all">Todo</option>
            </select>
          </>
        )}
        right={(
          <>
            <button className="btn btn-outline-secondary" onClick={onClear}>Limpiar</button>
            <div className="vr mx-2" />
            <button className="btn btn-success" disabled={!type || downloading}
                    onClick={async ()=>{ try { setDownloading(true); await exportExcel({ type }); } finally { setDownloading(false); } }}>
              {downloading ? 'Descargando...' : 'Exportar Excel'}
            </button>
            <button className="btn btn-danger" disabled={!type || downloading}
                    onClick={async ()=>{ try { setDownloading(true); await exportPDF({ type }); } finally { setDownloading(false); } }}>
              {downloading ? 'Descargando...' : 'Exportar PDF'}
            </button>
          </>
        )}
      />
      <DataTable
        columns={[
          { header: 'ID', key: 'id', width: 80 },
          { header: 'Tipo', key: 'type' },
          { header: 'Recurso', key: 'resource' },
          { header: 'Fecha', key: 'created_at', render: r => (r.created_at ? String(r.created_at).slice(0,19).replace('T',' ') : '—'), width: 160 },
          { header: 'Usuario', key: 'user_name' },
        ]}
        rows={rows}
        loading={isLoading}
      />
      <div className="d-flex justify-content-between align-items-center mt-2">
        <div className="text-muted small">Total: {total}</div>
        <div className="btn-group">
          <button className="btn btn-outline-secondary" disabled={page<=1 || isLoading} onClick={()=>setPage(p=>Math.max(1,p-1))}>Anterior</button>
          <span className="btn btn-outline-secondary disabled">{page}/{totalPages}</span>
          <button className="btn btn-outline-secondary" disabled={page>=totalPages || isLoading} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Siguiente</button>
        </div>
      </div>
    </ModuloBase>
  );
}
