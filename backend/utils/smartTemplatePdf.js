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

/**
 * Función para obtener las clases CSS adaptativas según el número de ítems
 * NOTA IMPORTANTE: Las clases solo compactan paddings/márgenes, NUNCA reducen el tamaño de fuente
 * El tamaño de letra se mantiene siempre en mínimo 13px para legibilidad profesional
 * @param {number} itemCount - Número de ítems en la cotización
 * @returns {Object} - Objeto con las clases y banderas adaptativas
 */
function getAdaptiveClasses(itemCount) {
  // Determinar la clase de compactación solo para paddings/márgenes
  let pageClass = '';
  
  if (itemCount <= 7) {
    pageClass = 'few-items';        // Padding generoso: 6px 10px
  } else if (itemCount >= 8 && itemCount <= 10) {
    pageClass = 'many-items';       // Padding reducido: 5px 8px
  } else if (itemCount >= 11 && itemCount <= 12) {
    pageClass = 'plazo-items';      // Padding moderado: 4px 7px
  } else if (itemCount >= 13 && itemCount <= 20) {
    pageClass = 'condiciones-items'; // Padding compacto: 4px 6px
  } else if (itemCount >= 21 && itemCount <= 24) {
    pageClass = 'partial-items';     // Padding mínimo: 3px 5px
  } else if (itemCount >= 25 && itemCount <= 27) {
    pageClass = 'medium-items';      // Padding muy compacto: 3px 4px
  } else if (itemCount >= 28) {
    pageClass = 'extreme-items';     // Padding extremo: 2px 3px
  }
  
  return {
    pageClass,
    // Banderas para compatibilidad con el sistema actual
    hasFewItems: itemCount <= 7,
    hasManyItems: itemCount >= 8 && itemCount <= 10,
    hasPlazoItems: itemCount >= 11 && itemCount <= 12,
    hasCondicionesItems: itemCount >= 13 && itemCount <= 20,
    hasPartialItems: itemCount >= 21 && itemCount <= 24,
    hasMediumItems: itemCount >= 25 && itemCount <= 27,
    hasVeryManyItems: itemCount >= 28,
    hasExtremeItems: itemCount > 30
  };
}

/**
 * CÁLCULO INTELIGENTE DE ESPACIO DISPONIBLE POR PÁGINA
 * Calcula dinámicamente cuántas filas de tabla caben en una página
 * considerando todos los elementos fijos (header, footer, info, etc.)
 */
function calculateAvailableSpace(pageClass, isFirstPage = false, pageType = 'table') {
  // Altura total de página A4 en mm
  const PAGE_HEIGHT_MM = 275; // Espacio útil después de márgenes
  
  // Espacios fijos (en mm aproximado)
  const HEADER_HEIGHT = 20;  // Logo y espacio (compactado: antes 25mm, ahora 20mm)
  const FOOTER_HEIGHT = 15;  // Footer fijo
  
  // Espacios variables según si es primera página o no
  let usedSpace = HEADER_HEIGHT + FOOTER_HEIGHT;
  
  if (pageType === 'table') {
    if (isFirstPage) {
      usedSpace += 70;  // Título + Info Grid + Referencia + Intro (compactado: antes 90mm, ahora 70mm)
    } else {
      usedSpace += 12;  // Solo título de continuación (compactado: antes 15mm, ahora 12mm)
    }
    
    // Altura de fila según clase (padding + fuente + border)
    const rowHeights = {
      'few-items': 8,
      'many-items': 7,
      'plazo-items': 6.5,
      'condiciones-items': 6,
      'partial-items': 5.5,
      'medium-items': 5,
      'extreme-items': 4.5
    };
    
    const rowHeight = rowHeights[pageClass] || 6;
    const availableSpace = PAGE_HEIGHT_MM - usedSpace;
    const maxRows = Math.floor(availableSpace / rowHeight);
    
    return {
      maxRows: maxRows,
      maxRowsWithTotals: Math.max(1, maxRows - 4),
      rowHeight: rowHeight,
      availableSpace: availableSpace
    };
  } else if (pageType === 'conditions') {
    // Para páginas de condiciones
    usedSpace += 15; // Margen superior + espaciado
    const availableSpace = PAGE_HEIGHT_MM - usedSpace - 15; // Margen moderado de seguridad
    
    // Estimación: 1 línea de texto = ~4.5mm
    const LINE_HEIGHT_MM = 4.5;
    const maxLines = Math.floor(availableSpace / LINE_HEIGHT_MM);
    
    return {
      availableSpace: availableSpace, // ~230mm (espacio generoso para agrupar bloques)
      maxLines: maxLines,
      maxChars: maxLines * 100 // ~100 caracteres por línea
    };
  }
}

