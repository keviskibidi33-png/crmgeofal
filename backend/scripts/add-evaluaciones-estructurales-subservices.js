const pool = require('../config/db');

async function addEvaluacionesEstructuralesSubservices() {
  console.log('🔧 AGREGANDO EVALUACIONES ESTRUCTURALES (4 subservicios)\n');
  
  try {
    // 1. Obtener el ID del servicio Laboratorio
    console.log('1️⃣ Obteniendo ID del servicio Laboratorio...');
    const serviceResult = await pool.query("SELECT id FROM services WHERE area = 'laboratorio'");
    const serviceId = serviceResult.rows[0].id;
    console.log(`✅ ID del servicio Laboratorio: ${serviceId}`);

    // 2. Función para agregar un subservicio
    async function addSubservice(codigo, descripcion, norma, precio) {
      try {
        // Verificar si el código ya existe
        const existingSubservice = await pool.query('SELECT id FROM subservices WHERE codigo = $1 AND service_id = $2', [codigo, serviceId]);
        if (existingSubservice.rows.length > 0) {
          console.warn(`   ⚠️  ${codigo}: Ya existe (omitido)`);
          return;
        }

        await pool.query(`
          INSERT INTO subservices (codigo, descripcion, norma, precio, service_id, name, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, true)
        `, [codigo, descripcion, norma, precio, serviceId, descripcion]);
        console.log(`   ✅ ${codigo}: ${descripcion.substring(0, 50)}...`);
      } catch (error) {
        console.error(`   ❌ Error agregando ${codigo}:`, error.message);
      }
    }

    // 3. Agregar los 4 EVALUACIONES ESTRUCTURALES
    console.log('\n2️⃣ Agregando EVALUACIONES ESTRUCTURALES...');
    
    await addSubservice('E01', 'Escaneo de acero de refuerzo. (CAMPO)', '-', 0); // Sujeto a evaluación
    await addSubservice('E02', 'Escaneo de acero por portico. (CAMPO)', '-', 0); // Sujeto a evaluación
    await addSubservice('E03', 'Escaneo de acero por estructura. (CAMPO)', '-', 0); // Sujeto a evaluación
    await addSubservice('E04', 'PH concreto. (LABORATORIO)', 'ASTM C4262', 100);

    console.log('\n✅ 4 subservicios de EVALUACIONES ESTRUCTURALES agregados');

    // 4. Verificar total
    console.log('\n3️⃣ Verificando total...');
    const totalResult = await pool.query(`
      SELECT COUNT(*) as total
      FROM subservices s 
      JOIN services sv ON s.service_id = sv.id 
      WHERE s.is_active = true 
      AND sv.area = 'laboratorio'
    `);
    
    const total = parseInt(totalResult.rows[0].total);
    console.log(`✅ Total de subservicios: ${total}`);

    // 5. Mostrar algunos ejemplos
    console.log('\n4️⃣ Ejemplos agregados:');
    const examples = await pool.query(`
      SELECT codigo, descripcion, precio
      FROM subservices s 
      JOIN services sv ON s.service_id = sv.id 
      WHERE s.is_active = true 
      AND sv.area = 'laboratorio'
      AND s.codigo IN ('E01', 'E04')
      ORDER BY s.codigo
    `);
    
    examples.rows.forEach(row => {
      const precio = (row.precio && parseFloat(row.precio) > 0) ? `S/ ${parseFloat(row.precio).toFixed(2)}` : 'Sujeto a evaluación';
      console.log(`   ${row.codigo}: ${row.descripcion.substring(0, 40)}... - ${precio}`);
    });

    console.log('\n🎉 EVALUACIONES ESTRUCTURALES COMPLETADAS');
    console.log('✅ 4 subservicios agregados correctamente');
    console.log('✅ Listo para la siguiente sección');
    
  } catch (error) {
    console.error('❌ Error agregando EVALUACIONES ESTRUCTURALES:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await addEvaluacionesEstructuralesSubservices();
    console.log('\n✅ Proceso completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }
}

main();
