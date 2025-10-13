const path = require('path');
const fs = require('fs');
const { exportToExcel } = require('../utils/exporter');
const { renderQuotePdf } = require('../utils/quotePdfTemplate');
const { generateSmartTemplatePdf } = require('../utils/smartTemplatePdf');
const pdfConfig = require('../config/pdf-config');
const pool = require('../config/db');
const ProjectAttachment = require('../models/projectAttachment');

async function loadQuoteBundle(id, frontendData = null) {
  try {
    console.log('🔍 loadQuoteBundle - Cargando bundle para ID:', id);
    console.log('🔍 loadQuoteBundle - Datos del frontend:', frontendData);
    
    const quoteRes = await pool.query('SELECT * FROM quotes WHERE id = $1', [id]);
    const quote = quoteRes.rows[0];
    if (!quote) {
      console.log('❌ loadQuoteBundle - Cotización no encontrada');
      return null;
    }
    
    console.log('✅ loadQuoteBundle - Cotización encontrada:', quote.id);
    
    // Si hay datos del frontend, usarlos para sobrescribir los de la BD
    if (frontendData) {
      if (frontendData.variant_id) {
        quote.variant_id = frontendData.variant_id;
        console.log('✅ loadQuoteBundle - variant_id del frontend:', frontendData.variant_id);
      }
      if (frontendData.delivery_days) {
        quote.delivery_days = frontendData.delivery_days;
        console.log('✅ loadQuoteBundle - delivery_days del frontend:', frontendData.delivery_days);
      }
      if (frontendData.meta) {
        quote.meta = frontendData.meta;
        console.log('✅ loadQuoteBundle - meta del frontend actualizado');
      }
    }
    
    // Obtener ítems de la cotización desde la base de datos
    const itemsRes = await pool.query('SELECT * FROM quote_items WHERE quote_id = $1', [id]);
    const items = itemsRes.rows.map(item => ({
      code: item.name || '',
      description: item.description || '',
      norm: item.norm || '',
      unit_price: parseFloat(item.unit_price) || 0,
      quantity: parseInt(item.quantity) || 1,
      partial_price: parseFloat(item.partial_price) || 0,
      total: parseFloat(item.total_price) || 0
    }));
    console.log('✅ loadQuoteBundle - Ítems obtenidos de la base de datos:', items.length);
    
    const projectRes = quote.project_id ? await pool.query('SELECT * FROM projects WHERE id = $1', [quote.project_id]) : { rows: [] };
    const project = projectRes.rows[0] || null;
    console.log('✅ loadQuoteBundle - Proyecto:', project?.id || 'null');
    
    const companyRes = project?.company_id ? await pool.query('SELECT * FROM companies WHERE id = $1', [project.company_id]) : { rows: [] };
    const company = companyRes.rows[0] || null;
    console.log('✅ loadQuoteBundle - Empresa:', company?.id || 'null');
    
    // Convertir variant_id de ID numérico a string (V1, V2, etc.) para el PDF
    if (quote.variant_id && typeof quote.variant_id === 'number') {
      try {
        const originalId = quote.variant_id;
        const variantQuery = await pool.query('SELECT code FROM quote_variants WHERE id = $1', [quote.variant_id]);
        if (variantQuery.rows.length > 0) {
          quote.variant_id = variantQuery.rows[0].code;
          console.log(`🔍 loadQuoteBundle - variant_id convertido de ID ${originalId} a string ${quote.variant_id}`);
        }
      } catch (error) {
        console.error('❌ loadQuoteBundle - Error convirtiendo variant_id:', error);
      }
    }
    
    const bundle = { quote, items, project, company };
    console.log('✅ loadQuoteBundle - Bundle creado exitosamente');
    return bundle;
  } catch (error) {
    console.error('❌ loadQuoteBundle - Error:', error.message);
    console.error('❌ loadQuoteBundle - Stack:', error.stack);
    throw error;
  }
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
    console.log('🔍 exportPdf - ID recibido:', id);
    console.log('🔍 exportPdf - Body recibido:', req.body);
    
    // Preparar datos del frontend
    const frontendData = {
      variant_id: req.body?.variant_id,
      delivery_days: req.body?.delivery_days,
      meta: req.body?.meta
    };
    
    const bundle = await loadQuoteBundle(id, frontendData);
    console.log('🔍 exportPdf - Bundle cargado:', {
      quoteId: bundle?.quote?.id,
      projectId: bundle?.project?.id,
      companyId: bundle?.company?.id,
      itemsCount: bundle?.items?.length || 0,
      variantId: bundle?.quote?.variant_id,
      deliveryDays: bundle?.quote?.delivery_days
    });
    if (!bundle) return res.status(404).json({ error: 'Cotización no encontrada' });
    
    // Agregar ítems del cuerpo de la petición si están disponibles
    if (req.body && req.body.items && Array.isArray(req.body.items)) {
      bundle.items = req.body.items;
      console.log('✅ exportPdf - Ítems recibidos del frontend:', req.body.items.length);
    } else {
      console.log('⚠️ exportPdf - No se recibieron ítems del frontend, usando ítems vacíos');
      bundle.items = bundle.items || [];
    }
    const tmp = path.join(__dirname, '../tmp');
    if (!fs.existsSync(tmp)) fs.mkdirSync(tmp);
    const fileName = buildFilename(bundle, 'pdf');
    const filePath = path.join(tmp, fileName);
    const data = [
      { header: 'Cotización', id: bundle.quote.id, total: bundle.quote.total },
      ...bundle.items.map(i => ({ code: i.code, desc: i.description, norm: i.norm, qty: i.quantity, unit: i.unit_price, partial: i.partial_price }))
    ];
  try {
    // Usar el sistema de PDF configurado
    if (pdfConfig.pdfSystem === 'html') {
      console.log('🔍 exportPdf - Usando sistema HTML/CSS (smartTemplatePdf)');
      await generateSmartTemplatePdf(bundle, filePath);
    } else {
      console.log('🔍 exportPdf - Usando sistema PDFKit (quotePdfTemplate)');
      await renderQuotePdf(bundle, filePath);
    }
    console.log('✅ exportPdf - PDF generado exitosamente');
  } catch (pdfError) {
    console.error('❌ exportPdf - Error generando PDF:', pdfError.message);
    console.error('❌ exportPdf - Stack:', pdfError.stack);
    throw pdfError;
  }
  
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
    // Registrar adjunto solo si hay proyecto válido
    if (bundle.project?.id && bundle.project.id !== null) {
      try {
        await ProjectAttachment.create({
          project_id: bundle.project.id,
          uploaded_by: req.user?.id || null,
          file_url: `/uploads/quotes/${fileName}`,
          file_type: 'pdf',
          description: `Exportación de cotización ${bundle.quote.id}`,
        });
        console.log('✅ ProjectAttachment creado para proyecto:', bundle.project.id);
      } catch (error) {
        console.error('⚠️ Error creando ProjectAttachment:', error.message);
        // No fallar la exportación por este error
      }
    } else {
      console.log('⚠️ No hay proyecto válido, saltando ProjectAttachment');
    }
    res.download(destPath, fileName);
  } catch (e) {
    console.error('❌ exportPdfDraft - Error:', e.message);
    console.error('❌ exportPdfDraft - Stack:', e.stack);
    res.status(500).json({ error: 'Error al exportar PDF', details: e.message });
  }
};

