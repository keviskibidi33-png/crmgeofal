import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import ModuloBase from '../components/ModuloBase';
import { getQuote, updateQuote } from '../services/quotes';
import QuoteEvidences from '../components/QuoteEvidences';

export default function DetalleCotizacion() {
  const { id } = useParams();
  const [row, setRow] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showItems, setShowItems] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError('');
        const q = await getQuote(id);
        
        // Parsear meta para extraer datos del cliente y de items
        let meta = null;
        if (q.meta && typeof q.meta === 'string') {
          try {
            meta = JSON.parse(q.meta);
          } catch (e) {
            meta = null;
          }
        } else if (q.meta && typeof q.meta === 'object') {
          meta = q.meta;
        }
        
        // Enriquecer la cotización con datos del meta
        if (meta) {
          // Agregar razón social y RUC desde meta.customer
          if (meta.customer) {
            q.client_company = meta.customer.company_name || q.company_name;
            q.client_ruc = meta.customer.ruc || q.company_ruc;
          }
          
          // Cargar ítems
          if (meta.items) {
            setItems(meta.items);
          } else {
            setItems([]);
          }
        } else {
          setItems([]);
        }
        
        setRow(q);
      } catch (e) {
        setError(e.message || 'No se pudo cargar la cotización');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const subtotal = useMemo(() => {
    if (row && row.subtotal) return Number(row.subtotal);
    return items.reduce((acc, it) => {
      const partial = it.partial_price || (Number(it.unit_price || 0) * Number(it.quantity || 0));
      return acc + Number(partial);
    }, 0);
  }, [items, row]);
  
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
      // Los ítems se manejan en el frontend, no se guardan en el backend
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
    <ModuloBase titulo={`📋 Evidencias - Cotización #${id}`} descripcion="Gestión de evidencias de la cotización">
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      )}
      {error && <div className="alert alert-danger">{error}</div>}
      {row && (
        <>
          {/* Información Resumida de la Cotización */}
          <div className="card mb-4 shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">📄 Información de la Cotización</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <strong className="text-muted d-block small">Razón Social</strong>
                  <div className="fs-6 fw-bold">{row.client_company || row.client_contact || 'No especificado'}</div>
                  {row.client_ruc && <small className="text-muted">RUC: {row.client_ruc}</small>}
                </div>
                <div className="col-md-4">
                  <strong className="text-muted d-block small">Contacto</strong>
                  <div className="fs-6">{row.client_contact || 'No especificado'}</div>
                  {row.client_email && <small className="text-muted d-block">{row.client_email}</small>}
                  {row.client_phone && <small className="text-muted">📞 {row.client_phone}</small>}
                </div>
                <div className="col-md-2">
                  <strong className="text-muted d-block small">Fecha de Emisión</strong>
                  <div className="fs-6">{row.issue_date ? new Date(row.issue_date).toLocaleDateString('es-ES') : 'No especificada'}</div>
                </div>
                <div className="col-md-2">
                  <strong className="text-muted d-block small">Estado</strong>
                  <div className="fs-6">
                    <span className={`badge ${
                      row.status === 'aprobado' ? 'bg-success' :
                      row.status === 'enviado' ? 'bg-primary' :
                      row.status === 'rechazado' ? 'bg-danger' : 'bg-secondary'
                    }`}>
                      {row.status === 'en_proceso' ? 'En proceso' :
                       row.status === 'enviado' ? 'Enviado' :
                       row.status === 'aprobado' ? 'Aprobado' :
                       row.status === 'rechazado' ? 'Rechazado' : row.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="row g-3 mt-2">
                <div className="col-md-3">
                  <strong className="text-muted d-block small">Cantidad de Ítems</strong>
                  <div className="d-flex align-items-center gap-2">
                    <div className="fs-6">{items.length} ítem{items.length !== 1 ? 's' : ''}</div>
                    {items.length > 0 && (
                      <div className="form-check">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="showItems" 
                          checked={showItems}
                          onChange={(e) => setShowItems(e.target.checked)}
                        />
                        <label className="form-check-label small" htmlFor="showItems">
                          Ver detalles
                        </label>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-md-3">
                  <strong className="text-muted d-block small">Total</strong>
                  <div className="fs-5 fw-bold text-success">S/ {total.toFixed(2)}</div>
                  <small className="text-muted">IGV: S/ {igvAmount.toFixed(2)}</small>
                </div>
                {row.reference && (
                  <div className="col-md-7">
                    <strong className="text-muted d-block small">Referencia</strong>
                    <div className="fs-6">{row.reference}</div>
                  </div>
                )}
              </div>

              {/* Listado de Ítems - Solo se muestra si está marcado el checkbox */}
              {items.length > 0 && showItems && (
                <div className="mt-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong className="text-muted small">Ítems de la Cotización</strong>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setShowItems(false)}
                    >
                      Ocultar
                    </button>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-sm table-hover">
                      <thead className="table-light">
                        <tr>
                          <th style={{width: '10%'}}>Código</th>
                          <th style={{width: '40%'}}>Descripción</th>
                          <th style={{width: '15%'}}>Norma</th>
                          <th style={{width: '12%'}}>P. Unit.</th>
                          <th style={{width: '8%'}}>Cant.</th>
                          <th style={{width: '15%'}} className="text-end">Parcial</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, idx) => (
                          <tr key={idx}>
                            <td><small>{item.code || '-'}</small></td>
                            <td><small>{item.description || '-'}</small></td>
                            <td><small>{item.norm || '-'}</small></td>
                            <td><small>S/ {Number(item.unit_price || 0).toFixed(2)}</small></td>
                            <td><small>{item.quantity || 0}</small></td>
                            <td className="text-end">
                              <small className="fw-bold">
                                S/ {(Number(item.unit_price || 0) * Number(item.quantity || 0)).toFixed(2)}
                              </small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="table-light">
                        <tr>
                          <td colSpan="5" className="text-end"><strong>Subtotal:</strong></td>
                          <td className="text-end"><strong>S/ {subtotal.toFixed(2)}</strong></td>
                        </tr>
                        <tr>
                          <td colSpan="5" className="text-end"><strong>IGV 18%:</strong></td>
                          <td className="text-end"><strong>S/ {igvAmount.toFixed(2)}</strong></td>
                        </tr>
                        <tr>
                          <td colSpan="5" className="text-end"><strong>Total:</strong></td>
                          <td className="text-end"><strong className="text-success fs-5">S/ {total.toFixed(2)}</strong></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sección de Evidencias */}
          <QuoteEvidences quoteId={id} />
        </>
      )}
    </ModuloBase>
  );
}