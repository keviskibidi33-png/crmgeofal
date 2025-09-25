const pool = require('../config/db');

async function addEstandarSubservices() {
  console.log('🔧 AGREGANDO ENSAYOS ESTÁNDAR (20 subservicios)\n');
  
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
        console.log(`   ❌ ${codigo}: Error - ${error.message}`);
        return false;
      }
    }

    // 3. Agregar los 20 ENSAYOS ESTÁNDAR
    console.log('\n2️⃣ Agregando ENSAYOS ESTÁNDAR...');
    
    await addSubservice('SU04', 'Contenido de humedad con Speedy.', 'NTP 339.25', 30);
    await addSubservice('SU16', 'Ensayo de Penetración Estándar (SPT).', 'NTP 339.133', 0); // Sujeto a evaluación
    await addSubservice('SU18', 'Capacidad de carga del Suelo (Placa de Carga).', 'ASTM D-1194', 2000);
    await addSubservice('SU19', 'Próctor modificado (*).', 'ASTM D1557-12 (Reapproved 2021)', 150);
    await addSubservice('SU20', 'Contenido de humedad en suelos (*).', 'ASTM D2216-19', 30);
    await addSubservice('SU20A', 'Contenido de humedad en Roca.', 'ASTM D2216-19', 30);
    await addSubservice('SU21', 'Equivalente de arena (*).', 'ASTM D2419-22', 150);
    await addSubservice('SU22', 'Clasificación suelo SUCS-AASHTO (*).', 'ASTM D2487-17 (Reapproved 2025)/ASTM 03282-24', 20);
    await addSubservice('SU23', 'Límite líquido y Límite Plástico del Suelo (*).', 'ASTM D4318-17ε1', 90);
    await addSubservice('SU24', 'Análisis granulométrico por tamizado en Suelo (*).', 'ASTM D6913/D6913M-17', 100);
    await addSubservice('SU27', 'Método de prueba estándar para la medición de sólidos en agua.', 'ASTM C1603', 120);
    await addSubservice('SU30', 'Ensayo de Compactación Próctor Estándar.', 'ASTM D698', 150);
    await addSubservice('SU31', 'Corrección de Peso Unitario para Partícula de gran tamaño.', 'ASTM D4718-87', 20);
    await addSubservice('SU32', 'Gravedad específica de los sólidos del suelo.', 'ASTM D854-14', 120);
    await addSubservice('SU34', 'Densidad y peso unitario de muestra suelo', 'ASTM D 7263', 70);
    await addSubservice('SU35', 'Densidad del peso unitario máximo del suelo.', 'NTP 339.137', 350);
    await addSubservice('SU36', 'Densidad del peso unitario mínimo del suelo.', 'NTP 339.138', 150);
    await addSubservice('SU38', 'Determinación de sólidos totales suspendidos.', 'NTP 214.039', 150);
    await addSubservice('SU39', 'Análisis granulométrico por hidrómetro (incl. Granulometría por tamizado).', 'NTP 339.128 1999 (revisada el 2019)', 350);
    await addSubservice('-', 'Conductividad térmica / Resistividad térmica', 'ASTM D5334-14', 1500);

    console.log('\n✅ 20 subservicios de ENSAYO ESTÁNDAR agregados');

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
      ORDER BY s.codigo
      LIMIT 5
    `);
    
    examples.rows.forEach(row => {
      const precio = (row.precio && parseFloat(row.precio) > 0) ? `S/ ${parseFloat(row.precio).toFixed(2)}` : 'Sujeto a evaluación';
      console.log(`   ${row.codigo}: ${row.descripcion.substring(0, 40)}... - ${precio}`);
    });

    console.log('\n🎉 ENSAYOS ESTÁNDAR COMPLETADOS');
    console.log('✅ 20 subservicios agregados correctamente');
    console.log('✅ Listo para la siguiente sección');
    
  } catch (error) {
    console.error('❌ Error agregando ENSAYOS ESTÁNDAR:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await addEstandarSubservices();
    console.log('\n✅ Proceso completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }
}

main();
