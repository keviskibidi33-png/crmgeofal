const pool = require('../config/db');

async function addPavimentoSubservices() {
  console.log('🔧 AGREGANDO ENSAYO PAVIMENTO (13 subservicios)\n');
  
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

    // 3. Agregar los 13 ENSAYOS PAVIMENTO
    console.log('\n2️⃣ Agregando ENSAYOS PAVIMENTO...');
    let addedCount = 0;

    if (await addSubservice('PAV01', 'Medida de la Irregularidad superficial de un pavimento con el Rugosímetro Merlín.', 'MTC E 1001', 2400)) addedCount++;
    if (await addSubservice('PAV02', 'Medida de la deflexión de un pavimento flexible (Viga Benkelman).', 'MTC E 1002', 3000)) addedCount++;
    if (await addSubservice('PAV02A', 'Medida de la deflexión de un pavimento flexible (Viga Benkelman) Inc. Camión.', 'MTC E 1002', 5000)) addedCount++;
    if (await addSubservice('PAV03', 'Determinacion del Coeficiente de Resistencia al Deslizamiento (Péndulo).', 'MTC E 1004', 150)) addedCount++;
    if (await addSubservice('PAV04', 'Determinación la Textura Superficial del Pavimento (Círculo de Arena).', 'MTC E 1005', 80)) addedCount++;
    if (await addSubservice('PAV05', 'Tasa de Imprimación y Riego de Liga.', '-', 100)) addedCount++;
    if (await addSubservice('PAV06', 'Espesor de especímenes de mezcla asfálticas compactado.', 'MTC E 507', 50)) addedCount++;
    if (await addSubservice('PAV07', 'Peso específico y peso unitario de mezcla asfálticas compactado en especímenes saturados con superficie seca.', 'MTC E 514', 90)) addedCount++;
    if (await addSubservice('PAV08', 'Determinación de la resistencia de mezclas bituminosas empleando el aparato Marshall, incluye peso específico (3 briquetas), cliente proporcionara ensayo Rice.', 'MTC E 504', 540)) addedCount++;
    if (await addSubservice('PAV09', 'Extracción cuantitativa de asfalto en mezclas para pavimentos (Lavado asfaltico), incl. Granulometría.', 'MTC E 502', 450)) addedCount++;
    if (await addSubservice('PAV10', 'Grado de compactación de una mezcla Bituminosa.', 'MTC E 509', 100)) addedCount++;
    if (await addSubservice('PAV11', 'Extracción de testigo diamantina con broca de 4" en pavimento flexible.', 'NTP 339.059', 140)) addedCount++;
    if (await addSubservice('PAV12', 'Resane en pavimento asfáltico', '-', 50)) addedCount++;

    console.log(`\n✅ ${addedCount} subservicios de ENSAYOS PAVIMENTO agregados.`);

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
      AND s.codigo IN ('PAV01', 'PAV02', 'PAV05', 'PAV12')
      ORDER BY s.codigo
    `);
    
    examples.rows.forEach(row => {
      const precio = (row.precio && parseFloat(row.precio) > 0) ? `S/ ${parseFloat(row.precio).toFixed(2)}` : 'Sujeto a evaluación';
      console.log(`   ${row.codigo}: ${row.descripcion.substring(0, 40)}... - ${precio}`);
    });

    console.log('\n🎉 ENSAYOS PAVIMENTO COMPLETADOS');
    console.log(`✅ ${addedCount} subservicios agregados correctamente`);
    console.log('✅ Listo para la siguiente sección');
    
  } catch (error) {
    console.error('❌ Error agregando ENSAYOS PAVIMENTO:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await addPavimentoSubservices();
    console.log('\n✅ Proceso completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }
}

main();
