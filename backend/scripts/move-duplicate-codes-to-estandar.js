const pool = require('../config/db');

async function moveDuplicateCodesToEstandar() {
  try {
    console.log('🔄 MOVIENDO CÓDIGOS DUPLICADOS A ENSAYO ESTÁNDAR...\n');
    
    // 1. Obtener ID de ENSAYO ESTÁNDAR
    const estandarResult = await pool.query("SELECT id FROM services WHERE name = 'ENSAYO ESTÁNDAR'");
    const estandarId = estandarResult.rows[0].id;
    console.log(`✅ ID de ENSAYO ESTÁNDAR: ${estandarId}`);
    
    // 2. Códigos que necesitamos mover a ENSAYO ESTÁNDAR
    const codesToMove = ['SU04', 'SU16', 'SU18', 'SU19', 'SU22', 'SU31', 'SU34', 'SU39', 'SU40'];
    
    console.log('\n2️⃣ Moviendo códigos duplicados...');
    
    for (const code of codesToMove) {
      try {
        // Buscar dónde está actualmente el código
        const currentLocation = await pool.query(`
          SELECT s.name as service_name, sub.id, sub.descripcion, sub.norma, sub.precio
          FROM subservices sub
          JOIN services s ON sub.service_id = s.id
          WHERE sub.codigo = $1 AND sub.is_active = true
        `, [code]);
        
        if (currentLocation.rows.length > 0) {
          const subservice = currentLocation.rows[0];
          console.log(`   🔄 ${code}: Moviendo desde "${subservice.service_name}" a "ENSAYO ESTÁNDAR"`);
          
          // Actualizar el service_id para moverlo a ENSAYO ESTÁNDAR
          await pool.query(
            'UPDATE subservices SET service_id = $1 WHERE codigo = $2',
            [estandarId, code]
          );
          
          console.log(`   ✅ ${code}: Movido exitosamente`);
        } else {
          console.log(`   ⚠️  ${code}: No encontrado en ningún servicio`);
        }
        
      } catch (error) {
        console.error(`   ❌ Error moviendo ${code}:`, error.message);
      }
    }
    
    // 3. Verificar estado final
    console.log('\n3️⃣ Verificando estado final...');
    const finalState = await pool.query(`
      SELECT 
        s.name,
        COUNT(sub.id) as subservices_count
      FROM services s 
      LEFT JOIN subservices sub ON s.id = sub.service_id AND sub.is_active = true
      WHERE s.name = 'ENSAYO ESTÁNDAR'
      GROUP BY s.id, s.name
    `);
    
    if (finalState.rows.length > 0) {
      console.log(`   📊 ENSAYO ESTÁNDAR: ${finalState.rows[0].subservices_count} subservicios`);
    }
    
    // 4. Mostrar todos los subservicios de ENSAYO ESTÁNDAR
    console.log('\n4️⃣ SUBSERVICIOS EN ENSAYO ESTÁNDAR:');
    const savedSubservices = await pool.query(`
      SELECT sub.codigo, sub.descripcion, sub.norma, sub.precio
      FROM subservices sub
      JOIN services s ON sub.service_id = s.id
      WHERE s.name = 'ENSAYO ESTÁNDAR' 
      AND sub.is_active = true
      ORDER BY sub.codigo
    `);
    
    savedSubservices.rows.forEach(row => {
      const precio = row.precio === 0 ? 'Sujeto a evaluación' : `S/ ${row.precio}`;
      console.log(`   - ${row.codigo}: ${row.descripcion} (${row.norma}) - ${precio}`);
    });
    
    console.log('\n🎉 CÓDIGOS DUPLICADOS MOVIDOS');
    console.log('✅ ENSAYO ESTÁNDAR ahora tiene los códigos SU* correctos');
    console.log('✅ Datos estructurados según la imagen');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

moveDuplicateCodesToEstandar();
