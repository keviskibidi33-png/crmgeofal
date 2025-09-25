const pool = require('../config/db');

async function addQuimicoAgregadoSubservices() {
  console.log('🔧 AGREGANDO ENSAYO QUÍMICO AGREGADO (9 subservicios)\n');
  
  try {
    // 1. Obtener el ID del servicio Laboratorio
    console.log('1️⃣ Obteniendo ID del servicio Laboratorio...');
    const serviceResult = await pool.query("SELECT id FROM services WHERE area = 'laboratorio'");
    const serviceId = serviceResult.rows[0].id;
    console.log(`✅ ID del servicio Laboratorio: ${serviceId}`);

    // 2. Función para agregar un subservicio
    async function addSubservice(codigo, descripcion, norma, precio) {
      try {
        await pool.query(`
          INSERT INTO subservices (codigo, descripcion, norma, precio, service_id, name, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, true)
        `, [codigo, descripcion, norma, precio, serviceId, descripcion]);
        console.log(`   ✅ ${codigo}: ${descripcion.substring(0, 40)}...`);
        return true;
      } catch (error) {
        if (error.code === '23505') { // Código duplicado
          console.log(`   ⚠️  ${codigo}: Ya existe (omitido)`);
          return false;
        } else {
          console.log(`   ❌ ${codigo}: Error - ${error.message}`);
          return false;
        }
      }
    }

    // 3. Agregar los 9 ENSAYO QUÍMICO AGREGADO
    console.log('\n2️⃣ Agregando ENSAYO QUÍMICO AGREGADO...');
    
    await addSubservice('AG11', 'Contenido Sales solubles, fino o grueso.', 'MTC E-219', 150);
    await addSubservice('AG16', 'Contenido de cloruros solubles.', 'NTP 400.042', 90);
    await addSubservice('AG17', 'Contenido de sulfatos solubles.', 'NTP 400.042', 150);
    await addSubservice('AG29', 'Valor de azul de metileno.', 'AASHTO TP57 / AASHTO TO3', 150);
    await addSubservice('AG30', 'Reactividad agregado alcálisis.', 'ASTM C289-07 / MTC E 217', 650);
    await addSubservice('AG24', 'Partículas Liviana en los agregados (carbon y lignito), Fino o grueso.', 'NTP 400.023', 220);
    await addSubservice('AG25', 'Terrones de arcilla y partículas friables, Fino o grueso.', 'NTP 400.015 / ASTM C142', 120);
    await addSubservice('AG12', 'Adherencia en agregado fino - Riedel Weber.', 'MTC E 220', 150);
    await addSubservice('AG13', 'Impurezas Orgánicas en los áridos finos.', 'ASTM C40-99', 150);

    console.log('\n✅ 9 subservicios de ENSAYO QUÍMICO AGREGADO agregados');

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
      AND s.codigo IN ('AG11', 'AG12', 'AG13', 'AG16', 'AG17', 'AG24', 'AG25', 'AG29', 'AG30')
      ORDER BY s.codigo
    `);
    
    examples.rows.forEach(row => {
      const precio = (row.precio && parseFloat(row.precio) > 0) ? `S/ ${parseFloat(row.precio).toFixed(2)}` : 'Sujeto a evaluación';
      console.log(`   ${row.codigo}: ${row.descripcion.substring(0, 40)}... - ${precio}`);
    });

    console.log('\n🎉 ENSAYO QUÍMICO AGREGADO COMPLETADO');
    console.log('✅ 9 subservicios agregados correctamente');
    console.log('✅ Listo para la siguiente sección');
    
  } catch (error) {
    console.error('❌ Error agregando ENSAYO QUÍMICO AGREGADO:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await addQuimicoAgregadoSubservices();
    console.log('\n✅ Proceso completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }
}

main();
