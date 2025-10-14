const pool = require('../config/db');

async function updateStatusConstraintNoContesto() {
  try {
    console.log('🔄 Actualizando restricción de estados para incluir "No contestó"...\n');
    
    // 1. Eliminar restricción existente
    console.log('🗑️ Eliminando restricción existente...');
    await pool.query('ALTER TABLE companies DROP CONSTRAINT IF EXISTS chk_company_status');
    console.log('✅ Restricción eliminada');
    
    // 2. Agregar nueva restricción con estado "no_contesto"
    console.log('➕ Agregando nueva restricción con estado "no_contesto"...');
    await pool.query(`
      ALTER TABLE companies ADD CONSTRAINT chk_company_status 
      CHECK (status IN (
        'prospeccion', 
        'contactado', 
        'no_contesto',
        'interesado', 
        'pendiente_cotizacion', 
        'cotizacion_enviada', 
        'negociacion', 
        'ganado', 
        'perdido', 
        'otro'
      ))
    `);
    console.log('✅ Nueva restricción agregada');
    
    // 3. Verificar estados disponibles
    console.log('\n📊 Estados disponibles ahora:');
    const result = await pool.query(`
      SELECT DISTINCT status 
      FROM companies 
      ORDER BY status
    `);
    
    result.rows.forEach(row => {
      console.log(`   - ${row.status}`);
    });
    
    console.log('\n✅ Restricción actualizada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  updateStatusConstraintNoContesto().then(() => {
    console.log('\n🎉 Proceso completado');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { updateStatusConstraintNoContesto };
