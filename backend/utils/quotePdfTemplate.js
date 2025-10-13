const PDFDocument = require('pdfkit');

// Helper: draw a table with borders
function drawTable(doc, { x, y, widths, rows, header = [], maxRowHeight = 25 }) {
  const startX = x;
  let cursorY = y;
  const baseRowHeight = Math.min(maxRowHeight, 25); // Usar altura máxima calculada

  // Función para calcular el tamaño de fuente óptimo basado en la longitud del texto
  const calculateOptimalFontSize = (text, availableWidth, availableHeight, baseFontSize = 9) => {
    if (!text || String(text).length === 0) return baseFontSize;
    
    const textLength = String(text).length;
    
    // Reducción más agresiva basada en la longitud del texto
    if (textLength > 150) return 5;      // Texto extremadamente largo
    if (textLength > 100) return 6;      // Texto muy largo
    if (textLength > 70) return 7;       // Texto largo
    if (textLength > 50) return 8;       // Texto medio-largo
    if (textLength > 30) return 8.5;     // Texto ligeramente largo
    
    return baseFontSize;
  };

  const drawRow = (cells, isHeader = false, isSection = false) => {
    let cx = startX;
    
    // Usar altura fija para evitar superposiciones
    const h = isSection ? 25 : baseRowHeight;
    
    // background for header/section
    if (isHeader) {
      doc.save().rect(cx, cursorY, widths.reduce((a,b)=>a+b,0), h).fill('#f2f2f2').restore();
    } else if (isSection) {
      doc.save().rect(cx, cursorY, widths.reduce((a,b)=>a+b,0), h).fill('#e9ecef').restore();
    }
    
    // cells
    cells.forEach((cell, i) => {
      doc.rect(cx, cursorY, widths[i], h).stroke();
      
      if (cell && String(cell).length > 0) {
        // Calcular tamaño de fuente óptimo para esta celda
        const availableWidth = widths[i] - 8;
        const availableHeight = h - 12;
        const optimalFontSize = calculateOptimalFontSize(cell, availableWidth, availableHeight, 9);
        
        doc.font(isSection ? 'Helvetica-Bold' : isHeader ? 'Helvetica-Bold' : 'Helvetica')
          .fontSize(optimalFontSize)
          .fillColor('#000')
          .text(String(cell), cx + 4, cursorY + 8, { 
            width: availableWidth, 
            height: availableHeight,
            align: i === cells.length - 1 ? 'right' : 'left' 
          });
      }
      cx += widths[i];
    });
    cursorY += h;
  };

  if (header.length) drawRow(header, true, false);
  rows.forEach(r => drawRow(r.cells, false, r.section === true));

  return cursorY; // new Y
}

// Helper: Add page break if needed
function checkPageBreak(doc, requiredSpace = 100) {
  if (doc.y + requiredSpace > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
    return true;
  }
  return false;
}


// Main render
exports.renderQuotePdf = async function renderQuotePdf(bundle, outFilePath) {
  return new Promise((resolve, reject) => {
    try {
      console.log('🔍 renderQuotePdf - Iniciando generación de PDF');
      console.log('🔍 renderQuotePdf - Bundle:', {
        quote: bundle.quote?.id,
        items: bundle.items?.length,
        project: bundle.project?.id,
        company: bundle.company?.id
      });
      
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const stream = doc.pipe(require('fs').createWriteStream(outFilePath));
      stream.on('finish', () => {
        console.log('✅ renderQuotePdf - PDF generado exitosamente');
        resolve();
      });
      stream.on('error', (error) => {
        console.error('❌ renderQuotePdf - Error en stream:', error);
        reject(error);
      });

      // PÁGINA 1: COTIZACIÓN PRINCIPAL
      console.log('🔍 renderQuotePdf - Renderizando página 1');
      renderQuotePage1(doc, bundle);
      
      // PÁGINA 2: CONDICIONES DEL SERVICIO Y PAGO
      console.log('🔍 renderQuotePdf - Renderizando página 2');
      doc.addPage();
      renderQuotePage2(doc, bundle);

      console.log('🔍 renderQuotePdf - Finalizando PDF');
      doc.end();
    } catch (error) {
      console.error('❌ renderQuotePdf - Error general:', error);
      reject(error);
    }
  });
};

