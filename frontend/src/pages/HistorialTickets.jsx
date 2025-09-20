import React from 'react';
import ModuloBase from '../components/ModuloBase';
import DataTable from '../components/DataTable';
import Toolbar from '../components/Toolbar';
import { useQuery } from 'react-query';
import { listTicketHistory, listTicketHistoryGlobal } from '../services/tickets';

export default function HistorialTickets() {
  const [ticketId, setTicketId] = React.useState('');
  const [q, setQ] = React.useState('');
  const [action, setAction] = React.useState('');
  const [range, setRange] = React.useState('30');
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10);

  const { data, isLoading } = useQuery(
    ['ticket-history', { ticketId, page, limit, q, action, range }],
    async () => {
      if (ticketId) {
        const resp = await listTicketHistory(ticketId, { page, limit });
        const rows = Array.isArray(resp?.data) ? resp.data : (resp?.rows || resp || []);
        const total = Number(resp?.total || rows.length || 0);
        return { rows, total };
      } else {
        const resp = await listTicketHistoryGlobal({ page, limit, q, action, range });
        const rows = Array.isArray(resp?.data) ? resp.data : (resp?.rows || resp || []);
        const total = Number(resp?.total || rows.length || 0);
        return { rows, total };
      }
    },
    { keepPreviousData: true }
  );

  return (
    <ModuloBase titulo="Historial de Tickets" descripcion="Listado de cambios de estado y acciones sobre tickets.">
      <Toolbar
        compact
        left={(
          <>
            <input className="form-control" style={{ minWidth: 160 }} placeholder="ID de ticket (opcional)"
                   value={ticketId} onChange={e=>{ setTicketId(e.target.value); setPage(1); }} />
            {!ticketId && (
              <>
                <input className="form-control" style={{ minWidth: 180 }} placeholder="Buscar (ticket/usuario)" value={q} onChange={e=>{ setQ(e.target.value); setPage(1); }} />
                <select className="form-select" value={action} onChange={e=>{ setAction(e.target.value); setPage(1); }}>
                  <option value="">Todas las acciones</option>
                  <option value="creado">Creado</option>
                  <option value="cambio">Cambio</option>
                  <option value="cambio a abierto">Cambio a abierto</option>
                  <option value="cambio a en_proceso">Cambio a en_proceso</option>
                  <option value="cambio a resuelto">Cambio a resuelto</option>
                  <option value="cambio a cerrado">Cambio a cerrado</option>
                </select>
                <select className="form-select" value={range} onChange={e=>{ setRange(e.target.value); setPage(1); }}>
                  <option value="7">Últimos 7 días</option>
                  <option value="30">Últimos 30 días</option>
                  <option value="90">Últimos 90 días</option>
                  <option value="all">Todo</option>
                </select>
              </>
            )}
            <div className="text-muted small d-flex align-items-center">{data?.total || 0} eventos</div>
          </>
        )}
        right={null}
      />
      <DataTable
        columns={[
          { header: 'ID', key: 'id', width: 80 },
          { header: 'Ticket', key: 'ticket_id' },
          { header: 'Acción', key: 'action' },
          { header: 'Usuario', key: 'user_name', render: r => r.user_name || r.performed_by },
          { header: 'Fecha', key: 'created_at', render: r => (r.created_at ? String(r.created_at).slice(0,19).replace('T',' ') : '—'), width: 160 },
        ]}
        rows={data?.rows || []}
        loading={isLoading}
      />
      <div className="d-flex justify-content-between align-items-center mt-2">
        <div className="text-muted small">Página {page}</div>
        <div className="btn-group">
          <button className="btn btn-outline-secondary" disabled={page<=1 || isLoading} onClick={()=>setPage(p=>Math.max(1,p-1))}>Anterior</button>
          <button className="btn btn-outline-secondary" disabled={(data?.rows?.length||0) < limit || isLoading} onClick={()=>setPage(p=>p+1)}>Siguiente</button>
        </div>
      </div>
    </ModuloBase>
  );
}
