const { generateCleanHtmlTemplateFromFiles } = require('./utils/smartTemplatePdf');
const fs = require('fs');
const path = require('path');

async function debugSegundaPagina() {
  try {
    console.log('🔍 DEBUG - Investigando segunda página');
    console.log('=====================================');
    
    // Datos de prueba
    const testData = {
      numero_cotizacion: '0120-251003-001',
      fecha_emision: '2025-10-03',
      cliente_nombre: 'Innovatech Solutions S.A.C.',
      cliente_ruc: '20512345678',
      contacto_nombre: 'Ana Torres',
      contacto_telefono: '+51 987 654 321',
      contacto_email: 'contacto@innovatech.com.pe',
      proyecto_nombre: '121221',
      ubicacion: 'Av. Javier Prado Este 123, Of. 404, San Isidro, Lima',
      asesor_comercial: 'Admin',
      asesor_telefono: '99999999999',
      items: [
        {
          code: 'AG34',
          description: 'Partículas planas y alargadas en agregado grueso (*)',
          norma: 'ASTM D4791-19 (Reapproved 2023)',
          costo_unitario: '120.00',
          cantidad: '1',
          costo_parcial: '120.00'
        }
      ],
      subtotal: '120.00',
      igv: '21.60',
      total: '141.60',
      condiciones_primera_pagina: '<div class="normal-subtitle">I. CONDICIONES DEL SERVICIO</div><div class="conditions-content">VALIDEZ DE LA OFERTA: 30 días calendario.</div>',
      condiciones_segunda_pagina: `
        <div class="normal-subtitle">CONTRAMUESTRA</div>
        <div class="conditions-content">
          Al finalizar los ensayos, la muestra sobrante/contramuestra permanecerán en custodia por un tiempo de 10 días calendario después de emitido el informe de ensayo.
        </div>
        <div class="normal-subtitle">CONFIDENCIALIDAD</div>
        <div class="conditions-content">
          El laboratorio mantiene acuerdos de confidencialidad entre el cliente y el laboratorio, la divulgación de la información sin la autorización de las partes no es permitida.
        </div>
        <div class="normal-subtitle">QUEJAS Y SUGERENCIAS</div>
        <div class="conditions-content">
          Si tiene alguna queja o sugerencia, lo invitamos a conocer nuestro Proceso de Atención de Quejas, el cual iniciará 24 horas después de recibida la queja.
        </div>
        <div class="normal-subtitle">ENTREGA DE INFORME DE ENSAYO</div>
        <div class="conditions-content">
          Como parte de la mejora de nuestros procesos y en alineamiento con el Laboratorio Nacional INACAL-DM(PRODUCE) a partir de julio del 2022 los informes de ensayo son emitidos de forma digital con firma electrónica.
        </div>
        <div class="normal-subtitle">HORARIO DE ATENCIÓN</div>
        <div class="conditions-content">
          El horario para recepción de muestra y entrega de informes es de Lunes a Viernes de 8:30am a 1:00pm y 2:00pm a 5:30pm, y Sábado de 8:30am a 12:30pm.
        </div>
      `,
      hasManyItems: false,
      hasVeryManyItems: false,
      itemCount: 1,
      __dirname: __dirname
    };
    
    console.log('📄 Generando HTML...');
    const htmlContent = await generateCleanHtmlTemplateFromFiles(testData);
    
    // Guardar HTML para inspección
    const htmlPath = path.join(__dirname, 'debug-segunda-pagina.html');
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log('💾 HTML guardado en:', htmlPath);
    
    // Analizar el contenido de la segunda página
    console.log('\n🔍 ANÁLISIS DEL HTML:');
    console.log('📏 Tamaño total:', htmlContent.length, 'caracteres');
    
    // Buscar la segunda página
    const secondPageMatch = htmlContent.match(/<div class="page-content second-page">([\s\S]*?)<\/div>\s*<\/body>/);
    if (secondPageMatch) {
      const secondPageContent = secondPageMatch[1];
      console.log('✅ Segunda página encontrada');
      console.log('📏 Tamaño contenido segunda página:', secondPageContent.length, 'caracteres');
      
      // Verificar elementos clave
      console.log('\n🔍 ELEMENTOS EN SEGUNDA PÁGINA:');
      console.log('✅ Logo:', secondPageContent.includes('logogeofal.png'));
      console.log('✅ CONTRAMUESTRA:', secondPageContent.includes('CONTRAMUESTRA'));
      console.log('✅ CONFIDENCIALIDAD:', secondPageContent.includes('CONFIDENCIALIDAD'));
      console.log('✅ Contenido de prueba:', secondPageContent.includes('SEGUNDA PÁGINA - CONTENIDO DE PRUEBA'));
      console.log('✅ Footer:', secondPageContent.includes('footer-bar second-page-footer'));
      
      // Mostrar una muestra del contenido
      console.log('\n📝 MUESTRA DEL CONTENIDO:');
      const sampleContent = secondPageContent.substring(0, 500);
      console.log(sampleContent);
      
    } else {
      console.log('❌ No se encontró la segunda página en el HTML');
    }
    
    // Verificar si hay problemas de CSS
    console.log('\n🎨 VERIFICANDO CSS:');
    const cssInHtml = htmlContent.match(/<style>([\s\S]*?)<\/style>/);
    if (cssInHtml) {
      const cssContent = cssInHtml[1];
      console.log('✅ CSS encontrado, tamaño:', cssContent.length, 'caracteres');
      
      // Verificar reglas específicas para segunda página
      console.log('🔍 Reglas CSS para segunda página:');
      console.log('✅ .second-page:', cssContent.includes('.second-page'));
      console.log('✅ page-break-before:', cssContent.includes('page-break-before'));
      console.log('✅ .second-page-footer:', cssContent.includes('.second-page-footer'));
    }
    
    console.log('\n🎯 INSTRUCCIONES:');
    console.log('1. Abre debug-segunda-pagina.html en el navegador');
    console.log('2. Verifica si la segunda página tiene contenido visible');
    console.log('3. Si está vacía, el problema está en el CSS');
    console.log('4. Si tiene contenido, el problema está en Puppeteer');
    
  } catch (error) {
    console.error('❌ Error en debug:', error.message);
  }
}

debugSegundaPagina();