// Página 1: Cotización principal
function renderQuotePage1(doc, bundle) {
  // Título principal como en la segunda imagen: "COTIZACIÓN N° 1478-25"
  const titleY = 40;
  const titleText = 'COTIZACIÓN N° 1478-25';
  const titleWidth = 400;
  const titleX = (doc.page.width - titleWidth) / 2;
  
  // Línea horizontal superior
  doc.moveTo(titleX, titleY).lineTo(titleX + titleWidth, titleY).stroke();
  
  // Texto del título centrado, negrita
  doc.font('Helvetica-Bold').fontSize(16).fillColor('#000')
    .text(titleText, titleX, titleY + 5, { width: titleWidth, align: 'center' });
  
  // Línea horizontal inferior
  const titleBottomY = titleY + 25;
  doc.moveTo(titleX, titleBottomY).lineTo(titleX + titleWidth, titleBottomY).stroke();

  // Información del cliente y proyecto
  const clientInfoY = titleY + 35; // Ajustado para la nueva estructura
  renderClientInfo(doc, bundle, clientInfoY);

  // Texto introductorio
  const introY = doc.y + 0; // Reducido de 10 a 5 para mejor espaciado
  doc.font('Helvetica').fontSize(10).text('Es grato dirigirnos a Ud. a fin de alcanzarle, de acuerdo a su requerimiento, nuestra cotización por los servicios solicitados de los siguientes ensayos de laboratorio:', 50, introY);
  
  // Actualizar posición del cursor
  doc.y = introY + 20; // Aumentado de 15 a 20 para mejor separación con la tabla

  // Tabla de ensayos - calcular espacio disponible
  const availableHeight = doc.page.height - doc.y - 100; // Espacio disponible para tabla
  const tableY = doc.y + 10;
  
  // Ajustar altura de filas según espacio disponible
  const numRows = (bundle.items?.length || 1) + 1; // +1 para header
  const maxRowHeight = Math.min(25, Math.floor(availableHeight / numRows));
  
  renderTestsTable(doc, bundle, tableY, maxRowHeight);


  // Totales
  renderTotals(doc, bundle);
}

