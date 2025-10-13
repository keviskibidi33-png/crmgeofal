const pool = require('../config/db');

async function cleanClients() {
  try {
    console.log('🧹 Limpiando clientes existentes...');
    
    const result = await pool.query("DELETE FROM companies WHERE type = 'client'");
    console.log(`✅ ${result.rowCount} clientes eliminados`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

cleanClients();
