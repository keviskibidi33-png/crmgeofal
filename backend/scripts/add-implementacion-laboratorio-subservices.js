const pool = require('../config/db');

async function addImplementacionLaboratorioSubservices() {
  console.log('🔧 AGREGANDO IMPLEMENTACIÓN LABORATORIO EN OBRA (1 subservicio)\n');
  
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

    // 3. Agregar el 1 IMPLEMENTACIÓN LABORATORIO EN OBRA
    console.log('\n2️⃣ Agregando IMPLEMENTACIÓN LABORATORIO EN OBRA...');
    
    await addSubservice('IMP01', 'Implementación de personal técnico y equipo de laboratorio en obra en la especialidad SUELO, AGREGADO, CONCRETO, PAVIMENTO.', '-', 0); // Sujeto a evaluación

    console.log('\n✅ 1 subservicio de IMPLEMENTACIÓN LABORATORIO EN OBRA agregado');

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

    // 5. Mostrar el ejemplo agregado
    console.log('\n4️⃣ Ejemplo agregado:');
    const examples = await pool.query(`
      SELECT codigo, descripcion, precio
      FROM subservices s 
      JOIN services sv ON s.service_id = sv.id 
      WHERE s.is_active = true 
      AND sv.area = 'laboratorio'
      AND s.codigo = 'IMP01'
    `);
    
    examples.rows.forEach(row => {
      const precio = (row.precio && parseFloat(row.precio) > 0) ? `S/ ${parseFloat(row.precio).toFixed(2)}` : 'Sujeto a evaluación';
      console.log(`   ${row.codigo}: ${row.descripcion.substring(0, 60)}... - ${precio}`);
    });

    console.log('\n🎉 IMPLEMENTACIÓN LABORATORIO EN OBRA COMPLETADA');
    console.log('✅ 1 subservicio agregado correctamente');
    console.log('✅ Listo para la siguiente sección');
    
  } catch (error) {
    console.error('❌ Error agregando IMPLEMENTACIÓN LABORATORIO EN OBRA:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await addImplementacionLaboratorioSubservices();
    console.log('\n✅ Proceso completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }
}

main();
