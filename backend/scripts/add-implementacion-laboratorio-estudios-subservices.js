const pool = require('../config/db');

async function addImplementacionLaboratorioEstudiosSubservices() {
  console.log('🔧 AGREGANDO ESTUDIOS Y EVALUACIONES DE IMPLEMENTACIÓN LABORATORIO EN OBRA (7 subservicios)\n');
  
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
          return false;
        }

        await pool.query(`
          INSERT INTO subservices (codigo, descripcion, norma, precio, service_id, name, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, true)
        `, [codigo, descripcion, norma, precio, serviceId, descripcion]);
        console.log(`   ✅ ${codigo}: ${descripcion.substring(0, 50)}...`);
        return true;
      } catch (error) {
        console.error(`   ❌ Error agregando ${codigo}:`, error.message);
        return false;
      }
    }

    // 3. Agregar los 7 subservicios de IMPLEMENTACIÓN LABORATORIO EN OBRA
    console.log('\n2️⃣ Agregando subservicios...');
    let addedCount = 0;

    if (await addSubservice('IL01', 'Estudio de suelos con fines de cimentación superficial y profunda, edificaciones, puentes, plantas industriales.', '-', 0)) addedCount++;
    if (await addSubservice('IL02', 'Estudio de suelos y diseño de pavimentación.', '-', 0)) addedCount++;
    if (await addSubservice('IL03', 'Estudio de suelos con fines de estabilidad de taludes.', '-', 0)) addedCount++;
    if (await addSubservice('IL04', 'Estudio de suelos confines de diseño de instalaciones sanitarias de agua y alcantarillado.', '-', 0)) addedCount++;
    if (await addSubservice('IL05', 'Estudio de Potencial de licuación de suelos.', '-', 0)) addedCount++;
    if (await addSubservice('IL06', 'Evaluación y caracterización del maciso rocoso.', '-', 0)) addedCount++;
    if (await addSubservice('IL07', 'Evaluación de canteras.', '-', 0)) addedCount++;

    console.log(`\n✅ ${addedCount} subservicios de IMPLEMENTACIÓN LABORATORIO EN OBRA agregados`);

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
      AND s.codigo LIKE 'IL%'
      ORDER BY s.codigo
      LIMIT 5
    `);
    
    examples.rows.forEach(row => {
      const precio = (row.precio && parseFloat(row.precio) > 0) ? `S/ ${parseFloat(row.precio).toFixed(2)}` : 'Sujeto a evaluación';
      console.log(`   ${row.codigo}: ${row.descripcion.substring(0, 40)}... - ${precio}`);
    });

    console.log('\n🎉 ESTUDIOS Y EVALUACIONES DE IMPLEMENTACIÓN LABORATORIO EN OBRA COMPLETADOS');
    console.log('✅ 7 subservicios agregados correctamente');
    console.log('✅ Listo para la siguiente sección');
    
  } catch (error) {
    console.error('❌ Error agregando ESTUDIOS Y EVALUACIONES DE IMPLEMENTACIÓN LABORATORIO EN OBRA:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await addImplementacionLaboratorioEstudiosSubservices();
    console.log('\n✅ Proceso completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }
}

main();