/**
 * ESTIMA ALTURA REAL DE UNA FILA DE TABLA
 * Considera descripciones largas que expanden la fila
 * @param {object} item - Ítem de la tabla
 * @param {string} pageClass - Clase CSS para altura base
 * @returns {number} - Altura estimada en mm
 */
function estimateTableRowHeight(item, pageClass) {
  // Alturas base por clase (padding + fuente + border)
  const baseHeights = {
    'few-items': 8,
    'many-items': 7,
    'plazo-items': 6.5,
    'condiciones-items': 6,
    'partial-items': 5.5,
    'medium-items': 5,
    'extreme-items': 4.5
  };
  
  const baseHeight = baseHeights[pageClass] || 6;
  const desc = (item.description || item.descripcion || '').toString();
  
  // Estimar líneas en la descripción (~85 caracteres por línea en columna de descripción)
  const lines = Math.max(1, Math.ceil(desc.length / 85));
  
  // Cada línea adicional agrega ~3.5mm de altura
  const extraHeight = (lines - 1) * 3.5;
  
  return baseHeight + extraHeight;
}

/**
 * ESTIMA ALTURA TOTAL DE LA TABLA
 * Suma altura de todas las filas + filas de totales si aplica
 * @param {Array} items - Lista de ítems
 * @param {string} pageClass - Clase CSS
 * @param {boolean} includeTotals - Si incluir filas de totales
 * @returns {number} - Altura total en mm
 */
function estimateTableHeight(items, pageClass, includeTotals = false) {
  let totalHeight = 0;
  
  // Sumar altura de cada fila
  for (const item of items) {
    totalHeight += estimateTableRowHeight(item, pageClass);
  }
  
  // Agregar filas de totales (3 filas con altura base)
  if (includeTotals) {
    const baseHeights = {
      'few-items': 8,
      'many-items': 7,
      'plazo-items': 6.5,
      'condiciones-items': 6,
      'partial-items': 5.5,
      'medium-items': 5,
      'extreme-items': 4.5
    };
    const baseHeight = baseHeights[pageClass] || 6;
    totalHeight += baseHeight * 3; // 3 filas de totales
  }
  
  return totalHeight;
}

/**
 * EXTRAE BLOQUES LÓGICOS COMPLETOS DEL HTML DE CONDICIONES
 * Identifica secciones completas (subtítulos + contenido) para mantenerlas juntas
 * @param {string} htmlContent - HTML completo
 * @returns {Array} - Array de bloques lógicos
 */
function extractLogicalBlocks(htmlContent) {
  if (!htmlContent || htmlContent.trim() === '') {
    return [];
  }
  
  const blocks = [];
  
  // Dividir por secciones principales (subtitle-box)
  const mainSections = htmlContent.split(/(?=<div class="subtitle-box">)/g);
  
  for (const section of mainSections) {
    if (!section.trim()) continue;
    
    // Si la sección tiene un subtitle-box, es una sección principal completa
    if (section.includes('subtitle-box')) {
      blocks.push({
        type: 'main-section',
        html: section.trim(),
        estimatedHeight: estimateBlockHeight(section),
        isBreakable: false // No dividir esta sección
      });
    } else {
      // Dividir por subsecciones (normal-subtitle)
      const subsections = section.split(/(?=<div class="normal-subtitle">)/g);
      
      for (const subsection of subsections) {
        if (!subsection.trim()) continue;
        
        blocks.push({
          type: 'subsection',
          html: subsection.trim(),
          estimatedHeight: estimateBlockHeight(subsection),
          isBreakable: false // Mantener subsección completa
        });
      }
    }
  }
  
  return blocks;
}

/**
 * ESTIMA LA ALTURA DE UN BLOQUE HTML
 * Calcula aproximadamente cuánto espacio ocupará en mm
 * @param {string} htmlBlock - Bloque HTML
 * @returns {number} - Altura estimada en mm
 */
