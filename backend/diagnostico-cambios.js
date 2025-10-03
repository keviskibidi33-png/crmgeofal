const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');
const fs = require('fs');

async function diagnosticarCambios() {
  try {
    console.log('🔍 DIAGNÓSTICO - Verificar cambios CSS');
    console.log('=====================================');
    
    // Verificar archivos template
    const templateHtmlPath = path.join(__dirname, 'utils', 'template.html');
    const templateCssPath = path.join(__dirname, 'utils', 'template.css');
    
    console.log('📁 Verificando archivos template...');
    console.log('HTML existe:', fs.existsSync(templateHtmlPath));
    console.log('CSS existe:', fs.existsSync(templateCssPath));
    
    if (fs.existsSync(templateCssPath)) {
      const cssContent = fs.readFileSync(templateCssPath, 'utf8');
      console.log('📄 Tamaño CSS:', cssContent.length);
      
      // Buscar el título en el CSS
      const titleMatch = cssContent.match(/\.title\s*\{[^}]*\}/s);
      if (titleMatch) {
        console.log('🎯 CSS del título encontrado:');
        console.log(titleMatch[0]);
      } else {
        console.log('❌ No se encontró el CSS del título');
      }
      
      // Buscar el footer en el CSS
      const footerMatch = cssContent.match(/\.first-page-footer\s*\{[^}]*\}/s);
      if (footerMatch) {
        console.log('🎯 CSS del footer encontrado:');
        console.log(footerMatch[0]);
      } else {
        console.log('❌ No se encontró el CSS del footer');
      }
    }
    
    // Generar PDF de prueba
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
        name: 'Test Company S.A.C.',
        ruc: '20512345678',
        contact_name: 'Test User',
        contact_phone: '+51 987 654 321',
        contact_email: 'test@test.com'
      },
      project: {
        name: 'Test Project',
        location: 'Test Location'
      },
      user: {
        name: 'Admin',
        phone: '99999999999'
      },
      items: [
        { code: 'TEST', description: 'Test Item', norma: 'ASTM', costo_unitario: 100.00, cantidad: 1, costo_parcial: 100.00 }
      ]
    };
    
    const outputPath = path.join(__dirname, 'diagnostico.pdf');
    
    console.log('📄 Generando PDF de diagnóstico...');
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado en:', outputPath);
    console.log('🎯 VERIFICAR:');
    console.log('1. Abre el archivo diagnostico.pdf');
    console.log('2. Verifica si los cambios CSS se aplicaron');
    console.log('3. Revisa el espaciado del título y footer');
    console.log('4. Si no hay cambios, puede ser un problema de cache');
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error.message);
  }
}

diagnosticarCambios();
