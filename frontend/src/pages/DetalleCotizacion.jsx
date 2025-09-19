import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import ModuloBase from '../components/ModuloBase';
import { getQuote, listQuoteItems } from '../services/quotes';

export default function DetalleCotizacion() {
  const { id } = useParams();
  const [row, setRow] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
  const igvAmount = useMemo(() => Number(row?.igv || 0), [row]);
  const total = useMemo(() => Number(row?.total || (subtotal + igvAmount)), [row, subtotal, igvAmount]);

  const exportUrl = (type) => {
    const base = import.meta.env?.VITE_API_URL?.replace(/\/$/, '') || '';
    const path = `/api/quotes/${id}/export/${type}`;
    return base && /\/api$/i.test(base) ? `${base}${path.replace(/^\/api/, '')}` : `${base}${path}`;
  };

  return (
    <ModuloBase titulo={`Cotización #${id}`} descripcion="Detalle y edición básica de la cotización">
      {loading && <div>Cargando...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {row && (
        <>
          <div className="row g-3">
            <div className="col-md-4"><strong>Proyecto:</strong> {row.project_name || row.project_id}</div>
            <div className="col-md-4"><strong>Emisión:</strong> {row.issue_date?.slice(0,10)}</div>
            <div className="col-md-4"><strong>Estado:</strong> {row.status}</div>
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
                {items.map(it => (
                  <tr key={it.id}>
                    <td>{it.code}</td>
                    <td>{it.description}</td>
                    <td>{it.norm}</td>
                    <td>S/ {Number(it.unit_price||0).toFixed(2)}</td>
                    <td>{it.quantity}</td>
                    <td>S/ {Number(it.partial_price||0).toFixed(2)}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan="6" className="text-center text-muted">Sin ítems</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="d-flex justify-content-end gap-4">
            <div className="text-end">
              <div>Subtotal: S/ {subtotal.toFixed(2)}</div>
              <div>IGV: S/ {igvAmount.toFixed(2)}</div>
              <div><strong>Total: S/ {total.toFixed(2)}</strong></div>
            </div>
            <a className="btn btn-outline-secondary" href={exportUrl('pdf')} target="_blank" rel="noreferrer">PDF</a>
            <a className="btn btn-outline-secondary" href={exportUrl('excel')} target="_blank" rel="noreferrer">Excel</a>
          </div>
        </>
      )}
    </ModuloBase>
  );
}
