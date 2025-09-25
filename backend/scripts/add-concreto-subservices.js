const pool = require('../config/db');

async function addConcretoSubservices() {
  console.log('🔧 AGREGANDO ENSAYO CONCRETO (29 subservicios)\n');
  
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

    // 3. Agregar los 29 ENSAYO CONCRETO
    console.log('\n2️⃣ Agregando ENSAYO CONCRETO...');
    
    // Primera imagen - ENSAYO CONCRETO
    await addSubservice('CO01', 'Resistencia a la compresión de probetas cilíndricas de concreto (Incluye Curado)(*).', 'ASTM C39/C39M-24', 15);
    await addSubservice('CO01.01', 'Resistencia a la compresión de probetas cilíndricas de concreto, se ensayaran 3 probetas a 7 días y 3 probetas a 28 días, suministro equipo, curado y recojo. (*)', 'ASTM C39/C39M-24', 90);
    await addSubservice('CO03A', 'Extracción, tallado, refrentado y ensayo de compresión de testigos diamantino de concreto con BROCA de 2" o 3" o 4".', 'NTP 339.059', 250);
    await addSubservice('CO03B', 'Resane de estructura a causa de la extracción de diamantino.', '-', 300);
    await addSubservice('CO03C', 'Extracción de testigos diamantino de concreto con BROCA de 2" o 3" o 4".', 'NTP 339.059', 200);
    await addSubservice('CO03D', 'Tallado, refrentado y ensayo de compresión de testigos diamantino de concreto con BROCA de 2" o 3" o 4".', 'NTP 339.059 / ASTM C39/C39M-24', 100);
    await addSubservice('CO03G', 'Extracción de diamantina de concreto asfáltico y su evaluación.', 'NTP 339.059', 140);
    await addSubservice('CO04', 'Esclerometría.', 'NTP 339.181', 80);
    await addSubservice('CO05', 'Muestreo del concreto fresco.', 'NTP 339.036', 250);
    await addSubservice('CO06', 'Procedimiento para la medición asentamiento.', 'NTP 339-035', 0); // Sujeto a evaluación
    await addSubservice('CO07', 'Resistencia a la Flexión del concreto.', 'NTP 339.078/079', 100);
    await addSubservice('CO08', 'Resistencia a la compresión de mortero con espécimen cúbicos de 50 mm.', 'NTP 334.051', 20);
    await addSubservice('CO09', 'Procedimiento para la medición asentamiento.', 'ASTM C143', 0); // Sujeto a evaluación
    await addSubservice('CO10', 'Determinación PH concreto endurecido / Carbonatación.', 'ASTM D1293', 100);
    await addSubservice('CO11', 'Control de calidad del concreto fresco en obra: * Muestreo de concreto fresco cant. 6 probetas * Ensayo asentamiento del concreto (Slump) * Control de temperatura en el concreto * Resistencia a la compresión.', '-', 250);
    await addSubservice('CO12', 'Compresión de testigos cilíndricos de concreto (*).', 'ASTM C39/C39M-24', 15);
    await addSubservice('CO13', 'Ensayo Carbonatación.', 'ASTM D129', 50);
    await addSubservice('CO14', 'Resistencia tracción simple por compresión diametral.', 'NTP 339.084', 25);
    await addSubservice('CO15', 'Determinar el pH de las aguas usadas para elaborar morteros y concretos.', 'NTP 334.190:2016', 100);
    
    // Segunda imagen - ENSAYO CONCRETO (continuación)
    await addSubservice('CO16', 'Determinar el contenido de sulfatos en las aguas usadas en la elaboración de morteros y concretos de cemento Pórtland.', 'NTP 339.227:2016', 120);
    await addSubservice('CO17', 'Determinar el contenido del ion cloruro en las aguas usadas en la elaboración de concretos y morteros de cemento Pórtland.', 'NTP 339.076:2017', 120);
    await addSubservice('CO18', 'Corte y refrentado de Testigo de concreto.', '-', 20);
    await addSubservice('DIS01', 'Verificación diseño de mezcla.', '-', 250);
    await addSubservice('DIS02', 'Verificación diseño de mezcla con aditivo.', '-', 500);
    await addSubservice('DIS03', 'Verificación de diseño de concreto, elaboración de 3 probetas que se ensayaran a 7 días.', 'ACI 211', 200);
    await addSubservice('DIS04', 'Diseño de mezcla Teórico.', '-', 100);
    await addSubservice('CO19', 'Refrentado de probetas cilíndricas de concreto (por cara).', 'ASTM C617/C617M-23', 15);
    await addSubservice('COM01', 'Compresión / Unidades de adoquines de concreto.', 'NTP 339.604', 150);
    await addSubservice('ABS01', 'Absorción / Unidades de adoquines de concreto.', 'NTP 339.604', 150);

    console.log('\n✅ 29 subservicios de ENSAYO CONCRETO agregados');

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
      AND (s.codigo LIKE 'CO%' OR s.codigo LIKE 'DIS%' OR s.codigo LIKE 'COM%' OR s.codigo LIKE 'ABS%')
      ORDER BY s.codigo
      LIMIT 5
    `);
    
    examples.rows.forEach(row => {
      const precio = (row.precio && parseFloat(row.precio) > 0) ? `S/ ${parseFloat(row.precio).toFixed(2)}` : 'Sujeto a evaluación';
      console.log(`   ${row.codigo}: ${row.descripcion.substring(0, 40)}... - ${precio}`);
    });

    console.log('\n🎉 ENSAYO CONCRETO COMPLETADO');
    console.log('✅ 29 subservicios agregados correctamente');
    console.log('✅ Listo para la siguiente sección');
    
  } catch (error) {
    console.error('❌ Error agregando ENSAYO CONCRETO:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await addConcretoSubservices();
    console.log('\n✅ Proceso completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }
}

main();
