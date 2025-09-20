import React, { useEffect, useMemo, useState } from 'react';
import { listCompanies } from '../services/companies';

export default function CompanySelect({ value, onChange, disabled }) {
  const [q, setQ] = useState('');
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedLabel = useMemo(() => {
    if (!value) return '';
    const match = items.find(i => i.id === value);
    return match ? `${match.name} ${match.ruc ? '('+match.ruc+')' : ''}` : String(value);
  }, [value, items]);

  useEffect(() => {
    if (!open) return;
    let stop = false;
    (async () => {
      setLoading(true);
      try {
        const res = await listCompanies({ page: 1, limit: 10, search: q });
        if (!stop) setItems(res?.data || []);
      } finally {
        if (!stop) setLoading(false);
      }
    })();
    return () => { stop = true; };
  }, [q, open]);

  return (
    <div style={{ position:'relative' }}>
      <input
        className="form-control"
        placeholder="Buscar cliente por nombre/RUC"
        value={open ? q : selectedLabel}
        onChange={e => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        disabled={disabled}
      />
      {open && (
        <div style={{ position:'absolute', zIndex:5, background:'#fff', border:'1px solid #eee', boxShadow:'0 2px 12px rgba(0,0,0,0.08)', borderRadius:8, width:'100%', marginTop:4, maxHeight:240, overflowY:'auto' }}>
          <div style={{ padding:8, fontSize:12, color:'#888' }}>{loading ? 'Buscando...' : 'Resultados'}</div>
          {(items || []).map(it => (
            <div
              key={it.id}
              onMouseDown={() => { onChange && onChange(it.id, it); setOpen(false); }}
              style={{ padding:'8px 10px', cursor:'pointer' }}
            >
              <div style={{ fontWeight:600 }}>{it.name}</div>
              <div style={{ fontSize:12, color:'#666' }}>{it.ruc ? `RUC: ${it.ruc}` : it.dni ? `DNI: ${it.dni}` : ''}</div>
            </div>
          ))}
          {(!items || items.length === 0) && <div style={{ padding:8, fontSize:12, color:'#888' }}>Sin resultados</div>}
        </div>
      )}
    </div>
  );
}
