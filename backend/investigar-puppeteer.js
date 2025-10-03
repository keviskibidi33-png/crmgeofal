const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function investigarPuppeteer() {
  try {
    console.log('🔍 INVESTIGACIÓN PROFUNDA - Problema con Puppeteer');
    console.log('==================================================');
    
    // Datos de prueba
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
    
    console.log('📄 Generando HTML...');
    const { generateCleanHtmlTemplateFromFiles } = require('./utils/smartTemplatePdf');
    const htmlContent = await generateCleanHtmlTemplateFromFiles(testBundle);
    
    // Guardar HTML para inspección
    const htmlPath = path.join(__dirname, 'investigacion.html');
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log('💾 HTML guardado en:', htmlPath);
    
    // Usar Puppeteer directamente para investigar
    console.log('\n🔍 USANDO PUPPETEER DIRECTO:');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
      
      // Verificar elementos en la página
      console.log('🔍 Verificando elementos en Puppeteer:');
      
      const firstPageExists = await page.$('.first-page');
      const secondPageExists = await page.$('.second-page');
      const secondPageContent = await page.$('.second-page .page-content-wrapper');
      
      console.log('✅ Primera página existe:', !!firstPageExists);
      console.log('✅ Segunda página existe:', !!secondPageExists);
      console.log('✅ Contenido segunda página existe:', !!secondPageContent);
      
      if (secondPageExists) {
        // Obtener información de la segunda página
        const secondPageInfo = await page.evaluate(() => {
          const secondPage = document.querySelector('.second-page');
          if (secondPage) {
            const rect = secondPage.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(secondPage);
            return {
              width: rect.width,
              height: rect.height,
              display: computedStyle.display,
              visibility: computedStyle.visibility,
              opacity: computedStyle.opacity,
              position: computedStyle.position,
              overflow: computedStyle.overflow,
              hasContent: secondPage.innerHTML.length > 0,
              contentLength: secondPage.innerHTML.length
            };
          }
          return null;
        });
        
        console.log('📊 Información de segunda página:', secondPageInfo);
        
        // Verificar si el contenido es visible
        const isVisible = await page.evaluate(() => {
          const secondPage = document.querySelector('.second-page');
          if (secondPage) {
            const rect = secondPage.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          }
          return false;
        });
        
        console.log('👁️ Segunda página es visible:', isVisible);
        
        // Intentar hacer scroll para ver si aparece
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
        
        // Esperar un poco
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verificar nuevamente después del scroll
        const isVisibleAfterScroll = await page.evaluate(() => {
          const secondPage = document.querySelector('.second-page');
          if (secondPage) {
            const rect = secondPage.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          }
          return false;
        });
        
        console.log('👁️ Segunda página visible después del scroll:', isVisibleAfterScroll);
      }
      
      // Generar PDF con configuración especial
      console.log('\n📄 Generando PDF con configuración especial...');
      const pdfPath = path.join(__dirname, 'investigacion.pdf');
      
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: {top: '5mm', right: '5mm', bottom: '5mm', left: '5mm'},
        preferCSSPageSize: false,
        displayHeaderFooter: false,
        scale: 1.0,
        tagged: false,
        outline: false
      });
      
      console.log('✅ PDF generado en:', pdfPath);
      console.log('📏 Tamaño del PDF:', fs.statSync(pdfPath).size, 'bytes');
      
    } finally {
      await browser.close();
    }
    
    console.log('\n🎯 ANÁLISIS COMPLETO:');
    console.log('1. Verifica investigacion.html en el navegador');
    console.log('2. Verifica investigacion.pdf');
    console.log('3. Si el HTML muestra contenido pero el PDF no, es problema de Puppeteer');
    console.log('4. Si ambos están vacíos, es problema del CSS');
    
  } catch (error) {
    console.error('❌ Error en investigación:', error.message);
    console.error('Stack:', error.stack);
  }
}

investigarPuppeteer();
