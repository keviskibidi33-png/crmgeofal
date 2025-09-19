const PDFDocument = require('pdfkit');

// Helper: draw a table with borders
function drawTable(doc, { x, y, widths, rows, header = [] }) {
  const startX = x;
  let cursorY = y;
  const rowHeight = 20;

  const drawRow = (cells, isHeader = false, isSection = false) => {
    let cx = startX;
    const h = isSection ? 22 : rowHeight;
    // background for header/section
    if (isHeader) {
      doc.save().rect(cx, cursorY, widths.reduce((a,b)=>a+b,0), h).fill('#f2f2f2').restore();
    } else if (isSection) {
      doc.save().rect(cx, cursorY, widths.reduce((a,b)=>a+b,0), h).fill('#e9ecef').restore();
    }
    // cells
    cells.forEach((cell, i) => {
      doc.rect(cx, cursorY, widths[i], h).stroke();
      doc.font(isSection ? 'Helvetica-Bold' : isHeader ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(9)
        .fillColor('#000')
        .text(String(cell ?? ''), cx + 4, cursorY + 5, { width: widths[i] - 8, align: i === cells.length - 1 ? 'right' : 'left' });
      cx += widths[i];
    });
    cursorY += h;
  };

  if (header.length) drawRow(header, true, false);
  rows.forEach(r => drawRow(r.cells, false, r.section === true));

  return cursorY; // new Y
}

function headerBlock(doc, { cliente, proyecto }) {
  doc.font('Helvetica-Bold').fontSize(12).text('COTIZACIÓN - LABORATORIO (LEM)', { align: 'center' }).moveDown(0.5);
  const x = 50; const y = doc.y; const midX = 300; const lineH = 16;
  const left = [
    ['CLIENTE:', cliente?.name || cliente?.company_name || '-'],
    ['R.U.C.:', cliente?.ruc || '-'],
    ['CONTACTO:', cliente?.contact_name || '-'],
    ['TELÉFONO:', cliente?.phone || cliente?.contact_phone || '-'],
    ['CORREO:', cliente?.email || cliente?.contact_email || '-'],
    ['FECHA SOLICITUD:', proyecto?.request_date || '-'],
    ['REFERENCIA:', proyecto?.reference || '-'],
  ];
  const right = [
    ['PROYECTO :', proyecto?.name || '-'],
    ['UBICACIÓN :', proyecto?.location || '-'],
    ['ASESOR COMERCIAL:', proyecto?.asesor || '-'],
    ['TELÉFONO:', proyecto?.asesor_phone || '-'],
    ['FECHA DE EMISIÓN:', proyecto?.issue_date || '-'],
  ];
  let cy = y;
  left.forEach(([k,v])=>{ doc.font('Helvetica-Bold').text(k, x, cy, { continued: true }); doc.font('Helvetica').text(' ' + v); cy+=lineH; });
  cy = y;
  right.forEach(([k,v])=>{ doc.font('Helvetica-Bold').text(k, midX, cy, { continued: true }); doc.font('Helvetica').text(' ' + v); cy+=lineH; });
  // Dotted vertical line between columns (matching the sample)
  const maxLines = Math.max(left.length, right.length);
  const yStart = y - 2;
  const yEnd = y + maxLines * lineH + 2;
  doc.save().lineWidth(0.5).dash(2, { space: 3 }).moveTo(midX - 5, yStart).lineTo(midX - 5, yEnd).stroke().undash().restore();
  doc.moveDown(0.5);
}

function condicionesPagoBlock(doc, condiciones = []) {
  if (!condiciones.length) return;
  doc.moveDown(0.5);
  doc.save();
  doc.rect(50, doc.y, 500, 18 + 14 * condiciones.length).fill('#efefef');
  doc.restore();
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#000').text('CONDICIONES DE PAGO', 55, doc.y - (18 + 14 * condiciones.length) + 3);
  let cy = doc.y - (18 + 14 * condiciones.length) + 22;
  doc.font('Helvetica').fontSize(9);
  condiciones.forEach(c => { doc.text(`CONDICIÓN: ${c}`, 55, cy); cy += 14; });
  doc.moveDown(1);
}

// Main render
exports.renderQuotePdf = async function renderQuotePdf(bundle, outFilePath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const stream = doc.pipe(require('fs').createWriteStream(outFilePath));
    stream.on('finish', resolve);
    stream.on('error', reject);

    // Header
    headerBlock(doc, {
      cliente: bundle.company || bundle.quote.meta?.customer || {},
      proyecto: {
        name: bundle.project?.name,
        location: bundle.project?.location,
        asesor: bundle.quote.meta?.quote?.commercial_name,
        issue_date: bundle.quote.issue_date,
        reference: bundle.quote.reference || bundle.quote.meta?.reference,
      }
    });

    // Items table
    const tableX = 50; let tableY = doc.y + 10;
  doc.lineWidth(0.8);
  const widths = [60, 240, 80, 80, 50, 70];
    const header = ['Código', 'Descripción Ensayo', 'Norma', 'Costo Unitario (S/)', 'Cantidad', 'Costo Parcial (S/)'];
    // Build rows with sections if meta.sections provided: [{title:'ANALISIS DE MATERIAL - AFIRMADO', from:0, to:3}, ...]
    const rows = [];
    const sections = bundle.quote.meta?.sections || [];
    if (sections.length) {
      let index = 0;
      sections.forEach(sec => {
        rows.push({ section: true, cells: [sec.title, '', '', '', '', ''] });
        for (let i = sec.from; i <= sec.to && i < bundle.items.length; i++) {
          const it = bundle.items[i];
          rows.push({ cells: [it.code, it.description, it.norm, it.unit_price?.toFixed?.(2) ?? it.unit_price, it.quantity, it.partial_price?.toFixed?.(2) ?? it.partial_price] });
          index = i + 1;
        }
      });
      for (let i = sections.reduce((m,s)=>Math.max(m,s.to+1),0); i < bundle.items.length; i++) {
        const it = bundle.items[i];
        rows.push({ cells: [it.code, it.description, it.norm, it.unit_price?.toFixed?.(2) ?? it.unit_price, it.quantity, it.partial_price?.toFixed?.(2) ?? it.partial_price] });
      }
    } else {
      bundle.items.forEach(it => rows.push({ cells: [it.code, it.description, it.norm, it.unit_price?.toFixed?.(2) ?? it.unit_price, it.quantity, it.partial_price?.toFixed?.(2) ?? it.partial_price] }));
    }
    tableY = drawTable(doc, { x: tableX, y: tableY, widths, header, rows });

    // INACAL footnote
    const inacalNote = bundle.quote.meta?.inacalNote !== false; // default true
    if (inacalNote) {
      doc.font('Helvetica-Oblique').fontSize(8).fillColor('#000')
        .text('(*) Ensayo dentro del alcance de acreditación INACAL.', tableX, tableY + 6);
    }

    // Totals block (align to right under the table)
    const totalsX = tableX + widths.slice(0, 5).reduce((a,b)=>a+b,0);
    const cellW = widths[5];
    const lineH = 18;
    const entries = [
      ['Costo parcial', bundle.quote.subtotal ?? bundle.quote.meta?.subtotal ?? 0],
      ['IGV 18%', bundle.quote.igv ?? bundle.quote.meta?.igv ?? 0],
      ['Costo Total', bundle.quote.total ?? 0],
    ];
    let y = tableY + 6;
    entries.forEach(([k,v], idx) => {
      doc.font('Helvetica').fontSize(9).text(k, totalsX - 120, y);
      doc.font(idx === entries.length - 1 ? 'Helvetica-Bold' : 'Helvetica').text((Number(v)||0).toFixed(2), totalsX, y, { width: cellW, align: 'right' });
      y += lineH;
    });

    // Condiciones de pago (from variant or fixed list)
    const condiciones = (bundle.variant?.conditions?.payment || bundle.quote.meta?.payment_conditions || [
      'El pago del servicio se realizará de acuerdo a la valorización mensual',
      'El pago del servicio deberá ser realizado por Adelantado.',
      'El pago del servicio Adelanto al 50% y saldo previo a la entrega del Informe.',
      'El pago del servicio Crédito a 7 días, previa orden de servicio.',
      'El pago del servicio Crédito a 30 días, previa orden de servicio.',
      'El pago del servicio Crédito a 15 días, previa orden de servicio.',
    ]);
    condicionesPagoBlock(doc, condiciones);

    doc.end();
  });
};
