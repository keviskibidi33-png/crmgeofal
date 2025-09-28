const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');

/**
 * Genera PDF usando la plantilla HTML existente como base pero con HTML limpio
 */
async function generateSmartTemplatePdf(bundle, outputPath) {
  try {
    const processedData = processBundleData(bundle);
    const htmlContent = generateCleanHtmlTemplate(processedData);
    const tempHtmlPath = path.join(__dirname, '..', 'tmp', `temp_${Date.now()}.html`);
    
    // Guardar archivo HTML temporal
    await fs.writeFile(tempHtmlPath, htmlContent, 'utf8');
    
    // Convertir a PDF
    await convertHtmlToPdf(tempHtmlPath, outputPath);
    
    // Eliminar archivo temporal
    await fs.unlink(tempHtmlPath);
    
    return true;
  } catch (err) {
    console.error('Error generando PDF:', err);
    throw err;
  }
}

/**
 * Procesa datos para la plantilla
 */
function processBundleData(bundle) {
    let subtotal = 0;
    const items = bundle.items || [];
    items.forEach(item => {
      const unitPrice = parseFloat(item.unit_price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      subtotal += unitPrice * quantity;
    });
    const igv = subtotal * 0.18;
    const total = subtotal + igv;
    const fechaFormateada = new Date().toLocaleDateString('es-PE', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
    const variantId = bundle.quote?.variant_id;
    const variantConditions = getVariantConditions(variantId);
  return {
    numero_cotizacion: `COT-${bundle.quote?.id || 'XXX'}-${new Date().getFullYear().toString().slice(-2)}`,
      fecha_emision: fechaFormateada,
      fecha_solicitud: bundle.quote?.meta?.quote?.request_date || '',
      referencia: bundle.quote?.meta?.quote?.reference || 'SEGÚN LO SOLICITADO VÍA CORREO ELECTRÓNICO / LLAMADA TELEFÓNICA',
      asesor_comercial: bundle.quote?.meta?.quote?.commercial_name || 'Silvia Peralta',
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
    __dirname: __dirname
  };
}

/**
 * Genera la plantilla HTML
 */
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
    min-height: 297mm;
    margin: 0; padding: 0;
            font-family: Arial, sans-serif;
    font-size: 11px; color: #000; background: #fff;
}
        .container {
    width: 190mm;
    margin: 0 10mm;
    padding: 0;
        }
        .header {
            display: flex;
            align-items: center;
    border-bottom: 2px solid #FF6B35;
    margin-bottom: 10px;
    padding-bottom: 4px;
}
.header img {
    height: 54px;
    width: auto;
    margin-right: 18px;
}
        .company-name {
    font-size: 12px;
    color: #333;
        }
        .title {
    font-size: 15px;
            text-align: center;
            font-weight: bold;
    margin: 8px 0 6px 0;
            text-decoration: underline;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
    gap: 18px;
    margin-bottom: 12px;
}
        .info-row {
    margin-bottom: 2px;
        }
        .info-label {
            font-weight: bold;
    display: inline-block;
    width: 110px;
}
        .intro-text {
    margin: 10px 0;
            font-size: 11px;
    color: #333;
        }
table {
            width: 100%;
            border-collapse: collapse;
    margin-bottom: 15px;
        }
th, td {
            border: 1px solid #000;
    padding: 4px 7px;
    font-size: 11px;
            vertical-align: top;
        }
th {
    background: #f2f2f2;
    text-align: center;
            font-weight: bold;
        }
.section-row {
    background: #ffe5d0;
            font-weight: bold;
        }
.total-row {
    background: #e9ecef;
            font-weight: bold;
        }
        .footer-note {
    margin-top: 10px;
            font-size: 9px;
    text-align: left;
            color: #666;
        }
.subtitle-box {
    display: block;
            text-align: center;
    margin: 26px 0 14px 0;
}
.subtitle-inner {
    display: inline-block;
    background: #FF6B35;
    color: #fff;
    border-radius: 5px;
    font-size: 12px;
    font-weight: bold;
    padding: 3px 26px;
    border: 1.8px solid #FF6B35;
    letter-spacing: 1px;
    box-shadow: 0 0 1.5px #ccc;
    min-width: 240px;
}
.normal-subtitle {
    font-size: 13px;
            font-weight: bold;
    margin: 20px 0 8px 0;
            text-decoration: underline;
    text-align: left;
    color: #000;
        }
        .conditions-content {
    font-size: 11px;
    margin-bottom: 8px;
        }
        .conditions-list {
    margin-left: 15px;
    margin-bottom: 9px;
        }
        .conditions-list li {
    margin-bottom: 2px;
}
.signature-block {
    margin-top: 20px;
    font-size: 11px;
}
.contact-block {
    font-size: 10px;
    margin-top: 10px;
}
.footer-bar {
    margin-top: 18px;
    padding-top: 6px;
    border-top: 1px solid #FF6B35;
    font-size: 9px;
    text-align: center;
    color: #999;
}
@media print {
    .container {
        margin: 0;
    }
    .footer-bar {
        position: relative;
    }
}
.page-break { page-break-before: always; }
    </style>
</head>
<body>
        <div class="container">
            <div class="header">
    <img src="file://{{__dirname}}/../image/ENCABEZADOS_FOOTER/logogeofal.png" alt="Logo Geofal" />
                <div class="company-name">Ingeniería y laboratorio de materiales</div>
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
        <div class="info-row"><span class="info-label">REFERENCIA:</span>{{ referencia }}</div>
                    </div>
    <div>
        <div class="info-row"><span class="info-label">PROYECTO:</span>{{ proyecto_nombre }}</div>
        <div class="info-row"><span class="info-label">UBICACIÓN:</span>{{ proyecto_ubicacion }}</div>
        <div class="info-row"><span class="info-label">ASESOR COMERCIAL:</span>{{ asesor_comercial }}</div>
        <div class="info-row"><span class="info-label">TELÉFONO:</span>962429895</div>
        <div class="info-row"><span class="info-label">FECHA DE EMISIÓN:</span>{{ fecha_emision }}</div>
                </div>
            </div>
            <div class="intro-text">
                Es grato dirigirnos a Ud. a fin de alcanzarle, de acuerdo a su requerimiento, nuestra cotización por los servicios solicitados de los siguientes ensayos de laboratorio:
            </div>
<table>
                <thead>
                    <tr>
<th>Código</th><th>Descripción Ensayo</th><th>Norma</th><th>Costo Unitario (S/)</th><th>Cantidad</th><th>Costo Parcial (S/)</th>
                    </tr>
                </thead>
                <tbody>
<tr class="section-row"><td colspan="3">{{variant_conditions.title}}</td><td></td><td></td><td></td></tr>
                    {{#each items}}
                    <tr>
                        <td>{{codigo}}</td>
                        <td>{{descripcion}}</td>
                        <td>{{norma}}</td>
<td style="text-align:right">{{costo_unitario}}</td>
<td style="text-align:center">{{cantidad}}</td>
<td style="text-align:right">{{costo_parcial}}</td>
                    </tr>
                    {{/each}}
<tr class="total-row"><td colspan="4"></td><td>Costo Parcial:</td><td style="text-align:right">S/ {{ subtotal }}</td></tr>
<tr class="total-row"><td colspan="4"></td><td>IGV 18%:</td><td style="text-align:right">S/ {{ igv }}</td></tr>
<tr class="total-row"><td colspan="4"></td><td>Costo Total:</td><td style="text-align:right">S/ {{ total }}</td></tr>
                </tbody>
            </table>
<div class="footer-note">(*) Ensayo dentro del alcance de acreditación INACAL.</div>
<div class="subtitle-box"><span class="subtitle-inner">I. CONDICIONES DEL SERVICIO</span></div>
                <div class="conditions-content">
<strong>VALIDEZ DE LA OFERTA:</strong> 30 días calendario. Si la cotización llegó al límite de validez, solicite actualización.<br/>
<strong>CONDICIONES ESPECÍFICAS:</strong>
                    <ul class="conditions-list">
{{#each variant_conditions.conditions}}
<li>{{this}}</li>
{{/each}}
                    </ul>
                </div>
<div class="footer-bar">
                GEOFAL - Ingeniería y laboratorio de materiales | Av. Marañón N° 763, Los Olivos, Lima
            </div>
<div class="page-break"></div>
<div class="normal-subtitle">PLAZO ESTIMADO DE EJECUCIÓN DE SERVICIO</div>
<div class="conditions-content">
El plazo de entrega será de los resultados se estima {{delivery_days}} días hábiles, este tiempo está sujeto a la programación enviada por el área de LEM.<br/>
El laboratorio enviará un correo de confirmación de recepción y fecha de entrega del informe.
        </div>
<div class="normal-subtitle">CONTRAMUESTRA</div>
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
Como parte de la mejora de nuestros procesos y en alineamiento con el Laboratorio Nacional INACAL-DM(PRODUCE) a partir de julio del 2022 los informes de ensayo son emitidos de forma digital con firma electrónica.<br/>
La entrega de los informes de ensayo será mediante el intranet de la pagina web www.geofal.com.pe, y se enviará un correo de confirmación con el usuario y clave para el acceso.<br/>
Geofal no declara conformidad de sus informes de ensayo.<br/>
En caso se requiera la modificación del informe de ensayo a consecuencia de los datos proporcionados por el cliente, esta se realizará mediante la emisión de un nuevo informe que tendrá un costo adicional de acuerdo a evaluación.
            </div>
<div class="normal-subtitle">HORARIO DE ATENCIÓN</div>
<div class="conditions-content">
El horario para recepción de muestra y entrega de informes es de Lunes a Viernes de 8:30am a 1:00pm y 2:00pm a 5:30pm, y Sábado de 8:30am a 12:30pm
                </div>
<div class="subtitle-box"><span class="subtitle-inner">II. CONDICIÓN DE PAGO</span></div>
                <div class="conditions-content">
<span style="font-weight:bold;">CONDICIÓN:</span> El pago del servicio deberá ser realizado por Adelantado.<br/>
<span style="font-weight:bold;">RAZON SOCIAL:</span> Geofal S.A.C. <span style="font-weight:bold;">RUC:</span> 20549356762<br/>
Sírvase realizar el depósito correspondiente de los servicios a nuestra cuenta bancaria:
<ul style="margin-top:8px; margin-bottom:6px;">
<li><span style="font-weight:bold;">Cuenta de detracción Banco de La Nación:</span><br/>- Cuenta de detracción Banco de La Nación: N° 00-074-045472</li>
<li><span style="font-weight:bold;">Cuenta corriente Interbank:</span><br/>- Cuenta Corriente en Soles de Interbank: N° 200-3005201096-31<br/>- Código Interbancario (CCI) de Interbank: N° 003-200-003005201096-31</li>
<li><span style="font-weight:bold;">Cuenta corriente BCP:</span><br/>- Cuenta Corriente en Soles del Banco de Crédito del Perú (BCP): N° 192 2024 3030 04<br/>- Código Interbancario (CCI) del Banco de Crédito del Perú (BCP): N° 002-192-002 02430 3004-34</li>
<li><span style="font-weight:bold;">Cuenta corriente BBVA:</span><br/>- Cuenta Corriente en Soles BBVA: N° 0111-0174-0100082311-00<br/>- Código Interbancario (CCI) BBVA: N° 011-174-000100082311-00</li>
                    </ul>
Se debe enviar el comprobante de depósito realizado vía correo electrónico.
                </div>
<div class="subtitle-box"><span class="subtitle-inner">III. ACEPTACIÓN DE LA COTIZACIÓN</span></div>
<div class="conditions-content">
La aceptación de la cotización de parte del cliente será mediante, Pago respectivo del servicio según cotización enviada, Envío de la orden de servicio. Envío de correo aceptando el servicio, a los siguientes correos laboratorio@geofal.com.pe y/o asesorcomercial@geofal.com.pe, en señal de conformidad.<br/>
Le agradeceremos que nos envíe el comprobante del depósito realizado vía correo electrónico.
            </div>
<div class="signature-block">
Atentamente,<br/>
Geofal SAC<br/>
Av. Río Marañón N° 763, Los Olivos, Lima<br/>
Telf.: (01) 9051911 / (01) 7543070 – 982428985 - 965057624 - 993077479
                </div>
<div style="font-size:10px;margin-top:7px;">
  COM-F-01<br/>
  Página 2 de 2<br/>
  Versión: 03 (01-08-2022)<br/>
  <span style="float:right;">Fin del documento</span>
            </div>
<div class="footer-bar">
                GEOFAL - Ingeniería y laboratorio de materiales | Av. Marañón N° 763, Los Olivos, Lima
        </div>
    </div>
</body>
</html>
  `;
  
  const compiledTemplate = handlebars.compile(template);
  return compiledTemplate(data);
}

async function convertHtmlToPdf(htmlPath, outputPath) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  try {
    const page = await browser.newPage();
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {top: '15mm', right: '10mm', bottom: '15mm', left: '10mm'},
      preferCSSPageSize: true,
      displayHeaderFooter: false
    });
  } finally {
    await browser.close();
  }
}

function getVariantConditions(variantId) {
  const variants = {
    'V1': {
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
    },
    'V2': {
      title: 'PROBETAS',
      delivery_days: 5,
      conditions: [
        'El cliente debe proporcionar las probetas antes del ingreso a obra.',
        'El cliente deberá de entregar las muestras debidamente identificadas.',
        'El cliente deberá especificar la Norma a ser utilizada para la ejecución del ensayo, caso contrario se considera Norma ASTM o NTP vigente de acuerdo con el alcance del laboratorio.',
        'El cliente deberá entregar las muestras en las instalaciones del LEM, ubicado en la Av. Marañón N° 763, Los Olivos, Lima.'
      ],
      payment_conditions: [
        'El pago debe realizarse antes del inicio de los ensayos.',
        'Se acepta pago en efectivo, transferencia bancaria o cheque.',
        'Los precios incluyen IGV (18%).',
        'La cotización tiene una validez de 30 días calendario.'
      ]
    },
    'V3': {
      title: 'DENSIDAD DE CAMPO Y MUESTREO',
      delivery_days: 6,
      conditions: [
        'El cliente deberá enviar al laboratorio, para los ensayo en suelo y agregados, la cantidad minima de 100 kg por cada muestra.',
        'Para el ensayo de Densidad de campo, la cantidad de puntos/salida minimo 4 und.',
        'El cliente deberá de programar el servicio, Densidad de campo, con 24 horas de anticipación.',
        'El cliente deberá especificar la Norma a ser utilizada para la ejecución del ensayo, caso contrario se considera Norma ASTM o NTP vigente de acuerdo con el alcance del laboratorio.',
        'El cliente deberá entregar las muestras en las instalaciones del LEM, ubicado en la Av. Marañón N° 763, Los Olivos, Lima.'
      ],
      payment_conditions: [
        'El pago debe realizarse antes del inicio de los ensayos.',
        'Se acepta pago en efectivo, transferencia bancaria o cheque.',
        'Los precios incluyen IGV (18%).',
        'La cotización tiene una validez de 30 días calendario.'
      ]
    },
    'V4': {
      title: 'EXTRACCIÓN DE DIAMANTINA',
      delivery_days: 8,
      conditions: [
        'Movilización y desmovilización de equipos y del personal técnico, estara a cargo de GEOFAL.',
        'Resane de estructura de concreto con sika rep 500 y Sikadur 32, estara a cargo de GEOFAL.',
        'El servicio no incluye trabajos de acabados como pintura, mayolica y otros.',
        'El area de trabajo, zona de extracción de diamantina, tiene que estar libre de interferencia.',
        'La extracción de diamantina se realizara en 2 dia en campo, en laboratorio se realizará el tallado y refrentado de diamantina, el ensayo de resistencia a la compresión de testigo de diamantina se realizara en 5 dias (el tiempo de ensayo obedece a la normativa vigente).',
        'Costo de resane insumos 250 soles, este costo se distribuira de acuerdo con el numero de perforaciones Donde se hara las extracciones de diamantina.'
      ],
      payment_conditions: [
        'El pago debe realizarse antes del inicio de los ensayos.',
        'Se acepta pago en efectivo, transferencia bancaria o cheque.',
        'Los precios incluyen IGV (18%).',
        'La cotización tiene una validez de 30 días calendario.',
        'En caso de cancelación, se cobrará el 50% del monto total.'
      ]
    },
    'V5': {
      title: 'DIAMANTINA PARA PASES',
      delivery_days: 7,
      conditions: [
        'El cliente deberá de programar el servicio, Extracción diamantina, con 24 horas de anticipación.',
        'El area de trabajo, zona de extraccion de diamantina, debera estar libre de interferencia.',
        'Para extraer la diamantina, se ubicara el acero con un escaneador.',
        'Movilizacion y desmovilizacion de equipos y del personal tecnico, estara a cargo de Geofal.'
      ],
      payment_conditions: [
        'El pago debe realizarse antes del inicio de los ensayos.',
        'Se acepta pago en efectivo, transferencia bancaria o cheque.',
        'Los precios incluyen IGV (18%).',
        'La cotización tiene una validez de 30 días calendario.'
      ]
    },
    'V6': {
      title: 'ALBAÑILERÍA',
      delivery_days: 5,
      conditions: [
        'El cliente deberá enviar al laboratorio, 20 ladrillo de cada tipo, en buen estado y sin presentar fisuras.',
        'El cliente deberá de entregar las muestras debidamente identificadas.',
        'El cliente deberá especificar la Norma a ser utilizada para la ejecución del ensayo, caso contrario se considera Norma ASTM o NTP vigente de acuerdo con el alcance del laboratorio.',
        'El cliente deberá entregar las muestras en las instalaciones del LEM, ubicado en la Av. Marañón N° 763, Los Olivos, Lima.'
      ],
      payment_conditions: [
        'El pago debe realizarse antes del inicio de los ensayos.',
        'Se acepta pago en efectivo, transferencia bancaria o cheque.',
        'Los precios incluyen IGV (18%).',
        'La cotización tiene una validez de 30 días calendario.'
      ]
    },
    'V7': {
      title: 'VIGA BECKELMAN',
      delivery_days: 6,
      conditions: [
        'El cliente deberá de programar el servicio, Ensayo de Deflexión, con 24 horas de anticipación.',
        'El area de trabajo tiene que estar habilitado.',
        'El cliente deberá especificar la Norma a ser utilizada para la ejecución del ensayo, caso contrario se considera Norma ASTM o NTP o MTC vigente de acuerdo con el alcance del laboratorio.',
        'Especificar las caracteristicas del camion.'
      ],
      payment_conditions: [
        'El pago debe realizarse antes del inicio de los ensayos.',
        'Se acepta pago en efectivo, transferencia bancaria o cheque.',
        'Los precios incluyen IGV (18%).',
        'La cotización tiene una validez de 30 días calendario.'
      ]
    },
    'V8': {
      title: 'CONTROL DE CALIDAD DE CONCRETO FRESCO EN OBRA',
      delivery_days: 10,
      conditions: [
        'El cliente deberá de programar el servicio, con 24 horas de anticipación.',
        'Para el ensayo de control de calidad de concreto fresco en obra, se moldeara 6 probetas, ensayo slump, control de temperatura, en laboratorio las probetas se colocara en camara de curado, el ensayo de compresión de las probetas seran 3 a 7 dias y 3 a 28 dias.',
        'El control de calidad del concreto fresco se sacara cada 50m3 a uno de los mixer donde se hara todos los ensayos respectivos mencionados, o por dia asi no se halla llegado los 50m3.',
        'El cliente deberá especificar la Norma a ser utilizada para la ejecución del ensayo, caso contrario se considera Norma ASTM o NTP vigente de acuerdo con el alcance del laboratorio.'
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
  return variants[variantId] || variants['V1'];
}

module.exports = {
  generateSmartTemplatePdf,
  getVariantConditions
};
