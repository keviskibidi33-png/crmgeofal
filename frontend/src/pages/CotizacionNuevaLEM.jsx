import React, { useEffect, useMemo, useState } from 'react';
import ModuloBase from '../components/ModuloBase';
import { listVariants } from '../services/quoteVariants';
import { createQuote, addQuoteItem } from '../services/quotes';
import CompanyProjectPicker from '../components/CompanyProjectPicker';

// Plantilla de creación de cotización para Laboratorio (LEM)
// Requisitos clave cubiertos:
// - Datos fijos del cliente y del proyecto
// - Datos de la cotización (fechas, comercial)
// - Tabla de ítems (código, descripción, norma, precio unitario, cantidad, parcial)
// - Selección de variante (condiciones predefinidas)
// - Condiciones de pago (adelantado/50%/crédito) y aceptación
// - Generación de nombre de archivo sugerido (no genera PDF aún)

const emptyClient = {
  company_name: '', ruc: '', contact_name: '', contact_phone: '', contact_email: '',
  project_location: '', project_name: '', service_name: '',
};

const emptyQuote = {
  request_date: '', issue_date: '', commercial_name: '', payment_terms: 'adelantado', acceptance: false, reference: '', igv: true,
};

const emptyItem = { code: '', description: '', norm: '', unit_price: 0, quantity: 1 };

function computePartial(item) {
  const u = Number(item.unit_price || 0);
  const q = Number(item.quantity || 0);
  return Number((u * q).toFixed(2));
}

function suggestedFileName(seq = 'xxx-XX', client = '') {
  const clientName = (client || '').toUpperCase().trim() || 'NOMBRE DEL CLIENTE';
  return `Cotización ${seq} LEM-GEOFAL-${clientName}`;
}