// Página 2: Condiciones del servicio y pago
function renderQuotePage2(doc, bundle) {
  // I. CONDICIONES DEL SERVICIO
  doc.font('Helvetica-Bold').fontSize(12).text('I. CONDICIONES DEL SERVICIO', 50, 50);
  
  // Validez de la oferta
  doc.font('Helvetica-Bold').fontSize(10).text('VALIDEZ DE LA OFERTA', 50, doc.y + 15);
  doc.font('Helvetica').fontSize(9).text('30 días calendarios.', 50, doc.y + 5);
  doc.font('Helvetica').fontSize(9).text('Si la cotización llegó al límite de su validez, solicite una actualización.', 50, doc.y + 2);

  // Condiciones específicas
  doc.font('Helvetica-Bold').fontSize(10).text('CONDICIONES ESPECÍFICAS', 50, doc.y + 15);
  const condicionesEspecificas = [
    'El cliente deberá enviar al laboratorio, para los ensayo en suelos, la cantidad mínima de 30 kg para muestra fina y 70 kg para muestra gruesa.',
    'El cliente deberá de entregar las muestras debidamente identificadas.',
    'El cliente deberá especificar la Norma a ser utilizada para la ejecución del ensayo, caso contrario se considera Norma ASTM o NTP vigente de acuerdo con el alcance del laboratorio.',
    'El cliente deberá entregar las muestras en las instalaciones del LEM, ubicado en la Av. Marañón N° 763, Los Olivos, Lima.'
  ];
  
  condicionesEspecificas.forEach(condicion => {
    doc.font('Helvetica').fontSize(9).text(`• ${condicion}`, 50, doc.y + 3, { width: 500 });
  });

  // Plazo estimado
  doc.font('Helvetica-Bold').fontSize(10).text('PLAZO ESTIMADO DE EJECUCIÓN DE SERVICIO', 50, doc.y + 15);
  const deliveryDays = bundle.quote?.meta?.quote?.delivery_days || bundle.quote?.delivery_days || 4;
  const plazos = [
    `El plazo de entrega será de los resultados se estima ${deliveryDays} días hábiles, este tiempo está sujeto a la programación enviada por el área de LEM.`,
    'El laboratorio enviará un correo de confirmación de recepción y fecha de entrega del informe.'
  ];
  
  plazos.forEach(plazo => {
    doc.font('Helvetica').fontSize(9).text(`• ${plazo}`, 50, doc.y + 3, { width: 500 });
  });

  // Contramuestra
  doc.font('Helvetica-Bold').fontSize(10).text('CONTRAMUESTRA', 50, doc.y + 15);
  doc.font('Helvetica').fontSize(9).text('Al finalizar los ensayos, la muestra sobrante/contramuestra permanecerán en custodia por un tiempo de 10 días calendario después de emitido el informe de ensayo. Siempre que se trate de una muestra dirimente, las contramuestras serán devueltas a los clientes, previa coordinación y autorización, caso contrario, serán eliminadas si se trata de residuos del ensayo o contramuestras de ensayo.', 50, doc.y + 5, { width: 500 });

  // Confidencialidad
  doc.font('Helvetica-Bold').fontSize(10).text('CONFIDENCIALIDAD', 50, doc.y + 15);
  doc.font('Helvetica').fontSize(9).text('El laboratorio mantiene acuerdos de confidencialidad entre el cliente y el laboratorio, la divulgación de la información sin la autorización de las partes, no es permitida. El laboratorio mantiene reserva de la información brindada por el cliente, salvo solicitud de la información por ley, o por entidades gubernamentales inmersos dentro del presente servicio de ensayo.', 50, doc.y + 5, { width: 500 });

  // Quejas y sugerencias
  doc.font('Helvetica-Bold').fontSize(10).text('QUEJAS Y SUGERENCIAS', 50, doc.y + 15);
  doc.font('Helvetica').fontSize(9).text('Si tiene alguna queja o sugerencia, lo invitamos a conocer nuestro Proceso de Atención de Quejas, el cual iniciará 24 horas después de recibida la queja. El plazo límite establecido para la recepción de quejas respecto a un informe de ensayo es de 10 días después de emitido el documento. Pasado este plazo, no se aceptarán quejas bajo ninguna circunstancia.', 50, doc.y + 5, { width: 500 });

  // Entrega de informe
  doc.font('Helvetica-Bold').fontSize(10).text('ENTREGA DE INFORME DE ENSAYO', 50, doc.y + 15);
  const entregaInfo = [
    'Como parte de la mejora de nuestros procesos y en alineamiento con el Laboratorio Nacional INACAL-DM(PRODUCE) a partir de julio del 2022 los informes de ensayo son emitidos de forma digital con firma electrónica.',
    'La entrega de los informes de ensayo será mediante el intranet de la pagina web www.geofal.com.pe, y se enviará un correo de confirmación con el usuario y clave para el acceso.',
    'Geofal no declara conformidad de sus informes de ensayo.',
    'En caso se requiera la modificación del informe de ensayo a consecuencia de los datos proporcionados por el cliente, esta se realizará mediante la emisión de un nuevo informe que tendrá un costo adicional de acuerdo a evaluación.'
  ];
  
  entregaInfo.forEach(info => {
    doc.font('Helvetica').fontSize(9).text(`• ${info}`, 50, doc.y + 3, { width: 500 });
  });

  // Verificar si necesitamos nueva página
  if (doc.y > 700) {
    doc.addPage();
  }

  // Horario de atención
  doc.font('Helvetica-Bold').fontSize(10).text('HORARIO DE ATENCIÓN', 50, doc.y + 20);
  doc.font('Helvetica').fontSize(9).text('El horario para recepción de muestra y entrega de informes es de Lunes a Viernes de 8:30am a 1:00pm y 2:00pm a 5:30pm, y Sábado de 8:30am a 12:30pm', 50, doc.y + 5, { width: 500 });

  // Línea separadora
  doc.moveTo(50, doc.y + 10).lineTo(550, doc.y + 10).stroke();

  // II. CONDICIONES DE PAGO
  doc.font('Helvetica-Bold').fontSize(12).text('II. CONDICIONES DE PAGO', 50, doc.y + 15);
  
  doc.font('Helvetica-Bold').fontSize(10).text('CONDICIÓN:', 50, doc.y + 10);
  doc.font('Helvetica').fontSize(9).text('El pago del servicio deberá ser realizado por Adelantado.', 50, doc.y + 5);
  
  doc.font('Helvetica-Bold').fontSize(10).text('RAZON SOCIAL:', 50, doc.y + 10);
  doc.font('Helvetica').fontSize(9).text('Geofal S.A.C. RUC: 20549356762', 50, doc.y + 5);
  
  doc.font('Helvetica').fontSize(9).text('Sírvase realizar el depósito correspondiente de los servicios a nuestra cuenta bancaria:', 50, doc.y + 10);

  // Cuentas bancarias
  const cuentasBancarias = [
    { banco: 'Cuenta de detraccion Banco de La Nación:', cuenta: 'Nº 00-074-045472' },
    { banco: 'Cuenta corriente Interbank:', cuenta: 'N° 200-3005201096', cci: 'Código Interbancario (CCI) de Interbank: N° 003-200-003005201096-31' },
    { banco: 'Cuenta corriente BCP:', cuenta: 'N° 192 2024 3030 04', cci: 'Código Interbancario (CCI) del Banco de Crédito del Perú (BCP): N° 002-192-002 02430 3004-34' },
    { banco: 'Cuenta corriente BBVA:', cuenta: 'N° 0011-0174-0100082311-00', cci: 'Código Interbancario (CCI) BBVA: N° 011-174-000100082311-00' }
  ];

  cuentasBancarias.forEach(cuenta => {
    doc.font('Helvetica-Bold').fontSize(9).text(cuenta.banco, 50, doc.y + 10);
    doc.font('Helvetica').fontSize(9).text(cuenta.cuenta, 50, doc.y + 5);
    if (cuenta.cci) {
      doc.font('Helvetica').fontSize(9).text(cuenta.cci, 50, doc.y + 2);
    }
  });

  // Línea separadora
  doc.moveTo(50, doc.y + 15).lineTo(550, doc.y + 15).stroke();

  // III. ACEPTACIÓN DE LA COTIZACIÓN
  doc.font('Helvetica-Bold').fontSize(12).text('III. ACEPTACIÓN DE LA COTIZACIÓN', 50, doc.y + 15);
  doc.font('Helvetica').fontSize(9).text('La aceptación de la cotización de parte del cliente será mediante, Pago respectivo del servicio según cotización enviada, Envío de la orden de servicio, Envío de correo aceptando el servicio, a los siguientes correos laboratorio@geofal.com.pe y/o asesorcomercial@geofal.com.pe, en señal de conformidad.', 50, doc.y + 10, { width: 500 });
  doc.font('Helvetica').fontSize(9).text('Le agradeceremos que nos envie el comprobante del depósito realizado via correo electronico', 50, doc.y + 10, { width: 500 });

  // Información de contacto
  doc.font('Helvetica').fontSize(10).text('Atentamente,', 50, doc.y + 20);
  doc.font('Helvetica-Bold').fontSize(10).text('Geofal SAC', 50, doc.y + 10);
  doc.font('Helvetica').fontSize(9).text('Av. Río Marañón N° 763, Los Olivos, Lima', 50, doc.y + 5);
  doc.font('Helvetica').fontSize(9).text('Telf.: (01) 9051911 / (01) 7543070 - 982429895 - 956057624 - 993077479', 50, doc.y + 5);

  // Footer
  doc.font('Helvetica').fontSize(8).text('COM-F-01', 50, doc.page.height - 50);
  doc.font('Helvetica').fontSize(8).text('Página 2 de 2', 300, doc.page.height - 50);
  doc.font('Helvetica').fontSize(8).text('Versión: 03 (01-08-2022)', 450, doc.page.height - 50);
  doc.font('Helvetica').fontSize(8).text('Fin del documento', 450, doc.page.height - 40);
}

