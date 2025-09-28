const pool = require('../config/db');

async function crearServiciosLaboratorio() {
  try {
    console.log('🔧 CREANDO SERVICIOS DE LABORATORIO...\n');
    
    // Servicios necesarios para los subservicios
    const servicios = [
      { name: 'ENSAYO ESTÁNDAR', area: 'laboratorio' },
      { name: 'ENSAYOS ESPECIALES', area: 'laboratorio' },
      { name: 'ENSAYO AGREGADO', area: 'laboratorio' },
      { name: 'ENSAYOS DE CAMPO', area: 'laboratorio' },
      { name: 'ENSAYO QUÍMICO SUELO', area: 'laboratorio' },
      { name: 'ENSAYO QUÍMICO AGREGADO', area: 'laboratorio' },
      { name: 'ENSAYO CONCRETO', area: 'laboratorio' },
      { name: 'ENSAYO ALBAÑILERÍA', area: 'laboratorio' },
      { name: 'ENSAYO ROCA', area: 'laboratorio' },
      { name: 'CEMENTO', area: 'laboratorio' },
      { name: 'ENSAYO PAVIMENTO', area: 'laboratorio' },
      { name: 'ENSAYO ASFALTO', area: 'laboratorio' },
      { name: 'ENSAYO MEZCLA ASFÁLTICO', area: 'laboratorio' },
      { name: 'EVALUACIONES ESTRUCTURALES', area: 'laboratorio' },
      { name: 'IMPLEMENTACIÓN LABORATORIO', area: 'laboratorio' },
      { name: 'OTROS SERVICIOS', area: 'laboratorio' }
    ];
    
    let creados = 0;
    let existentes = 0;
    
    for (const servicio of servicios) {
      try {
        // Verificar si ya existe
        const existing = await pool.query(
          'SELECT id FROM services WHERE name = $1 AND area = $2',
          [servicio.name, servicio.area]
        );
        
        if (existing.rows.length > 0) {
          console.log(`   ✅ ${servicio.name}: Ya existe (ID: ${existing.rows[0].id})`);
          existentes++;
        } else {
          // Crear el servicio
          const result = await pool.query(
            'INSERT INTO services (name, area) VALUES ($1, $2) RETURNING id',
            [servicio.name, servicio.area]
          );
          console.log(`   🆕 ${servicio.name}: Creado (ID: ${result.rows[0].id})`);
          creados++;
        }
      } catch (error) {
        console.log(`   ❌ Error con ${servicio.name}:`, error.message);
      }
    }
    
    console.log('\n📊 RESUMEN:');
    console.log(`✅ Servicios creados: ${creados}`);
    console.log(`⚠️  Servicios existentes: ${existentes}`);
    console.log(`📈 Total procesados: ${servicios.length}`);
    
    // Verificar servicios finales
    console.log('\n🔍 VERIFICANDO SERVICIOS FINALES...');
    const finalResult = await pool.query(
      "SELECT id, name, area FROM services WHERE area = 'laboratorio' ORDER BY name"
    );
    
    console.log('\n📋 SERVICIOS DE LABORATORIO DISPONIBLES:');
    finalResult.rows.forEach(servicio => {
      console.log(`   ${servicio.id}. ${servicio.name} (${servicio.area})`);
    });
    
    console.log('\n🎉 ¡SERVICIOS DE LABORATORIO CREADOS EXITOSAMENTE!');
    console.log('🚀 Ahora puedes ejecutar los scripts de subservicios.');
    
  } catch (error) {
    console.error('💥 Error crítico:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  crearServiciosLaboratorio().catch(error => {
    console.error('💥 Error en el script:', error);
    process.exit(1);
  });
}

module.exports = { crearServiciosLaboratorio };
