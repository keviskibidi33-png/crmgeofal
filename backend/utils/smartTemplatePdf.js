const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');

// Función para generar número de cotización autoincremental por día
function generateQuoteNumber() {
  const today = new Date();
  const year = today.getFullYear().toString().slice(-2);
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  
  // Crear un identificador único basado en fecha y hora
  const now = new Date();
  const timeStamp = now.getTime();
  const dailyCounter = Math.floor(timeStamp / (1000 * 60 * 60 * 24)) % 1000; // Contador diario
  
  return `0120-${year}${month}${day}-${String(dailyCounter).padStart(3, '0')}`;
}
const handlebars = require('handlebars');

async function generateSmartTemplatePdf(bundle, outputPath) {
  try {
    const processedData = processBundleData(bundle);
    const htmlContent = await generateCleanHtmlTemplateFromFiles(processedData);
    const tempHtmlPath = path.join(__dirname, '..', 'tmp', `temp_${Date.now()}.html`);
    
    await fs.writeFile(tempHtmlPath, htmlContent, 'utf8');
    await convertHtmlToPdf(tempHtmlPath, outputPath);
    await fs.unlink(tempHtmlPath);
    
    return true;
  } catch (err) {
    console.error('Error generando PDF:', err);
    throw err;
  }
}

function processBundleData(bundle) {
    let subtotal = 0;
  const allItems = bundle.quote?.meta?.items || bundle.items || [];
  // Filtrar solo items que tienen datos válidos (código o descripción)
  const items = allItems.filter(item => 
    (item.code && item.code.trim() !== '') || 
    (item.description && item.description.trim() !== '')
  );
  
  // Detectar cantidad de items para layout adaptativo inteligente
  const itemCount = items.length;
  const hasManyItems = itemCount > 6;
  const hasVeryManyItems = itemCount > 12;
  const hasExtremeItems = itemCount > 15;
    items.forEach(item => {
      const unitPrice = parseFloat(item.unit_price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      subtotal += unitPrice * quantity;
    });
    const igv = subtotal * 0.18;
    const total = subtotal + igv;
  let fechaFormateada = '';
  if (bundle.quote?.meta?.quote?.issue_date) {
    fechaFormateada = bundle.quote.meta.quote.issue_date;
  } else {
    const fechaActual = new Date();
    fechaFormateada = `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, '0')}-${String(fechaActual.getDate()).padStart(2, '0')}`;
  }
    const variantId = bundle.quote?.variant_id;
    const variantConditions = getVariantConditions(variantId);
    
  // Layout adaptativo inteligente según cantidad de items
  let condicionesPrimeraPagina;
  
  if (hasExtremeItems) {
    // Con items extremos: solo lo esencial en primera página
    condicionesPrimeraPagina = `
      <div class="subtitle-box"><span class="subtitle-inner">I. CONDICIONES DEL SERVICIO</span></div>
      <div class="conditions-content">
        VALIDEZ DE LA OFERTA: 30 días calendario. Si la cotización llegó al límite de validez, solicite actualización.
      </div>
      <div class="normal-subtitle">CONDICIONES ESPECÍFICAS:</div>
      <div class="conditions-content">
        El cliente debe enviar al laboratorio, para los ensayos en suelo y agregados, la cantidad mínima de 100 kg por cada muestra. El cliente deberá entregar las muestras debidamente identificadas. El cliente deberá especificar la Norma a ser utilizada para la ejecución del ensayo, caso contrario se considera Norma ASTM o NTP vigente de acuerdo con el alcance del laboratorio. El cliente deberá entregar las muestras en las instalaciones del LEM, ubicado en la Av. Marañón N° 763, Los Olivos, Lima.
      </div>`;
  } else if (hasManyItems) {
    // Con muchos items: condiciones básicas + PLAZO ESTIMADO
    condicionesPrimeraPagina = `
      <div class="subtitle-box"><span class="subtitle-inner">I. CONDICIONES DEL SERVICIO</span></div>
      <div class="conditions-content">
        VALIDEZ DE LA OFERTA: 30 días calendario. Si la cotización llegó al límite de validez, solicite actualización.
      </div>
      <div class="normal-subtitle">CONDICIONES ESPECÍFICAS:</div>
      <div class="conditions-content">
        El cliente debe enviar al laboratorio, para los ensayos en suelo y agregados, la cantidad mínima de 100 kg por cada muestra. El cliente deberá entregar las muestras debidamente identificadas. El cliente deberá especificar la Norma a ser utilizada para la ejecución del ensayo, caso contrario se considera Norma ASTM o NTP vigente de acuerdo con el alcance del laboratorio. El cliente deberá entregar las muestras en las instalaciones del LEM, ubicado en la Av. Marañón N° 763, Los Olivos, Lima.
      </div>
    <div class="normal-subtitle">PLAZO ESTIMADO DE EJECUCIÓN DE SERVICIO</div>
    <div class="conditions-content">
      El plazo de entrega será de los resultados se estima ${variantConditions.delivery_days} días hábiles, este tiempo está sujeto a la programación enviada por el área de LEM. El laboratorio enviará un correo de confirmación de recepción y fecha de entrega del informe.
      </div>`;
  } else {
    // Con pocos items: layout completo en primera página
    condicionesPrimeraPagina = `
      <div class="subtitle-box"><span class="subtitle-inner">I. CONDICIONES DEL SERVICIO</span></div>
      <div class="conditions-content">
        VALIDEZ DE LA OFERTA: 30 días calendario. Si la cotización llegó al límite de validez, solicite actualización.
      </div>
      <div class="normal-subtitle">CONDICIONES ESPECÍFICAS:</div>
      <div class="conditions-content">
        El cliente debe enviar al laboratorio, para los ensayos en suelo y agregados, la cantidad mínima de 100 kg por cada muestra. El cliente deberá entregar las muestras debidamente identificadas. El cliente deberá especificar la Norma a ser utilizada para la ejecución del ensayo, caso contrario se considera Norma ASTM o NTP vigente de acuerdo con el alcance del laboratorio. El cliente deberá entregar las muestras en las instalaciones del LEM, ubicado en la Av. Marañón N° 763, Los Olivos, Lima.
    </div>
      <div class="normal-subtitle">PLAZO ESTIMADO DE EJECUCIÓN DE SERVICIO</div>
      <div class="conditions-content">
        El plazo de entrega será de los resultados se estima ${variantConditions.delivery_days} días hábiles, este tiempo está sujeto a la programación enviada por el área de LEM. El laboratorio enviará un correo de confirmación de recepción y fecha de entrega del informe.
      </div>`;
  }

  // Segunda página adaptativa
  let condicionesSegundaPagina;
  
  // Segunda página siempre sin PLAZO ESTIMADO (ya está en primera página)
  condicionesSegundaPagina = `
    <div class="normal-subtitle">CONTRAMUESTRA</div>`;
  
  condicionesSegundaPagina += `
    <div class="conditions-content">
      Al finalizar los ensayos, la muestra sobrante/contramuestra permanecerán en custodia por un tiempo de 10 días calendario después de emitido el informe de ensayo. Siempre que se trate de una muestra dirimente, las contramuestras serán devueltas a los clientes, previa coordinación y autorización, caso contrario, serán eliminadas si se trata de residuos del ensayo o contramuestras de ensayo.
    </div>
    <div class="normal-subtitle">CONFIDENCIALIDAD</div>
    <div class="conditions-content">
      El laboratorio mantiene acuerdos de confidencialidad entre el cliente y el laboratorio, la divulgación de la información sin la autorización de las partes no es permitida. El laboratorio mantiene reserva sobre la información brindada por el cliente, salvo solicitud de la información por ley, o por entidades gubernamentales inmersos dentro del presente servicio de ensayo.
    </div>
    <div class="normal-subtitle">QUEJAS Y SUGERENCIAS</div>
    <div class="conditions-content">
      Si tiene alguna queja o sugerencia, lo invitamos a conocer nuestro Proceso de Atención de Quejas, el cual iniciará 24 horas después de recibida la queja. El plazo límite establecido para la recepción de quejas respecto a un informe de ensayo es de 10 días después de emitido el documento. Pasado este plazo, no se aceptarán quejas bajo ninguna circunstancia.
    </div>
    <div class="normal-subtitle">ENTREGA DE INFORME DE ENSAYO</div>
    <div class="conditions-content">
      Como parte de la mejora de nuestros procesos y en alineamiento con el Laboratorio Nacional INACAL-DM(PRODUCE) a partir de julio del 2022 los informes de ensayo son emitidos de forma digital con firma electrónica. La entrega de los informes de ensayo será mediante el intranet de la pagina web <a href="https://www.geofal.com.pe">www.geofal.com.pe</a>, y se enviará un correo de confirmación con el usuario y clave para el acceso. Geofal no declara conformidad de sus informes de ensayo. En caso se requiera la modificación del informe de ensayo a consecuencia de los datos proporcionados por el cliente, esta se realizará mediante la emisión de un nuevo informe que tendrá un costo adicional de acuerdo a evaluación.
    </div>
    <div class="normal-subtitle">HORARIO DE ATENCIÓN</div>
    <div class="conditions-content">
      El horario para recepción de muestra y entrega de informes es de Lunes a Viernes de 8:30am a 1:00pm y 2:00pm a 5:30pm, y Sábado de 8:30am a 12:30pm.
    </div>
    <div class="subtitle-box"><span class="subtitle-inner">II. CONDICIÓN DE PAGO</span></div>
    <div class="conditions-content">
      <span style="font-weight:bold;">CONDICIÓN:</span> ${getPaymentConditionText(bundle.quote?.meta?.quote?.payment_terms)}<br/>
      <span style="font-weight:bold;">RAZON SOCIAL:</span> Geofal S.A.C. <span style="font-weight:bold;">RUC:</span> 20549356762<br/>
      Sírvase realizar el depósito correspondiente de los servicios a nuestra cuenta bancaria:<br/>
      <span style="font-weight:bold;">Cuenta de detracción Banco de La Nación:</span><br/>- Cuenta de detracción Banco de La Nación: N° 00-074-045472<br/>
      <span style="font-weight:bold;">Cuenta corriente Interbank:</span><br/>- Cuenta Corriente en Soles de Interbank: N° 200-3005201096-31<br/>- Código Interbancario (CCI) de Interbank: N° 003-200-003005201096-31<br/>
      <span style="font-weight:bold;">Cuenta corriente BCP:</span><br/>- Cuenta Corriente en Soles del Banco de Crédito del Perú (BCP): N° 192 2024 3030 04<br/>- Código Interbancario (CCI) del Banco de Crédito del Perú (BCP): N° 002-192-002 02430 3004-34<br/>
      <span style="font-weight:bold;">Cuenta corriente BBVA:</span><br/>- Cuenta Corriente en Soles BBVA: N° 0111-0174-0100082311-00<br/>- Código Interbancario (CCI) BBVA: N° 011-174-000100082311-00<br/>
      Se debe enviar el comprobante de depósito realizado vía correo electrónico.
    </div>
    <div class="subtitle-box"><span class="subtitle-inner">III. ACEPTACIÓN DE LA COTIZACIÓN</span></div>
    <div class="conditions-content">
      La aceptación de la cotización de parte del cliente será mediante, Pago respectivo del servicio según cotización enviada, Envío de la orden de servicio. Envío de correo aceptando el servicio, a los siguientes correos <a href="mailto:laboratorio@geofal.com.pe">laboratorio@geofal.com.pe</a> y/o <a href="mailto:asesorcomercial@geofal.com.pe">asesorcomercial@geofal.com.pe</a>, en señal de conformidad. Le agradeceremos que nos envíe el comprobante del depósito realizado vía correo electrónico.
    </div>
    <div class="signature-block">
      Atentamente,<br/>
      Geofal SAC<br/>
      Av. Río Marañón N° 763, Los Olivos, Lima<br/>
      Telf.: (01) 9051911 / (01) 7543070
    </div>`;

  return {
    numero_cotizacion: generateQuoteNumber(),
      fecha_emision: fechaFormateada,
      fecha_solicitud: bundle.quote?.meta?.quote?.request_date || '',
    referencia: bundle.quote?.meta?.quote?.reference || bundle.quote?.reference || 'SEGÚN LO SOLICITADO VÍA CORREO ELECTRÓNICO / LLAMADA TELEFÓNICA',
      asesor_comercial: bundle.quote?.meta?.quote?.commercial_name || 'Silvia Peralta',
    telefono_comercial: bundle.quote?.meta?.quote?.commercial_phone || '962429895',
    condicion_pago: getPaymentConditionText(bundle.quote?.meta?.quote?.payment_terms),
      cliente_nombre: bundle.company?.name || 'GEOFAL SAC',
      cliente_ruc: bundle.company?.ruc || '20549356762',
      cliente_contacto: bundle.quote?.meta?.customer?.contact_name || 'Brenda Vilca Calla',
      cliente_telefono: bundle.quote?.meta?.customer?.contact_phone || '944435392',
      cliente_correo: bundle.quote?.meta?.customer?.contact_email || 'ingenieria@geofal.com.pe',
      proyecto_nombre: bundle.project?.name || 'AP5119_B_U_GF_MP_30 CULTA',
      proyecto_ubicacion: bundle.project?.location || '',
    items: items.map(item => ({
          codigo: item.code || '',
          descripcion: item.description || '',
          norma: item.norm || '',
      costo_unitario: parseFloat(item.unit_price || 0).toFixed(2),
      cantidad: parseInt(item.quantity || 1),
      costo_parcial: (parseFloat(item.unit_price || 0) * parseInt(item.quantity || 1)).toFixed(2)
    })),
      subtotal: subtotal.toFixed(2),
      igv: igv.toFixed(2),
      total: total.toFixed(2),
    variant_conditions: variantConditions,
    delivery_days: bundle.quote?.meta?.quote?.delivery_days || variantConditions?.delivery_days || 4,
    condiciones_primera_pagina: condicionesPrimeraPagina,
    condiciones_segunda_pagina: condicionesSegundaPagina,
    // Variables para layout adaptativo
    hasManyItems: hasManyItems,
    hasVeryManyItems: hasVeryManyItems,
    itemCount: itemCount,
    __dirname: __dirname
  };
}

function generateCleanHtmlTemplate(data) {
  const template = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
    <title>Cotización {{ numero_cotizacion }}</title>
    <style>
html, body {
  width: 210mm;
  height: 297mm;
            margin: 0;
            padding: 0;
  font-family: Arial, sans-serif;
  font-size: 13px;
  background: #fff;
  color: #000;
            box-sizing: border-box;
  max-height: 594mm; /* Exacto para 2 páginas */
  overflow: hidden;
}
@page {
  size: A4;
  margin: 0;
}
        body {
  max-height: 594mm !important;
  overflow: hidden !important;
}
.page-content {
  width: 180mm;
  margin: 10mm 15mm 0 15mm;
  box-sizing: border-box;
  min-height: 275mm;
  max-height: 275mm;
  overflow: hidden;
  page-break-inside: avoid;
}
.page-content:not(:last-child) {
            page-break-after: always;
}
/* Ocultar todos menos primeras 2 paginas */
.page-content:nth-child(n+3) {
  display: none !important;
  height: 0 !important;
  width: 0 !important;
  overflow: hidden !important;
  visibility: hidden !important;
  position: absolute !important;
  left: -9999px !important;
  top: -9999px !important;
}
.footer-bar {
            position: relative;
  left: 0;
  right: 0;
  bottom: 0;
  height: auto;
  padding: 0;
  background: white;
  color: #222;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  margin-top: 20px;
  page-break-inside: avoid;
}


.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 6px 8px;
  width: 100%;
  max-width: 160mm;
  margin: 0 auto;
}

.footer-left, .footer-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 0 0 auto;
}