// Información del cliente y proyecto
function renderClientInfo(doc, bundle, startY = 100) {
  const x = 50;
  const y = startY; // Usar la posición Y pasada como parámetro
  const midX = 320; // Aumentado para más separación
  const lineH = 20; // Aumentado para mejor espaciado
  const leftWidth = 240; // Aumentado para más espacio para REFERENCIA
  const rightWidth = 220; // Aumentado para más espacio

  const cliente = bundle.company || bundle.quote.meta?.customer || {};
  const proyecto = {
    name: bundle.project?.name,
    location: bundle.project?.location,
    asesor: bundle.quote.meta?.quote?.commercial_name,
    issue_date: bundle.quote.issue_date,
    reference: bundle.quote.reference || bundle.quote.meta?.reference,
  };

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
    ['PROYECTO:', proyecto?.name || '-'],
    ['UBICACIÓN:', proyecto?.location || '-'],
    ['ASESOR COMERCIAL:', proyecto?.asesor || '-'],
    ['TELÉFONO:', proyecto?.asesor_phone || '-'],
    ['FECHA DE EMISIÓN:', proyecto?.issue_date || '-'],
  ];

  // Dibujar columna izquierda con control de ancho
  let cy = y;
  left.forEach(([k, v]) => { 
    doc.font('Helvetica-Bold').fontSize(10).text(k, x, cy, { continued: true }); 
    // Ajustar ancho del texto según el campo - REFERENCIA puede ser muy largo
    const textWidth = k === 'REFERENCIA:' ? leftWidth - 90 : leftWidth - 80;
    doc.font('Helvetica').fontSize(10).text(' ' + v, { width: textWidth }); 
    cy += lineH; 
  });

  // Dibujar columna derecha con control de ancho
  cy = y;
  right.forEach(([k, v]) => { 
    doc.font('Helvetica-Bold').fontSize(10).text(k, midX, cy, { continued: true }); 
    doc.font('Helvetica').fontSize(10).text(' ' + v, { width: rightWidth - 80 }); 
    cy += lineH; 
  });

  // Línea vertical punteada entre columnas
  const maxLines = Math.max(left.length, right.length);
  const yStart = y - 2;
  const yEnd = y + maxLines * lineH + 2;
  doc.save().lineWidth(0.5).dash(2, { space: 3 }).moveTo(midX - 5, yStart).lineTo(midX - 5, yEnd).stroke().undash().restore();
  
  // Actualizar posición del cursor
  doc.y = y + maxLines * lineH + 15;
}

