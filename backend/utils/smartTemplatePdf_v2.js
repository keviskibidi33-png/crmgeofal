const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');

/**
 * ============================================
 * SISTEMA MODERNO DE PDF CON CSS PRINT
 * ============================================
 * 
 * FILOSOFÍA: El navegador hace TODO el trabajo de paginación.
 * Backend SOLO prepara datos limpios.
 * CSS Print maneja la fragmentación automáticamente.
 * 
 * VENTAJAS:
 * - 90% menos código
 * - Sin cálculos manuales de altura
 * - Sin bugs de fragmentación
 * - Mantenimiento simple
 * - Siempre funciona correctamente
 */

// Generar número de cotización
function generateQuoteNumber() {
  const today = new Date();
  const year = today.getFullYear().toString().slice(-2);
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const now = new Date();
  const timeStamp = now.getTime();
  const dailyCounter = Math.floor(timeStamp / (1000 * 60 * 60 * 24)) % 1000;
  return `0120-${year}${month}${day}-${String(dailyCounter).padStart(3, '0')}`;
}

/**
 * DETERMINAR MODO DE LAYOUT SEGÚN CANTIDAD DE ITEMS
 * 
 * REGLAS:
 * - 1-5 items: SPACIOUS (3 páginas fijas)
 * - 6-10 items: COMPACT (3-4 páginas dinámicas)
 * - 11+ items: ULTRA_COMPACT (N páginas dinámicas)
 */
function getLayoutMode(itemCount) {
  if (itemCount <= 5) {
    return {
      mode: 'spacious',
      cssClass: 'few-items',
      description: '1-5 items: 3 páginas fijas'
    };
  } else if (itemCount <= 10) {
    return {
      mode: 'compact',
      cssClass: 'moderate-items',
      description: '6-10 items: 3-4 páginas dinámicas'
    };
  } else {
    return {
      mode: 'ultra-compact',
      cssClass: 'many-items',
      description: '11+ items: N páginas dinámicas'
    };
  }
}

/**
 * GENERAR HTML DE CONDICIONES PARTE 1
 * (PLAZO + CONTRAMUESTRA + CONFIDENCIALIDAD)
 */
function generateConditionsPart1HTML(deliveryDays) {
  return `
    <div class="conditions-block">
      <div class="normal-subtitle">PLAZO ESTIMADO DE EJECUCIÓN DE SERVICIO</div>
      <div class="conditions-content">
        El plazo de entrega será de los resultados se estima ${deliveryDays} días hábiles, este tiempo está sujeto a la programación enviada por el área de LEM. El laboratorio enviará un correo de confirmación de recepción y fecha de entrega del informe.
      </div>
      
      <div class="normal-subtitle">CONTRAMUESTRA</div>
      <div class="conditions-content">
        Al finalizar los ensayos, la muestra sobrante/contramuestra permanecerán en custodia por un tiempo de 10 días calendario después de emitido el informe de ensayo. Siempre que se trate de una muestra dirimente, las contramuestras serán devueltas a los clientes, previa coordinación y autorización, caso contrario, serán eliminadas si se trata de residuos del ensayo o contramuestras de ensayo.
      </div>
      
      <div class="normal-subtitle">CONFIDENCIALIDAD</div>
      <div class="conditions-content">
        El laboratorio mantiene acuerdos de confidencialidad entre el cliente y el laboratorio, la divulgación de la información sin la autorización de las partes no es permitida. El laboratorio mantiene reserva sobre la información brindada por el cliente, salvo solicitud de la información por ley, o por entidades gubernamentales inmersos dentro del presente servicio de ensayo.
      </div>
    </div>
  `;
}

/**
 * GENERAR HTML DE CONDICIONES PARTE 2
 * (QUEJAS + ENTREGA + HORARIO)
 */
function generateConditionsPart2HTML() {
  return `
    <div class="conditions-block">
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
    </div>
  `;
}

/**
 * GENERAR HTML DE PAGO Y ACEPTACIÓN
 * 
 * OPTIMIZACIÓN: Formato compacto para que quepa en una sola página (página 3).
 * - Cuentas bancarias en formato "Cuenta | CCI" (una línea por banco)
 * - Fuente 8.5px para maximizar espacio
 * - Márgenes mínimos
 */
