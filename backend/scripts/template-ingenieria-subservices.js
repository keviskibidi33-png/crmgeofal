const pool = require('../config/db');

async function addIngenieriaSubservices() {
  console.log('🔧 AGREGANDO SUBSERVICIOS DE INGENIERÍA\n');
  
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

    // 3. Agregar subservicios de Ingeniería
    console.log('\n2️⃣ Agregando subservicios de Ingeniería...');
    let addedCount = 0;

    // TODO: Reemplazar con los datos reales cuando estén disponibles
    // Ejemplo de estructura:
    // if (await addSubservice('ING01', 'Descripción del subservicio', 'Norma aplicable', 0)) addedCount++;
    // if (await addSubservice('ING02', 'Otro subservicio', 'Otra norma', 150)) addedCount++;
    
    console.log('⚠️  Este es un template. Reemplazar con datos reales de Ingeniería.');
    console.log('📝 Estructura esperada:');
    console.log('   - Código: ING01, ING02, etc.');
    console.log('   - Descripción: Descripción detallada del servicio');
    console.log('   - Norma: Norma técnica aplicable o "-" si no aplica');
    console.log('   - Precio: Valor numérico o 0 para "Sujeto a evaluación"');

    console.log(`\n✅ ${addedCount} subservicios de Ingeniería agregados`);

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
      LIMIT 5
    `);
    
    examples.rows.forEach(row => {
      const precio = (row.precio && parseFloat(row.precio) > 0) ? `S/ ${parseFloat(row.precio).toFixed(2)}` : 'Sujeto a evaluación';
      console.log(`   ${row.codigo}: ${row.descripcion.substring(0, 40)}... - ${precio}`);
    });

    console.log('\n🎉 SUBSERVICIOS DE INGENIERÍA COMPLETADOS');
    console.log('✅ Subservicios agregados correctamente');
    console.log('✅ Listo para la siguiente sección');
    
  } catch (error) {
    console.error('❌ Error agregando subservicios de Ingeniería:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await addIngenieriaSubservices();
    console.log('\n✅ Proceso completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }
}

main();
