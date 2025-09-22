const pool = require('../config/db');
require('dotenv').config({ path: '../.env' });

async function seedManyClients() {
  console.log('🚀 Iniciando la inserción de muchos clientes de prueba...');
  try {
    const tiposEmpresa = ['S.A.C.', 'S.A.', 'E.I.R.L.', 'S.R.L.', 'S.A.A.'];
    const sectores = ['Construcción', 'Minería', 'Ingeniería', 'Laboratorio', 'Consultoría', 'Tecnología', 'Ambiental', 'Geología'];
    const ciudades = ['Lima', 'Arequipa', 'Cusco', 'Trujillo', 'Piura', 'Chiclayo', 'Iquitos', 'Huancayo'];
    const nombresPersonas = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Patricia', 'Roberto', 'Carmen', 'Miguel', 'Elena'];
    const apellidos = ['García', 'López', 'Martínez', 'González', 'Pérez', 'Sánchez', 'Ramírez', 'Cruz', 'Morales', 'Jiménez'];
    
    const numEmpresas = 50;
    const numPersonas = 50;
    const totalClients = numEmpresas + numPersonas;
    
    console.log(`Creando ${numEmpresas} empresas y ${numPersonas} personas naturales...`);

    // Crear empresas
    for (let i = 1; i <= numEmpresas; i++) {
      const sector = sectores[Math.floor(Math.random() * sectores.length)];
      const tipoEmpresa = tiposEmpresa[Math.floor(Math.random() * tiposEmpresa.length)];
      const ciudad = ciudades[Math.floor(Math.random() * ciudades.length)];
      
      const ruc = `20${String(i).padStart(9, '0')}`;
      const name = `${sector} ${tipoEmpresa} ${i}`;
      const address = `Av. Principal ${i * 10}, ${ciudad}`;
      const email = `empresa${i}@${sector.toLowerCase().replace(' ', '')}.com`;
      const phone = `+51 ${Math.floor(Math.random() * 9) + 1} ${String(Math.floor(Math.random() * 900) + 100)} ${String(Math.floor(Math.random() * 900) + 100)}`;
      const contact_name = `${nombresPersonas[Math.floor(Math.random() * nombresPersonas.length)]} ${apellidos[Math.floor(Math.random() * apellidos.length)]}`;

      await pool.query(
        `INSERT INTO companies (type, ruc, dni, name, address, email, phone, contact_name, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)`,
        ['empresa', ruc, null, name, address, email, phone, contact_name]
      );

      if (i % 10 === 0) {
        console.log(`  ${i} empresas creadas...`);
      }
    }

    // Crear personas naturales
    for (let i = 1; i <= numPersonas; i++) {
      const ciudad = ciudades[Math.floor(Math.random() * ciudades.length)];
      const nombre = nombresPersonas[Math.floor(Math.random() * nombresPersonas.length)];
      const apellido1 = apellidos[Math.floor(Math.random() * apellidos.length)];
      const apellido2 = apellidos[Math.floor(Math.random() * apellidos.length)];
      
      const dni = String(10000000 + i);
      const rucPersona = `10${String(i).padStart(9, '0')}`; // RUC único para personas
      const name = `${nombre} ${apellido1} ${apellido2}`;
      const address = `Jr. ${nombre} ${i * 5}, ${ciudad}`;
      const email = `${nombre.toLowerCase()}.${apellido1.toLowerCase()}${i}@email.com`;
      const phone = `+51 999 ${String(Math.floor(Math.random() * 900) + 100)} ${String(Math.floor(Math.random() * 900) + 100)}`;
      const contact_name = name;

      await pool.query(
        `INSERT INTO companies (type, ruc, dni, name, address, email, phone, contact_name, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)`,
        ['persona', rucPersona, dni, name, address, email, phone, contact_name]
      );

      if (i % 10 === 0) {
        console.log(`  ${i} personas creadas...`);
      }
    }

    console.log(`✅ ${totalClients} clientes de prueba insertados exitosamente.`);
    console.log(`   - ${numEmpresas} empresas`);
    console.log(`   - ${numPersonas} personas naturales`);
  } catch (error) {
    console.error('❌ Error durante la inserción de clientes de prueba:', error.message);
  } finally {
    pool.end();
  }
}

if (require.main === module) {
  seedManyClients();
}
