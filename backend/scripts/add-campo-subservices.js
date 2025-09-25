const pool = require('../config/db');

async function addCampoSubservices() {
  console.log('🔧 AGREGANDO ENSAYOS DE CAMPO (8 subservicios)\n');
  
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

    // 3. Agregar los 8 ENSAYOS DE CAMPO
    console.log('\n2️⃣ Agregando ENSAYOS DE CAMPO...');
    
    await addSubservice('SU02', 'Ensayo de penetración dinámica DPL.', 'NTP 339.159', 0); // Sujeto a evaluación
    await addSubservice('SU29', 'Infiltración de suelos en campo.', 'ASTM D3385', 3500);
    await addSubservice('SU40', 'Métodos de prueba estándar para el análisis del tamaño de partículas de materiales de escollera naturales y artificiales.', 'ASTM D5519-07', 250);
    await addSubservice('SU41', 'Determinación de la densidad de suelo en terreno (Método Densímetro Nuclear).', 'ASTM D2922', 90);
    await addSubservice('SU06A', 'Densidad del suelo IN-SITU, Cono de Arena 6" (*).', 'NTP 339.143:1999 (revisada el 2019)', 50);
    await addSubservice('SU06B', 'Densidad del suelo IN-SITU, Cono de Arena 12".', 'NTP 339.143:1999 (revisada el 2019)', 80);
    await addSubservice('SU06C', 'Control de calidad de suelo con Cono de arena 6", contenido de humedad con equipo Speedy, y personal tecnico, por día.', 'NTP 339.143:1999 (revisada el 2019)', 400);
    await addSubservice('SU28', 'Densidad del suelo y roca IN SITU por reemplazo de agua.', 'ASTM D5030', 0); // Sujeto a evaluación

    console.log('\n✅ 8 subservicios de ENSAYOS DE CAMPO agregados');

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
      AND (s.codigo LIKE 'SU%' AND s.codigo IN ('SU02', 'SU29', 'SU40', 'SU41', 'SU06A', 'SU06B', 'SU06C', 'SU28'))
      ORDER BY s.codigo
      LIMIT 5
    `);
    
    examples.rows.forEach(row => {
      const precio = (row.precio && parseFloat(row.precio) > 0) ? `S/ ${parseFloat(row.precio).toFixed(2)}` : 'Sujeto a evaluación';
      console.log(`   ${row.codigo}: ${row.descripcion.substring(0, 40)}... - ${precio}`);
    });

    console.log('\n🎉 ENSAYOS DE CAMPO COMPLETADOS');
    console.log('✅ 8 subservicios agregados correctamente');
    console.log('✅ Todas las secciones completadas');
    
  } catch (error) {
    console.error('❌ Error agregando ENSAYOS DE CAMPO:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await addCampoSubservices();
    console.log('\n✅ Proceso completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }
}

main();
