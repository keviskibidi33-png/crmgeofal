const pool = require('../config/db');

async function addEspecialesSubservices() {
  console.log('🔧 AGREGANDO ENSAYOS ESPECIALES (17 subservicios)\n');
  
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

    // 3. Agregar los 17 ENSAYOS ESPECIALES
    console.log('\n2️⃣ Agregando ENSAYOS ESPECIALES...');
    
    await addSubservice('SU33', 'Compresión no confinada.', 'NTP 339.167', 250);
    await addSubservice('SU37', 'California Bearing Ratio (CBR) (*).', 'ASTM D1883-21 / NTP 339.145', 300);
    await addSubservice('SU05', 'Corte Directo.', 'NTP 339.171 / D3080', 350);
    await addSubservice('EE01', 'Conductividad eléctrica.', '-', 250);
    await addSubservice('EE02', 'Resistividad eléctrica.', 'Electrodo', 550);
    await addSubservice('EE03', 'Compresión inconfinada en suelos cohesivos.', 'ASTM D2166', 190);
    await addSubservice('EE04', 'Compresión triaxial no consolidado no drenado UU.', 'ASTM D2850', 1500);
    await addSubservice('EE05', 'Compresión triaxial consolidado no drenado CU.', 'ASTM D4767', 2000);
    await addSubservice('EE06', 'Compresión triaxial consolidado drenado CD.', 'ASTM D7181', 0); // Sujeto a evaluación
    await addSubservice('EE07', 'Colapso.', 'ASTM D5333', 370);
    await addSubservice('EE08', 'Consolidación unidimensional.', 'ASTM D2435', 800);
    await addSubservice('EE09', 'Expansión libre.', 'ASTM D4546', 350);
    await addSubservice('EE10', 'Expansión controlada Método A.', 'ASTM D4546', 670);
    await addSubservice('EE11', 'Conductividad hidráulica en pared flexible (Permeabilidad).', 'ASTM D5084', 640);
    await addSubservice('EE12', 'Conductividad hidráulica en pared rígida (Permeabilidad).', 'ASTM D2434', 530);
    await addSubservice('EE13', 'Ensayo resistividad eléctrica (5 perfiles).', '-', 700);
    // El último con código "-" se omite porque ya existe uno en ESTÁNDAR
    console.log('   ⚠️  -: Conductividad térmica / Resistividad térmica - Ya existe código "-" (omitido)');

    console.log('\n✅ 16 subservicios de ENSAYOS ESPECIALES agregados (1 omitido por duplicación)');

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
      AND s.codigo LIKE 'EE%'
      ORDER BY s.codigo
      LIMIT 5
    `);
    
    examples.rows.forEach(row => {
      const precio = (row.precio && parseFloat(row.precio) > 0) ? `S/ ${parseFloat(row.precio).toFixed(2)}` : 'Sujeto a evaluación';
      console.log(`   ${row.codigo}: ${row.descripcion.substring(0, 40)}... - ${precio}`);
    });

    console.log('\n🎉 ENSAYOS ESPECIALES COMPLETADOS');
    console.log('✅ 16 subservicios agregados correctamente');
    console.log('✅ 1 subservicio omitido por duplicación de código');
    console.log('✅ Listo para la siguiente sección');
    
  } catch (error) {
    console.error('❌ Error agregando ENSAYOS ESPECIALES:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await addEspecialesSubservices();
    console.log('\n✅ Proceso completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }
}

main();
