// controllers/exportController.js
const { exportToExcel, exportToPDF } = require('../utils/exporter');
const pool = require('../config/db');
const path = require('path');
const fs = require('fs');
const ExportHistory = require('../models/exportHistory');

// Helper para obtener datos de ejemplo (puedes adaptar a cualquier consulta)
async function getReportData(type) {
  if (type === 'leads') {
    const res = await pool.query('SELECT * FROM leads ORDER BY id DESC LIMIT 100');
    return res.rows;
  }
  if (type === 'projects') {
    const res = await pool.query('SELECT * FROM projects ORDER BY id DESC LIMIT 100');
    return res.rows;
  }
  // Agrega más tipos según tus reportes
  return [];
}

exports.exportExcel = async (req, res) => {
  try {
    const { type = 'leads' } = req.query;
    const data = await getReportData(type);
    if (!data.length) return res.status(404).json({ error: 'No hay datos para exportar' });
    const columns = Object.keys(data[0]).map(key => ({ header: key, key }));
    const filePath = path.join(__dirname, '../tmp', `reporte_${type}_${Date.now()}.xlsx`);
    await exportToExcel(data, columns, filePath);
    // Log history
    try { await ExportHistory.log({ user_id: req.user?.id || null, type: 'xlsx', resource: type }); } catch (e) {}
    res.download(filePath, err => {
      fs.unlink(filePath, () => {});
      if (err) res.status(500).json({ error: 'Error al descargar archivo' });
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al exportar a Excel' });
  }
};

exports.exportPDF = async (req, res) => {
  try {
    const { type = 'leads' } = req.query;
    const data = await getReportData(type);
    if (!data.length) return res.status(404).json({ error: 'No hay datos para exportar' });
    const filePath = path.join(__dirname, '../tmp', `reporte_${type}_${Date.now()}.pdf`);
    await exportToPDF(data, filePath);
    // Log history
    try { await ExportHistory.log({ user_id: req.user?.id || null, type: 'pdf', resource: type }); } catch (e) {}
    res.download(filePath, err => {
      fs.unlink(filePath, () => {});
      if (err) res.status(500).json({ error: 'Error al descargar archivo' });
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al exportar a PDF' });
  }
};

exports.history = async (req, res) => {
  try {
    const { page, limit, q, type, range } = req.query;
    const { rows, total } = await ExportHistory.getAll({ page: Number(page)||1, limit: Number(limit)||20, q, type, range });
    res.json({ data: rows, total });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener historial de exportaciones' });
  }
};
