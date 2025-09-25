const pool = require('../config/db');

async function addAsfaltoSubservices() {
  console.log('🔧 AGREGANDO ENSAYO ASFALTO (24 subservicios)\n');
  
  try {
    // 1. Obtener el ID del servicio Laboratorio
    console.log('1️⃣ Obteniendo ID del servicio Laboratorio...');
    const serviceResult = await pool.query("SELECT id FROM services WHERE area = 'laboratorio'");
    const serviceId = serviceResult.rows[0].id;
    console.log(`✅ ID del servicio Laboratorio: ${serviceId}`);

    // 2. Función para agregar un subservicio
    async function addSubservice(codigo, descripcion, norma, precio) {
      try {
        // Verificar si el código ya existe
        const existingSubservice = await pool.query('SELECT id FROM subservices WHERE codigo = $1 AND service_id = $2', [codigo, serviceId]);
        if (existingSubservice.rows.length > 0) {
          console.warn(`   ⚠️  ${codigo}: Ya existe (omitido)`);
          return false; // Indica que no se agregó
        }

        await pool.query(`
          INSERT INTO subservices (codigo, descripcion, norma, precio, service_id, name, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, true)
        `, [codigo, descripcion, norma, precio, serviceId, descripcion]);
        console.log(`   ✅ ${codigo}: ${descripcion.substring(0, 50)}...`);
        return true; // Indica que se agregó
      } catch (error) {
        console.error(`   ❌ Error agregando ${codigo}:`, error.message);
        return false; // Indica que hubo un error
      }
    }

    // 3. Agregar los 24 ENSAYOS ASFALTO
    console.log('\n2️⃣ Agregando ENSAYOS ASFALTO...');
    let addedCount = 0;

    // Primera parte (AS01-AS13)
    if (await addSubservice('AS01', 'Penetración', 'D5', 0)) addedCount++;
    if (await addSubservice('AS02', 'Punto de inflamación', 'D92', 0)) addedCount++;
    if (await addSubservice('AS03', 'Solubilidad en tricloroetileno', 'D2042', 0)) addedCount++;
    if (await addSubservice('AS04', 'Ensayo de la mancha (Oliensis)', 'AASHTO T102', 0)) addedCount++;
    if (await addSubservice('AS05', 'Ductilidad', 'D113', 0)) addedCount++;
    if (await addSubservice('AS06', 'Película delgada (Incluye: pérdida por calentamiento, penetración del residuo, ductilidad del residuo)', 'D1754', 0)) addedCount++;
    if (await addSubservice('AS07', 'Punto de ablandamiento', 'D36', 0)) addedCount++;
    if (await addSubservice('AS08', 'Viscosidad Saybolt Furol', 'D244/D88', 0)) addedCount++;
    if (await addSubservice('AS09', 'Índice de penetración (incluye 3 ensayos de penetración)', 'D5', 0)) addedCount++;
    if (await addSubservice('AS10', 'Control de calidad de asfalto emulsificado (Incluye: Viscosidad SF, estabilidad al almacenamiento, carga de partícula, tamizado, destilación, ensayos en residuo: penetración, ductilidad y solubilidad)', 'D2397/D977', 0)) addedCount++;
    if (await addSubservice('AS11', 'Peso específico', 'D70', 0)) addedCount++;
    if (await addSubservice('AS12', 'Viscosidad cinemática', 'D2170', 0)) addedCount++;
    if (await addSubservice('AS13', 'Control de calidad de asfaltos líquidos (Incluye: viscosidad cinemática, punto de inflamación, destilación y determinación del residuo, ensayos en residuo: penetración, ductilidad y solubilidad; contenido de agua)', 'D2026 D2027 D2028', 0)) addedCount++;

    // Segunda parte (AS14-AS25)
    if (await addSubservice('AS14', 'Ensayos al residuo de destilación (Incluye: destilación, penetración, ductilidad y solubilidad)', '-', 0)) addedCount++;
    if (await addSubservice('AS15', 'Contenido de agua', 'D95', 0)) addedCount++;
    if (await addSubservice('AS16', 'Control de calidad de cementos asfálticos (Incluye: penetración, punto de inflamación, solubilidad, ductilidad, pérdida por calentamiento, penetración retenida y ductilidad del residuo)', 'D946', 0)) addedCount++;
    if (await addSubservice('AS17', 'Pérdida por calentamiento', 'D1754', 0)) addedCount++;
    if (await addSubservice('AS18', 'Estabilidad al almacenamiento', 'D244', 0)) addedCount++;
    if (await addSubservice('AS19', 'Carga de partícula', 'D244', 0)) addedCount++;
    if (await addSubservice('AS20', 'Tamizado malla N° 20', 'D244', 0)) addedCount++;
    if (await addSubservice('AS21', 'Destilación y determinación del residuo', 'D244', 0)) addedCount++;
    if (await addSubservice('AS22', 'Evaporación y determinación del residuo', 'D244', 0)) addedCount++;
    if (await addSubservice('AS23', 'Sedimentación a los 5 días', 'D244', 0)) addedCount++;
    if (await addSubservice('AS24', 'Ensayos al residuo de evaporación (Incluye: evaporación y determinación del residuo, penetración, solubilidad, punto de ablandamiento)', '-', 0)) addedCount++;
    if (await addSubservice('AS25', 'Control de calidad de emulsión catiónica modificada con polímeros (Incluye: Viscosidad SF, Estabilidad al almacenamiento, carga de partícula, tamizado, sedimentación, evaporación, ensayos en residuo: penetración, solubilidad y punto de ablandamiento)', 'D2397', 0)) addedCount++;

    console.log(`\n✅ ${addedCount} subservicios de ENSAYO ASFALTO agregados`);

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
      AND s.codigo LIKE 'AS%'
      ORDER BY s.codigo
      LIMIT 5
    `);
    
    examples.rows.forEach(row => {
      const precio = (row.precio && parseFloat(row.precio) > 0) ? `S/ ${parseFloat(row.precio).toFixed(2)}` : 'Sujeto a evaluación';
      console.log(`   ${row.codigo}: ${row.descripcion.substring(0, 40)}... - ${precio}`);
    });

    console.log('\n🎉 ENSAYO ASFALTO COMPLETADO');
    console.log('✅ 24 subservicios agregados correctamente');
    console.log('✅ Listo para la siguiente sección');
    
  } catch (error) {
    console.error('❌ Error agregando ENSAYO ASFALTO:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await addAsfaltoSubservices();
    console.log('\n✅ Proceso completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }
}

main();