function estimateBlockHeight(htmlBlock) {
  if (!htmlBlock) return 0;
  
  // Contar elementos que ocupan espacio vertical
  const subtitleBoxCount = (htmlBlock.match(/<div class="subtitle-box">/g) || []).length;
  const normalSubtitleCount = (htmlBlock.match(/<div class="normal-subtitle">/g) || []).length;
  const contentDivs = (htmlBlock.match(/<div class="conditions-content">/g) || []).length;
  const signatureBlock = htmlBlock.includes('signature-block');
  
  let totalHeight = 0;
  
  // Alturas aproximadas en mm (realistas para permitir agrupación)
  totalHeight += subtitleBoxCount * 15;      // subtitle-box: ~15mm
  totalHeight += normalSubtitleCount * 8;    // normal-subtitle: ~8mm
  totalHeight += signatureBlock ? 25 : 0;    // signature-block: ~25mm
  
  // Para content divs, estimar por longitud de texto
  for (const match of htmlBlock.matchAll(/<div class="conditions-content">(.*?)<\/div>/gs)) {
    const textContent = match[1].replace(/<[^>]*>/g, ''); // Quitar HTML
    const textLength = textContent.length;
    const lines = Math.ceil(textLength / 100); // ~100 chars por línea
    totalHeight += lines * 4.5; // ~4.5mm por línea
  }
  
  // Agregar margen de seguridad del 10%
  return Math.ceil(totalHeight * 1.1);
}

/**
 * Divide un bloque lógico demasiado grande en subfragmentos por párrafos
 * Mantiene el/los subtítulos al inicio del primer fragmento y replica el principal cuando sea necesario
 * @param {string} htmlBlock
 * @param {number} availableHeightMm
 * @returns {Array<string>} fragmentos que caben página por página
 */
function splitBlockByParagraphs(htmlBlock, availableHeightMm) {
  const fragments = [];
  if (!htmlBlock || !availableHeightMm) return [htmlBlock];

  // Extraer encabezados (subtitle-box y/o normal-subtitle) y cuerpo (conditions-content)
  const headerMatches = [];
  const headerPatterns = [
    /<div class="subtitle-box">[\s\S]*?<\/div>/g,
    /<div class="normal-subtitle">[\s\S]*?<\/div>/g
  ];
  let headerHtml = '';
  let bodyHtml = htmlBlock;
  for (const pat of headerPatterns) {
    const m = htmlBlock.match(pat);
    if (m && m.length) {
      headerMatches.push(...m);
    }
  }
  if (headerMatches.length) {
    headerHtml = headerMatches.join('\n');
    bodyHtml = htmlBlock.replace(headerHtml, '');
  }

  // Extraer secciones de contenido
  const contentBlocks = [];
  const reContent = /<div class="conditions-content">([\s\S]*?)<\/div>/g;
  let match;
  while ((match = reContent.exec(bodyHtml)) !== null) {
    const inner = match[1].trim();
    if (!inner) continue;
    
    // Dividir por saltos de línea dobles, <br/><br/>, o simplemente agregar como bloque completo si es corto
    if (inner.length < 300) {
      // Texto corto: mantener completo
      contentBlocks.push(`<div class="conditions-content">${inner}</div>`);
    } else {
      // Texto largo: dividir por saltos de línea dobles o <br/>
      const parts = inner.split(/(<br\s*\/?\s*>){2,}|\n\s*\n/i);
      parts.filter(p => p && p.trim() && !p.match(/^<br/i)).forEach(p => {
        contentBlocks.push(`<div class="conditions-content">${p.trim()}</div>`);
      });
    }
  }
  
  if (contentBlocks.length === 0) {
    // Fallback: si no pudimos separar, devolver el bloque tal cual
    return [htmlBlock];
  }

  let current = headerHtml ? headerHtml : '';
  let currentMm = headerHtml ? estimateBlockHeight(headerHtml) : 0;
  for (const part of contentBlocks) {
    const h = estimateBlockHeight(part);
    if (currentMm + h > availableHeightMm) {
      if (current.trim()) fragments.push(current);
      // Reiniciar página con encabezado principal si existe
      current = headerHtml ? headerHtml + '\n' + part : part;
      currentMm = (headerHtml ? estimateBlockHeight(headerHtml) : 0) + h;
    } else {
      current += '\n' + part;
      currentMm += h;
    }
  }
  if (current.trim()) fragments.push(current);

  return fragments.length ? fragments : [htmlBlock];
}
/**
 * FRAGMENTACIÓN INTELIGENTE POR BLOQUES LÓGICOS
 * Divide condiciones en páginas respetando bloques completos
 * NUNCA corta una sección a mitad - si no cabe, salta completa a la siguiente página
 * @param {string} htmlContent - HTML de condiciones completo
 * @param {string} pageClass - Clase CSS para calcular espacio
 * @returns {Array} - Array de páginas con bloques agrupados
 */
