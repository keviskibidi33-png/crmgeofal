// File download helpers for export endpoints
export async function exportExcel({ type = 'leads' } = {}) {
  const base = (import.meta.env?.VITE_API_URL || '').replace(/\/$/, '');
  const path = '/api/export/excel?type=' + encodeURIComponent(type);
  const url = base ? base + path : path;
  const token = localStorage.getItem('token');
  const res = await fetch(url, {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('No se pudo exportar Excel');
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `reporte_${type}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function exportPDF({ type = 'leads' } = {}) {
  const base = (import.meta.env?.VITE_API_URL || '').replace(/\/$/, '');
  const path = '/api/export/pdf?type=' + encodeURIComponent(type);
  const url = base ? base + path : path;
  const token = localStorage.getItem('token');
  const res = await fetch(url, {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('No se pudo exportar PDF');
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `reporte_${type}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default { exportExcel, exportPDF };