// Tabla de ensayos
function renderTestsTable(doc, bundle, tableY, maxRowHeight = 25) {
  const tableX = 80; // Aumentado de 50 a 80 para mejor margen horizontal
    doc.lineWidth(0.8);
  const widths = [60, 240, 80, 80, 50];
  const totalWidth = widths.reduce((a, b) => a + b, 0); // Ancho total de la tabla
  const header = ['Código', 'Descripción Ensayo', 'Norma', 'Costo Unitario', 'Cantidad'];
    
    const rows = [];
    
    if (!bundle.items || bundle.items.length === 0) {
    rows.push({ cells: ['-', 'No hay ítems en esta cotización', '-', '-', '-'] });
  } else {
    // Agregar ítems individuales con valores completos como en la segunda imagen
    bundle.items.forEach(it => {
      const unitPrice = Number(it.unit_price) || 0;
      const quantity = Number(it.quantity) || 0;
      
      rows.push({ 
        cells: [
          it.code, 
          it.description, 
          it.norm || '-', 
          unitPrice.toFixed(2), // Con costo unitario
          quantity.toString()
        ] 
      });
    });
  }
  
  // Usar altura máxima calculada
  const finalY = drawTable(doc, { x: tableX, y: tableY, widths, header, rows, maxRowHeight });
  
  // Actualizar posición del cursor
  doc.y = finalY;
}

// Totales - caja separada como en la imagen
function renderTotals(doc, bundle) {
  // Calcular totales reales de los ítems
  const subtotal = bundle.items?.reduce((sum, item) => {
    const unitPrice = Number(item.unit_price) || 0;
    const quantity = Number(item.quantity) || 0;
    return sum + (unitPrice * quantity);
  }, 0) || 0;
  
  const igv = subtotal * 0.18;
  const total = subtotal + igv;
  
  // Posición de la caja de totales (esquina inferior derecha)
  const boxWidth = 200;
  const boxHeight = 80;
  const boxX = doc.page.width - boxWidth - 50;
  const boxY = doc.page.height - boxHeight - 50;
  
  // Dibujar caja de totales
  doc.save()
    .rect(boxX, boxY, boxWidth, boxHeight)
    .fill('#f8f9fa')
    .stroke()
    .restore();
  
  // Título de la caja
  doc.font('Helvetica-Bold').fontSize(10)
    .text('RESUMEN DE COSTOS', boxX + 10, boxY + 10);
  
  // Línea separadora
  doc.moveTo(boxX + 10, boxY + 25).lineTo(boxX + boxWidth - 10, boxY + 25).stroke();
  
  // Filas de totales
  const lineHeight = 15;
  let currentY = boxY + 35;
  
  // Costo Parcial
  doc.font('Helvetica').fontSize(9)
    .text('Costo Parcial', boxX + 10, currentY);
  doc.font('Helvetica').fontSize(9)
    .text(subtotal.toFixed(2), boxX + boxWidth - 60, currentY, { align: 'right' });
  
  currentY += lineHeight;
  
  // IGV
  doc.font('Helvetica').fontSize(9)
    .text('IGV 18%', boxX + 10, currentY);
  doc.font('Helvetica').fontSize(9)
    .text(igv.toFixed(2), boxX + boxWidth - 60, currentY, { align: 'right' });
  
  currentY += lineHeight;
  
  // Costo Total
  doc.font('Helvetica-Bold').fontSize(10)
    .text('Costo Total', boxX + 10, currentY);
  doc.font('Helvetica-Bold').fontSize(10)
    .text(total.toFixed(2), boxX + boxWidth - 60, currentY, { align: 'right' });
}
