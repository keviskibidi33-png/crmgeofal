const pool = require('../config/db');

async function addAlbanileriaSubservices() {
  console.log('🔧 AGREGANDO ENSAYO ALBAÑILERÍA (18 subservicios)\n');
  
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

    // 3. Agregar los 18 ENSAYO ALBAÑILERÍA
    console.log('\n2️⃣ Agregando ENSAYO ALBAÑILERÍA...');
    
    await addSubservice('ALB01', 'Absorción / Unidades de albañilería de Arcilla.', 'NTP 399.613', 130);
    await addSubservice('ALB02', 'Alabeo / Unidades de albañilería de Arcilla.', 'NTP 399.613', 130);
    await addSubservice('ALB03', 'Compresión / Unidades de albañilería de Arcilla.', 'NTP 399.613', 200);
    await addSubservice('ALB04', 'Eflorescencia / Unidades de albañilería de Arcilla.', 'NTP 399.613', 130);
    await addSubservice('ALB04A', 'Eflorescencia / Unidades de albañilería de Arcilla.', 'NTP 399.613', 200);
    await addSubservice('ALB05', 'Dimensionamiento  / Unidades de albañilería de Arcilla.', 'NTP 399.613', 130);
    await addSubservice('ALB06', 'Medidas del área de vacíos en unidades perforadas.', 'NTP 399.613', 150);
    await addSubservice('ALB07', 'Ensayo de Compresión en pilas de ladrillo (prisma albañilería).', 'NTP 399.605', 250);
    await addSubservice('ALB08', 'Muestreo / Unidades de albañilería de concreto.', 'NTP 399.604', 350);
    await addSubservice('ALB09', 'Resistencia a la compresión  / Unidades de albañilería de concreto.', 'NTP 399.604', 250);
    await addSubservice('ALB10', 'Dimensionamiento  / Unidades de albañilería de concreto.', 'NTP 399.604', 150);
    await addSubservice('ALB11', 'Absorción  / Unidades de albañilería de concreto.', 'NTP 399.604', 150);
    await addSubservice('ALB12', 'Absorción / Ladrillo pastelero', 'NTP 399.041', 130);
    await addSubservice('ALB13', 'Modulo de rotura (Ensayo Flexión) / Unidades de albañilería de Arcilla', 'NTP 399.613', 200);
    await addSubservice('ALB14', 'Contenido de humedad  / Unidades de albañilería de concreto.', 'NTP 399.604', 100);   
    await addSubservice('ALB15', 'Densidad / Unidades de albañilería de concreto.', 'NTP 399.604', 150);
    await addSubservice('ALB16', 'Dimensionamiento  / Ladrillo pastelero', 'NTP 331.041', 130);
    await addSubservice('ALB17', 'Alabeo  / Ladrillo pastelero', 'NTP 331.041', 130);
    await addSubservice('ALB18', 'Carga de rotura por unidad de ancho / Ladrillo pastelero', 'NTP 331.041', 200);

    console.log('\n✅ 18 subservicios de ENSAYO ALBAÑILERÍA agregados');

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
      AND s.codigo LIKE 'ALB%'
      ORDER BY s.codigo
      LIMIT 5
    `);
    
    examples.rows.forEach(row => {
      const precio = (row.precio && parseFloat(row.precio) > 0) ? `S/ ${parseFloat(row.precio).toFixed(2)}` : 'Sujeto a evaluación';
      console.log(`   ${row.codigo}: ${row.descripcion.substring(0, 40)}... - ${precio}`);
    });

    console.log('\n🎉 ENSAYO ALBAÑILERÍA COMPLETADO');
    console.log('✅ 18 subservicios agregados correctamente');
    console.log('✅ Listo para la siguiente sección');
    
  } catch (error) {
    console.error('❌ Error agregando ENSAYO ALBAÑILERÍA:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await addAlbanileriaSubservices();
    console.log('\n✅ Proceso completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }
}

main();
