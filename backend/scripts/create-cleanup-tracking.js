const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'crmgeofal',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

async function createCleanupTracking() {
  try {
    console.log('🔧 Creando tabla de seguimiento de limpieza...');
    
    // Crear tabla de seguimiento
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_cleanup_log (
        id SERIAL PRIMARY KEY,
        cleanup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        hours_threshold INTEGER NOT NULL,
        deleted_count INTEGER NOT NULL,
        total_before INTEGER NOT NULL,
        total_after INTEGER NOT NULL,
        executed_by INTEGER REFERENCES users(id),
        notes TEXT
      )
    `);
    
    // Crear índice
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_cleanup_date ON audit_cleanup_log(cleanup_date)
    `);
    
    // Crear función para obtener última limpieza
    await pool.query(`
      CREATE OR REPLACE FUNCTION get_last_cleanup()
      RETURNS TIMESTAMP AS $$
      BEGIN
        RETURN (
          SELECT cleanup_date 
          FROM audit_cleanup_log 
          ORDER BY cleanup_date DESC 
          LIMIT 1
        );
      END;
      $$ LANGUAGE plpgsql
    `);
    
    console.log('✅ Tabla de seguimiento de limpieza creada exitosamente');
    
    // Verificar si hay registros
    const result = await pool.query('SELECT COUNT(*) FROM audit_cleanup_log');
    console.log(`📊 Registros de limpieza existentes: ${result.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error creando tabla de seguimiento:', error);
  } finally {
    await pool.end();
  }
}

createCleanupTracking();
