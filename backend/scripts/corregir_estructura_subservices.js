const pool = require('../config/db');

async function corregirEstructuraSubservices() {
  try {
    console.log('🔧 CORRIGIENDO ESTRUCTURA DE TABLA SUBSERVICES...\n');
    console.log('📋 Aplicando restricciones NOT NULL y valores por defecto para datos sensibles\n');
    
    // 1. Eliminar la tabla actual y recrearla con la estructura correcta
    console.log('🗑️  Eliminando tabla subservices actual...');
    await pool.query('DROP TABLE IF EXISTS subservices CASCADE');
    
    // 2. Crear la tabla con la estructura correcta y restricciones
    console.log('🏗️  Creando tabla subservices con estructura robusta...');
    const createTable = `
      CREATE TABLE subservices (
        id SERIAL PRIMARY KEY,
        codigo VARCHAR(20) NOT NULL UNIQUE,
        descripcion TEXT NOT NULL,
        norma VARCHAR(100) NOT NULL DEFAULT '-',
        precio DECIMAL(10,2) NOT NULL DEFAULT 0,
        service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await pool.query(createTable);
    console.log('   ✅ Tabla subservices creada con estructura robusta');
    
    // 3. Crear índices para optimización
    console.log('\n📊 Creando índices optimizados...');
    const indices = [
      "CREATE INDEX idx_subservices_codigo ON subservices(codigo)",
      "CREATE INDEX idx_subservices_descripcion ON subservices USING gin(to_tsvector('spanish', descripcion))",
      "CREATE INDEX idx_subservices_service_id ON subservices(service_id)",
      "CREATE INDEX idx_subservices_active ON subservices(is_active)",
      "CREATE INDEX idx_subservices_precio ON subservices(precio)",
      "CREATE INDEX idx_subservices_norma ON subservices(norma)"
    ];
    
    for (const indice of indices) {
      await pool.query(indice);
      console.log(`   ✅ Índice creado: ${indice.split(' ')[2]}`);
    }
    
    // 4. Crear función para updated_at
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
    
    await pool.query(funcion);
    console.log('   ✅ Función updated_at creada');
    
    // 5. Crear trigger para updated_at
    console.log('\n🔧 Creando trigger updated_at...');
    const trigger = `
      CREATE TRIGGER update_subservices_updated_at 
          BEFORE UPDATE ON subservices 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
    `;
    
    await pool.query(trigger);
    console.log('   ✅ Trigger updated_at creado');
    
    // 6. Agregar comentarios para documentación
    console.log('\n📝 Agregando comentarios de documentación...');
    const comentarios = [
      "COMMENT ON TABLE subservices IS 'Catálogo de subservicios de laboratorio para cotizaciones'",
      "COMMENT ON COLUMN subservices.codigo IS 'Código único del subservicio (ej: SU04, CO01, AS01)'",
      "COMMENT ON COLUMN subservices.descripcion IS 'Descripción detallada del subservicio'",
      "COMMENT ON COLUMN subservices.norma IS 'Norma técnica aplicable (ASTM, NTP, ACI, etc.)'",
      "COMMENT ON COLUMN subservices.precio IS 'Precio unitario en soles (0 = Sujeto a evaluación)'",
      "COMMENT ON COLUMN subservices.service_id IS 'ID del servicio padre (ENSAYO ESTÁNDAR, CONCRETO, etc.)'",
      "COMMENT ON COLUMN subservices.is_active IS 'Estado del subservicio (true = activo, false = inactivo)'"
    ];
    
    for (const comentario of comentarios) {
      await pool.query(comentario);
    }
    console.log('   ✅ Comentarios agregados');
    
    // 7. Verificar estructura final
    console.log('\n🔍 VERIFICANDO ESTRUCTURA FINAL...');
    const columnas = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'subservices' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 ESTRUCTURA FINAL DE SUBSERVICES:');
    columnas.rows.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultVal = col.column_default ? ` (DEFAULT: ${col.column_default})` : '';
      console.log(`   - ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
    });
    
    // 8. Verificar restricciones
    console.log('\n🔒 VERIFICANDO RESTRICCIONES...');
    const constraints = await pool.query(`
      SELECT 
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'subservices'
      ORDER BY tc.constraint_type, kcu.column_name
    `);
    
    console.log('\n📋 RESTRICCIONES APLICADAS:');
    constraints.rows.forEach(constraint => {
      console.log(`   - ${constraint.constraint_type}: ${constraint.constraint_name} (${constraint.column_name})`);
    });
    
    console.log('\n🎉 ¡ESTRUCTURA CORREGIDA EXITOSAMENTE!');
    console.log('✅ Todos los campos son NOT NULL para datos sensibles');
    console.log('✅ Valores por defecto apropiados configurados');
    console.log('✅ Índices optimizados para búsquedas rápidas');
    console.log('✅ Triggers para auditoría automática');
    console.log('✅ Comentarios de documentación agregados');
    console.log('\n🚀 Ahora puedes ejecutar los scripts de subservicios con confianza.');
    
  } catch (error) {
    console.error('💥 Error crítico:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  corregirEstructuraSubservices().catch(error => {
    console.error('💥 Error en el script:', error);
    process.exit(1);
  });
}

module.exports = { corregirEstructuraSubservices };
