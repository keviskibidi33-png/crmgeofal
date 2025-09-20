import React, { useEffect, useMemo, useState } from 'react';
import ModuloBase from '../components/ModuloBase';
import { listQuotes, createQuote, listQuoteItems, addQuoteItem } from '../services/quotes';
import { listCompanies } from '../services/companies';
import { listProjects } from '../services/projects';
import { Link, useNavigate } from 'react-router-dom';

export default function ListaCotizaciones() {
  const [companies, setCompanies] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState({ company_id: '', project_id: '' });
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

  return (
    <ModuloBase titulo="Cotizaciones" descripcion="Lista de cotizaciones por cliente y proyecto">
      <div className="row g-2 align-items-end">
        <div className="col-md-4">
          <label className="form-label">Cliente</label>
          <select className="form-select" value={filters.company_id} onChange={e=>setFilters({ ...filters, company_id: e.target.value, project_id: '' })}>
            <option value="">Todos</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Proyecto</label>
          <select className="form-select" value={filters.project_id} onChange={e=>setFilters({ ...filters, project_id: e.target.value })}>
            <option value="">Todos</option>
            {filteredProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="col-md-2 d-grid">
          <button className="btn btn-outline-primary" onClick={loadData} disabled={loading}>{loading ? 'Cargando...' : 'Filtrar'}</button>
        </div>
        <div className="col-md-2 d-grid">
          <Link to="/cotizaciones/nueva/lem" className="btn btn-primary">Nueva LEM</Link>
        </div>
      </div>

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
                <td>{row.status}</td>
                <td className="d-flex gap-2">
                  <Link to={`/cotizaciones/${row.id}`} className="btn btn-sm btn-outline-secondary">Ver/Editar</Link>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => onClone(row)}>Clonar</button>
                  <a className="btn btn-sm btn-outline-success" href={exportUrl(row, 'pdf')} target="_blank" rel="noreferrer">PDF</a>
                  <a className="btn btn-sm btn-outline-success" href={exportUrl(row, 'excel')} target="_blank" rel="noreferrer">Excel</a>
                </td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr>
                <td colSpan="8" className="text-center text-muted">Sin resultados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ModuloBase>
  );
}
