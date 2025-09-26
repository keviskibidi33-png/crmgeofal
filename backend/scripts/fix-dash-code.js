const pool = require('../config/db');

async function fixDashCode() {
  try {
    console.log('🔧 CORRIGIENDO CÓDIGO "-" A "TERM01"...\n');
    
    // Buscar el código "-"
    const dashCode = await pool.query(`
      SELECT id, codigo, descripcion 
      FROM subservices 
      WHERE codigo = '-' AND is_active = true
    `);
    
    if (dashCode.rows.length > 0) {
      console.log(`📋 Encontrado código "-": ${dashCode.rows[0].descripcion}`);
      
      // Actualizar a TERM01
      await pool.query(`
        UPDATE subservices 
        SET codigo = 'TERM01' 
        WHERE codigo = '-' AND is_active = true
      `);
      
      console.log('✅ Código "-" corregido a "TERM01"');
    } else {
      console.log('✅ No se encontró código "-"');
    }
    
    // Verificar el cambio
    const updated = await pool.query(`
      SELECT codigo, descripcion 
      FROM subservices 
      WHERE codigo = 'TERM01' AND is_active = true
    `);
    
    if (updated.rows.length > 0) {
      console.log(`✅ Verificado: ${updated.rows[0].codigo} - ${updated.rows[0].descripcion}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixDashCode();
