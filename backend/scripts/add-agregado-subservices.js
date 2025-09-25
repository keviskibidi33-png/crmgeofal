const pool = require('../config/db');

async function addAgregadoSubservices() {
  console.log('🔧 AGREGANDO ENSAYO AGREGADO (16 subservicios)\n');
  
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

    // 3. Agregar los 16 ENSAYO AGREGADO
    console.log('\n2️⃣ Agregando ENSAYO AGREGADO...');
    
    await addSubservice('AG08A', 'Inalterabilidad Agregado Grueso con Sulfato de Magnesio.', 'NTP 400.016 / ASTM C88', 350);
    await addSubservice('AG08B', 'Inalterabilidad Agregado Fino con Sulfato de Magnesio.', 'NTP 400.016 / ASTM C88', 350);
    await addSubservice('AG09', 'Índice de Durabilidad Agregado.', 'MTC E-214', 350);
    await addSubservice('AG18', 'Gravedad específica y absorción del agregado fino (*).', 'ASTM C128-22', 150);
    await addSubservice('AG19', 'Análisis granulométrico por tamizado en agregado (*).', 'ASTM C136/C136M-19', 100);
    await addSubservice('AG20', 'Contenido de humedad en agregado (*).', 'ASTM C566-19', 30);
    await addSubservice('AG22', 'Peso Unitario y Vacío de agregados (*).', 'ASTM C29/C29M-23', 120);
    await addSubservice('AG23', 'Pasante de la malla No.200 (*).', 'ASTM C117-23', 120);
    await addSubservice('AG26', 'Abrasión los Ángeles de agregado grueso de gran tamaño (*).', 'ASTM C535-16 (Reapproved 2024)', 350);
    await addSubservice('AG28', 'Gravedad especifica y absorción de agregado grueso (*).', 'ASTM C127-24', 120);
    await addSubservice('AG31', 'Índice de espesor del agregado grueso.', 'NTP 400.041', 90);
    await addSubservice('AG32', 'Carbón y Lignito en agregado fino (OBSOLETO)', 'MTC E215', 120);
    await addSubservice('AG33', 'Angularidad del agregado fino.', 'MTC E222', 120);
    await addSubservice('AG34', 'Partículas planas y alargadas en agregado grueso (*).', 'ASTM D4791-19 (Reapproved)', 120);
    await addSubservice('AG35', 'Porcentaje de Caras fracturadas en agregado grueso (*).', 'ASTM D5821-13 (Reapproved 2017)', 120);
    await addSubservice('AG36', 'Abrasión los Ángeles de agregado grueso de tamaño pequeño (*).', 'ASTM C131/C131M-20', 250);

    console.log('\n✅ 16 subservicios de ENSAYO AGREGADO agregados');

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
      AND s.codigo LIKE 'AG%'
      ORDER BY s.codigo
      LIMIT 5
    `);
    
    examples.rows.forEach(row => {
      const precio = (row.precio && parseFloat(row.precio) > 0) ? `S/ ${parseFloat(row.precio).toFixed(2)}` : 'Sujeto a evaluación';
      console.log(`   ${row.codigo}: ${row.descripcion.substring(0, 40)}... - ${precio}`);
    });

    console.log('\n🎉 ENSAYO AGREGADO COMPLETADO');
    console.log('✅ 16 subservicios agregados correctamente');
    console.log('✅ Listo para la siguiente sección');
    
  } catch (error) {
    console.error('❌ Error agregando ENSAYO AGREGADO:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await addAgregadoSubservices();
    console.log('\n✅ Proceso completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }
}

main();
