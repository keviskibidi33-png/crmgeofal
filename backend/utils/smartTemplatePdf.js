const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');

/**
 * Genera PDF usando la plantilla HTML existente como base pero con HTML limpio
 */
async function generateSmartTemplatePdf(bundle, outputPath) {
  try {
    console.log('🎨 Generando PDF con plantilla inteligente...');
    
    // Procesar datos del bundle
    const processedData = processBundleData(bundle);
    
    // Generar HTML limpio basado en tu plantilla
    const htmlContent = generateCleanHtmlTemplate(processedData);
    
    // Guardar HTML temporal
    const tempHtmlPath = path.join(__dirname, '..', 'tmp', `temp_${Date.now()}.html`);
    await fs.writeFile(tempHtmlPath, htmlContent, 'utf8');
    
    console.log('🔄 Convirtiendo HTML a PDF con puppeteer...');
    console.log(`   HTML: ${tempHtmlPath}`);
    console.log(`   PDF: ${outputPath}`);
    
    // Convertir HTML a PDF
    await convertHtmlToPdf(tempHtmlPath, outputPath);
    
    // Limpiar archivo temporal
    await fs.unlink(tempHtmlPath);
    
    console.log('✅ HTML convertido a PDF exitosamente');
    return true;
    
  } catch (error) {
    console.error('❌ Error generando PDF con plantilla inteligente:', error);
    throw error;
  }
}

/**
 * Procesa los datos del bundle para el HTML
 */
