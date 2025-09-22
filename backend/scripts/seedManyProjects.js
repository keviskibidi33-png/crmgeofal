const pool = require('../config/db');
require('dotenv').config({ path: '../.env' });

async function seedManyProjects() {
  console.log('🚀 Iniciando la inserción de muchos proyectos de prueba...');
  try {
    // Obtener empresas disponibles
    const companiesResult = await pool.query('SELECT id, name FROM companies ORDER BY id');
    const companies = companiesResult.rows;
    
    if (companies.length === 0) {
      console.log('❌ No hay empresas disponibles. Ejecuta primero seedManyClients.js');
      return;
    }

    // Obtener usuarios vendedores
    const vendedoresResult = await pool.query(`
      SELECT id, name, apellido FROM users 
      WHERE role IN ('vendedor_comercial', 'jefa_comercial') 
      ORDER BY id
    `);
    const vendedores = vendedoresResult.rows;

    // Obtener usuarios de laboratorio
    const laboratorioResult = await pool.query(`
      SELECT id, name, apellido FROM users 
      WHERE role IN ('jefe_laboratorio', 'usuario_laboratorio', 'laboratorio') 
      ORDER BY id
    `);
    const laboratorioUsers = laboratorioResult.rows;

    if (vendedores.length === 0 || laboratorioUsers.length === 0) {
      console.log('❌ No hay usuarios vendedores o de laboratorio disponibles');
      return;
    }

    const tiposProyecto = [
      'Análisis de Suelos',
      'Estudio Geotécnico',
      'Evaluación Ambiental',
      'Control de Calidad',
      'Análisis de Agua',
      'Estudio de Impacto Ambiental',
      'Análisis Químico',
      'Pruebas de Laboratorio',
      'Inspección Técnica',
      'Certificación de Materiales'
    ];

    const ubicaciones = [
      'Lima, Perú',
      'Arequipa, Perú',
      'Cusco, Perú',
      'Trujillo, Perú',
      'Piura, Perú',
      'Chiclayo, Perú',
      'Iquitos, Perú',
      'Huancayo, Perú',
      'Tacna, Perú',
      'Cajamarca, Perú'
    ];

    const estados = ['pendiente', 'activo', 'completado', 'cancelado'];
    const numProyectos = 80;

    console.log(`Creando ${numProyectos} proyectos de prueba...`);
    console.log(`Empresas disponibles: ${companies.length}`);
    console.log(`Vendedores disponibles: ${vendedores.length}`);
    console.log(`Usuarios de laboratorio disponibles: ${laboratorioUsers.length}`);

    for (let i = 1; i <= numProyectos; i++) {
      const tipoProyecto = tiposProyecto[Math.floor(Math.random() * tiposProyecto.length)];
      const ubicacion = ubicaciones[Math.floor(Math.random() * ubicaciones.length)];
      const estado = estados[Math.floor(Math.random() * estados.length)];
      const empresa = companies[Math.floor(Math.random() * companies.length)];
      const vendedor = vendedores[Math.floor(Math.random() * vendedores.length)];
      const laboratorio = laboratorioUsers[Math.floor(Math.random() * laboratorioUsers.length)];

      const name = `${tipoProyecto} - ${empresa.name} #${i}`;
      const location = `${ubicacion} - Zona ${Math.floor(Math.random() * 10) + 1}`;

      await pool.query(
        `INSERT INTO projects (company_id, name, location, vendedor_id, laboratorio_id, status, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
        [empresa.id, name, location, vendedor.id, laboratorio.id, estado]
      );

      if (i % 10 === 0) {
        console.log(`  ${i} proyectos creados...`);
      }
    }

    console.log(`✅ ${numProyectos} proyectos de prueba insertados exitosamente.`);
    
    // Mostrar estadísticas
    const statsResult = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM projects 
      GROUP BY status 
      ORDER BY status
    `);
    
    console.log('\n📊 Estadísticas por estado:');
    statsResult.rows.forEach(row => {
      console.log(`  ${row.status}: ${row.count} proyectos`);
    });

  } catch (error) {
    console.error('❌ Error durante la inserción de proyectos de prueba:', error.message);
  } finally {
    pool.end();
  }
}

if (require.main === module) {
  seedManyProjects();
}
