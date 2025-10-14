const pool = require('../config/db');

async function updateClientStatus() {
  try {
    console.log('🔄 Actualizando estado de clientes a "Contactado"...\n');
    
    // Buscar los 3 clientes específicos
    const searchTerms = [
      'MELLADO AMAUT GIANFRANCO',
      'HUAYANA ESPINOZA ALEXANDER JUNIOR', 
      'ANTONIO ASTO'
    ];
    
    console.log('🔍 Buscando clientes...');
    
    for (const term of searchTerms) {
      // Buscar por nombre de empresa o contacto
      const result = await pool.query(`
        SELECT id, name, contact_name, status 
        FROM companies 
        WHERE name ILIKE $1 OR contact_name ILIKE $1
        ORDER BY name
      `, [`%${term}%`]);
      
      if (result.rows.length > 0) {
        const client = result.rows[0];
        console.log(`📋 Cliente encontrado: ${client.name} (${client.contact_name}) - Estado actual: ${client.status}`);
        
        // Actualizar estado a "contactado"
        await pool.query(`
          UPDATE companies 
          SET status = 'contactado', updated_at = NOW()
          WHERE id = $1
        `, [client.id]);
        
        console.log(`✅ Estado actualizado a "contactado" para ID: ${client.id}\n`);
      } else {
        console.log(`⚠️ Cliente no encontrado: ${term}\n`);
      }
    }
    
    // Verificar que el estado "contactado" esté disponible
    console.log('🔍 Verificando estados disponibles...');
    const statusResult = await pool.query(`
      SELECT DISTINCT status 
      FROM companies 
      ORDER BY status
    `);
    
    console.log('📊 Estados disponibles en el sistema:');
    statusResult.rows.forEach(row => {
      console.log(`   - ${row.status}`);
    });
    
    console.log('\n✅ Actualización completada!');
    
  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  updateClientStatus().then(() => {
    console.log('\n🎉 Proceso completado');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { updateClientStatus };
