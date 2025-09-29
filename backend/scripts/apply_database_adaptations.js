const pool = require('../config/db');
const fs = require('fs');

async function applyDatabaseAdaptations() {
  try {
    console.log('🔄 Aplicando adaptaciones a la base de datos...');
    
    const sql = fs.readFileSync('./sql/adapt_notifications_table.sql', 'utf8');
    await pool.query(sql);
    
    console.log('✅ Base de datos adaptada exitosamente');
    console.log('📋 Tablas creadas: quote_versions, quote_approvals');
    console.log('🔧 Tabla notifications adaptada con nuevas columnas');
    console.log('📊 Índices creados para optimización');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error aplicando adaptaciones:', error.message);
    process.exit(1);
  }
}

applyDatabaseAdaptations();
