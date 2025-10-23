const pool = require('../config/db');

async function getToken() {
  try {
    const result = await pool.query('SELECT id, username, role, token FROM users WHERE role = $1 LIMIT 1', ['admin']);
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('👤 Usuario admin encontrado:');
      console.log(`  ID: ${user.id}`);
      console.log(`  Username: ${user.username}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Token: ${user.token}`);
    } else {
      console.log('❌ No se encontraron usuarios admin');
      
      // Mostrar todos los usuarios disponibles
      const allUsers = await pool.query('SELECT id, username, role FROM users LIMIT 5');
      console.log('\n👥 Usuarios disponibles:');
      allUsers.rows.forEach(user => {
        console.log(`  ${user.username} (${user.role})`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    pool.end();
  }
}

getToken();