.footer-left {
  align-items: flex-start;
  justify-content: flex-start;
}

.footer-right {
  align-items: flex-end;
  justify-content: flex-start;
}

.footer-item {
  display: flex;
  align-items: center;
  gap: 2px;
  white-space: nowrap;
  font-size: 8px;
}

.footer-item svg {
  fill: #FF6B35;
  height: 10px;
  width: 10px;
  flex-shrink: 0;
}

.footer-item div {
  display: inline;
  line-height: 1.0;
  font-size: 8px;
}
/* El resto estilos similares al de antes */

.subtitle-box {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 2px 0 2px 0;
  width: 100%;
}
.subtitle-inner {
  background: white;
  border-radius: 3px;
  border: 1px solid #000;
  color: #000;
  display: inline-block;
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 0.5px;
  padding: 6px 20px;
  text-align: center;
  width: auto;
  max-width: 90%;
  margin: 0 auto;
}
.normal-subtitle {
  font-size: 11px;
  font-weight: bold;
  margin: 1px 0 1px 0;
  text-decoration: none;
  text-align: left;
  color: #000;
}
        .header {
            position: relative;
            height: 80px;
            margin-bottom: 10px;
}
.header img {
  position: absolute;
  top: 0;
  left: 0;
  height: 120px;
  z-index: 1;
}
        .company-name {
  font-size: 14px;
        }
        .title {
  font-weight: bold;
  font-size: 20px;
  margin: 40px 0 30px 0;
            text-align: center;
            text-decoration: underline;
            position: relative;
            z-index: 2;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
  gap: 22px;
  margin-bottom: 18px;
}
        .info-label {
            font-weight: bold;
  width: 130px;
  display: inline-block;
}
.info-row {
  margin-bottom: 8px;
  line-height: 1.4;
}
.reference-row {
  margin-top: 15px;
  margin-bottom: 15px;
}
.reference-row .info-label {
  width: auto;
  margin-right: 5px;
}
        .intro-text {
  font-size: 12px;
  color: #222;
  margin: 8px 0;
}
table {
  border-collapse: collapse;
            width: 100%;
  margin-bottom: 1px;
  margin-left: 0;
  margin-right: 0;
        }

