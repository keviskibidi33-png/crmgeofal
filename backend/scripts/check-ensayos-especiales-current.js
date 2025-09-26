const pool = require('../config/db');

async function checkEnsayosEspecialesCurrent() {
  try {
    console.log('🔍 VERIFICANDO ENSAYOS ESPECIALES ACTUALES...\n');
    
    // 1. Verificar el estado actual de ENSAYOS ESPECIALES
    console.log('📊 ESTADO ACTUAL DE ENSAYOS ESPECIALES:');
    const ensayosEspeciales = await pool.query(`
      SELECT 
        s.id,
        s.name,
        COUNT(sub.id) as subservices_count
      FROM services s 
      LEFT JOIN subservices sub ON s.id = sub.service_id AND sub.is_active = true
      WHERE s.name = 'ENSAYOS ESPECIALES'
      GROUP BY s.id, s.name
    `);
    
    if (ensayosEspeciales.rows.length > 0) {
      const row = ensayosEspeciales.rows[0];
      console.log(`   ID: ${row.id}`);
      console.log(`   Nombre: ${row.name}`);
      console.log(`   Subservicios: ${row.subservices_count}`);
    } else {
      console.log('   ❌ ENSAYOS ESPECIALES no encontrado');
    }
    
    // 2. Mostrar todos los subservicios actuales
    console.log('\n📋 SUBSERVICIOS ACTUALES EN ENSAYOS ESPECIALES:');
    const currentSubservices = await pool.query(`
      SELECT sub.codigo, sub.descripcion, sub.norma, sub.precio
      FROM subservices sub
      JOIN services s ON sub.service_id = s.id
      WHERE s.name = 'ENSAYOS ESPECIALES' 
      AND sub.is_active = true
      ORDER BY sub.codigo
    `);
    
    if (currentSubservices.rows.length > 0) {
      currentSubservices.rows.forEach(row => {
        const precio = row.precio === 0 ? 'Sujeto a evaluación' : `S/ ${row.precio}`;
        console.log(`   - ${row.codigo}: ${row.descripcion} (${row.norma}) - ${precio}`);
      });
    } else {
      console.log('   ❌ No hay subservicios en ENSAYOS ESPECIALES');
    }
    
    // 3. Verificar si hay subservicios con códigos EE* en otros servicios
    console.log('\n🔍 SUBSERVICIOS CON CÓDIGOS EE* EN OTROS SERVICIOS:');
    const eeInOtherServices = await pool.query(`
      SELECT 
        s.name as service_name,
        sub.codigo,
        sub.descripcion
      FROM subservices sub
      JOIN services s ON sub.service_id = s.id
      WHERE s.name != 'ENSAYOS ESPECIALES'
      AND sub.codigo LIKE 'EE%'
      AND sub.is_active = true
      ORDER BY sub.codigo
    `);
    
    if (eeInOtherServices.rows.length > 0) {
      console.log('   ⚠️  SUBSERVICIOS EE* EN SERVICIOS INCORRECTOS:');
      eeInOtherServices.rows.forEach(row => {
        console.log(`      - ${row.codigo} en ${row.service_name}: ${row.descripcion}`);
      });
    } else {
      console.log('   ✅ No hay subservicios EE* en servicios incorrectos');
    }
    
    // 4. Verificar si hay subservicios con códigos SU* que deberían estar en ENSAYOS ESPECIALES
    console.log('\n🔍 SUBSERVICIOS SU* QUE PODRÍAN SER ESPECIALES:');
    const suInOtherServices = await pool.query(`
      SELECT 
        s.name as service_name,
        sub.codigo,
        sub.descripcion
      FROM subservices sub
      JOIN services s ON sub.service_id = s.id
      WHERE s.name != 'ENSAYOS ESPECIALES'
      AND sub.codigo IN ('SU33', 'SU37', 'SU05')
      AND sub.is_active = true
      ORDER BY sub.codigo
    `);
    
    if (suInOtherServices.rows.length > 0) {
      console.log('   ⚠️  SUBSERVICIOS SU* EN SERVICIOS INCORRECTOS:');
      suInOtherServices.rows.forEach(row => {
        console.log(`      - ${row.codigo} en ${row.service_name}: ${row.descripcion}`);
      });
    } else {
      console.log('   ✅ No hay subservicios SU* problemáticos');
    }
    
    // 5. Verificar distribución general
    console.log('\n📊 DISTRIBUCIÓN GENERAL:');
    const generalDistribution = await pool.query(`
      SELECT 
        s.name,
        COUNT(sub.id) as subservices_count
      FROM services s 
      LEFT JOIN subservices sub ON s.id = sub.service_id AND sub.is_active = true
      GROUP BY s.id, s.name 
      ORDER BY COUNT(sub.id) DESC
    `);
    
    generalDistribution.rows.forEach(row => {
      console.log(`   - ${row.name}: ${row.subservices_count} subservicios`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkEnsayosEspecialesCurrent();
