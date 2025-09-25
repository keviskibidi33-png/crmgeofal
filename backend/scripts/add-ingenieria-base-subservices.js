const pool = require('../config/db');

async function addIngenieriaBaseSubservices() {
  console.log('🔧 PREPARANDO ESTRUCTURA BASE PARA INGENIERÍA\n');
  
  try {
    // 1. Obtener el ID del servicio Ingeniería
    console.log('1️⃣ Obteniendo ID del servicio Ingeniería...');
    const serviceResult = await pool.query("SELECT id FROM services WHERE area = 'ingenieria'");
    const serviceId = serviceResult.rows[0].id;
    console.log(`✅ ID del servicio Ingeniería: ${serviceId}`);

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

    // 3. Agregar algunos subservicios de ejemplo para Ingeniería
    console.log('\n2️⃣ Agregando subservicios base de Ingeniería...');
    let addedCount = 0;

    // Ejemplos de subservicios de Ingeniería
    if (await addSubservice('ING01', 'Diseño estructural de edificaciones.', 'NTE E.030', 0)) addedCount++;
    if (await addSubservice('ING02', 'Análisis de suelos para cimentación.', 'NTE E.050', 0)) addedCount++;
    if (await addSubservice('ING03', 'Diseño de sistemas de drenaje.', 'NTE E.060', 0)) addedCount++;
    if (await addSubservice('ING04', 'Evaluación de estructuras existentes.', 'NTE E.070', 0)) addedCount++;
    if (await addSubservice('ING05', 'Consultoría en proyectos de ingeniería.', '-', 0)) addedCount++;

    console.log(`\n✅ ${addedCount} subservicios base de Ingeniería agregados`);

    // 4. Verificar total
    console.log('\n3️⃣ Verificando total...');
    const totalResult = await pool.query(`
      SELECT COUNT(*) as total
      FROM subservices s 
      JOIN services sv ON s.service_id = sv.id 
      WHERE s.is_active = true 
      AND sv.area = 'ingenieria'
    `);
    
    const total = parseInt(totalResult.rows[0].total);
    console.log(`✅ Total de subservicios de Ingeniería: ${total}`);

    // 5. Mostrar ejemplos agregados
    console.log('\n4️⃣ Ejemplos agregados:');
    const examples = await pool.query(`
      SELECT codigo, descripcion, precio
      FROM subservices s 
      JOIN services sv ON s.service_id = sv.id 
      WHERE s.is_active = true 
      AND sv.area = 'ingenieria'
      ORDER BY s.codigo
    `);
    
    examples.rows.forEach(row => {
      const precio = (row.precio && parseFloat(row.precio) > 0) ? `S/ ${parseFloat(row.precio).toFixed(2)}` : 'Sujeto a evaluación';
      console.log(`   ${row.codigo}: ${row.descripcion.substring(0, 40)}... - ${precio}`);
    });

    console.log('\n🎉 ESTRUCTURA BASE DE INGENIERÍA COMPLETADA');
    console.log('✅ Scripts base preparados para recibir datos');
    console.log('✅ Frontend configurado para mostrar subservicios');
    console.log('✅ Listo para recibir datos específicos de Ingeniería');
    
  } catch (error) {
    console.error('❌ Error preparando estructura base de Ingeniería:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await addIngenieriaBaseSubservices();
    console.log('\n✅ Proceso completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }
}

main();
