const pool = require('../config/db');

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuarios en la base de datos...');

    const users = await pool.query('SELECT id, name, email, role FROM users ORDER BY id');
    
    console.log(`📊 Total de usuarios: ${users.rows.length}`);
    
    if (users.rows.length > 0) {
      console.log('📋 Usuarios encontrados:');
      users.rows.forEach(user => {
        console.log(`  - ID: ${user.id} | Nombre: ${user.name} | Email: ${user.email} | Rol: ${user.role}`);
      });
    } else {
      console.log('⚠️  No hay usuarios en la base de datos');
      
      // Crear usuario admin por defecto
      console.log('📝 Creando usuario admin por defecto...');
      
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await pool.query(`
        INSERT INTO users (name, email, password, role, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
      `, ['Admin', 'admin@geofal.com', hashedPassword, 'admin']);
      
      console.log('✅ Usuario admin creado: admin@geofal.com / admin123');
    }

  } catch (error) {
    console.error('❌ Error verificando usuarios:', error);
  }
}

if (require.main === module) {
  checkUsers().then(() => {
    console.log('🎉 Verificación completada');
    process.exit(0);
  });
}

module.exports = checkUsers;
