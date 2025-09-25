const pool = require('../config/db');

async function setupCleanupTracking() {
  try {
    console.log('🔧 Configurando seguimiento de limpieza...');
    
    // Crear tabla de seguimiento si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_cleanup_log (
        id SERIAL PRIMARY KEY,
        cleanup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        hours_threshold INTEGER NOT NULL,
        deleted_count INTEGER NOT NULL,
        total_before INTEGER NOT NULL,
        total_after INTEGER NOT NULL,
        executed_by INTEGER,
        notes TEXT
      )
    `);
    
    // Crear índice si no existe
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_cleanup_date ON audit_cleanup_log(cleanup_date)
    `);
    
    console.log('✅ Tabla de seguimiento de limpieza configurada');
    
    // Verificar si hay registros
    const result = await pool.query('SELECT COUNT(*) FROM audit_cleanup_log');
    console.log(`📊 Registros de limpieza existentes: ${result.rows[0].count}`);
    
    // Si no hay registros, crear uno inicial
    if (parseInt(result.rows[0].count) === 0) {
      console.log('📝 Creando registro inicial de limpieza...');
      await pool.query(`
        INSERT INTO audit_cleanup_log (hours_threshold, deleted_count, total_before, total_after, executed_by, notes)
        VALUES (24, 0, 0, 0, NULL, 'Sistema inicializado - Sin limpiezas previas')
      `);
      console.log('✅ Registro inicial creado');
    }
    
  } catch (error) {
    console.error('❌ Error configurando seguimiento:', error);
  } finally {
    await pool.end();
  }
}

setupCleanupTracking();