function fragmentConditions(htmlContent, pageClass) {
  if (!htmlContent || htmlContent.trim() === '') {
    return [''];
  }
  
  const spaceCalc = calculateAvailableSpace(pageClass, false, 'conditions');
  const availableHeightMm = spaceCalc.availableSpace;
  
  console.log(`📄 Procesando condiciones (${htmlContent.length} chars)...`);
  console.log(`   Espacio disponible por página: ${availableHeightMm}mm`);
  
  // Extraer bloques lógicos
  const logicalBlocks = extractLogicalBlocks(htmlContent);
  
  if (logicalBlocks.length === 0) {
    return [htmlContent];
  }
  
  console.log(`   Bloques lógicos identificados: ${logicalBlocks.length}`);
  
  // Paginar bloques
  const pages = [];
  let currentPageBlocks = [];
  let currentPageHeight = 0;
  
  for (let i = 0; i < logicalBlocks.length; i++) {
    const block = logicalBlocks[i];
    
    console.log(`   Bloque ${i + 1}: ${block.type}, altura estimada: ${block.estimatedHeight}mm`);
    
    // Si el bloque por sí solo excede la página, dividir por párrafos
    if (block.estimatedHeight > availableHeightMm) {
      console.log(`   ↪️ Bloque ${i + 1} excede una página; fragmentando por párrafos...`);
      const splitted = splitBlockByParagraphs(block.html, availableHeightMm);
      splitted.forEach((sub, idx) => {
        const h = estimateBlockHeight(sub);
        if (currentPageHeight + h > availableHeightMm && currentPageBlocks.length > 0) {
          const pageHtml = currentPageBlocks.map(b => b.html).join('\n');
          pages.push(pageHtml);
          console.log(`   ✅ Página ${pages.length} completada (${currentPageHeight}mm usados)`);
          currentPageBlocks = [];
          currentPageHeight = 0;
        }
        currentPageBlocks.push({ html: sub, estimatedHeight: h });
        currentPageHeight += h;
      });
      continue;
    }

    // Si agregar este bloque excede el espacio disponible
    if (currentPageHeight + block.estimatedHeight > availableHeightMm && currentPageBlocks.length > 0) {
      // Guardar página actual
      const pageHtml = currentPageBlocks.map(b => b.html).join('\n');
      pages.push(pageHtml);
      
      console.log(`   ✅ Página ${pages.length} completada (${currentPageHeight}mm usados)`);
      
      // Empezar nueva página con este bloque
      currentPageBlocks = [block];
      currentPageHeight = block.estimatedHeight;
    } else {
      // Agregar bloque a la página actual
      currentPageBlocks.push(block);
      currentPageHeight += block.estimatedHeight;
    }
  }
  
  // Agregar última página
  if (currentPageBlocks.length > 0) {
    const pageHtml = currentPageBlocks.map(b => b.html).join('\n');
    pages.push(pageHtml);
    console.log(`   ✅ Página ${pages.length} completada (${currentPageHeight}mm usados)`);
  }
  
  console.log(`📄 Fragmentación completada: ${pages.length} página(s) de condiciones`);
  
  return pages.length > 0 ? pages : [htmlContent];
}

/**
 * Determina si una tabla necesita fragmentarse en múltiples páginas
 * ACTUALIZADO: Usa altura real estimada en lugar de conteo de filas
 * @param {Array} items - Lista de ítems de la cotización
 * @param {string} pageClass - Clase CSS aplicada
 * @returns {boolean} - true si necesita fragmentación
 */
function shouldFragmentTable(items, pageClass) {
  const spaceCalc = calculateAvailableSpace(pageClass, true, 'table');
  const estimatedHeight = estimateTableHeight(items, pageClass, true);
  
  console.log(`📐 Análisis: espacio=${spaceCalc.availableSpace.toFixed(1)}mm, altura tabla=${estimatedHeight.toFixed(1)}mm`);
  
  return estimatedHeight > spaceCalc.availableSpace;
}

/**
 * FRAGMENTACIÓN INTELIGENTE DE TABLA BASADA EN ALTURA REAL
 * Fragmenta la tabla acumulando altura de filas, no por conteo
 * Considera descripciones largas que expanden filas
 * @param {Array} items - Lista completa de ítems
 * @param {string} pageClass - Clase CSS para calcular espacio
 * @returns {Array} - Array de fragmentos (páginas) con metadata
 */
