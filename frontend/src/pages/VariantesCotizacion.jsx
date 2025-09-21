import React, { useEffect, useState } from 'react';
import ModuloBase from '../components/ModuloBase';
import { listVariants, createVariant, updateVariant, deleteVariant } from '../services/quoteVariants';

const emptyForm = { code: '', title: '', description: '', conditions: '' };

const VariantesCotizacion = () => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listVariants();
      setVariants(data || []);
    } catch (e) {
      setError(e.message || 'Error al cargar variantes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateVariant(editing.id, form);
      } else {
        await createVariant(form);
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      await load();
    } catch (e) {
      alert(e.message || 'Error al guardar');
    }
  };

  const onEdit = (v) => {
    setEditing(v);
    setForm({ code: v.code || '', title: v.title || '', description: v.description || '', conditions: v.conditions || '' });
    setShowForm(true);
  };

  const onDelete = async (v) => {
    if (!confirm(`Eliminar variante ${v.title}?`)) return;
    try {
      await deleteVariant(v.id);
      await load();
    } catch (e) {
      alert(e.message || 'Error al eliminar');
    }
  };

  return (
    <ModuloBase titulo="Variantes de Cotización" descripcion="Administra plantillas base para cotizaciones (código, condiciones, etc.)">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          {loading && <span>Cargando...</span>}
          {error && <span style={{ color: 'red' }}>{error}</span>}
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm); }}>Nueva variante</button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Código</th>
              <th>Título</th>
              <th>Descripción</th>
              <th>Condiciones</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(variants || []).map((v) => (
              <tr key={v.id}>
                <td>{v.id}</td>
                <td>{v.code}</td>
                <td>{v.title}</td>
                <td>{v.description}</td>
                <td style={{ maxWidth: 320, whiteSpace: 'pre-wrap' }}>{v.conditions}</td>
                <td>{String(v.active ?? true)}</td>
                <td>
                  <button className="btn btn-sm btn-secondary" onClick={() => onEdit(v)}>Editar</button>{' '}
                  <button className="btn btn-sm btn-danger" onClick={() => onDelete(v)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, marginTop: 16 }}>
          <h5>{editing ? 'Editar variante' : 'Nueva variante'}</h5>
          <form onSubmit={onSubmit}>
            <div className="mb-2">
              <label className="form-label">Código</label>
              <input className="form-control" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
            </div>
            <div className="mb-2">
              <label className="form-label">Título</label>
              <input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="mb-2">
              <label className="form-label">Descripción</label>
              <textarea className="form-control" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="form-label">Condiciones (texto libre)</label>
              <textarea className="form-control" rows={4} value={form.conditions} onChange={(e) => setForm({ ...form, conditions: e.target.value })} />
            </div>
            <div>
              <button type="submit" className="btn btn-success">Guardar</button>{' '}
              <button type="button" className="btn btn-outline-secondary" onClick={() => { setShowForm(false); setEditing(null); }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </ModuloBase>
  );
};

export default VariantesCotizacion;
