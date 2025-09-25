const pool = require('../config/db');

async function addMissingSubservices() {
  console.log('🔧 AGREGANDO SUBSERVICIOS FALTANTES\n');
  
  try {
    // 1. Obtener el ID del servicio Laboratorio
    console.log('1️⃣ Obteniendo ID del servicio Laboratorio...');
    const serviceResult = await pool.query("SELECT id FROM services WHERE area = 'laboratorio'");
    const serviceId = serviceResult.rows[0].id;
    console.log(`✅ ID del servicio Laboratorio: ${serviceId}`);

    // 2. Subservicios de ENSAYO ROCA
    console.log('\n2️⃣ Agregando subservicios de ENSAYO ROCA...');
    const rocaSubservices = [
      {
        codigo: 'RO01',
        descripcion: 'Carga Puntual (incluye tallado y ensayo 10 especimenes)',
        norma: 'ASTM D 5731',
        precio: 0 // Sujeto a evaluación
      },
      {
        codigo: 'RO02',
        descripcion: 'Gravedad especifica y absorción de roca',
        norma: 'ASTM D 6473',
        precio: 0 // Sujeto a evaluación
      },
      {
        codigo: 'RO03',
        descripcion: 'Densidad y peso unitario de muestra roca',
        norma: 'ASTM D 7263',
        precio: 0 // Sujeto a evaluación
      },
      {
        codigo: 'RO04',
        descripcion: 'Método de prueba para la resistencia a la compresión (uniaxial) - Método C',
        norma: 'ASTM D 7012-14e1',
        precio: 0 // Sujeto a evaluación
      }
    ];

    for (const sub of rocaSubservices) {
      try {
        await pool.query(`
          INSERT INTO subservices (codigo, descripcion, norma, precio, service_id, name, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, true)
        `, [sub.codigo, sub.descripcion, sub.norma, sub.precio, serviceId, sub.descripcion]);
        console.log(`   ✅ ${sub.codigo}: ${sub.descripcion.substring(0, 40)}...`);
      } catch (error) {
        if (error.code === '23505') { // Código duplicado
          console.log(`   ⚠️  ${sub.codigo}: Ya existe`);
        } else {
          console.log(`   ❌ ${sub.codigo}: Error - ${error.message}`);
        }
      }
    }

    // 3. Subservicios adicionales de ENSAYO CONCRETO
    console.log('\n3️⃣ Agregando subservicios adicionales de ENSAYO CONCRETO...');
    const concretoSubservices = [
      {
        codigo: 'CO19',
        descripcion: 'Refrentado de probetas cilíndricas de concreto (por cara)',
        norma: 'ASTM C617/C617M-23',
        precio: 0
      },
      {
        codigo: 'COM01',
        descripcion: 'Compresión / Unidades de adoquines de concreto',
        norma: 'NTP 339.604',
        precio: 0
      },
      {
        codigo: 'ABS01',
        descripcion: 'Absorción / Unidades de adoquines de concreto',
        norma: 'NTP 339.604',
        precio: 150.00
      }
    ];

    for (const sub of concretoSubservices) {
      try {
        await pool.query(`
          INSERT INTO subservices (codigo, descripcion, norma, precio, service_id, name, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, true)
        `, [sub.codigo, sub.descripcion, sub.norma, sub.precio, serviceId, sub.descripcion]);
        console.log(`   ✅ ${sub.codigo}: ${sub.descripcion.substring(0, 40)}...`);
      } catch (error) {
        if (error.code === '23505') { // Código duplicado
          console.log(`   ⚠️  ${sub.codigo}: Ya existe`);
        } else {
          console.log(`   ❌ ${sub.codigo}: Error - ${error.message}`);
        }
      }
    }

    // 4. Subservicios de IMPLEMENTACIÓN LABORATORIO EN OBRA
    console.log('\n4️⃣ Agregando subservicios de IMPLEMENTACIÓN LABORATORIO EN OBRA...');
    const implementacionSubservices = [
      {
        codigo: 'IMP01',
        descripcion: 'Implemetación de personal técnico y equipo de laboratorio en obra en la especialidad SUELO, AGREGADO, CONCRETO, PAVIMENTO',
        norma: '-',
        precio: 0
      },
      {
        codigo: 'IMP02',
        descripcion: 'Estudio de suelos con fines de cimentación superficial y profunda, edificaciones, puentes, plantas industriales',
        norma: '-',
        precio: 0
      },
      {
        codigo: 'IMP03',
        descripcion: 'Estudio de suelos y diseño de pavimentación',
        norma: '-',
        precio: 0
      },
      {
        codigo: 'IMP04',
        descripcion: 'Estudio de suelos con fines de estabilidad de taludes',
        norma: '-',
        precio: 0
      },
      {
        codigo: 'IMP05',
        descripcion: 'Estudio de suelos confines de diseño de instalaciones sanitarias de agua y alcantarillado',
        norma: '-',
        precio: 0
      },
      {
        codigo: 'IMP06',
        descripcion: 'Estudio de Potencial de licuación de suelos',
        norma: '-',
        precio: 0
      },
      {
        codigo: 'IMP07',
        descripcion: 'Evaluación y caracterización del maciso rocoso',
        norma: '-',
        precio: 0
      },
      {
        codigo: 'IMP08',
        descripcion: 'Evaluación de canteras',
        norma: '-',
        precio: 0
      }
    ];

    for (const sub of implementacionSubservices) {
      try {
        await pool.query(`
          INSERT INTO subservices (codigo, descripcion, norma, precio, service_id, name, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, true)
        `, [sub.codigo, sub.descripcion, sub.norma, sub.precio, serviceId, sub.descripcion]);
        console.log(`   ✅ ${sub.codigo}: ${sub.descripcion.substring(0, 40)}...`);
      } catch (error) {
        if (error.code === '23505') { // Código duplicado
          console.log(`   ⚠️  ${sub.codigo}: Ya existe`);
        } else {
          console.log(`   ❌ ${sub.codigo}: Error - ${error.message}`);
        }
      }
    }

    // 5. Verificar total final
    console.log('\n5️⃣ Verificando total final...');
    const totalResult = await pool.query(`
      SELECT COUNT(*) as total
      FROM subservices s 
      JOIN services sv ON s.service_id = sv.id 
      WHERE s.is_active = true 
      AND sv.area = 'laboratorio'
    `);
    
    const total = parseInt(totalResult.rows[0].total);
    console.log(`✅ Total de subservicios: ${total}`);

    // 6. Verificar categorización
    console.log('\n6️⃣ Verificando categorización...');
    const categoriesResult = await pool.query(`
      SELECT 
        CASE 
          WHEN s.codigo LIKE 'SU%' THEN 'ENSAYO ESTÁNDAR'
          WHEN s.codigo LIKE 'AG%' THEN 'ENSAYO AGREGADO'
          WHEN s.codigo LIKE 'C%' OR s.codigo LIKE 'CO%' OR s.codigo LIKE 'COM%' OR s.codigo LIKE 'ABS%' THEN 'ENSAYO CONCRETO'
          WHEN s.codigo LIKE 'ALB%' THEN 'ENSAYO ALBAÑILERÍA'
          WHEN s.codigo LIKE 'R%' THEN 'ENSAYO ROCA'
          WHEN s.codigo LIKE 'CEM%' THEN 'CEMENTO'
          WHEN s.codigo LIKE 'PAV%' THEN 'ENSAYO PAVIMENTO'
          WHEN s.codigo LIKE 'AS%' THEN 'ENSAYO ASFALTO'
          WHEN s.codigo LIKE 'MA%' THEN 'ENSAYO MEZCLA ASFÁLTICO'
          WHEN s.codigo LIKE 'E%' THEN 'EVALUACIONES ESTRUCTURALES'
          WHEN s.codigo LIKE 'IMP%' THEN 'IMPLEMENTACIÓN LABORATORIO'
          WHEN s.codigo LIKE 'SER%' THEN 'OTROS SERVICIOS'
          ELSE 'OTROS'
        END as categoria,
        COUNT(*) as cantidad
      FROM subservices s 
      JOIN services sv ON s.service_id = sv.id
      WHERE s.is_active = true 
      AND sv.area = 'laboratorio'
      GROUP BY categoria 
      ORDER BY cantidad DESC
    `);
    
    console.log(`✅ Categorías disponibles: ${categoriesResult.rows.length}`);
    categoriesResult.rows.forEach(row => {
      console.log(`   - ${row.categoria}: ${row.cantidad} subservicios`);
    });

    console.log('\n🎉 SUBSERVICIOS FALTANTES AGREGADOS');
    console.log('✅ ENSAYO ROCA: 4 subservicios');
    console.log('✅ ENSAYO CONCRETO: 3 subservicios adicionales');
    console.log('✅ IMPLEMENTACIÓN LABORATORIO: 8 subservicios');
    console.log(`✅ Total actualizado: ${total} subservicios`);
    console.log('✅ Sistema completo y actualizado');
    
  } catch (error) {
    console.error('❌ Error agregando subservicios:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await addMissingSubservices();
    console.log('\n✅ Proceso completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }
}

main();
