import React, { useEffect, useMemo, useState } from 'react';
import { listCompanies } from '../services/companies';
import { createProject } from '../services/projects';

// Lightweight picker: select existing company and define minimal project data
export default function CompanyProjectPicker({ value, onChange }) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ company_id: '', project_name: '', location: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await listCompanies({ page: 1, limit: 50 });
        const data = Array.isArray(res?.data) ? res.data : res; // backend returns {data,total}
        setCompanies(data || []);
      } catch (e) {
        setError('No se pudo cargar empresas');
      } finally { setLoading(false); }
    })();
  }, []);

  const selectedCompany = useMemo(() => companies.find(c => String(c.id) === String(form.company_id)), [companies, form.company_id]);

  useEffect(() => {
    if (typeof onChange === 'function') {
      onChange({
        company_id: form.company_id ? Number(form.company_id) : null,
        company: selectedCompany || null,
        project_name: form.project_name,
        location: form.location,
      });
    }
  }, [form, selectedCompany, onChange]);

  const createQuickProject = async () => {
    if (!form.company_id || !form.project_name) return;
    try {
      const payload = { company_id: Number(form.company_id), name: form.project_name, location: form.location };
      const prj = await createProject(payload);
      // bubble up created project id
      if (typeof onChange === 'function') onChange({ ...value, project_id: prj.id, project: prj });
    } catch (e) {
      setError(e.message || 'No se pudo crear proyecto');
    }
  };

  return (
    <div className="border rounded p-3">
      <h6>Cliente y Proyecto</h6>
      {error && <div className="alert alert-warning py-1 my-2">{error}</div>}
      <div className="row g-2 align-items-end">
        <div className="col-md-4">
          <label className="form-label">Cliente</label>
          <select className="form-select" value={form.company_id} disabled={loading}
                  onChange={(e)=>setForm({ ...form, company_id: e.target.value })}>
            <option value="">Seleccione...</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name} {c.ruc ? `(RUC ${c.ruc})` : ''}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Nombre del proyecto</label>
          <input className="form-control" value={form.project_name}
                 onChange={e=>setForm({ ...form, project_name: e.target.value })}
                 placeholder="Ej. Control de calidad de mezclas" />
        </div>
        <div className="col-md-3">
          <label className="form-label">Ubicación</label>
          <input className="form-control" value={form.location}
                 onChange={e=>setForm({ ...form, location: e.target.value })} />
        </div>
        <div className="col-md-1 d-grid">
          <button type="button" className="btn btn-outline-secondary" onClick={createQuickProject}
                  disabled={!form.company_id || !form.project_name}>Crear</button>
        </div>
      </div>
      {selectedCompany && (
        <div className="small text-muted mt-2">
          Contacto: {selectedCompany.contact_name} · Tel: {selectedCompany.phone} · Email: {selectedCompany.email}
        </div>
      )}
    </div>
  );
}
