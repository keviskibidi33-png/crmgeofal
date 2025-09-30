const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.PGUSER || 'admin',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'postgres',
  password: process.env.PGPASSWORD || 'admin123',
  port: process.env.PGPORT || 5432,
});

async function verificarRolFacturacion() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verificando rol de facturación en la base de datos...\n');
    
    // Ejecutar el script de verificación
    const verificacionQuery = `
      -- Verificar roles existentes
      SELECT 
          role,
          COUNT(*) as cantidad_usuarios,
          array_agg(name || ' ' || apellido) as nombres_usuarios
      FROM users 
      GROUP BY role 
      ORDER BY role;
    `;
    
    const result = await client.query(verificacionQuery);
    
    console.log('📊 Roles actuales en la base de datos:');
    console.log('==========================================');
    
    result.rows.forEach(row => {
      console.log(`🔸 Rol: ${row.role}`);
      console.log(`   Usuarios: ${row.cantidad_usuarios}`);
      console.log(`   Nombres: ${row.nombres_usuarios.join(', ')}`);
      console.log('');
    });
    
    // Verificar específicamente el rol facturación
    const facturacionUsers = result.rows.find(row => row.role === 'facturacion');
    
    if (facturacionUsers) {
      console.log('✅ El rol "facturacion" ya existe en la base de datos');
      console.log(`   Usuarios con este rol: ${facturacionUsers.cantidad_usuarios}`);
    } else {
      console.log('⚠️  El rol "facturacion" NO existe en la base de datos');
      console.log('   Puedes crear usuarios con este rol desde el frontend');
    }
    
    // Verificar estructura de la tabla users
    const tableStructure = await client.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name IN ('role', 'area')
      ORDER BY column_name;
    `);
    
    console.log('\n📋 Estructura de campos relacionados:');
    console.log('=====================================');
    tableStructure.rows.forEach(row => {
      console.log(`🔸 ${row.column_name}: ${row.data_type}${row.character_maximum_length ? `(${row.character_maximum_length})` : ''} ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
  } catch (error) {
    console.error('❌ Error verificando rol de facturación:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

// Función para crear un usuario de facturación de ejemplo
async function crearUsuarioFacturacion() {
  const client = await pool.connect();
  
  try {
    console.log('\n🚀 Creando usuario de facturación de ejemplo...');
    
    // Verificar si ya existe un usuario de facturación
    const existingUser = await client.query(
      "SELECT * FROM users WHERE role = 'facturacion' LIMIT 1"
    );
    
    if (existingUser.rows.length > 0) {
      console.log('✅ Ya existe un usuario con rol facturación');
      return;
    }
    
    // Crear usuario de facturación
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('facturacion123', 10);
    
    const insertQuery = `
      INSERT INTO users (name, apellido, email, password, role, area, active, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id, name, apellido, email, role, area;
    `;
    
    const values = [
      'Usuario',
      'Facturación',
      'facturacion@geofal.com',
      hashedPassword,
      'facturacion',
      'Facturación',
      true
    ];
    
    const result = await client.query(insertQuery, values);
    
    console.log('✅ Usuario de facturación creado exitosamente:');
    console.log(result.rows[0]);
    console.log('\n🔑 Credenciales:');
    console.log('   Email: facturacion@geofal.com');
    console.log('   Password: facturacion123');
    
  } catch (error) {
    if (error.code === '23505') { // Duplicate key error
      console.log('⚠️  El email ya existe. Usuario de facturación ya creado previamente.');
    } else {
      console.error('❌ Error creando usuario de facturación:', error.message);
    }
  } finally {
    client.release();
  }
}

// Ejecutar verificación
async function main() {
  await verificarRolFacturacion();
  
  // Preguntar si crear usuario de ejemplo
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('\n❓ ¿Quieres crear un usuario de facturación de ejemplo? (y/n): ', async (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      await crearUsuarioFacturacion();
    }
    rl.close();
    process.exit(0);
  });
}

main().catch(console.error);