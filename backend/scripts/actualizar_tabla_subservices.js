const pool = require('../config/db');

async function actualizarTablaSubservices() {
  try {
    console.log('🔧 ACTUALIZANDO TABLA SUBSERVICES...\n');
    
    // Agregar columnas faltantes
    const alteraciones = [
      "ALTER TABLE subservices ADD COLUMN IF NOT EXISTS codigo VARCHAR(20) UNIQUE",
      "ALTER TABLE subservices ADD COLUMN IF NOT EXISTS descripcion TEXT",
      "ALTER TABLE subservices ADD COLUMN IF NOT EXISTS norma VARCHAR(100)",
      "ALTER TABLE subservices ADD COLUMN IF NOT EXISTS precio DECIMAL(10,2) DEFAULT 0",
      "ALTER TABLE subservices ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true",
      "ALTER TABLE subservices ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    ];
    
    console.log('📝 Agregando columnas faltantes...');
    for (const alteracion of alteraciones) {
      try {
        await pool.query(alteracion);
        console.log(`   ✅ Ejecutado: ${alteracion.split(' ')[3]}`);
      } catch (error) {
        console.log(`   ⚠️  ${alteracion.split(' ')[3]}: ${error.message}`);
      }
    }
    
    // Crear índices
    console.log('\n📊 Creando índices...');
    const indices = [
      "CREATE INDEX IF NOT EXISTS idx_subservices_codigo ON subservices(codigo)",
      "CREATE INDEX IF NOT EXISTS idx_subservices_descripcion ON subservices USING gin(to_tsvector('spanish', descripcion))",
      "CREATE INDEX IF NOT EXISTS idx_subservices_service_id ON subservices(service_id)",
      "CREATE INDEX IF NOT EXISTS idx_subservices_active ON subservices(is_active)"
    ];
    
    for (const indice of indices) {
      try {
        await pool.query(indice);
        console.log(`   ✅ Índice creado: ${indice.split(' ')[4]}`);
      } catch (error) {
        console.log(`   ⚠️  Índice: ${error.message}`);
      }
    }
    
    // Crear función para updated_at
    console.log('\n🔧 Creando función updated_at...');
    const funcion = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `;
    
    try {
      await pool.query(funcion);
      console.log('   ✅ Función updated_at creada');
    } catch (error) {
      console.log(`   ⚠️  Función: ${error.message}`);
    }
    
    // Crear trigger
    console.log('\n🔧 Creando trigger...');
    const trigger = `
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.triggers 
              WHERE trigger_name = 'update_subservices_updated_at' 
              AND event_object_table = 'subservices'
          ) THEN
              CREATE TRIGGER update_subservices_updated_at 
                  BEFORE UPDATE ON subservices 
                  FOR EACH ROW 
                  EXECUTE FUNCTION update_updated_at_column();
          END IF;
      END $$;
    `;
    
    try {
      await pool.query(trigger);
      console.log('   ✅ Trigger creado');
    } catch (error) {
      console.log(`   ⚠️  Trigger: ${error.message}`);
    }
    
    // Verificar estructura final
    console.log('\n🔍 VERIFICANDO ESTRUCTURA FINAL...');
    const columnas = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'subservices' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 COLUMNAS FINALES DE SUBSERVICES:');
    columnas.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    console.log('\n🎉 ¡TABLA SUBSERVICES ACTUALIZADA EXITOSAMENTE!');
    console.log('🚀 Ahora puedes ejecutar los scripts de subservicios.');
    
  } catch (error) {
    console.error('💥 Error crítico:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  actualizarTablaSubservices().catch(error => {
    console.error('💥 Error en el script:', error);
    process.exit(1);
  });
}

module.exports = { actualizarTablaSubservices };
