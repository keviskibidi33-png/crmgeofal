const pool = require('../config/db');

async function checkUsers() {
  try {
    // Verificar estructura de la tabla
    const columns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Estructura de la tabla users:');
    columns.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type}`);
    });
    
    console.log('\n👥 Usuarios en la base de datos:');
    const users = await pool.query('SELECT * FROM users LIMIT 3');
    users.rows.forEach(user => {
      console.log('  Usuario:', user);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    pool.end();
  }
}

checkUsers();
