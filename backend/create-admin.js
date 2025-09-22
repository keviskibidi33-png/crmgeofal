// Script para crear usuario administrador
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PGUSER || 'admin',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'postgres',
  password: process.env.PGPASSWORD || 'admin123',
  port: process.env.PGPORT || 5432,
});

async function createAdminUser() {
  try {
    console.log('🔐 Creando usuario administrador...');
    
    // Verificar si ya existe un usuario admin
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@geofal.com']);
    
    if (existingUser.rows.length > 0) {
      console.log('⚠️  El usuario admin ya existe');
      console.log('📧 Email:', existingUser.rows[0].email);
      console.log('👤 Nombre:', existingUser.rows[0].name);
      console.log('🔑 Rol:', existingUser.rows[0].role);
      return;
    }

    // Crear hash de la contraseña
    const password = 'admin123';
    const passwordHash = await bcrypt.hash(password, 10);

    // Insertar usuario admin
    const result = await pool.query(
      `INSERT INTO users (name, apellido, email, password_hash, role, area) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, name, email, role`,
      ['Administrador', 'Sistema', 'admin@geofal.com', passwordHash, 'admin', 'Sistemas']
    );

    const user = result.rows[0];
    
    console.log('✅ Usuario administrador creado exitosamente!');
    console.log('📧 Email:', user.email);
    console.log('🔑 Contraseña:', password);
    console.log('👤 Nombre:', user.name);
    console.log('🔑 Rol:', user.role);
    console.log('🆔 ID:', user.id);
    
    // Crear también un usuario vendedor de prueba
    const vendedorResult = await pool.query(
      `INSERT INTO users (name, apellido, email, password_hash, role, area) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, name, email, role`,
      ['Vendedor', 'Prueba', 'vendedor@geofal.com', passwordHash, 'vendedor_comercial', 'Comercial']
    );

    const vendedor = vendedorResult.rows[0];
    
    console.log('\n✅ Usuario vendedor creado exitosamente!');
    console.log('📧 Email:', vendedor.email);
    console.log('🔑 Contraseña:', password);
    console.log('👤 Nombre:', vendedor.name);
    console.log('🔑 Rol:', vendedor.role);
    console.log('🆔 ID:', vendedor.id);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error creando usuario admin:', err);
    process.exit(1);
  }
}

createAdminUser();