/* ===== LAYOUT ADAPTATIVO PARA MUCHOS ITEMS ===== */
.many-items table {
  font-size: 8px;
}

.many-items th, .many-items td {
  padding: 1px 1px;
  font-size: 8px;
}

.many-items .section-row {
  font-size: 9px;
  margin-top: 3px;
}

.many-items .total-row {
  font-size: 8px;
}

.many-items .total-row td {
  padding: 1px 1px;
  font-size: 8px;
        }
th, td {
            border: 1px solid #000;
  padding: 1px 2px;
  font-size: 9px;
  vertical-align: middle;
  text-align: center;
}
.total-row td {
  text-align: left !important;
}
.total-row td:last-child {
  text-align: right !important;
}
th {
  background: #f2f2f2;
  font-weight: 700;
            text-align: center;
        }
.section-row {
  background: #f8f9fa;
  font-weight: 700;
  font-size: 10px;
  margin-top: 5px;
}
.total-row {
  background: #e9ecef;
  font-weight: 700;
  font-size: 9px;
  padding: 1px 2px;
}

.total-row td {
  padding: 1px 2px !important;
  font-size: 9px !important;
}
        .footer-note {
  font-size: 10px;
  margin-top: 2px;
  margin-bottom: 8px;
            color: #666;
  text-align: left;
}
.conditions-content {
  font-size: 9px;
  color: #222;
  margin-bottom: 1px;
  line-height: 1.2;
}
.conditions-list {
  margin-left: 15px;
  margin-bottom: 8px;
}
.conditions-list li {
  margin-bottom: 2px;
  font-size: 10px;
}
.signature-block {
  margin-top: 2px;
  font-size: 10px;
}
.contact-block {
  font-size: 12px;
  margin-top: 12px;
}
a {
  color: #000 !important;
  text-decoration: none !important;
}

