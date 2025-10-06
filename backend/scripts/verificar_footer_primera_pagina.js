const { generateSmartTemplatePdf } = require('../utils/smartTemplatePdf');
const path = require('path');
const fs = require('fs');

async function verificarFooterPrimeraPagina() {
  try {
    console.log('🔍 VERIFICANDO FOOTER DE LA PRIMERA PÁGINA - VERSIÓN PROFESIONAL...\n');
    
    // Datos de prueba específicos para verificar el footer
    const testBundle = {
      quote: {
        id: 999,
        total: 500.00,
        subtotal: 423.73,
        igv: 76.27,
        meta: {
          quote: {
            commercial_name: 'Juan Pérez',
            reference: 'REF-2025-001'
          },
          customer: {
            company_name: 'Empresa de Prueba S.A.C.',
            contact_name: 'María González',
            contact_phone: '987654321',
            contact_email: 'maria@empresa.com'
          }
        }
      },
      items: [
        {
          code: 'SU01',
          description: 'Ensayo de granulometría por tamizado',
          norm: 'NTP 339.127',
          unit_price: 50.00,
          quantity: 2,
          partial_price: 100.00
        },
        {
          code: 'SU02', 
          description: 'Ensayo de límites de Atterberg',
          norm: 'NTP 339.128',
          unit_price: 75.00,
          quantity: 1,
          partial_price: 75.00
        },
        {
          code: 'SU03',
          description: 'Ensayo de densidad in situ',
          norm: 'NTP 339.129',
          unit_price: 60.00,
          quantity: 3,
          partial_price: 180.00
        }
      ],
      project: {
        id: 1,
        name: 'Proyecto de Verificación Footer',
        location: 'Lima, Perú'
      },
      company: {
        id: 1,
        name: 'GEOFAL',
        ruc: '20123456789'
      }
    };
    
    const outputPath = path.join(__dirname, '..', 'tmp', `verificacion_footer_${Date.now()}.pdf`);
    
    console.log('📋 Datos de prueba para verificar footer:');
    console.log('   - Cotización ID:', testBundle.quote.id);
    console.log('   - Cliente:', testBundle.quote.meta.customer.company_name);
    console.log('   - Total:', testBundle.quote.total);
    console.log('   - Items:', testBundle.items.length);
    
    console.log('\n🔄 Generando PDF con footer verificado...');
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado exitosamente en:', outputPath);
    console.log('\n📋 VERIFICACIÓN DEL FOOTER CORREGIDO:');
    console.log('   - El footer debe contener:');
    console.log('     • Dirección: Av. Marañón N° 763, Los Olivos, Lima');
    console.log('     • Email: laboratorio@geofal.com.pe');
    console.log('     • Teléfono: (01) 754-3070');
    console.log('     • Web: www.geofal.com.pe');
    console.log('   - Debe tener borde superior naranja (#FF6B35)');
    console.log('   - Debe estar posicionado en la parte inferior de la primera página');
    console.log('   - Los iconos SVG deben ser visibles y en color naranja');
    console.log('   - DEBE TENER MARGEN INFERIOR ADECUADO (15mm)');
    console.log('   - NO DEBE CORTARSE EL TEXTO');
    console.log('   - DEBE VERSE PROFESIONAL Y COMPLETO');
    console.log('   - LOGO Y ESTRUCTURA DEBEN ESTAR MÁS ARRIBA');
    console.log('   - MÁS ESPACIO ENTRE CONTENIDO Y FOOTER (80px)');
    console.log('   - FOOTER CON MAYOR ALTURA Y ESPACIADO INTERNO');
    console.log('   - APARIENCIA MÁS PROFESIONAL Y EQUILIBRADA');
    
    // Verificar que el archivo se creó
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      console.log(`\n📊 Archivo generado: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log('✅ El archivo PDF se generó correctamente');
      console.log('\n🔍 Para verificar el footer:');
      console.log('   1. Abre el archivo PDF generado');
      console.log('   2. Verifica que el footer aparezca en la primera página');
      console.log('   3. Confirma que todos los elementos estén visibles');
      console.log('   4. Verifica que el borde superior sea naranja');
    } else {
      console.log('❌ Error: El archivo PDF no se generó');
    }
    
  } catch (error) {
    console.error('❌ Error verificando footer:', error.message);
    console.error('❌ Stack:', error.stack);
  }
}

// Ejecutar la verificación
verificarFooterPrimeraPagina();
