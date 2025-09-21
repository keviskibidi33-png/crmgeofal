import React from 'react';
import ModuloBase from '../components/ModuloBase';
import DataTable from '../components/DataTable';
import Toolbar from '../components/Toolbar';
import Modal from '../components/Modal';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { listNoticesByProject, listAllNotices, createNotice } from '../services/whatsappNotices';

export default function NotificacionesWhatsapp() {
  // Filters (placeholders for future global list). Currently we need project_id to list.
  const [projectId, setProjectId] = React.useState('');
  const [q, setQ] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [range, setRange] = React.useState('30');
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ sent_to: '', message: '' });

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ['whatsapp-notices', { projectId, page, limit, q, status, range }],
    async () => {
      if (projectId) {
        const resp = await listNoticesByProject(projectId, { page, limit });
        const rows = Array.isArray(resp?.data) ? resp.data : (resp?.rows || resp || []);
        const total = Number(resp?.total || rows.length || 0);
        return { rows, total };
      } else {
        const resp = await listAllNotices({ page, limit, q, status, range });
        const rows = Array.isArray(resp?.data) ? resp.data : (resp?.rows || resp || []);
        const total = Number(resp?.total || rows.length || 0);
        return { rows, total };
      }
    },
    { keepPreviousData: true }
  );

  const createMut = useMutation(createNotice, {
    onSuccess: () => {
      queryClient.invalidateQueries('whatsapp-notices');
      setOpen(false);
      setForm({ sent_to: '', message: '' });
    }
  });

  return (
    <ModuloBase titulo="Notificaciones WhatsApp" descripcion="Historial y estado de notificaciones enviadas por WhatsApp.">
      <Toolbar
        compact
        left={(
          <>
            <input className="form-control" style={{ minWidth: 160 }} placeholder="ID de proyecto (opcional)"
                   value={projectId} onChange={e=>{ setProjectId(e.target.value); setPage(1); }} />
            {!projectId && (
              <>
                <input className="form-control" style={{ minWidth: 200 }} placeholder="Buscar (destinatario/mensaje)" value={q} onChange={e=>{ setQ(e.target.value); setPage(1); }} />
                <select className="form-select" value={status} onChange={e=>{ setStatus(e.target.value); setPage(1); }}>
                  <option value="">Todos los estados</option>
                  <option value="queued">En cola</option>
                  <option value="sent">Enviado</option>
                  <option value="delivered">Entregado</option>
                  <option value="failed">Fallido</option>
                </select>
                <select className="form-select" value={range} onChange={e=>{ setRange(e.target.value); setPage(1); }}>
                  <option value="7">Últimos 7 días</option>
                  <option value="30">Últimos 30 días</option>
                  <option value="90">Últimos 90 días</option>
                  <option value="all">Todo</option>
                </select>
              </>
            )}
            <div className="text-muted small d-flex align-items-center">{data?.total || 0} resultados</div>
          </>
        )}
        right={(
          <>
            <button className="btn btn-primary" disabled={!projectId} onClick={()=>setOpen(true)}>+ Enviar aviso</button>
          </>
        )}
      />
      <DataTable
        columns={[
          { header: 'ID', key: 'id', width: 80 },
          { header: 'Destinatario', key: 'sent_to', render: r => r.sent_to || r.to },
          { header: 'Mensaje', key: 'message' },
          { header: 'Estado', key: 'status' },
          { header: 'Fecha', key: 'sent_at', render: r => (r.sent_at ? String(r.sent_at).slice(0,19).replace('T',' ') : (r.created_at ? String(r.created_at).slice(0,19).replace('T',' ') : '—')), width: 160 },
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

      <Modal open={open} onClose={()=>setOpen(false)}>
        <h5 className="mb-2">Enviar aviso WhatsApp</h5>
        <div className="text-muted mb-3">Proyecto #{projectId}</div>
        <div className="mb-2">
          <label className="form-label">Destinatario</label>
          <input className="form-control" value={form.sent_to} onChange={e=>setForm({ ...form, sent_to: e.target.value })} placeholder="Ej. +51999999999" />
        </div>
        <div className="mb-3">
          <label className="form-label">Mensaje</label>
          <textarea className="form-control" rows={4} value={form.message} onChange={e=>setForm({ ...form, message: e.target.value })} />
        </div>
        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-outline-secondary" onClick={()=>setOpen(false)}>Cancelar</button>
          <button className="btn btn-primary" disabled={!projectId || !form.sent_to || !form.message || createMut.isLoading}
                  onClick={()=>createMut.mutate({ project_id: Number(projectId), sent_to: form.sent_to, message: form.message })}>
            {createMut.isLoading ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </Modal>
    </ModuloBase>
  );
}