exports.exportExcel = async (req, res) => {
  try {
    const id = req.params.id;
    // Preparar datos del frontend
    const frontendData = {
      variant_id: req.body?.variant_id,
      delivery_days: req.body?.delivery_days,
      meta: req.body?.meta
    };
    
    const bundle = await loadQuoteBundle(id, frontendData);
    if (!bundle) return res.status(404).json({ error: 'Cotización no encontrada' });
    
    // Agregar ítems del cuerpo de la petición si están disponibles
    if (req.body && req.body.items && Array.isArray(req.body.items)) {
      bundle.items = req.body.items;
      console.log('✅ exportExcel - Ítems recibidos del frontend:', req.body.items.length);
    }
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
    if (bundle.project?.id && bundle.project.id !== null) {
      try {
        await ProjectAttachment.create({
          project_id: bundle.project.id,
          uploaded_by: req.user?.id || null,
          file_url: `/uploads/quotes/${fileName}`,
          file_type: 'excel',
          description: `Exportación de cotización ${bundle.quote.id}`,
        });
        console.log('✅ ProjectAttachment creado para Excel, proyecto:', bundle.project.id);
      } catch (error) {
        console.error('⚠️ Error creando ProjectAttachment Excel:', error.message);
      }
    } else {
      console.log('⚠️ No hay proyecto válido para Excel, saltando ProjectAttachment');
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
    console.log('🔍 exportPdfDraft - ID:', id);
    // Preparar datos del frontend
    const frontendData = {
      variant_id: req.body?.variant_id,
      delivery_days: req.body?.delivery_days,
      meta: req.body?.meta
    };
    
    const bundle = await loadQuoteBundle(id, frontendData);
    if (!bundle) return res.status(404).json({ error: 'Cotización no encontrada' });
    
    // Agregar ítems del cuerpo de la petición si están disponibles
    if (req.body && req.body.items && Array.isArray(req.body.items)) {
      bundle.items = req.body.items;
      console.log('✅ exportPdfDraft - Ítems recibidos del frontend:', req.body.items.length);
    }
    
    console.log('🔍 exportPdfDraft - Bundle:', {
      quote: bundle.quote?.id,
      items: bundle.items?.length,
      project: bundle.project?.id,
      company: bundle.company?.id
    });
    const tmp = path.join(__dirname, '../tmp');
    if (!fs.existsSync(tmp)) fs.mkdirSync(tmp);
    const date = new Date().toISOString().slice(0,10);
    const asesor = (bundle.quote.meta?.quote?.commercial_name || 'asesor').toString().replace(/[^a-z0-9_\-]+/gi, '_');
    const companyName = (bundle.company?.name || bundle.quote.meta?.customer?.company_name || 'cliente').toString().replace(/[^a-z0-9_\-]+/gi, '_');
    const fileName = `BORRADOR_${companyName}_${asesor}_${date}.pdf`;
    const filePath = path.join(tmp, fileName);
    console.log('🔍 exportPdfDraft - Generando PDF:', filePath);
    console.log('🔍 exportPdfDraft - Bundle items:', bundle.items);
    console.log('🔍 exportPdfDraft - Quote meta:', bundle.quote?.meta);
    
            try {
              // Usar el sistema inteligente (único sistema activo)
              console.log('🎯 Usando sistema inteligente basado en plantilla');
              await generateSmartTemplatePdf(bundle, filePath);
              console.log('✅ exportPdfDraft - PDF generado con sistema inteligente exitosamente');
            } catch (pdfError) {
              console.error('❌ exportPdfDraft - Error generando PDF:', pdfError.message);
              console.error('❌ exportPdfDraft - Stack:', pdfError.stack);
              throw pdfError;
            }
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
    if (bundle.project?.id && bundle.project.id !== null) {
      try {
        await ProjectAttachment.create({
          project_id: bundle.project.id,
          uploaded_by: req.user?.id || null,
          file_url: destPath.replace(path.join(__dirname, '..'), '').replace(/\\/g, '/'),
          file_type: 'pdf',
          description: `BORRADOR de cotización ${bundle.quote.id}`,
        });
        console.log('✅ ProjectAttachment creado para borrador, proyecto:', bundle.project.id);
      } catch (error) {
        console.error('⚠️ Error creando ProjectAttachment borrador:', error.message);
      }
    } else {
      console.log('⚠️ No hay proyecto válido para borrador, saltando ProjectAttachment');
    }
    res.download(destPath, path.basename(destPath));
  } catch (e) {
    res.status(500).json({ error: 'Error al exportar PDF borrador' });
  }
};