function processBundleData(bundle) {
  try {
    console.log('🎨 Procesando datos para plantilla inteligente...');
    
    // Calcular totales
    let subtotal = 0;
    const items = bundle.items || [];
    
    items.forEach(item => {
      const unitPrice = parseFloat(item.unit_price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      subtotal += unitPrice * quantity;
    });
    
    const igv = subtotal * 0.18;
    const total = subtotal + igv;
    
    // Formatear fecha
    const fechaFormateada = new Date().toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Obtener variante seleccionada
    const variantId = bundle.quote?.variant_id;
    const variantConditions = getVariantConditions(variantId);
    
    // Datos para el HTML
    const htmlData = {
      // Información de la cotización
      numero_cotizacion: `COT-${bundle.quote?.id || 'XXX'}-25`,
      fecha_emision: fechaFormateada,
      fecha_solicitud: bundle.quote?.meta?.quote?.request_date || '',
      referencia: bundle.quote?.meta?.quote?.reference || 'SEGÚN LO SOLICITADO VÍA CORREO ELECTRÓNICO / LLAMADA TELEFÓNICA',
      asesor_comercial: bundle.quote?.meta?.quote?.commercial_name || 'Silvia Peralta',
      
      // Información del cliente
      cliente_nombre: bundle.company?.name || 'GEOFAL SAC',
      cliente_ruc: bundle.company?.ruc || '20549356762',
      cliente_contacto: bundle.quote?.meta?.customer?.contact_name || 'Brenda Vilca Calla',
      cliente_telefono: bundle.quote?.meta?.customer?.contact_phone || '944435392',
      cliente_correo: bundle.quote?.meta?.customer?.contact_email || 'ingenieria@geofal.com.pe',
      
      // Información del proyecto
      proyecto_nombre: bundle.project?.name || 'AP5119_B_U_GF_MP_30 CULTA',
      proyecto_ubicacion: bundle.project?.location || '',
      
      // Items de la cotización
      items: items.map((item, index) => {
        const unitPrice = parseFloat(item.unit_price) || 0;
        const quantity = parseInt(item.quantity) || 1;
        const partialCost = unitPrice * quantity;
        
        return {
          codigo: item.code || '',
          descripcion: item.description || '',
          norma: item.norm || '',
          costo_unitario: unitPrice.toFixed(2),
          cantidad: quantity,
          costo_parcial: partialCost.toFixed(2)
        };
      }),
      
      // Totales
      subtotal: subtotal.toFixed(2),
      igv: igv.toFixed(2),
      total: total.toFixed(2),
      
      // Condiciones de la variante
      variant_conditions: variantConditions
    };
    
    console.log('✅ Datos procesados para plantilla inteligente:', Object.keys(htmlData).length, 'campos');
    console.log('💰 Totales calculados:', { subtotal, igv, total });
    
    return htmlData;
    
  } catch (error) {
    console.error('❌ Error al procesar datos para plantilla inteligente:', error);
    throw error;
  }
}

/**
 * Genera HTML limpio basado en tu plantilla
 */
function generateCleanHtmlTemplate(data) {
  const template = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cotización {{ numero_cotizacion }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #000;
            background: white;
        }
        
        .page {
            page-break-after: always;
            min-height: 100vh;
            position: relative;
            padding: 20px;
        }
        
        .page:last-child {
            page-break-after: avoid;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        
        .header {
            display: flex;
            align-items: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #ff6b35;
            padding-bottom: 10px;
        }
        
        .logo {
            width: 80px;
            height: 30px;
            background-color: #FF6B35;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
            margin-right: 20px;
        }
        
        .company-name {
            font-size: 10px;
            color: #000;
        }
        
        .title {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            margin: 20px 0;
            text-decoration: underline;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .info-section {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .info-row {
            display: flex;
            align-items: center;
        }
        
        .info-label {
            font-weight: bold;
            width: 120px;
            flex-shrink: 0;
        }
        
        .info-value {
            flex: 1;
        }
        
        .intro-text {
            margin: 20px 0;
            font-size: 11px;
            line-height: 1.5;
        }
        
        .table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            table-layout: fixed;
        }
        
        .table th,
        .table td {
            border: 1px solid #000;
            padding: 6px 4px;
            text-align: left;
            font-size: 8px;
            vertical-align: top;
        }
        
        .table th {
            background-color: #f2f2f2;
            font-weight: bold;
            text-align: center;
        }
        
        .table .section-row {
            background-color: #e9ecef;
            font-weight: bold;
        }
        
        .table .total-row {
            background-color: #e9ecef;
            font-weight: bold;
        }
        
        /* Columnas específicas */
        .table th:nth-child(1), .table td:nth-child(1) { width: 8%; } /* Código */
        .table th:nth-child(2), .table td:nth-child(2) { width: 35%; } /* Descripción */
        .table th:nth-child(3), .table td:nth-child(3) { width: 25%; } /* Norma */
        .table th:nth-child(4), .table td:nth-child(4) { width: 12%; } /* Costo Unitario */
        .table th:nth-child(5), .table td:nth-child(5) { width: 8%; } /* Cantidad */
        .table th:nth-child(6), .table td:nth-child(6) { width: 12%; } /* Costo Parcial */
        
        .footer-note {
            margin-top: 20px;
            font-size: 9px;
            text-align: center;
            color: #666;
        }
        
        .page-footer {
            position: fixed;
            bottom: 20px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 8px;
            color: #999;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        
        .page-number {
            position: fixed;
            bottom: 10px;
            right: 20px;
            font-size: 8px;
            color: #999;
        }
        
        .conditions-section {
            margin-top: 30px;
        }
        
        .conditions-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 15px;
            text-decoration: underline;
        }
        
        .conditions-content {
            font-size: 10px;
            line-height: 1.5;
            margin-bottom: 20px;
        }
        
        .conditions-list {
            margin-left: 20px;
        }
        
        .conditions-list li {
            margin-bottom: 8px;
        }
    </style>
</head>
<body>
    <!-- PÁGINA 1: COTIZACIÓN -->
    <div class="page">
        <div class="container">
            <!-- Header -->
            <div class="header">
                <div class="logo">GEOFAL</div>
                <div class="company-name">Ingeniería y laboratorio de materiales</div>
            </div>
        
            <!-- Título -->
            <div class="title">COTIZACIÓN N° {{ numero_cotizacion }}</div>
            
            <!-- Información del cliente y proyecto -->
            <div class="info-grid">
                <div class="info-section">
                    <div class="info-row">
                        <span class="info-label">CLIENTE:</span>
                        <span class="info-value">{{ cliente_nombre }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">R.U.C.:</span>
                        <span class="info-value">{{ cliente_ruc }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">CONTACTO:</span>
                        <span class="info-value">{{ cliente_contacto }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">TELÉFONO:</span>
                        <span class="info-value">{{ cliente_telefono }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">CORREO:</span>
                        <span class="info-value">{{ cliente_correo }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">FECHA SOLICITUD:</span>
                        <span class="info-value">{{ fecha_solicitud }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">REFERENCIA:</span>
                        <span class="info-value">{{ referencia }}</span>
                    </div>
                </div>
                
                <div class="info-section">
                    <div class="info-row">
                        <span class="info-label">PROYECTO:</span>
                        <span class="info-value">{{ proyecto_nombre }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">UBICACIÓN:</span>
                        <span class="info-value">{{ proyecto_ubicacion }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">ASESOR COMERCIAL:</span>
                        <span class="info-value">{{ asesor_comercial }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">TELÉFONO:</span>
                        <span class="info-value">962429895</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">FECHA DE EMISIÓN:</span>
                        <span class="info-value">{{ fecha_emision }}</span>
                    </div>
                </div>
            </div>
            
            <!-- Texto introductorio -->
            <div class="intro-text">
                Es grato dirigirnos a Ud. a fin de alcanzarle, de acuerdo a su requerimiento, nuestra cotización por los servicios solicitados de los siguientes ensayos de laboratorio:
            </div>
            
            <!-- Condiciones del Servicio en Primera Página -->
            <div class="conditions-section">
                <div class="conditions-title">I. CONDICIONES DEL SERVICIO</div>
                <div class="conditions-content">
                    <p><strong>VALIDEZ DE LA OFERTA:</strong> 30 días calendarios. Si la cotización llegó al límite de su validez, solicite una actualización.</p>
                    
                    <p><strong>CONDICIONES ESPECÍFICAS:</strong></p>
                    <ul class="conditions-list">
                        <li>El cliente deberá enviar un mínimo de 30 kg de muestra fina y 70 kg de muestra gruesa para ensayos de suelo al laboratorio.</li>
                        <li>El cliente deberá entregar las muestras debidamente identificadas.</li>
                        <li>El cliente deberá especificar la Norma a ser utilizada para la ejecución del ensayo, caso contrario se considera Norma ASTM o NTP vigente de acuerdo con el alcance del laboratorio.</li>
                        <li>El cliente deberá entregar las muestras en las instalaciones del LEM, ubicado en la Av. Marañón N° 763, Los Olivos, Lima.</li>
                    </ul>
                </div>
            </div>
            
            <!-- Tabla de ensayos -->
            <table class="table">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Descripción Ensayo</th>
                        <th>Norma</th>
                        <th>Costo Unitario (S/)</th>
                        <th>Cantidad</th>
                        <th>Costo Parcial (S/)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="section-row">
                        <td colspan="3">ENSAYOS DE LABORATORIO</td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                    {{#each items}}
                    <tr>
                        <td>{{codigo}}</td>
                        <td>{{descripcion}}</td>
                        <td>{{norma}}</td>
                        <td>{{costo_unitario}}</td>
                        <td>{{cantidad}}</td>
                        <td>{{costo_parcial}}</td>
                    </tr>
                    {{/each}}
                    <tr class="total-row">
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>Costo Parcial:</td>
                        <td></td>
                        <td>S/ {{ subtotal }}</td>
                    </tr>
                    <tr class="total-row">
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>IGV 18%:</td>
                        <td></td>
                        <td>S/ {{ igv }}</td>
                    </tr>
                    <tr class="total-row">
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>Costo Total:</td>
                        <td></td>
                        <td>S/ {{ total }}</td>
                    </tr>
                </tbody>
            </table>
            
            <!-- Nota al pie -->
            <div class="footer-note">
                (*) Ensayo dentro del alcance de acreditación INACAL.
            </div>
            
            <!-- Footer de página -->
            <div class="page-footer">
                GEOFAL - Ingeniería y laboratorio de materiales | Av. Marañón N° 763, Los Olivos, Lima
            </div>
            
            <!-- Número de página -->
            <div class="page-number">Página 1 de 2</div>
        </div>
    </div>
    
    <!-- PÁGINA 2: CONDICIONES -->
    <div class="page">
        <div class="container">
            <!-- Header -->
            <div class="header">
                <div class="logo">GEOFAL</div>
                <div class="company-name">Ingeniería y laboratorio de materiales</div>
            </div>
            
            <!-- Título -->
            <div class="title">CONDICIONES DE SERVICIO Y PAGO</div>
            
            <!-- I. CONDICIONES DEL SERVICIO -->
            <div class="conditions-section">
                <div class="conditions-title">I. CONDICIONES DEL SERVICIO</div>
                <div class="conditions-content">
                    <p><strong>CONDICIÓN:</strong> El pago del servicio deberá ser realizado por Adelantado.</p>
                    <p><strong>RAZON SOCIAL:</strong> Geofal S.A.C. RUC: 20549356762</p>
                    <p>Sírvase realizar el depósito correspondiente de los servicios a nuestra cuenta bancaria:</p>
                    
                    <p><strong>Cuenta de detraccion Banco de La Nación:</strong> Nº 00-074-045472</p>
                    
                    <p><strong>Cuenta corriente Interbank:</strong></p>
                    <ul>
                        <li>Cuenta Corriente en Soles de Interbank: Nº 200-3005201096</li>
                        <li>Código Interbancario (CCI) de Interbank: Nº 003-200-003005201096-31</li>
                    </ul>
                    
                    <p><strong>Cuenta corriente BCP:</strong></p>
                    <ul>
                        <li>Cuenta Corriente en Soles del Banco de Crédito del Perú (BCP): Nº 192 2024 3030 04</li>
                        <li>Código Interbancario (CCI) del Banco de Crédito del Perú (BCP): Nº 002-192-002 02430 3004-34</li>
                    </ul>
                    
                    <p><strong>Cuenta corriente BBVA:</strong></p>
                    <ul>
                        <li>Cuenta Corriente en Soles BBVA: Nº 0011-0174-0100082311-00</li>
                        <li>Código Interbancario (CCI) BBVA: Nº 011-174-000100082311-00</li>
                    </ul>
                    
                    <p>Le agradeceremos que nos envie el comprobante del depósito realizado via correo electronico</p>
                </div>
            </div>
            
            <!-- II. CONDICIONES DE PAGO -->
            <div class="conditions-section">
                <div class="conditions-title">II. CONDICIONES DE PAGO</div>
                <div class="conditions-content">
                    <p>La aceptación de la cotización de parte del cliente será mediante:</p>
                    <ul>
                        <li>Pago respectivo del servicio según cotización enviada</li>
                        <li>Envío de la orden de servicio</li>
                        <li>Envío de correo aceptando el servicio, a los siguientes correos laboratorio@geofal.com.pe y/o asesorcomercial@geofal.com.pe, en señal de conformidad</li>
                    </ul>
                </div>
            </div>
            
            <!-- III. ACEPTACIÓN DE LA COTIZACIÓN -->
            <div class="conditions-section">
                <div class="conditions-title">III. ACEPTACIÓN DE LA COTIZACIÓN</div>
                <div class="conditions-content">
                    <p><strong>PLAZO ESTIMADO DE EJECUCIÓN DE SERVICIO</strong></p>
                    <ul>
                        <li>El plazo de entrega será de los resultados se estima {{ variant_conditions.delivery_days }} días hábiles, este tiempo está sujeto a la programación enviada por el área de LEM.</li>
                        <li>El laboratorio enviará un correo de confirmación de recepción y fecha de entrega del informe.</li>
                    </ul>
                    
                    <p><strong>CONTRAMUESTRA</strong></p>
                    <p>Al finalizar los ensayos, la muestra sobrante/contramuestra permanecerán en custodia por un tiempo de 10 días calendario después de emitido el informe de ensayo. Siempre que se trate de una muestra dirimente, las contramuestras serán devueltas a los clientes, previa coordinación y autorización, caso contrario, serán eliminadas si se trata de residuos del ensayo o contramuestras de ensayo.</p>
                    
                    <p><strong>CONFIDENCIALIDAD</strong></p>
                    <p>El laboratorio mantiene acuerdos de confidencialidad entre el cliente y el laboratorio, la divulgación de la información sin la autorización de las partes, no es permitida. El laboratorio mantiene reserva de la información brindada por el cliente, salvo solicitud de la información por ley, o por entidades gubernamentales inmersos dentro del presente servicio de ensayo.</p>
                    
                    <p><strong>QUEJAS Y SUGERENCIAS</strong></p>
                    <p>Si tiene alguna queja o sugerencia, lo invitamos a conocer nuestro Proceso de Atención de Quejas, el cual iniciará 24 horas después de recibida la queja. El plazo límite establecido para la recepción de quejas respecto a un informe de ensayo es de 10 días después de emitido el documento. Pasado este plazo, no se aceptarán quejas bajo ninguna circunstancia.</p>
                    
                    <p><strong>ENTREGA DE INFORME DE ENSAYO</strong></p>
                    <ul>
                        <li>Como parte de la mejora de nuestros procesos y en alineamiento con el Laboratorio Nacional INACAL-DM(PRODUCE) a partir de julio del 2022 los informes de ensayo son emitidos de forma digital con firma electrónica.</li>
                        <li>La entrega de los informes de ensayo será mediante el intranet de la pagina web www.geofal.com.pe, y se enviará un correo de confirmación con el usuario y clave para el acceso.</li>
                        <li>Geofal no declara conformidad de sus informes de ensayo.</li>
                        <li>En caso se requiera la modificación del informe de ensayo a consecuencia de los datos proporcionados por el cliente, esta se realizará mediante la emisión de un nuevo informe que tendrá un costo adicional de acuerdo a evaluación.</li>
                    </ul>
                    
                    <p><strong>HORARIO DE ATENCIÓN</strong></p>
                    <p>El horario para recepción de muestra y entrega de informes es de Lunes a Viernes de 8:30am a 1:00pm y 2:00pm a 5:30pm, y Sábado de 8:30am a 12:30pm</p>
                </div>
            </div>
            
            <!-- Información de Contacto -->
            <div class="conditions-section">
                <div class="conditions-content">
                    <p><strong>Atentamente,</strong></p>
                    <p><strong>Geofal SAC</strong></p>
                    <p>Av. Río Marañón N° 763, Los Olivos, Lima</p>
                    <p>Telf.: (01) 9051911 / (01) 7543070 - 982429895 - 956057624 - 993077479</p>
                    <p><strong>Fin del documento</strong></p>
                    <p>COM-F-01</p>
                    <p>Versión: 03 (01-08-2022)</p>
                </div>
            </div>
            
            <!-- Footer de página -->
            <div class="page-footer">
                GEOFAL - Ingeniería y laboratorio de materiales | Av. Marañón N° 763, Los Olivos, Lima
            </div>
            
            <!-- Número de página -->
            <div class="page-number">Página 2 de 2</div>
        </div>
    </div>
</body>
</html>
  `;
  
  // Compilar template con handlebars
  const compiledTemplate = handlebars.compile(template);
  
  // Renderizar con datos
  return compiledTemplate(data);
}

/**
 * Convierte HTML a PDF usando puppeteer
 */
async function convertHtmlToPdf(htmlPath, outputPath) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Cargar HTML
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
    
    // Generar PDF
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      }
    });
    
  } finally {
    await browser.close();
  }
}

/**
 * Obtiene las condiciones específicas de la variante
 */
function getVariantConditions(variantId) {
    const variants = {
        'V1': {
          title: 'MUESTRA DE SUELO Y AGREGADO',
          delivery_days: 15,
          conditions: [
            'El cliente debe proporcionar las probetas antes del ingreso a obra.',
            'El cliente deberá de entregar las muestras debidamente identificadas.',
            'El cliente deberá especificar la Norma a ser utilizada para la ejecución del ensayo, caso contrario se considera Norma ASTM o NTP vigente de acuerdo con el alcance del laboratorio.',
            'El cliente deberá entregar las muestras en las instalaciones del LEM, ubicado en la Av. Marañón N° 763, Los Olivos, Lima.',
            'Los resultados se entregarán en un plazo máximo de 15 días hábiles.',
            'Los ensayos se realizarán dentro del alcance de acreditación INACAL.'
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
          delivery_days: 10,
          conditions: [
            'El cliente debe proporcionar las probetas antes del ingreso a obra.',
            'Las probetas deben estar en perfecto estado y debidamente identificadas.',
            'El cliente deberá especificar la Norma a ser utilizada para la ejecución del ensayo.',
            'El cliente deberá entregar las probetas en las instalaciones del LEM.',
            'Los resultados se entregarán en un plazo máximo de 10 días hábiles.',
            'Los ensayos se realizarán dentro del alcance de acreditación INACAL.'
          ],
          payment_conditions: [
            'El pago debe realizarse antes del inicio de los ensayos.',
            'Se acepta pago en efectivo, transferencia bancaria o cheque.',
            'Los precios incluyen IGV (18%).',
            'La cotización tiene una validez de 30 días calendario.',
            'En caso de cancelación, se cobrará el 50% del monto total.'
          ]
        },
        'V3': {
          title: 'DENSIDAD DE CAMPO Y MUESTREO',
          delivery_days: 20,
          conditions: [
            'El cliente debe proporcionar las probetas antes del ingreso a obra.',
            'El cliente deberá de entregar las muestras debidamente identificadas.',
            'El cliente deberá especificar la Norma a ser utilizada para la ejecución del ensayo.',
            'El cliente deberá entregar las muestras en las instalaciones del LEM.',
            'Los resultados se entregarán en un plazo máximo de 20 días hábiles.',
            'Los ensayos se realizarán dentro del alcance de acreditación INACAL.'
          ],
          payment_conditions: [
            'El pago debe realizarse antes del inicio de los ensayos.',
            'Se acepta pago en efectivo, transferencia bancaria o cheque.',
            'Los precios incluyen IGV (18%).',
            'La cotización tiene una validez de 30 días calendario.',
            'En caso de cancelación, se cobrará el 50% del monto total.'
          ]
        },
        'V4': {
          title: 'EXTRACCIÓN DE DIAMANTINA',
          delivery_days: 25,
          conditions: [
            'El cliente debe proporcionar las probetas antes del ingreso a obra.',
            'El cliente deberá de entregar las muestras debidamente identificadas.',
            'El cliente deberá especificar la Norma a ser utilizada para la ejecución del ensayo.',
            'El cliente deberá entregar las muestras en las instalaciones del LEM.',
            'Los resultados se entregarán en un plazo máximo de 25 días hábiles.',
            'Los ensayos se realizarán dentro del alcance de acreditación INACAL.'
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
          delivery_days: 30,
          conditions: [
            'El cliente debe proporcionar las probetas antes del ingreso a obra.',
            'El cliente deberá de entregar las muestras debidamente identificadas.',
            'El cliente deberá especificar la Norma a ser utilizada para la ejecución del ensayo.',
            'El cliente deberá entregar las muestras en las instalaciones del LEM.',
            'Los resultados se entregarán en un plazo máximo de 30 días hábiles.',
            'Los ensayos se realizarán dentro del alcance de acreditación INACAL.'
          ],
          payment_conditions: [
            'El pago debe realizarse antes del inicio de los ensayos.',
            'Se acepta pago en efectivo, transferencia bancaria o cheque.',
            'Los precios incluyen IGV (18%).',
            'La cotización tiene una validez de 30 días calendario.',
            'En caso de cancelación, se cobrará el 50% del monto total.'
          ]
        },
        'V6': {
          title: 'ALBAÑILERÍA',
          delivery_days: 18,
          conditions: [
            'El cliente debe proporcionar las probetas antes del ingreso a obra.',
            'El cliente deberá de entregar las muestras debidamente identificadas.',
            'El cliente deberá especificar la Norma a ser utilizada para la ejecución del ensayo.',
            'El cliente deberá entregar las muestras en las instalaciones del LEM.',
            'Los resultados se entregarán en un plazo máximo de 18 días hábiles.',
            'Los ensayos se realizarán dentro del alcance de acreditación INACAL.'
          ],
          payment_conditions: [
            'El pago debe realizarse antes del inicio de los ensayos.',
            'Se acepta pago en efectivo, transferencia bancaria o cheque.',
            'Los precios incluyen IGV (18%).',
            'La cotización tiene una validez de 30 días calendario.',
            'En caso de cancelación, se cobrará el 50% del monto total.'
          ]
        },
        'V7': {
          title: 'VIGA BECKELMAN',
          delivery_days: 22,
          conditions: [
            'El cliente debe proporcionar las probetas antes del ingreso a obra.',
            'El cliente deberá de entregar las muestras debidamente identificadas.',
            'El cliente deberá especificar la Norma a ser utilizada para la ejecución del ensayo.',
            'El cliente deberá entregar las muestras en las instalaciones del LEM.',
            'Los resultados se entregarán en un plazo máximo de 22 días hábiles.',
            'Los ensayos se realizarán dentro del alcance de acreditación INACAL.'
          ],
          payment_conditions: [
            'El pago debe realizarse antes del inicio de los ensayos.',
            'Se acepta pago en efectivo, transferencia bancaria o cheque.',
            'Los precios incluyen IGV (18%).',
            'La cotización tiene una validez de 30 días calendario.',
            'En caso de cancelación, se cobrará el 50% del monto total.'
          ]
        },
        'V8': {
          title: 'CONTROL DE CALIDAD DE CONCRETO FRESCO EN OBRA',
          delivery_days: 12,
          conditions: [
            'El cliente debe proporcionar las probetas antes del ingreso a obra.',
            'El cliente deberá de entregar las muestras debidamente identificadas.',
            'El cliente deberá especificar la Norma a ser utilizada para la ejecución del ensayo.',
            'El cliente deberá entregar las muestras en las instalaciones del LEM.',
            'Los resultados se entregarán en un plazo máximo de 12 días hábiles.',
            'Los ensayos se realizarán dentro del alcance de acreditación INACAL.'
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
  
  // Retornar condiciones de la variante o condiciones por defecto
  return variants[variantId] || variants['V1'];
}

module.exports = {
  generateSmartTemplatePdf
};
