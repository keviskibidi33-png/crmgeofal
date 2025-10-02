const pool = require('../config/db');

async function setupCotizacionesInteligentes() {
  try {
    console.log('🚀 CONFIGURANDO SISTEMA DE COTIZACIONES INTELIGENTES...\n');

    // 1. Agregar campos a la tabla quotes
    console.log('📋 Agregando campos a la tabla quotes...');
    
    await pool.query(`
      ALTER TABLE quotes ADD COLUMN IF NOT EXISTS category_main VARCHAR(20) DEFAULT 'laboratorio'
    `);
    console.log('✅ Campo category_main agregado');

    await pool.query(`
      ALTER TABLE quotes ADD COLUMN IF NOT EXISTS quote_code VARCHAR(50) UNIQUE
    `);
    console.log('✅ Campo quote_code agregado');

    await pool.query(`
      ALTER TABLE quotes ADD COLUMN IF NOT EXISTS status_payment VARCHAR(50) DEFAULT 'pendiente'
    `);
    console.log('✅ Campo status_payment agregado');

    // 2. Crear tabla funnel_metrics
    console.log('\n📊 Creando tabla funnel_metrics...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS funnel_metrics (
        id SERIAL PRIMARY KEY,
        quote_id INTEGER REFERENCES quotes(id) ON DELETE CASCADE,
        quote_code VARCHAR(50),
        category_main VARCHAR(20) NOT NULL,
        service_name VARCHAR(100) NOT NULL,
        item_name VARCHAR(200) NOT NULL,
        item_total DECIMAL(10,2) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        real_amount_paid DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Tabla funnel_metrics creada');

    // 3. Crear índices para optimizar consultas
    console.log('\n🔍 Creando índices...');
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_funnel_metrics_quote_id ON funnel_metrics(quote_id)
    `);
    console.log('✅ Índice en quote_id creado');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_funnel_metrics_category ON funnel_metrics(category_main)
    `);
    console.log('✅ Índice en category_main creado');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_funnel_metrics_created_at ON funnel_metrics(created_at)
    `);
    console.log('✅ Índice en created_at creado');

    // 4. Verificar que todo esté funcionando
    console.log('\n🔍 Verificando configuración...');
    
    const quotesCheck = await pool.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'quotes' 
      AND column_name IN ('category_main', 'quote_code', 'status_payment')
    `);
    
    console.log('📋 Campos en tabla quotes:');
    quotesCheck.rows.forEach(row => {
      console.log(`   ${row.column_name}: ${row.data_type} (default: ${row.column_default})`);
    });

    const funnelCheck = await pool.query(`
      SELECT COUNT(*) as count FROM funnel_metrics
    `);
    console.log(`📊 Registros en funnel_metrics: ${funnelCheck.rows[0].count}`);

    console.log('\n🎉 SISTEMA DE COTIZACIONES INTELIGENTES CONFIGURADO EXITOSAMENTE!');
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('1. ✅ Frontend ya modificado (selector de categoría + código único)');
    console.log('2. 🔧 Crear endpoint /api/quotes/my-quotes');
    console.log('3. 🔧 Crear endpoint /api/funnel/alimentar-embudo');
    console.log('4. 🔧 Modificar ComprobantesPago.jsx para selección inteligente');
    console.log('5. 🔧 Modificar proceso de aprobación para alimentar embudo');

  } catch (error) {
    console.error('❌ Error configurando sistema:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

setupCotizacionesInteligentes();