function generatePaymentHTML(paymentTerms) {
  const paymentText = getPaymentConditionText(paymentTerms);
  
  return `
    <div class="payment-block">
      <div class="subtitle-box"><span class="subtitle-inner">II. CONDICIÓN DE PAGO</span></div>
      <div class="conditions-content">
        <b>CONDICIÓN:</b> ${paymentText}<br/>
        <b>RAZON SOCIAL:</b> Geofal S.A.C. <b>RUC:</b> 20549356762<br/>
        Sírvase realizar el depósito a nuestra cuenta bancaria:<br/>
        <b>Detracción Banco Nación:</b> 00-074-045472<br/>
        <b>Interbank Soles:</b> 200-3005201096-31 | CCI: 003-200-003005201096-31<br/>
        <b>BCP Soles:</b> 192 2024 3030 04 | CCI: 002-192-002 02430 3004-34<br/>
        <b>BBVA Soles:</b> 0111-0174-0100082311-00 | CCI: 011-174-000100082311-00<br/>
        Enviar comprobante vía correo electrónico.
      </div>
      
      <div class="subtitle-box"><span class="subtitle-inner">III. ACEPTACIÓN DE LA COTIZACIÓN</span></div>
      <div class="conditions-content">
        La aceptación será mediante: Pago del servicio, envío de orden de servicio, o correo a <a href="mailto:laboratorio@geofal.com.pe">laboratorio@geofal.com.pe</a> / <a href="mailto:asesorcomercial@geofal.com.pe">asesorcomercial@geofal.com.pe</a>.
      </div>
      
      <div class="signature-block">
        Atentamente,<br/>
        Geofal SAC<br/>
        Av. Río Marañón N° 763, Los Olivos, Lima<br/>
        Telf.: (01) 9051911 / (01) 7543070
      </div>
    </div>
  `;
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

/**
 * PROCESAR DATOS DEL BUNDLE - VERSIÓN SIMPLIFICADA
 * 
 * SOLO prepara datos limpios.
 * NO calcula alturas.
 * NO fragmenta manualmente.
 * El navegador hace TODO el trabajo.
 */
function processBundleData(bundle) {
  console.log('🚀 ===== SISTEMA MODERNO CSS PRINT =====');
  
  // 1. Extraer items
  const allItems = bundle.quote?.meta?.items || bundle.items || [];
  const items = allItems.filter(item => 
    (item.code && item.code.trim() !== '') || 
    (item.description && item.description.trim() !== '')
  );
  
  const itemCount = items.length;
  console.log(`📊 Items en cotización: ${itemCount}`);
  
  // 2. Determinar modo de layout
  const layout = getLayoutMode(itemCount);
  console.log(`🎨 Modo de layout: ${layout.mode.toUpperCase()} (${layout.description})`);
  
  // 3. Calcular totales
  let subtotal = 0;
  items.forEach(item => {
    const unitPrice = parseFloat(item.unit_price) || 0;
    const quantity = parseInt(item.quantity) || 1;
    subtotal += unitPrice * quantity;
  });
  const igv = subtotal * 0.18;
  const total = subtotal + igv;
  
  // 4. Fecha
  let fechaFormateada = '';
  if (bundle.quote?.meta?.quote?.issue_date) {
    fechaFormateada = bundle.quote.meta.quote.issue_date;
  } else {
    const fechaActual = new Date();
    fechaFormateada = `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, '0')}-${String(fechaActual.getDate()).padStart(2, '0')}`;
  }
  
  // 5. Delivery days
  const deliveryDays = bundle.quote?.meta?.quote?.delivery_days || 4;
  
  // 6. Generar HTML de condiciones EN DOS PARTES para que quepa en página 2
  const condicionesParte1HTML = generateConditionsPart1HTML(deliveryDays);
  const condicionesParte2HTML = generateConditionsPart2HTML();
  const pagoHTML = generatePaymentHTML(bundle.quote?.meta?.quote?.payment_terms);
  
  // 7. Preparar items para la tabla
  const tableItems = items.map(item => ({
    codigo: item.code || '',
    descripcion: item.description || '',
    norma: item.norm || '',
    costo_unitario: parseFloat(item.unit_price || 0).toFixed(2),
    cantidad: parseInt(item.quantity || 1),
    costo_parcial: (parseFloat(item.unit_price || 0) * parseInt(item.quantity || 1)).toFixed(2)
  }));
  
  console.log(`✅ Datos procesados correctamente`);
  console.log(`   - Items: ${tableItems.length}`);
  console.log(`   - Subtotal: S/ ${subtotal.toFixed(2)}`);
  console.log(`   - Total: S/ ${total.toFixed(2)}`);
  
  // 8. Retornar TODO (el navegador pagina automáticamente)
  return {
    // Datos básicos
    numero_cotizacion: generateQuoteNumber(),
    fecha_emision: fechaFormateada,
    fecha_solicitud: bundle.quote?.meta?.quote?.request_date || '',
    referencia: bundle.quote?.meta?.quote?.reference || bundle.quote?.reference || 'SEGÚN LO SOLICITADO VÍA CORREO ELECTRÓNICO / LLAMADA TELEFÓNICA',
    
    // Comercial
    asesor_comercial: bundle.quote?.meta?.quote?.commercial_name || 'Silvia Peralta',
    telefono_comercial: bundle.quote?.meta?.quote?.commercial_phone || '962429895',
    
    // Cliente
    cliente_nombre: bundle.company?.name || 'GEOFAL SAC',
    cliente_ruc: bundle.company?.ruc || '20549356762',
    cliente_contacto: bundle.quote?.meta?.customer?.contact_name || 'Brenda Vilca Calla',
    cliente_telefono: bundle.quote?.meta?.customer?.contact_phone || '944435392',
    cliente_correo: bundle.quote?.meta?.customer?.contact_email || 'ingenieria@geofal.com.pe',
    
    // Proyecto
    proyecto_nombre: bundle.project?.name || 'AP5119_B_U_GF_MP_30 CULTA',
    proyecto_ubicacion: bundle.project?.location || '',
    
    // Items y totales
    items: tableItems,
    subtotal: subtotal.toFixed(2),
    igv: igv.toFixed(2),
    total: total.toFixed(2),
    
    // HTML de condiciones EN DOS PARTES (para lograr 3 páginas exactas)
    condicionesParte1HTML: condicionesParte1HTML,
    condicionesParte2HTML: condicionesParte2HTML,
    pagoHTML: pagoHTML,
    
    // Modo de layout
    layoutMode: layout.mode,
    cssClass: layout.cssClass,
    itemCount: itemCount,
    
    // Path para imágenes
    __dirname: __dirname
  };
}

/**
 * GENERAR HTML CON HANDLEBARS - VERSIÓN SIMPLIFICADA
 */
async function generateCleanHtmlTemplateFromFiles(data) {
  try {
    // Leer archivos de template
    const templatePath = path.join(__dirname, 'template_v2.html');
    const cssPath = path.join(__dirname, 'template_v2.css');
    
    const htmlTemplate = await fs.readFile(templatePath, 'utf-8');
    const cssContent = await fs.readFile(cssPath, 'utf-8');
    
    console.log('✅ Template HTML leído:', templatePath);
    console.log('✅ CSS leído:', cssPath, `(${cssContent.length} caracteres)`);
    
    // Inyectar CSS ANTES de compilar con Handlebars
    const htmlWithCssPlaceholder = htmlTemplate.replace('{{CSS_PLACEHOLDER}}', cssContent);
    
    // Registrar helpers de Handlebars
    handlebars.registerHelper('eq', (a, b) => a === b);
    
    // Compilar template CON el CSS ya inyectado
    const template = handlebars.compile(htmlWithCssPlaceholder);
    const finalHtml = template(data);
    
    console.log('✅ HTML final generado:', `${finalHtml.length} caracteres`);
    
    return finalHtml;
  } catch (error) {
    console.error('❌ Error generando HTML:', error);
    throw error;
  }
}

/**
 * CONVERTIR HTML A PDF CON PUPPETEER
 * 
 * CONFIGURACIÓN DE TAMAÑO:
 * - format: 'A4' → Tamaño de página A4 (210mm × 297mm)
 * - preferCSSPageSize: true → Prioriza el tamaño definido en CSS (@page { size: A4 })
 * - margin: 0 → Sin márgenes automáticos (los manejamos en CSS con padding)
 */
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
      format: 'A4', // ← TAMAÑO A4 (210mm × 297mm)
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
      preferCSSPageSize: true, // ← Prioriza @page { size: A4 } del CSS
      displayHeaderFooter: false
    });
    
    console.log(`✅ PDF generado: ${outputPath}`);
  } finally {
    await browser.close();
  }
}

module.exports = {
  processBundleData,
  generateCleanHtmlTemplateFromFiles,
  convertHtmlToPdf,
  generateQuoteNumber
};