const CotizacionNuevaLEM = () => {
  const [variants, setVariants] = useState([]);
  const [variantId, setVariantId] = useState('');
  const [variantVisual, setVariantVisual] = useState(false);
  const [client, setClient] = useState(emptyClient);
  const [selection, setSelection] = useState({ company_id: null, project_id: null, company: null, project: null });
  const [quote, setQuote] = useState(emptyQuote);
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const v = await listVariants({ active: true });
        setVariants(v || []);
      } catch (e) {
        // ignore load error
      }
    })();
  }, []);

  const subtotal = useMemo(() => items.reduce((acc, it) => acc + computePartial(it), 0), [items]);
  const igvAmount = useMemo(() => quote.igv ? Number((subtotal * 0.18).toFixed(2)) : 0, [subtotal, quote.igv]);
  const total = useMemo(() => Number((subtotal + igvAmount).toFixed(2)), [subtotal, igvAmount]);

  const onAddItem = () => setItems([...items, { ...emptyItem }]);
  const onRemoveItem = (idx) => setItems(items.filter((_, i) => i !== idx));
  const onChangeItem = (idx, patch) => setItems(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  // Autocompletar campos desde la variante seleccionada
  useEffect(() => {
    if (!variantId) return;
    const v = (variants || []).find(x => String(x.id) === String(variantId));
    if (!v) return;
    const c = v.conditions || {};
    setQuote(prev => ({
      ...prev,
      payment_terms: c.default_payment_terms || prev.payment_terms,
      acceptance: typeof c.default_acceptance === 'boolean' ? c.default_acceptance : prev.acceptance,
      igv: typeof c.default_igv === 'boolean' ? c.default_igv : prev.igv,
      reference: c.default_reference || prev.reference,
    }));
    if (Array.isArray(c.default_items) && items.length <= 1 && !items[0].code && !items[0].description && !items[0].norm) {
      const mapped = c.default_items.map(di => ({
        code: di.code || '',
        description: di.description || '',
        norm: di.norm || '',
        unit_price: Number(di.unit_price || 0),
        quantity: Number(di.quantity || 1),
      }));
      if (mapped.length) setItems(mapped);
    }
    if (c.default_service_name && !client.service_name) {
      setClient(prev => ({ ...prev, service_name: c.default_service_name }));
    }
  }, [variantId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      // Construir payload de cotización base
      const payload = {
        project_id: selection.project?.id || selection.project_id || null,
        variant_id: variantId || null,
        client_contact: client.contact_name,
        client_email: client.contact_email,
        client_phone: client.contact_phone,
        issue_date: quote.issue_date || new Date().toISOString().slice(0, 10),
        subtotal,
        igv: igvAmount,
        total,
        status: 'borrador',
        // campos adicionales útiles
        meta: {
          customer: client,
          quote,
          payment_terms: quote.payment_terms,
          acceptance: quote.acceptance,
          reference: quote.reference,
          subtotal,
          igv: igvAmount,
          file_name: suggestedFileName('xxx-XX', client.company_name),
        }
      };
      const saved = await createQuote(payload);
      // Añadir ítems
      for (const it of items) {
        await addQuoteItem({
          quote_id: saved.id,
          code: it.code,
          description: it.description,
          norm: it.norm,
          unit_price: Number(it.unit_price || 0),
          quantity: Number(it.quantity || 0),
          partial_price: computePartial(it),
        });
      }
      alert('Cotización creada');
      // Guardar id para exportaciones
      setLastSavedId(saved.id);
      // Redirigir a detalle/edición en el futuro
    } catch (e) {
      setError(e.message || 'Error al crear cotización');
    } finally {
      setSaving(false);
    }
  };

  const [lastSavedId, setLastSavedId] = useState(null);

  const exportFile = async (type) => {
    try {
      const id = lastSavedId; // en futuro usar id de ruta/estado
      if (!id) return alert('Guarde la cotización antes de exportar');
      const base = import.meta.env?.VITE_API_URL?.replace(/\/$/, '') || '';
      const path = `/api/quotes/${id}/export/${type}`;
      const url = base && /\/api$/i.test(base) ? `${base}${path.replace(/^\/api/, '')}` : `${base}${path}`;
      // abre en nueva pestaña para descargar
      window.open(url, '_blank');
    } catch (e) {
      alert('No se pudo exportar');
    }
  };

  const exportDraft = async () => {
    try {
      const id = lastSavedId;
      if (!id) return alert('Guarde la cotización antes de generar el borrador');
      const base = import.meta.env?.VITE_API_URL?.replace(/\/$/, '') || '';
      const path = `/api/quotes/${id}/export/pdf-draft`;
      const url = base && /\/api$/i.test(base) ? `${base}${path.replace(/^\/api/, '')}` : `${base}${path}`;
      window.open(url, '_blank');
    } catch {
      alert('No se pudo generar el borrador');
    }
  };

  return (
    <ModuloBase titulo="Nueva Cotización LEM" descripcion="Plantilla de cotización para Laboratorio con variantes y condiciones">
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={onSubmit}>
        <CompanyProjectPicker value={selection} onChange={setSelection} />
        <div className="row g-3 mt-3">
          <div className="col-md-6">
            <h5>Datos del Cliente</h5>
            <div className="mb-2"><label className="form-label">Empresa</label><input className="form-control" value={client.company_name} onChange={e=>setClient({...client, company_name:e.target.value})} required/></div>
            <div className="mb-2"><label className="form-label">R.U.C.</label><input className="form-control" value={client.ruc} onChange={e=>setClient({...client, ruc:e.target.value})} /></div>
            <div className="mb-2"><label className="form-label">Contacto</label><input className="form-control" value={client.contact_name} onChange={e=>setClient({...client, contact_name:e.target.value})} required/></div>
            <div className="mb-2"><label className="form-label">Teléfono</label><input className="form-control" value={client.contact_phone} onChange={e=>setClient({...client, contact_phone:e.target.value})} /></div>
            <div className="mb-2"><label className="form-label">Correo</label><input type="email" className="form-control" value={client.contact_email} onChange={e=>setClient({...client, contact_email:e.target.value})} /></div>
            <div className="mb-2"><label className="form-label">Ubicación del proyecto</label><input className="form-control" value={client.project_location} onChange={e=>setClient({...client, project_location:e.target.value})} /></div>
            <div className="mb-2"><label className="form-label">Nombre del proyecto</label><input className="form-control" value={client.project_name} onChange={e=>setClient({...client, project_name:e.target.value})} /></div>
            <div className="mb-3"><label className="form-label">Nombre del servicio</label><input className="form-control" value={client.service_name} onChange={e=>setClient({...client, service_name:e.target.value})} /></div>
          </div>

          <div className="col-md-6">
            <h5>Datos de la Cotización</h5>
            <div className="mb-2"><label className="form-label">Fecha de Solicitud</label><input type="date" className="form-control" value={quote.request_date} onChange={e=>setQuote({...quote, request_date:e.target.value})} /></div>
            <div className="mb-2"><label className="form-label">Fecha de Emisión</label><input type="date" className="form-control" value={quote.issue_date} onChange={e=>setQuote({...quote, issue_date:e.target.value})} /></div>
            <div className="mb-2"><label className="form-label">Comercial</label><input className="form-control" value={quote.commercial_name} onChange={e=>setQuote({...quote, commercial_name:e.target.value})} /></div>
            <div className="mb-2"><label className="form-label">Referencia</label><input className="form-control" placeholder="SEGÚN LO SOLICITADO VÍA correo / llamada" value={quote.reference} onChange={e=>setQuote({...quote, reference:e.target.value})} /></div>
            <div className="mb-2">
              <div className="d-flex justify-content-between align-items-center">
                <label className="form-label mb-0">Variante</label>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={()=>setVariantVisual(!variantVisual)}>
                  {variantVisual ? 'Ver como lista' : 'Ver como cards'}
                </button>
              </div>
              {!variantVisual ? (
                <select className="form-select mt-2" value={variantId} onChange={(e)=>setVariantId(e.target.value)}>
                  <option value="">Sin variante</option>
                  {(variants||[]).map(v => <option key={v.id} value={v.id}>{v.code} - {v.title}</option>)}
                </select>
              ) : (
                <div className="row row-cols-2 row-cols-md-3 g-2 mt-1">
                  {(variants||[]).map(v => (
                    <div className="col" key={v.id}>
                      <div className={`card h-100 ${String(variantId)===String(v.id)?'border-primary':''}`} role="button" onClick={()=>setVariantId(String(v.id))}>
                        {v.image_url ? (
                          <img src={v.image_url} alt={v.title} className="card-img-top" style={{ maxHeight: 120, objectFit: 'cover' }} />
                        ) : null}
                        <div className="card-body py-2">
                          <div className="fw-semibold small">{v.code}</div>
                          <div className="small">{v.title}</div>
                          {v.description ? <div className="text-muted small mt-1" style={{minHeight: '2.4em'}}>{v.description}</div> : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mb-2"><label className="form-label">Forma de pago</label>
              <select className="form-select" value={quote.payment_terms} onChange={e=>setQuote({...quote, payment_terms:e.target.value})}>
                <option value="adelantado">Adelantado</option>
                <option value="50%">Adelanto 50% y saldo previo al informe</option>
                <option value="credito7">Crédito 7 días con OS</option>
                <option value="credito15">Crédito 15 días con OS</option>
                <option value="credito30">Crédito 30 días con OS</option>
              </select>
            </div>
            <div className="form-check mb-2">
              <input className="form-check-input" type="checkbox" id="igv" checked={quote.igv} onChange={e=>setQuote({...quote, igv: e.target.checked})}/>
              <label className="form-check-label" htmlFor="igv">Aplicar IGV 18%</label>
            </div>
            <div className="form-check mb-3">
              <input className="form-check-input" type="checkbox" id="acceptance" checked={quote.acceptance} onChange={e=>setQuote({...quote, acceptance:e.target.checked})}/>
              <label className="form-check-label" htmlFor="acceptance">Aceptación de cotización</label>
            </div>
            <div className="mb-2"><label className="form-label">Nombre de archivo sugerido</label>
              <input className="form-control" value={suggestedFileName('xxx-XX', client.company_name)} readOnly />
            </div>
          </div>
        </div>

        <h5 className="mt-3">Ítems</h5>
        <div className="table-responsive">
          <table className="table table-bordered align-middle">
            <thead>
              <tr>
                <th>Código/N° ensayo</th>
                <th>Descripción</th>
                <th>Norma</th>
                <th>Unitario (S/)</th>
                <th>Cantidad</th>
                <th>Parcial (S/)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx}>
                  <td><input className="form-control" value={it.code} onChange={e=>onChangeItem(idx, { code: e.target.value })} /></td>
                  <td><textarea className="form-control" rows={1} value={it.description} onChange={e=>onChangeItem(idx, { description: e.target.value })} /></td>
                  <td><input className="form-control" value={it.norm} onChange={e=>onChangeItem(idx, { norm: e.target.value })} /></td>
                  <td style={{ width: 120 }}><input type="number" step="0.01" className="form-control" value={it.unit_price} onChange={e=>onChangeItem(idx, { unit_price: e.target.value })} /></td>
                  <td style={{ width: 100 }}><input type="number" className="form-control" value={it.quantity} onChange={e=>onChangeItem(idx, { quantity: e.target.value })} /></td>
                  <td style={{ width: 120 }}>{computePartial(it)}</td>
                  <td style={{ width: 80 }}>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={()=>onRemoveItem(idx)} disabled={items.length===1}>-</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mb-3">
          <button type="button" className="btn btn-outline-primary" onClick={onAddItem}>Agregar ítem</button>
        </div>

        <div className="d-flex justify-content-end align-items-center gap-4 flex-wrap">
          <div className="text-end">
            <div>Subtotal: S/ {subtotal.toFixed(2)}</div>
            <div>IGV 18%: S/ {igvAmount.toFixed(2)}</div>
            <div><strong>Total: S/ {total.toFixed(2)}</strong></div>
          </div>
          <button type="submit" className="btn btn-success" disabled={saving || !selection.project?.id && !selection.project_id}>{saving ? 'Guardando...' : 'Guardar borrador'}</button>
          <button type="button" className="btn btn-outline-warning" onClick={exportDraft}>
            Guardar PDF Borrador
          </button>
          <button type="button" className="btn btn-outline-secondary" onClick={()=>exportFile('pdf')}>
            Exportar PDF
          </button>
          <button type="button" className="btn btn-outline-secondary" onClick={()=>exportFile('excel')}>
            Exportar Excel
          </button>
        </div>
      </form>
    </ModuloBase>
  );
};

export default CotizacionNuevaLEM;
