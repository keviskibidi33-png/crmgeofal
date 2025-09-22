import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import ModuloBase from '../components/ModuloBase';
import { getQuote, listQuoteItems, updateQuote, updateQuoteItem } from '../services/quotes';

export default function DetalleCotizacion() {
  const { id } = useParams();
  const [row, setRow] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError('');
        const [q, its] = await Promise.all([
          getQuote(id),
          listQuoteItems(id)
        ]);
        setRow(q);
        setItems(Array.isArray(its?.data) ? its.data : (its || []));
      } catch (e) {
        setError(e.message || 'No se pudo cargar la cotización');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const subtotal = useMemo(() => {
    return items.reduce((acc, it) => acc + Number(it.partial_price || 0), 0);
  }, [items]);
  
  const derivedIgv = useMemo(() => Number((subtotal * 0.18).toFixed(2)), [subtotal]);
  const igvAmount = useMemo(() => {
    if (!row) return 0;
    if (typeof row.igv === 'number') return Number(row.igv);
    return derivedIgv;
  }, [row, derivedIgv]);
  const total = useMemo(() => Number((subtotal + igvAmount).toFixed(2)), [subtotal, igvAmount]);

  const exportUrl = (type) => {
    const base = import.meta.env?.VITE_API_URL?.replace(/\/$/, '') || '';
    const path = `/api/quotes/${id}/export/${type}`;
    return base && /\/api$/i.test(base) ? `${base}${path.replace(/^\/api/, '')}` : `${base}${path}`;
  };

  const onItemChange = (idx, field, value) => {
    setItems((prev) => {
      const next = [...prev];
      const cur = { ...next[idx], [field]: field === 'quantity' || field === 'unit_price' ? Number(value) : value };
      const qty = Number(cur.quantity || 0);
      const unit = Number(cur.unit_price || 0);
      cur.partial_price = Number((qty * unit).toFixed(2));
      next[idx] = cur;
      return next;
    });
  };

  const onHeaderChange = (field, value) => {
    setRow((prev) => ({ ...prev, [field]: value }));
  };

  const saveAll = async () => {
    try {
      setSaving(true);
      setError('');
      setMessage('');
      for (const it of items) {
        await updateQuoteItem(it.id, {
          code: it.code,
          description: it.description,
          norm: it.norm,
          unit_price: Number(it.unit_price || 0),
          quantity: Number(it.quantity || 0),
          partial_price: Number(it.partial_price || 0),
        });
      }
      const payload = {
        client_contact: row?.client_contact || null,
        client_email: row?.client_email || null,
        client_phone: row?.client_phone || null,
        issue_date: row?.issue_date || null,
        subtotal: Number(subtotal || 0),
        igv: Number(igvAmount || 0),
        total: Number(total || 0),
        status: row?.status || 'en_proceso',
        reference: row?.reference || null,
        meta: row?.meta || null,
      };
      const updated = await updateQuote(id, payload);
      setRow(updated);
      setMessage('Cambios guardados correctamente.');
    } catch (e) {
      setError(e.message || 'No se pudo guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModuloBase titulo={`Cotización #${id}`} descripcion="Detalle y edición de la cotización.">
      {loading && <div>Cargando...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {row && (
        <>
          <div className="row g-3">
            <div className="col-md-4"><strong>Proyecto:</strong> {row.project_name || row.project_id}</div>
            <div className="col-md-4">
              <label className="form-label mb-0"><strong>Emisión</strong></label>
              <input type="date" className="form-control form-control-sm" value={(row.issue_date||'').slice(0,10)} onChange={(e)=>onHeaderChange('issue_date', e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label mb-0"><strong>Estado</strong></label>
              <select className="form-select form-select-sm" value={row.status||'en_proceso'} onChange={(e)=>onHeaderChange('status', e.target.value)}>
                <option value="en_proceso">En proceso</option>
                <option value="enviado">Enviado</option>
                <option value="aprobado">Aprobado</option>
                <option value="rechazado">Rechazado</option>
              </select>
            </div>
            <div className="col-md-8">
              <label className="form-label mb-0"><strong>Referencia</strong></label>
              <input type="text" className="form-control form-control-sm" value={row.reference||''} onChange={(e)=>onHeaderChange('reference', e.target.value)} placeholder="Asunto / referencia" />
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <div className="form-check me-3">
                <input id="igvCheck" className="form-check-input" type="checkbox" checked={Number(igvAmount) > 0} onChange={(e)=>onHeaderChange('igv', e.target.checked ? derivedIgv : 0)} />
                <label className="form-check-label" htmlFor="igvCheck">Aplicar IGV 18%</label>
              </div>
              <div className="small text-muted">IGV actual: S/ {Number(igvAmount||0).toFixed(2)}</div>
            </div>
          </div>
          <div className="table-responsive mt-3">
            <table className="table table-bordered align-middle">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th>Norma</th>
                  <th>Unitario</th>
                  <th>Cantidad</th>
                  <th>Parcial</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={it.id}>
                    <td style={{width:'12rem'}}>
                      <input className="form-control form-control-sm" value={it.code||''} onChange={(e)=>onItemChange(idx,'code',e.target.value)} />
                    </td>
                    <td>
                      <textarea className="form-control form-control-sm" rows={2} value={it.description||''} onChange={(e)=>onItemChange(idx,'description',e.target.value)} />
                    </td>
                    <td style={{width:'10rem'}}>
                      <input className="form-control form-control-sm" value={it.norm||''} onChange={(e)=>onItemChange(idx,'norm',e.target.value)} />
                    </td>
                    <td style={{width:'10rem'}}>
                      <div className="input-group input-group-sm">
                        <span className="input-group-text">S/</span>
                        <input type="number" step="0.01" className="form-control" value={it.unit_price??0} onChange={(e)=>onItemChange(idx,'unit_price',e.target.value)} />
                      </div>
                    </td>
                    <td style={{width:'8rem'}}>
                      <input type="number" step="1" className="form-control form-control-sm" value={it.quantity??0} onChange={(e)=>onItemChange(idx,'quantity',e.target.value)} />
                    </td>
                    <td style={{width:'10rem'}}>S/ {Number(it.partial_price||0).toFixed(2)}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan="6" className="text-center text-muted">Sin ítems</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="d-flex justify-content-between align-items-start gap-4 mt-3">
            <div>
              {message && <div className="alert alert-success py-1 px-2 mb-2">{message}</div>}
              {error && <div className="alert alert-danger py-1 px-2 mb-2">{error}</div>}
              <button className="btn btn-primary" onClick={saveAll} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
            <div className="text-end">
              <div>Subtotal: S/ {subtotal.toFixed(2)}</div>
              <div>IGV: S/ {igvAmount.toFixed(2)}</div>
              <div><strong>Total: S/ {total.toFixed(2)}</strong></div>
            </div>
            <div className="d-flex gap-2">
              <a className="btn btn-outline-secondary" href={exportUrl('pdf')} target="_blank" rel="noreferrer">Exportar PDF</a>
              <a className="btn btn-outline-secondary" href={exportUrl('excel')} target="_blank" rel="noreferrer">Exportar Excel</a>
            </div>
          </div>
        </>
      )}
    </ModuloBase>
  );
}