/* Contenedores de página específicos */
.page-content-wrapper {
  width: 100%;
  min-height: 200mm;
  padding: 0 10mm 20px 10mm;
  box-sizing: border-box;
}

/* Primera página con footer fijo */
.first-page {
  position: relative;
  min-height: 275mm;
  max-height: 275mm;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.first-page-footer {
  position: relative;
  margin-top: auto;
  height: auto;
  padding: 4px 5mm;
  border-top: 1.5px solid #FF6B35;
  background: white;
  color: #222;
  font-size: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  flex-shrink: 0;
  page-break-inside: avoid;
}

/* Segunda página con footer en la parte inferior */
.second-page {
  position: relative;
  min-height: 275mm;
  max-height: 275mm;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.second-page-footer {
  position: relative;
  margin-top: auto;
  height: auto;
  padding: 3px 5mm 5px 5mm;
  border-top: 1.5px solid #FF6B35;
  background: white;
  color: #222;
  font-size: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  flex-shrink: 0;
  page-break-inside: avoid;
  min-height: 25px;
}

.second-page .header {
  position: relative;
  height: 120px;
  margin-bottom: 10px;
  margin-top: 10px;
  display: flex;
  align-items: flex-start;
  width: 100%;
  flex-shrink: 0;
}

.second-page .header img {
  position: relative;
  height: 120px;
  display: block;
  flex-shrink: 0;
}

.second-page .page-content-wrapper {
  flex: 1;
  padding: 0 10mm 2px 10mm;
  margin: 0;
  display: flex;
  flex-direction: column;
  overflow: visible;
}

    </style>
</head>
<body>
  <div class="page-content first-page {{#if hasManyItems}}many-items{{/if}}">
    <div class="page-content-wrapper">
            <div class="header">
        <img src="file://{{__dirname}}/../image/ENCABEZADOS_FOOTER/logogeofal.png" alt="Logo Geofal" />
            </div>
            <div class="title">COTIZACIÓN N° {{ numero_cotizacion }}</div>
            <div class="info-grid">
        <div>
          <div class="info-row"><span class="info-label">CLIENTE:</span>{{ cliente_nombre }}</div>
          <div class="info-row"><span class="info-label">R.U.C.:</span>{{ cliente_ruc }}</div>
          <div class="info-row"><span class="info-label">CONTACTO:</span>{{ cliente_contacto }}</div>
          <div class="info-row"><span class="info-label">TELÉFONO:</span>{{ cliente_telefono }}</div>
          <div class="info-row"><span class="info-label">CORREO:</span>{{ cliente_correo }}</div>
          <div class="info-row"><span class="info-label">FECHA SOLICITUD:</span>{{ fecha_solicitud }}</div>
                    </div>
        <div>
          <div class="info-row"><span class="info-label">PROYECTO:</span>{{ proyecto_nombre }}</div>
          <div class="info-row"><span class="info-label">UBICACIÓN:</span>{{ proyecto_ubicacion }}</div>
          <div class="info-row"><span class="info-label">ASESOR COMERCIAL:</span>{{ asesor_comercial }}</div>
          <div class="info-row"><span class="info-label">TELÉFONO:</span>{{ telefono_comercial }}</div>
          <div class="info-row"><span class="info-label">FECHA DE EMISIÓN:</span>{{ fecha_emision }}</div>
                </div>
            </div>
            <div class="info-row reference-row"><span class="info-label">REFERENCIA:</span>{{ referencia }}</div>
            <div class="intro-text">
                Es grato dirigirnos a Ud. a fin de alcanzarle, de acuerdo a su requerimiento, nuestra cotización por los servicios solicitados de los siguientes ensayos de laboratorio:
            </div>
      <table>
                <thead>
                    <tr>
            <th>Código</th><th>Descripción Ensayo</th><th>Norma</th><th>Acreditación</th><th>Costo Unitario (S/)</th><th>Cantidad</th><th>Costo Parcial (S/)</th>
                    </tr>
                </thead>
                <tbody>
          <tr class="section-row"><td colspan="3">{{variant_conditions.title}}</td><td></td><td></td><td></td><td></td></tr>
                    {{#each items}}
                    <tr>
                        <td>{{codigo}}</td>
                        <td>{{descripcion}}</td>
                        <td>{{norma}}</td>
            <td style="text-align:center">(*)</td>
            <td style="text-align:center">{{costo_unitario}}</td>
            <td style="text-align:center">{{cantidad}}</td>
            <td style="text-align:center">{{costo_parcial}}</td>
                    </tr>
                    {{/each}}
          <tr class="total-row"><td colspan="4"></td><td></td><td>Costo Parcial:</td><td style="text-align:right">S/ {{ subtotal }}</td></tr>
          <tr class="total-row"><td colspan="4"></td><td></td><td>IGV 18%:</td><td style="text-align:right">S/ {{ igv }}</td></tr>
          <tr class="total-row"><td colspan="4"></td><td></td><td>Costo Total:</td><td style="text-align:right">S/ {{ total }}</td></tr>
                </tbody>
            </table>
      <div class="footer-note">(*) Ensayo dentro del alcance de acreditación INACAL.</div>
      {{{condiciones_primera_pagina}}}
            </div>

    <!-- Footer específico para la primera página -->
    <div class="footer-bar first-page-footer">
      <div class="footer-content">
        <div class="footer-left">
          <div class="footer-item">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            <div>Av. Marañón N° 763, Los Olivos, Lima</div>
          </div>
          <div class="footer-item">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16a2 2 0 002-2V6c0-1.1-.9-2-2-2zm0 2v.01L12 13 4 6.01V6h16z"/></svg>
            <div>
        <a href="mailto:laboratorio@geofal.com.pe">laboratorio@geofal.com.pe</a>
            </div>
          </div>
        </div>
        <div class="footer-right">
          <div class="footer-item">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
            <div>(01) 754-3070</div>
          </div>
          <div class="footer-item">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            <div>
        <a href="https://www.geofal.com.pe">www.geofal.com.pe</a>
            </div>
          </div>
        </div>
      </div>
        </div>
    </div>
    
  <div class="page-content second-page">
    <div class="header">
      <img src="file://{{__dirname}}/../image/ENCABEZADOS_FOOTER/logogeofal.png" alt="Logo Geofal" />
    </div>
    <div class="page-content-wrapper">
      {{{condiciones_segunda_pagina}}}
            </div>

    <!-- Footer específico para la segunda página -->
    <div class="footer-bar second-page-footer">
      <div class="footer-content">
        <div class="footer-left">
          <div class="footer-item">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            <div>Av. Marañón N° 763, Los Olivos, Lima</div>
          </div>
          <div class="footer-item">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16a2 2 0 002-2V6c0-1.1-.9-2-2-2zm0 2v.01L12 13 4 6.01V6h16z"/></svg>
            <div>
        <a href="mailto:laboratorio@geofal.com.pe">laboratorio@geofal.com.pe</a>
            </div>
          </div>
        </div>
        <div class="footer-right">
          <div class="footer-item">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
            <div>(01) 754-3070</div>
          </div>
          <div class="footer-item">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            <div>
        <a href="https://www.geofal.com.pe">www.geofal.com.pe</a>
            </div>
          </div>
        </div>
      </div>
                </div>
            </div>
            
</body>
</html>
  `;
  
  const compiledTemplate = handlebars.compile(template);
  return compiledTemplate(data);
}

function getVariantConditions(variantId) {
    const variants = {
    V1: {
          title: 'MUESTRA DE SUELO Y AGREGADO',
      delivery_days: 4,
          conditions: [
        'El cliente debe enviar al laboratorio, para los ensayo en suelo y agregados, la cantidad minima de 100 kg por cada muestra.',
            'El cliente deberá de entregar las muestras debidamente identificadas.',
            'El cliente deberá especificar la Norma a ser utilizada para la ejecución del ensayo, caso contrario se considera Norma ASTM o NTP vigente de acuerdo con el alcance del laboratorio.',
        'El cliente deberá entregar las muestras en las instalaciones del LEM, ubicado en la Av. Marañón N° 763, Los Olivos, Lima.'
          ],
          payment_conditions: [
            'El pago debe realizarse antes del inicio de los ensayos.',
            'Se acepta pago en efectivo, transferencia bancaria o cheque.',
            'Los precios incluyen IGV (18%).',
            'La cotización tiene una validez de 30 días calendario.',
            'En caso de cancelación, se cobrará el 50% del monto total.'
          ]
        }
  };
  return variants[variantId] || variants.V1;
}

function getPaymentConditionText(paymentTerms) {
  const conditions = {
    adelantado: 'El pago del servicio deberá ser realizado por Adelantado.',
    '50%': 'El pago del servicio Adelanto el 50% y saldo previo a la entrega del Informe.',
    credito7: 'El pago del servicio Crédito a 7 días, previa orden de servicio.',
    credito15: 'El pago del servicio Crédito a 15 días, previa orden de servicio.',
    credito30: 'El pago del servicio Crédito a 30 días, previa orden de servicio.'
  };
  return conditions[paymentTerms] || conditions.adelantado;
}

async function convertHtmlToPdf(htmlPath, outputPath) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  try {
    const page = await browser.newPage();
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
    
    // Forzar segunda página sin interferir con CSS de primera página
    await page.evaluate(() => {
      const secondPage = document.querySelector('.second-page');
      if (secondPage) {
        // Forzar salto de página
        secondPage.style.pageBreakBefore = 'always';
        secondPage.style.breakBefore = 'page';
        secondPage.style.display = 'block';
        secondPage.style.position = 'relative';
        secondPage.style.minHeight = '297mm';
        secondPage.style.height = '297mm';
        
        // Asegurar que el contenido de segunda página sea visible
        const contentWrapper = secondPage.querySelector('.page-content-wrapper');
        if (contentWrapper) {
          contentWrapper.style.minHeight = '200mm';
          contentWrapper.style.height = '200mm';
          contentWrapper.style.visibility = 'visible';
          contentWrapper.style.opacity = '1';
        }
      }
      
      // Forzar que el body tenga altura suficiente para dos páginas
      document.body.style.height = '594mm';
      document.body.style.minHeight = '594mm';
    });
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {top: '5mm', right: '5mm', bottom: '5mm', left: '5mm'},
      preferCSSPageSize: false,
      displayHeaderFooter: false,
      scale: 1.0,
      tagged: false,
      outline: false
    });
  } finally {
    await browser.close();
  }
}

// Función para generar PDF de cotización desde datos de la base de datos
async function generateQuotePDF(quoteData) {
  try {
    console.log('🔍 generateQuotePDF - Datos recibidos:', {
      id: quoteData.id,
      quote_number: quoteData.quote_number,
      client_name: quoteData.client_name,
      total: quoteData.total
    });

    // Procesar los datos para el template
    const processedData = {
      quote: {
        id: quoteData.id,
        quote_number: quoteData.quote_number || `COT-${quoteData.id}`,
        client_name: quoteData.client_name || quoteData.client_contact || (quoteData.meta && quoteData.meta.customer && quoteData.meta.customer.contact_name) || 'Cliente',
        client_email: quoteData.client_email || '',
        client_phone: quoteData.client_phone || '',
        total: quoteData.total || quoteData.total_amount || (quoteData.subtotal + quoteData.igv) || 0,
        subtotal: quoteData.subtotal || 0,
        igv: quoteData.igv || 0,
        issue_date: quoteData.issue_date || new Date().toISOString().split('T')[0],
        payment_terms: quoteData.payment_terms || '30 días',
        notes: quoteData.notes || '',
        meta: {
          items: quoteData.items || []
        }
      },
      company: {
        name: quoteData.company_name || 'GEOFAL',
        ruc: quoteData.ruc || '20123456789',
        address: quoteData.company_address || 'Dirección de la empresa',
        phone: quoteData.company_phone || 'Teléfono',
        email: quoteData.company_email || 'email@empresa.com'
      }
    };

    console.log('🔍 generateQuotePDF - Datos procesados:', processedData);

    // Generar HTML usando archivos separados
    const htmlContent = await generateCleanHtmlTemplateFromFiles(processedData);
    
    // Convertir a PDF usando Puppeteer
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
      
      const page = await browser.newPage();
      
      // Configurar viewport
      await page.setViewport({ width: 1200, height: 800 });
      
      // Establecer contenido
      await page.setContent(htmlContent, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      // Forzar salto de página con JavaScript más agresivo
      await page.evaluate(() => {
        const secondPage = document.querySelector('.second-page');
        if (secondPage) {
          // Múltiples métodos para forzar salto de página
          secondPage.style.pageBreakBefore = 'always';
          secondPage.style.breakBefore = 'page';
          secondPage.style.display = 'block';
          secondPage.style.position = 'relative';
          secondPage.style.minHeight = '297mm';
          secondPage.style.height = '297mm';
          
          // Agregar contenido adicional si es necesario
          const contentWrapper = secondPage.querySelector('.page-content-wrapper');
          if (contentWrapper) {
            contentWrapper.style.minHeight = '200mm';
            contentWrapper.style.height = '200mm';
          }
        }
        
        // Forzar que el body tenga altura suficiente
        document.body.style.height = '594mm';
        document.body.style.minHeight = '594mm';
      });
      
      // Generar PDF con configuración mejorada
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: false,
        margin: {
          top: '5mm',
          right: '5mm',
          bottom: '5mm',
          left: '5mm'
        },
        scale: 1.0,
        tagged: false,
        outline: false
      });
      
      console.log('✅ generateQuotePDF - PDF generado, tamaño:', pdfBuffer.length, 'bytes');
      return pdfBuffer;
      
    } finally {
      if (browser) {
        await browser.close();
      }
    }
    
  } catch (error) {
    console.error('❌ Error en generateQuotePDF:', error);
    throw error;
  }
}


// Función para generar HTML usando archivos separados
async function generateCleanHtmlTemplateFromFiles(data) {
  try {
    console.log('🔍 Leyendo archivos template...');
    
    // Leer el template HTML
    const htmlTemplate = await fs.readFile(path.join(__dirname, 'template.html'), 'utf8');
    console.log('✅ Template HTML leído, tamaño:', htmlTemplate.length);
    
    // Leer el CSS
    const cssContent = await fs.readFile(path.join(__dirname, 'template.css'), 'utf8');
    console.log('✅ Template CSS leído, tamaño:', cssContent.length);
    
    // Reemplazar el link del CSS con el contenido real
    const htmlWithCss = htmlTemplate.replace(
      '<link rel="stylesheet" href="template.css">',
      `<style>${cssContent}</style>`
    );
    
    console.log('✅ HTML con CSS combinado, tamaño:', htmlWithCss.length);
    
    // Registrar helper para comparación numérica
    handlebars.registerHelper('lt', function(a, b) {
      return a < b;
    });
    
    // Compilar con Handlebars
    const compiledTemplate = handlebars.compile(htmlWithCss);
    const result = compiledTemplate(data);
    
    console.log('✅ Template compilado, tamaño final:', result.length);
    return result;
  } catch (error) {
    console.error('❌ Error generando HTML desde archivos:', error);
    throw error;
  }
}

module.exports = {
  generateSmartTemplatePdf,
  generateQuotePDF,
  generateCleanHtmlTemplateFromFiles,
  getVariantConditions,
  getPaymentConditionText,
  convertHtmlToPdf
};

