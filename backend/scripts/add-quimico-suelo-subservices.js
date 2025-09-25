const pool = require('../config/db');

async function addQuimicoSueloSubservices() {
  console.log('🔧 AGREGANDO ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO (5 subservicios)\n');
  
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

    // 3. Agregar los 5 ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO
    console.log('\n2️⃣ Agregando ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO...');
    
    await addSubservice('SU03', 'Determinación del PH en Suelo y Agua.', 'NTP 339.176 / D4972', 70);
    await addSubservice('SU13', 'Sales solubles en Suelos y Agua.', 'NTP 339.152 / BS 1377', 80);
    await addSubservice('SU14', 'Cloruros Solubles en Suelos y Agua.', 'NTP 339.177 / AASHTO T291', 80);
    await addSubservice('SU15', 'Sulfatos Solubles en Suelos y Agua.', 'NTP 339.178 / AASHTO T290', 120);
    await addSubservice('SU26', 'Contenido de materia orgánica.', 'AASHTO T267', 120);

    console.log('\n✅ 5 subservicios de ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO agregados');

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
      AND s.codigo IN ('SU03', 'SU13', 'SU14', 'SU15', 'SU26')
      ORDER BY s.codigo
    `);
    
    examples.rows.forEach(row => {
      const precio = (row.precio && parseFloat(row.precio) > 0) ? `S/ ${parseFloat(row.precio).toFixed(2)}` : 'Sujeto a evaluación';
      console.log(`   ${row.codigo}: ${row.descripcion.substring(0, 40)}... - ${precio}`);
    });

    console.log('\n🎉 ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO COMPLETADO');
    console.log('✅ 5 subservicios agregados correctamente');
    console.log('✅ Listo para la siguiente sección');
    
  } catch (error) {
    console.error('❌ Error agregando ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await addQuimicoSueloSubservices();
    console.log('\n✅ Proceso completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }
}

main();
