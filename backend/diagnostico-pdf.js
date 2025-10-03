const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const { generateCleanHtmlTemplateFromFiles } = require('./utils/smartTemplatePdf');
// const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

async function diagnosticarPDF() {
  try {
    console.log('🔍 DIAGNÓSTICO COMPLETO DEL PDF');
    console.log('================================');
    
    // 1. Verificar archivos template
    console.log('\n📁 1. VERIFICANDO ARCHIVOS TEMPLATE:');
    const htmlPath = path.join(__dirname, 'utils', 'template.html');
    const cssPath = path.join(__dirname, 'utils', 'template.css');
    
    console.log('✅ HTML existe:', fs.existsSync(htmlPath));
    console.log('✅ CSS existe:', fs.existsSync(cssPath));
    
    if (fs.existsSync(htmlPath)) {
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      console.log('📏 Tamaño HTML:', htmlContent.length, 'caracteres');
      console.log('🔍 Contiene second-page:', htmlContent.includes('second-page'));
      console.log('🔍 Contiene page-break:', htmlContent.includes('page-break'));
    }
    
    // 2. Generar HTML y verificar contenido
    console.log('\n📄 2. GENERANDO HTML:');
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
      condiciones_segunda_pagina: '<div class="normal-subtitle">CONTRAMUESTRA</div><div class="conditions-content">Al finalizar los ensayos, la muestra sobrante/contramuestra permanecerán en custodia por un tiempo de 10 días calendario después de emitido el informe de ensayo.</div><div class="normal-subtitle">CONFIDENCIALIDAD</div><div class="conditions-content">El laboratorio mantiene acuerdos de confidencialidad entre el cliente y el laboratorio.</div>',
      hasManyItems: false,
      hasVeryManyItems: false,
      itemCount: 1,
      __dirname: __dirname
    };
    
    const htmlContent = await generateCleanHtmlTemplateFromFiles(testData);
    console.log('✅ HTML generado, tamaño:', htmlContent.length, 'caracteres');
    
    // Guardar HTML para inspección
    const htmlOutputPath = path.join(__dirname, 'debug-output.html');
    fs.writeFileSync(htmlOutputPath, htmlContent, 'utf8');
    console.log('💾 HTML guardado en:', htmlOutputPath);
    
    // Verificar elementos clave en HTML
    console.log('\n🔍 3. ANÁLISIS DEL HTML GENERADO:');
    console.log('✅ Contiene first-page:', htmlContent.includes('first-page'));
    console.log('✅ Contiene second-page:', htmlContent.includes('second-page'));
    console.log('✅ Contiene page-break-before:', htmlContent.includes('page-break-before'));
    console.log('✅ Contiene condiciones_segunda_pagina:', htmlContent.includes('condiciones_segunda_pagina'));
    
    // Contar elementos
    const firstPageCount = (htmlContent.match(/first-page/g) || []).length;
    const secondPageCount = (htmlContent.match(/second-page/g) || []).length;
    console.log('📊 Elementos first-page encontrados:', firstPageCount);
    console.log('📊 Elementos second-page encontrados:', secondPageCount);
    
    // 3. Generar PDF
    console.log('\n📄 4. GENERANDO PDF:');
    const testBundle = {
      quote: {
        id: 999,
        meta: {
          quote: {
            issue_date: '2025-10-03',
            delivery_days: 4
          }
        }
      },
      company: {
        name: 'Innovatech Solutions S.A.C.',
        ruc: '20512345678',
        contact_name: 'Ana Torres',
        contact_phone: '+51 987 654 321',
        contact_email: 'contacto@innovatech.com.pe'
      },
      project: {
        name: '121221',
        location: 'Av. Javier Prado Este 123, Of. 404, San Isidro, Lima'
      },
      user: {
        name: 'Admin',
        phone: '99999999999'
      },
      items: [
        {
          code: 'AG34',
          description: 'Partículas planas y alargadas en agregado grueso (*)',
          norma: 'ASTM D4791-19 (Reapproved 2023)',
          costo_unitario: 120.00,
          cantidad: 1,
          costo_parcial: 120.00
        }
      ]
    };
    
    const pdfPath = path.join(__dirname, 'diagnostico.pdf');
    await generateSmartTemplatePdf(testBundle, pdfPath);
    console.log('✅ PDF generado en:', pdfPath);
    
    // 4. Analizar PDF generado
    console.log('\n📊 5. ANÁLISIS DEL PDF GENERADO:');
    if (fs.existsSync(pdfPath)) {
      const pdfBuffer = fs.readFileSync(pdfPath);
      console.log('📏 Tamaño del PDF:', pdfBuffer.length, 'bytes');
      
      // Análisis básico del PDF
      console.log('📄 PDF generado exitosamente');
      console.log('🔍 Para verificar el número de páginas:');
      console.log('   1. Abre el archivo diagnostico.pdf');
      console.log('   2. Verifica si tiene 2 páginas');
      console.log('   3. Si solo tiene 1 página, el problema está en Puppeteer');
      
      // Verificar si el HTML tiene suficiente contenido
      console.log('\n🔍 ANÁLISIS DEL CONTENIDO:');
      const htmlDebug = fs.readFileSync(htmlOutputPath, 'utf8');
      const secondPageContent = htmlDebug.match(/<div class="page-content second-page">([\s\S]*?)<\/div>/);
      if (secondPageContent) {
        console.log('✅ Segunda página encontrada en HTML');
        console.log('📏 Tamaño del contenido segunda página:', secondPageContent[1].length, 'caracteres');
      } else {
        console.log('❌ No se encontró contenido de segunda página en HTML');
      }
    } else {
      console.log('❌ El PDF no se generó');
    }
    
    console.log('\n🎯 RESUMEN DEL DIAGNÓSTICO:');
    console.log('============================');
    console.log('1. Verifica el archivo debug-output.html en el navegador');
    console.log('2. Busca si hay elementos .second-page en el HTML');
    console.log('3. Verifica si el PDF tiene 2 páginas');
    console.log('4. Si solo hay 1 página, el problema está en Puppeteer');
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error.message);
    console.error('Stack:', error.stack);
  }
}

diagnosticarPDF();
