import React, { useEffect, useMemo, useState } from 'react';
import ModuloBase from '../components/ModuloBase';
import TableEmpty from '../components/TableEmpty';
import Toolbar from '../components/Toolbar';
import { listQuotes, createQuote, listQuoteItems, addQuoteItem } from '../services/quotes';
import { listCompanies } from '../services/companies';
import { listProjects } from '../services/projects';
import { Link, useNavigate } from 'react-router-dom';

export default function ListaCotizaciones() {
  const [companies, setCompanies] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState({ company_id: '', project_id: '', status: '', date_from: '', date_to: '' });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [cRes, pRes] = await Promise.all([
          listCompanies({ page: 1, limit: 100 }),
          listProjects({ page: 1, limit: 200 }),
        ]);
        setCompanies(Array.isArray(cRes?.data) ? cRes.data : (cRes || []));
        setProjects(Array.isArray(pRes?.data) ? pRes.data : (pRes || []));
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
  const params = {};
      if (filters.company_id) params.company_id = filters.company_id;
      if (filters.project_id) params.project_id = filters.project_id;
  if (filters.status) params.status = filters.status;
  if (filters.date_from) params.date_from = filters.date_from;
  if (filters.date_to) params.date_to = filters.date_to;
      const resp = await listQuotes(params);
      const arr = Array.isArray(resp)
        ? resp
        : Array.isArray(resp?.data)
        ? resp.data
        : Array.isArray(resp?.rows)
        ? resp.rows
        : [];
      setRows(arr);
    } catch (e) {
      setError(e.message || 'No se pudo cargar cotizaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []); // initial

  const filteredProjects = useMemo(() => {
    if (!filters.company_id) return projects;
    const cid = Number(filters.company_id);
    return projects.filter(p => Number(p.company_id) === cid);
  }, [projects, filters.company_id]);

  const onClone = async (row) => {
    try {
      const payload = {
        project_id: row.project_id,
        variant_id: row.variant_id || null,
        client_contact: row.client_contact,
        client_email: row.client_email,
        client_phone: row.client_phone,
        issue_date: new Date().toISOString().slice(0,10),
        subtotal: row.subtotal,
        igv: row.igv,
        total: row.total,
        status: 'borrador',
        meta: { from_quote_id: row.id, ...row.meta }
      };
      const created = await createQuote(payload);
      // Copiar ítems
      const its = await listQuoteItems(row.id);
      const items = Array.isArray(its?.data) ? its.data : (its || []);
      for (const it of items) {
        await addQuoteItem({
          quote_id: created.id,
          code: it.code,
          description: it.description,
          norm: it.norm,
          unit_price: Number(it.unit_price || 0),
          quantity: Number(it.quantity || 0),
          partial_price: Number(it.partial_price || 0),
        });
      }
      navigate(`/cotizaciones/${created.id}`);
    } catch (e) {
      alert('No se pudo clonar');
    }
  };

  const exportUrl = (row, type) => {
    const base = import.meta.env?.VITE_API_URL?.replace(/\/$/, '') || '';
    const path = `/api/quotes/${row.id}/export/${type}`;
    return base && /\/api$/i.test(base) ? `${base}${path.replace(/^\/api/, '')}` : `${base}${path}`;
  };

  const setPreset = (preset) => {
    const today = new Date();
    if (preset === 'today') {
      const d = today.toISOString().slice(0,10);
      setFilters(f => ({ ...f, date_from: d, date_to: d }));
      return;
    }
    if (preset === '7d') {
      const to = today.toISOString().slice(0,10);
      const fromDate = new Date(today); fromDate.setDate(today.getDate() - 6);
      const from = fromDate.toISOString().slice(0,10);
      setFilters(f => ({ ...f, date_from: from, date_to: to }));
      return;
    }
    if (preset === 'month') {
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const first = `${y}-${m}-01`;
      const nextMonth = new Date(y, today.getMonth() + 1, 1);
      const last = new Date(nextMonth - 1);
      const lastStr = last.toISOString().slice(0,10);
      setFilters(f => ({ ...f, date_from: first, date_to: lastStr }));
    }
  };

  const StatusBadge = ({ status }) => {
    const map = {
      borrador: 'secondary',
      enviado: 'primary',
      aceptado: 'success',
      rechazado: 'danger',
    };
    const cls = map[String(status || '').toLowerCase()] || 'secondary';
    return <span className={`badge text-bg-${cls} text-capitalize`}>{status || '—'}</span>;
  };

  return (
    <ModuloBase titulo="Cotizaciones" descripcion="Lista de cotizaciones por cliente y proyecto">
      <Toolbar
        compact
        left={
          <div className="row g-2 w-100">
            <div className="col-12 col-md-3">
              <label className="form-label">Cliente</label>
              <select className="form-select" value={filters.company_id} onChange={e=>setFilters({ ...filters, company_id: e.target.value, project_id: '' })}>
                <option value="">Todos</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label">Proyecto</label>
              <select className="form-select" value={filters.project_id} onChange={e=>setFilters({ ...filters, project_id: e.target.value })}>
                <option value="">Todos</option>
                {filteredProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label">Estado</label>
              <select className="form-select" value={filters.status} onChange={e=>setFilters({ ...filters, status: e.target.value })}>
                <option value="">Todos</option>
                <option value="borrador">Borrador</option>
                <option value="enviado">Enviado</option>
                <option value="aceptado">Aceptado</option>
                <option value="rechazado">Rechazado</option>
              </select>
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label">Desde</label>
              <input type="date" className="form-control" value={filters.date_from} onChange={e=>setFilters({ ...filters, date_from: e.target.value })} />
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label">Hasta</label>
              <input type="date" className="form-control" value={filters.date_to} onChange={e=>setFilters({ ...filters, date_to: e.target.value })} />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label">Presets</label>
              <div className="d-flex gap-2 flex-wrap">
                <button className="btn btn-sm btn-outline-secondary" type="button" onClick={()=>setPreset('today')}>Hoy</button>
                <button className="btn btn-sm btn-outline-secondary" type="button" onClick={()=>setPreset('7d')}>7 días</button>
                <button className="btn btn-sm btn-outline-secondary" type="button" onClick={()=>setPreset('month')}>Este mes</button>
              </div>
            </div>
          </div>
        }
        right={
          <div className="d-flex gap-2 flex-wrap">
            <button className="btn btn-outline-primary" onClick={loadData} disabled={loading}>{loading ? 'Cargando...' : 'Filtrar'}</button>
            <Link to="/cotizaciones/nueva/lem" className="btn btn-primary">Nueva LEM</Link>
          </div>
        }
      />

      {error && <div className="alert alert-danger mt-3">{error}</div>}

      <div className="table-responsive mt-3">
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Proyecto</th>
              <th>Fecha</th>
              <th>Subtotal</th>
              <th>IGV</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(Array.isArray(rows) ? rows : []).map(row => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.project_name || row.project_id}</td>
                <td>{row.issue_date?.slice(0,10)}</td>
                <td>S/ {Number(row.subtotal||0).toFixed(2)}</td>
                <td>S/ {Number(row.igv||0).toFixed(2)}</td>
                <td><strong>S/ {Number(row.total||0).toFixed(2)}</strong></td>
                <td><StatusBadge status={row.status} /></td>
                <td className="d-flex gap-2">
                  <Link to={`/cotizaciones/${row.id}`} className="btn btn-sm btn-outline-secondary">Ver/Editar</Link>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => onClone(row)}>Clonar</button>
                  <a className="btn btn-sm btn-outline-success" href={exportUrl(row, 'pdf')} target="_blank" rel="noreferrer">PDF</a>
                  <a className="btn btn-sm btn-outline-success" href={exportUrl(row, 'excel')} target="_blank" rel="noreferrer">Excel</a>
                </td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <TableEmpty colSpan={8} label="Sin resultados" />
            )}
          </tbody>
        </table>
      </div>
    </ModuloBase>
  );
}