function fragmentTable(items, pageClass) {
  if (!items || items.length === 0) {
    return [{
      items: [],
      pageNumber: 1,
      isFirstPage: true,
      isLastPage: true,
      isEmpty: true
    }];
  }
  
  const fragments = [];
  let currentPageItems = [];
  let currentHeightMm = 0;
  let globalIndex = 0;
  
  // Altura fija de las 3 filas de totales
  const baseHeights = {
    'few-items': 8,
    'many-items': 7,
    'plazo-items': 6.5,
    'condiciones-items': 6,
    'partial-items': 5.5,
    'medium-items': 5,
    'extreme-items': 4.5
  };
  const totalsHeight = (baseHeights[pageClass] || 6) * 3;
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const isFirstPage = fragments.length === 0 && currentPageItems.length === 0;
    const spaceCalc = calculateAvailableSpace(pageClass, isFirstPage, 'table');
    const itemHeight = estimateTableRowHeight(item, pageClass);
    
    // Si es la última iteración, reservar espacio para totales
    const isLastItem = (i === items.length - 1);
    const reserveForTotals = isLastItem ? totalsHeight : 0;
    
    // Si agregar este ítem excede el espacio (y ya hay ítems en la página), cerrar página
    if (currentHeightMm + itemHeight + reserveForTotals > spaceCalc.availableSpace && currentPageItems.length > 0) {
      // Guardar fragmento actual
      fragments.push({
        items: [...currentPageItems],
        pageNumber: fragments.length + 1,
        isFirstPage: fragments.length === 0,
        isLastPage: false,
        isEmpty: false,
        totalItems: currentPageItems.length,
        startIndex: globalIndex - currentPageItems.length,
        endIndex: globalIndex - 1
      });
      
      // Reiniciar para nueva página
      currentPageItems = [];
      currentHeightMm = 0;
    }
    
    // Agregar ítem a la página actual
    currentPageItems.push(item);
    currentHeightMm += itemHeight;
    globalIndex++;
  }
  
  // Agregar última página si tiene ítems
  if (currentPageItems.length > 0) {
    fragments.push({
      items: currentPageItems,
      pageNumber: fragments.length + 1,
      isFirstPage: fragments.length === 0,
      isLastPage: true,
      isEmpty: false,
      totalItems: currentPageItems.length,
      startIndex: globalIndex - currentPageItems.length,
      endIndex: globalIndex - 1
    });
  }
  
  console.log(`📊 Fragmentación basada en altura: ${items.length} ítems → ${fragments.length} página(s)`);
  fragments.forEach(f => {
    const heightMm = f.items.reduce((sum, it) => sum + estimateTableRowHeight(it, pageClass), 0);
    console.log(`  📄 Página ${f.pageNumber}: ${f.totalItems} ítems (${f.startIndex + 1}-${f.endIndex + 1}), altura≈${heightMm.toFixed(1)}mm`);
  });
  
  return fragments;
}

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
  
  // Obtener clases adaptativas según el número de ítems
  const itemCount = items.length;
  const adaptiveClasses = getAdaptiveClasses(itemCount);
  
  // Desestructurar las clases y banderas adaptativas
  const { 
    pageClass, 
    hasFewItems, 
    hasManyItems, 
    hasPlazoItems, 
    hasCondicionesItems, 
    hasPartialItems, 
    hasMediumItems, 
    hasVeryManyItems, 
    hasExtremeItems 
  } = adaptiveClasses;
  
  // Determinar si se necesita fragmentar la tabla (basado en altura real)
  const needsFragmentation = shouldFragmentTable(items, pageClass);
  const tableFragments = needsFragmentation ? fragmentTable(items, pageClass) : null;

  // Detección de ÍTEMS GRANDES (para regla estricta del usuario)
  const isLargeItem = (it) => {
    const desc = (it.description || '').toString();
    return desc.length > 85 || desc.split('\n').length > 2 || desc.includes('\n\n');
  };
  const largeItemsCount = items.filter(isLargeItem).length;
  console.log(`🧮 Ítems grandes detectados: ${largeItemsCount} / ${items.length}`);
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
  let shouldMoveAllConditionsToNextPage = false;
  
  // REGLA ESTRICTA: Si la tabla se fragmenta O hay 2+ ítems grandes, NO mezclar condiciones en primera página
  if (needsFragmentation || largeItemsCount >= 2) {
    condicionesPrimeraPagina = '';
    shouldMoveAllConditionsToNextPage = true;
    console.log(`🚫 Tabla fragmentada o ítems grandes detectados → condiciones van SOLO en páginas separadas`);
  } else if (hasPlazoItems) {
    // Con ITEMS CON PLAZO (11-12): PLAZO ESTIMADO a segunda página
    condicionesPrimeraPagina = `
      <div class="subtitle-box"><span class="subtitle-inner">I. CONDICIONES DEL SERVICIO</span></div>
      <div class="conditions-content">
        VALIDEZ DE LA OFERTA: 30 días calendario. Si la cotización llegó al límite de validez, solicite actualización.
      </div>
      <div class="normal-subtitle">CONDICIONES ESPECÍFICAS:</div>
      <div class="conditions-content">
        El cliente debe enviar al laboratorio, para los ensayos en suelo y agregados, la cantidad mínima de 100 kg por cada muestra. El cliente deberá entregar las muestras debidamente identificadas. El cliente deberá especificar la Norma a ser utilizada para la ejecución del ensayo, caso contrario se considera Norma ASTM o NTP vigente de acuerdo con el alcance del laboratorio. El cliente deberá entregar las muestras en las instalaciones del LEM, ubicado en la Av. Marañón N° 763, Los Olivos, Lima.
    </div>`;
  } else if (hasCondicionesItems) {
    // Con ITEMS CON CONDICIONES (13-20): I. CONDICIONES DEL SERVICIO a segunda página
    condicionesPrimeraPagina = ``;
  } else if (hasPartialItems) {
    // Con ITEMS PARCIALES (21-24): condiciones básicas en primera página, PLAZO ESTIMADO a segunda página
    condicionesPrimeraPagina = `
      <div class="subtitle-box"><span class="subtitle-inner">I. CONDICIONES DEL SERVICIO</span></div>
      <div class="conditions-content">
        VALIDEZ DE LA OFERTA: 30 días calendario. Si la cotización llegó al límite de validez, solicite actualización.
      </div>
      <div class="normal-subtitle">CONDICIONES ESPECÍFICAS:</div>
      <div class="conditions-content">
        El cliente debe enviar al laboratorio, para los ensayos en suelo y agregados, la cantidad mínima de 100 kg por cada muestra. El cliente deberá entregar las muestras debidamente identificadas. El cliente deberá especificar la Norma a ser utilizada para la ejecución del ensayo, caso contrario se considera Norma ASTM o NTP vigente de acuerdo con el alcance del laboratorio. El cliente deberá entregar las muestras en las instalaciones del LEM, ubicado en la Av. Marañón N° 763, Los Olivos, Lima.
    </div>`;
  } else if (hasMediumItems) {
    // Con ITEMS MEDIOS (25-27): solo tabla en primera página, condiciones básicas a segunda página
    condicionesPrimeraPagina = ``;
  } else if (hasVeryManyItems) {
    // Con MUY MUCHOS items (28+): solo tabla en primera página, condiciones a segunda página
    condicionesPrimeraPagina = ``;
  } else {
    // Con pocos/muchos items (≤20): layout completo en primera página
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
  let condicionesSegundaPagina = '';
  
  // PRIORIDAD 1: Si movemos TODAS las condiciones a páginas separadas (tabla fragmentada)
  if (shouldMoveAllConditionsToNextPage) {
    console.log(`✅ Generando condiciones COMPLETAS para páginas separadas (incluye: CONDICIONES + PLAZO + CONTRAMUESTRA)`);
    // Incluir TODO: CONDICIONES + PLAZO + CONTRAMUESTRA (inicio)
    condicionesSegundaPagina = `
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
      </div>
      <div class="normal-subtitle">CONTRAMUESTRA</div>`;
  } 
  // PRIORIDAD 2: Lógica normal según cantidad de ítems (sin fragmentación)
  else if (hasPlazoItems) {
    // Con ITEMS CON PLAZO (11-12): PLAZO ESTIMADO a segunda página
    condicionesSegundaPagina = `
      <div class="normal-subtitle">PLAZO ESTIMADO DE EJECUCIÓN DE SERVICIO</div>
      <div class="conditions-content">
        El plazo de entrega será de los resultados se estima ${variantConditions.delivery_days} días hábiles, este tiempo está sujeto a la programación enviada por el área de LEM. El laboratorio enviará un correo de confirmación de recepción y fecha de entrega del informe.
      </div>
      <div class="normal-subtitle">CONTRAMUESTRA</div>`;
  } else if (hasCondicionesItems) {
    // Con ITEMS CON CONDICIONES (13-20): I. CONDICIONES DEL SERVICIO a segunda página
    condicionesSegundaPagina = `
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
      </div>
      <div class="normal-subtitle">CONTRAMUESTRA</div>`;
  } else if (hasPartialItems) {
    // Con ITEMS PARCIALES (21-24): solo PLAZO ESTIMADO a segunda página
    condicionesSegundaPagina = `
      <div class="normal-subtitle">PLAZO ESTIMADO DE EJECUCIÓN DE SERVICIO</div>
      <div class="conditions-content">
        El plazo de entrega será de los resultados se estima ${variantConditions.delivery_days} días hábiles, este tiempo está sujeto a la programación enviada por el área de LEM. El laboratorio enviará un correo de confirmación de recepción y fecha de entrega del informe.
      </div>
      <div class="normal-subtitle">CONTRAMUESTRA</div>`;
  } else if (hasMediumItems) {
    // Con ITEMS MEDIOS (25-27): condiciones básicas a segunda página
    condicionesSegundaPagina = `
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
      </div>
      <div class="normal-subtitle">CONTRAMUESTRA</div>`;
  } else if (hasVeryManyItems) {
    // Con MUY MUCHOS items (28+): todas las condiciones van a segunda página
    condicionesSegundaPagina = `
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
      </div>
      <div class="normal-subtitle">CONTRAMUESTRA</div>`;
  } else {
    // Con pocos/muchos items (≤10): PLAZO ESTIMADO ya está en primera página
    // SOLO agregar CONTRAMUESTRA (las demás condiciones se agregan después)
    condicionesSegundaPagina = `
      <div class="normal-subtitle">CONTRAMUESTRA</div>`;
  }
  
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
    </div>`;
  
  // BLOQUE SEPARADO PARA PAGO Y ACEPTACIÓN (forzar en página nueva si es necesario)
  const condicionesPagoYAceptacion = `
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

  // SISTEMA UNIFICADO DE PÁGINAS - BLOQUES INDEPENDIENTES POR SECCIÓN
  // Crear bloques separados para cada sección individual (máximo control)
  const conditionBlocks = [];
  
  // Solo agregar bloques de condiciones de servicio si fueron generados
  if (condicionesPrimeraPagina && condicionesPrimeraPagina.trim()) {
    // Este caso solo ocurre cuando NO hay fragmentación (tabla pequeña)
    conditionBlocks.push({
      name: 'I. Condiciones (Primera Página)',
      html: condicionesPrimeraPagina,
      order: 1,
      forceNewPage: false
    });
  }
  
  // Bloques de segunda página: TODO JUNTO (sin dividir por CONTRAMUESTRA)
  // Solo agregar si hay contenido
  if (condicionesSegundaPagina && condicionesSegundaPagina.trim()) {
    conditionBlocks.push({
      name: 'Condiciones generales',
      html: condicionesSegundaPagina,
      order: 2,
      forceNewPage: false,
      noFragment: true // NO fragmentar, mantener todo junto
    });
  }
  
  // BLOQUE INDEPENDIENTE: Pago y Aceptación (SIEMPRE separado en página nueva)
  conditionBlocks.push({
    name: 'II. Pago + III. Aceptación',
    html: condicionesPagoYAceptacion,
    order: 10, // Alta prioridad para ir al final
    forceNewPage: true // FORZAR nueva página
  });
  
  console.log(`📋 Bloques de condiciones generados: ${conditionBlocks.length}`);
  conditionBlocks.forEach((block, i) => {
    console.log(`   ${block.order}. ${block.name} (${block.html.length} chars)`);
  });
  
  // Fragmentar cada bloque independientemente
  const allConditionsFragments = [];
  for (const block of conditionBlocks.sort((a, b) => a.order - b.order)) {
    console.log(`📄 Procesando: ${block.name}...`);
    
    // Si el bloque fuerza nueva página o no debe fragmentarse, agregarlo completo
    if (block.forceNewPage || block.noFragment) {
      if (block.forceNewPage) {
        console.log(`   🔒 Bloque forzado a nueva página independiente`);
      }
      if (block.noFragment) {
        console.log(`   📦 Bloque completo sin fragmentar (${block.html.length} chars)`);
      }
      allConditionsFragments.push(block.html);
    } else {
      const fragments = fragmentConditions(block.html, pageClass);
      fragments.forEach((frag, idx) => {
        if (frag && frag.trim()) {
          allConditionsFragments.push(frag);
          console.log(`   ✅ Fragmento ${idx + 1} generado (${frag.length} chars)`);
        }
      });
    }
  }
  
  const conditionsFragments = allConditionsFragments;
  
  // Crear array unificado de todas las páginas
  const allPages = [];
  
  if (needsFragmentation) {
    // MODO FRAGMENTACIÓN: Agregar páginas de tabla
    tableFragments.forEach((fragment, index) => {
      // Validar que el fragmento tenga contenido real
      if (fragment.items && fragment.items.length > 0) {
        allPages.push({
          type: 'table',
          ...fragment,
          absolutePageNumber: allPages.length + 1
        });
      }
    });
  } else {
    // MODO NORMAL: Una sola página de tabla
    const tableItems = items.map(item => ({
      codigo: item.code || '',
      descripcion: item.description || '',
      norma: item.norm || '',
      costo_unitario: parseFloat(item.unit_price || 0).toFixed(2),
      cantidad: parseInt(item.quantity || 1),
      costo_parcial: (parseFloat(item.unit_price || 0) * parseInt(item.quantity || 1)).toFixed(2)
    }));
    
    // Solo agregar si hay ítems
    if (tableItems.length > 0) {
      allPages.push({
        type: 'table',
        items: tableItems,
        pageNumber: 1,
        isFirstPage: true,
        isLastPage: true,
        absolutePageNumber: 1
      });
    }
  }
  
  // Agregar páginas de condiciones (solo las que tienen contenido)
  conditionsFragments.forEach((conditionFragment, index) => {
    // Validar que el fragmento tenga contenido real (no solo espacios)
    if (conditionFragment && conditionFragment.trim().length > 0) {
      allPages.push({
        type: 'conditions',
        html: conditionFragment,
        pageNumber: index + 1,
        isFirstConditionPage: index === 0,
        isLastConditionPage: index === conditionsFragments.length - 1,
        absolutePageNumber: allPages.length + 1
      });
    }
  });
  
  // VALIDACIÓN FINAL: Eliminar cualquier página vacía que pudiera haberse generado
  const validPages = allPages.filter(page => {
    if (page.type === 'table') {
      return page.items && page.items.length > 0;
    } else if (page.type === 'conditions') {
      return page.html && page.html.trim().length > 0;
    }
    return true;
  });
  
  console.log(`📄 Total de páginas en el PDF: ${validPages.length}`);
  console.log(`  - Páginas de tabla: ${validPages.filter(p => p.type === 'table').length}`);
  console.log(`  - Páginas de condiciones: ${validPages.filter(p => p.type === 'conditions').length}`);
  
  // Actualizar absolutePageNumber después de filtrar
  validPages.forEach((page, index) => {
    page.absolutePageNumber = index + 1;
  });
  
  // LOG CRÍTICO: Verificar que allPages siempre tenga contenido
  if (validPages.length === 0) {
    console.error('❌ ERROR CRÍTICO: allPages está vacío. Esto causará que el PDF use código legacy.');
    console.error('   Items:', items.length, 'Fragmentos tabla:', tableFragments?.length, 'Fragmentos condiciones:', conditionsFragments.length);
  } else {
    console.log(`✅ allPages poblado correctamente con ${validPages.length} página(s)`);
  }

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
    // Variables para layout adaptativo profesional
    pageClass: pageClass,              // Clase CSS principal para el layout (compacta solo paddings/márgenes)
    // Banderas booleanas para compatibilidad con el sistema actual
    hasFewItems: hasFewItems,
    hasManyItems: hasManyItems,
    hasPlazoItems: hasPlazoItems,
    hasCondicionesItems: hasCondicionesItems,
    hasPartialItems: hasPartialItems,
    hasMediumItems: hasMediumItems,
    hasVeryManyItems: hasVeryManyItems,
    hasExtremeItems: hasExtremeItems,
    itemCount: itemCount,
    // Variables para fragmentación de tablas en múltiples páginas
    needsFragmentation: needsFragmentation,
    tableFragments: tableFragments,
    // NUEVO SISTEMA UNIFICADO DE PÁGINAS (validadas y limpias)
    allPages: validPages,
    totalPages: validPages.length,
    hasMultipleConditionPages: conditionsFragments.length > 1,
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
  <div class="page-content first-page {{#if hasFewItems}}few-items{{else if hasManyItems}}many-items{{else if hasExtremeItems}}extreme-items{{/if}}">
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
    
    // Registrar helpers de Handlebars
    handlebars.registerHelper('lt', function(a, b) {
      return a < b;
    });
    
    handlebars.registerHelper('eq', function(a, b) {
      return a === b;
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

