// Script para limpiar y recrear la base de datos
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PGUSER || 'admin',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'postgres',
  password: process.env.PGPASSWORD || 'admin123',
  port: process.env.PGPORT || 5432,
});

async function cleanDatabase() {
  try {
    console.log('🧹 Limpiando base de datos...');
    
    // Lista de tablas a eliminar (en orden inverso para evitar problemas de dependencias)
    const tables = [
      'audit_quotes',
      'audit_log',
      'quote_items',
      'quotes',
      'quote_variants',
      'project_whatsapp_notices',
      'project_attachments',
      'project_history',
      'projects',
      'companies',
      'subcategories',
      'categories',
      'users'
    ];

    // Eliminar todas las tablas
    for (const table of tables) {
      try {
        await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        console.log(`✅ Tabla ${table} eliminada`);
      } catch (err) {
        console.log(`⚠️  Error eliminando ${table}:`, err.message);
      }
    }

    console.log('✅ Base de datos limpiada exitosamente');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error limpiando base de datos:', err);
    process.exit(1);
  }
}

cleanDatabase();
