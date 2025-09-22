const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function seedManyUsers() {
  console.log('🚀 Iniciando la inserción de una gran cantidad de usuarios de prueba...');

  const roles = ['vendedor_comercial', 'jefa_comercial', 'jefe_laboratorio', 'usuario_laboratorio', 'soporte', 'gerencia'];
  const areas = ['Comercial', 'Laboratorio', 'Soporte', 'Gerencia'];
  const numUsersToCreate = 1000; // Cantidad de usuarios a crear

  try {
    // Asegurarse de que el usuario admin exista para poder loguearse
    const adminCheck = await pool.query("SELECT id FROM users WHERE email = 'admin@crm.com'");
    if (adminCheck.rows.length === 0) {
      console.log('⚠️ Usuario admin no encontrado. Creando uno por defecto...');
      const adminPasswordHash = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO users (name, apellido, email, password_hash, role, area, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        ['Admin', 'Sistema', 'admin@crm.com', adminPasswordHash, 'admin', 'Sistemas', new Date()]
      );
      console.log('✅ Usuario admin creado.');
    } else {
      console.log('✅ Usuario admin ya existe.');
    }

    for (let i = 1; i <= numUsersToCreate; i++) {
      const name = `Usuario${i}`;
      const apellido = `Apellido${i}`;
      const email = `user${i}@crm.com`;
      const password = `password${i}`;
      const role = roles[i % roles.length];
      const area = areas[i % areas.length];
      const password_hash = await bcrypt.hash(password, 10);

      await pool.query(
        'INSERT INTO users (name, apellido, email, password_hash, role, area, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [name, apellido, email, password_hash, role, area, new Date()]
      );

      if (i % 100 === 0) {
        console.log(`  ${i} usuarios insertados...`);
      }
    }
    console.log(`✅ ${numUsersToCreate} usuarios de prueba insertados exitosamente.`);
  } catch (error) {
    console.error('❌ Error al insertar usuarios de prueba:', error.message);
  } finally {
    pool.end();
  }
}

if (require.main === module) {
  seedManyUsers();
}
