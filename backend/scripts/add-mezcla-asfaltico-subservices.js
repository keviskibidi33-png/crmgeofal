    const pool = require('../config/db');

async function addMezclaAsfalticoSubservices() {
  console.log('🔧 AGREGANDO ENSAYO MEZCLA ASFÁLTICO (16 subservicios)\n');
  
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

    // 3. Agregar los 16 ENSAYOS MEZCLA ASFÁLTICO
    console.log('\n2️⃣ Agregando ENSAYOS MEZCLA ASFÁLTICO...');
    let addedCount = 0;

    if (await addSubservice('MA01', 'Extracción cuantitativa de asfalto en mezclas para pavimentos (Lavado asfaltico), incl. Granulometría.', 'ASTM D 2172/MTC502', 450)) addedCount++;
    if (await addSubservice('MA01A', 'Lavado asfáltico (incluye tricloroetileno)', 'ASTM D 2172/MTC502', 250)) addedCount++;
    if (await addSubservice('MA02', 'Determinación de la resistencia de mezclas bituminosas empleando el aparato Marshall, incluye ensayo Rice y peso específico.', 'ASTM D1559/MTC E504/MTC E 514/ASTM D2041', 790)) addedCount++;
    if (await addSubservice('MA02A', 'Determinación de la resistencia de mezclas bituminosas empleando el aparato Marshall, e incluye peso específico, el cliente proporcionara el ensayo Rice.', 'ASTM D1559/MTC E504/MTC E 514', 540)) addedCount++;
    if (await addSubservice('MA03', 'Estabilidad Marshall (Incluye: elaboración de briqueta 3und, estabilidad y flujo)', 'ASTM D1559', 350)) addedCount++;
    if (await addSubservice('MA04', 'Densidad máxima teórica (Rice).', 'ASTM D2041', 250)) addedCount++;
    if (await addSubservice('MA04A', 'Porcentaje de vacíos (incluye: densidad de espécimen y densidad máxima teórica (Rice)) (costo por briqueta).', '-', 100)) addedCount++;
    if (await addSubservice('MA05', 'Diseño de mezcla asfáltica en caliente (Diseño Marshall).', 'D1559', 5000)) addedCount++;
    if (await addSubservice('MA06', 'Elaboración de briquetas (juego de 3).', 'MTC E 504/D1559', 0)) addedCount++; // Sujeto a evaluación
    if (await addSubservice('MA09', 'Diseño mezcla en frío (teórico, por áreas equivalentes).', '-', 0)) addedCount++; // Sujeto a evaluación
    if (await addSubservice('MA11', 'Adherencia en agregado grueso (Revestimiento y desprendimiento), incluye ensayo Peso específico.', 'MTC E517/D3625 (MTC E521)', 250)) addedCount++;
    if (await addSubservice('MA12', 'Espesor o altura de especimenes compactados de mezcla asfáltica.', 'MTC E 507', 150)) addedCount++;
    if (await addSubservice('MA13', 'determinacion del grado de compactacion de mezclas vituminosas.', '-', 0)) addedCount++; // Sujeto a evaluación
    if (await addSubservice('MA14', 'Grado estimado de cubrimiento de partículas en mezclas agregado - Bitumen.', 'MTC E 519', 150)) addedCount++;
    if (await addSubservice('MA15', 'Control de temperatura en mezcla asfáltica.', '-', 70)) addedCount++;
    if (await addSubservice('AS26', 'Recuperación de asfalto por el método de abson.', '-', 1200)) addedCount++;

    console.log(`\n✅ ${addedCount} subservicios de ENSAYO MEZCLA ASFÁLTICO agregados.`);

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
      AND s.codigo IN ('MA01', 'MA03', 'MA05', 'MA11', 'AS26')
      ORDER BY s.codigo
    `);
    
    examples.rows.forEach(row => {
      const precio = (row.precio && parseFloat(row.precio) > 0) ? `S/ ${parseFloat(row.precio).toFixed(2)}` : 'Sujeto a evaluación';
      console.log(`   ${row.codigo}: ${row.descripcion.substring(0, 40)}... - ${precio}`);
    });

    console.log('\n🎉 ENSAYO MEZCLA ASFÁLTICO COMPLETADO');
    console.log(`✅ ${addedCount} subservicios agregados correctamente`);
    console.log('✅ Listo para la siguiente sección');
    
  } catch (error) {
    console.error('❌ Error agregando ENSAYO MEZCLA ASFÁLTICO:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await addMezclaAsfalticoSubservices();
    console.log('\n✅ Proceso completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }
}

main();
