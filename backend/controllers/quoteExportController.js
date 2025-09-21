const path = require('path');
const fs = require('fs');
const { exportToExcel } = require('../utils/exporter');
const { renderQuotePdf } = require('../utils/quotePdfTemplate');
const pool = require('../config/db');
const ProjectAttachment = require('../models/projectAttachment');

async function loadQuoteBundle(id) {
  const quoteRes = await pool.query('SELECT * FROM quotes WHERE id = $1', [id]);
  const quote = quoteRes.rows[0];
  if (!quote) return null;
  const itemsRes = await pool.query('SELECT * FROM quote_items WHERE quote_id = $1 ORDER BY id', [id]);
  const projectRes = quote.project_id ? await pool.query('SELECT * FROM projects WHERE id = $1', [quote.project_id]) : { rows: [null] };
  const companyRes = projectRes.rows[0]?.company_id ? await pool.query('SELECT * FROM companies WHERE id = $1', [projectRes.rows[0].company_id]) : { rows: [null] };
  return { quote, items: itemsRes.rows, project: projectRes.rows[0], company: companyRes.rows[0] };
}

function buildFilename(bundle, ext = 'pdf') {
  const asesor = (bundle.quote.meta?.quote?.commercial_name || 'asesor').toString().replace(/[^a-z0-9_\-]+/gi, '_');
  const date = new Date().toISOString().slice(0,10);
  const companyName = (bundle.company?.name || bundle.quote.meta?.customer?.company_name || 'cliente').toString().replace(/[^a-z0-9_\-]+/gi, '_');
  return `COT_${companyName}_${asesor}_${date}.${ext}`;
}

exports.exportPdf = async (req, res) => {
  try {
    const id = req.params.id;
    const bundle = await loadQuoteBundle(id);
    if (!bundle) return res.status(404).json({ error: 'Cotización no encontrada' });
    const tmp = path.join(__dirname, '../tmp');
    if (!fs.existsSync(tmp)) fs.mkdirSync(tmp);
    const fileName = buildFilename(bundle, 'pdf');
    const filePath = path.join(tmp, fileName);
    const data = [
      { header: 'Cotización', id: bundle.quote.id, total: bundle.quote.total },
      ...bundle.items.map(i => ({ code: i.code, desc: i.description, norm: i.norm, qty: i.quantity, unit: i.unit_price, partial: i.partial_price }))
    ];
  await renderQuotePdf(bundle, filePath);
    // Persistir en uploads/quotes
    const uploadsDir = path.join(__dirname, '../uploads/quotes');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    let destPath = path.join(uploadsDir, fileName);
    if (fs.existsSync(destPath)) {
      const base = fileName.replace(/\.(pdf)$/i, '');
      let i = 1;
      while (fs.existsSync(path.join(uploadsDir, `${base}-${i}.pdf`))) i++;
      destPath = path.join(uploadsDir, `${base}-${i}.pdf`);
    }
    fs.copyFileSync(filePath, destPath);
    fs.unlink(filePath, () => {});
    // Registrar adjunto
    if (bundle.project?.id) {
      await ProjectAttachment.create({
        project_id: bundle.project.id,
        uploaded_by: req.user?.id || null,
        file_url: `/uploads/quotes/${fileName}`,
        file_type: 'pdf',
        description: `Exportación de cotización ${bundle.quote.id}`,
      });
    }
    res.download(destPath, fileName);
  } catch (e) {
    res.status(500).json({ error: 'Error al exportar PDF' });
  }
};

exports.exportExcel = async (req, res) => {
  try {
    const id = req.params.id;
    const bundle = await loadQuoteBundle(id);
    if (!bundle) return res.status(404).json({ error: 'Cotización no encontrada' });
    const tmp = path.join(__dirname, '../tmp');
    if (!fs.existsSync(tmp)) fs.mkdirSync(tmp);
    const fileName = buildFilename(bundle, 'xlsx');
    const filePath = path.join(tmp, fileName);
    const rows = bundle.items.map(i => ({ Codigo: i.code, Descripcion: i.description, Norma: i.norm, Unitario: i.unit_price, Cantidad: i.quantity, Parcial: i.partial_price }));
    const columns = [
      { header: 'Codigo', key: 'Codigo', width: 15 },
      { header: 'Descripcion', key: 'Descripcion', width: 60 },
      { header: 'Norma', key: 'Norma', width: 20 },
      { header: 'Unitario', key: 'Unitario', width: 12 },
      { header: 'Cantidad', key: 'Cantidad', width: 10 },
      { header: 'Parcial', key: 'Parcial', width: 12 },
    ];
    await exportToExcel(rows, columns, filePath);
    const uploadsDir = path.join(__dirname, '../uploads/quotes');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    let destPath = path.join(uploadsDir, fileName);
    if (fs.existsSync(destPath)) {
      const base = fileName.replace(/\.(xlsx)$/i, '');
      let i = 1;
      while (fs.existsSync(path.join(uploadsDir, `${base}-${i}.xlsx`))) i++;
      destPath = path.join(uploadsDir, `${base}-${i}.xlsx`);
    }
    fs.copyFileSync(filePath, destPath);
    fs.unlink(filePath, () => {});
    if (bundle.project?.id) {
      await ProjectAttachment.create({
        project_id: bundle.project.id,
        uploaded_by: req.user?.id || null,
        file_url: `/uploads/quotes/${fileName}`,
        file_type: 'excel',
        description: `Exportación de cotización ${bundle.quote.id}`,
      });
    }
    res.download(destPath, fileName);
  } catch (e) {
    res.status(500).json({ error: 'Error al exportar Excel' });
  }
};

// Exportar y guardar como BORRADOR en carpeta drafts
exports.exportPdfDraft = async (req, res) => {
  try {
    const id = req.params.id;
    const bundle = await loadQuoteBundle(id);
    if (!bundle) return res.status(404).json({ error: 'Cotización no encontrada' });
    const tmp = path.join(__dirname, '../tmp');
    if (!fs.existsSync(tmp)) fs.mkdirSync(tmp);
    const date = new Date().toISOString().slice(0,10);
    const asesor = (bundle.quote.meta?.quote?.commercial_name || 'asesor').toString().replace(/[^a-z0-9_\-]+/gi, '_');
    const companyName = (bundle.company?.name || bundle.quote.meta?.customer?.company_name || 'cliente').toString().replace(/[^a-z0-9_\-]+/gi, '_');
    const fileName = `BORRADOR_${companyName}_${asesor}_${date}.pdf`;
    const filePath = path.join(tmp, fileName);
    await renderQuotePdf(bundle, filePath);
    const uploadsDir = path.join(__dirname, '../uploads/quotes/drafts');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    let destPath = path.join(uploadsDir, fileName);
    if (fs.existsSync(destPath)) {
      const base = fileName.replace(/\.(pdf)$/i, '');
      let i = 1;
      while (fs.existsSync(path.join(uploadsDir, `${base}-${i}.pdf`))) i++;
      destPath = path.join(uploadsDir, `${base}-${i}.pdf`);
    }
    fs.copyFileSync(filePath, destPath);
    fs.unlink(filePath, () => {});
    if (bundle.project?.id) {
      await ProjectAttachment.create({
        project_id: bundle.project.id,
        uploaded_by: req.user?.id || null,
        file_url: destPath.replace(path.join(__dirname, '..'), '').replace(/\\/g, '/'),
        file_type: 'pdf',
        description: `BORRADOR de cotización ${bundle.quote.id}`,
      });
    }
    res.download(destPath, path.basename(destPath));
  } catch (e) {
    res.status(500).json({ error: 'Error al exportar PDF borrador' });
  }
};
