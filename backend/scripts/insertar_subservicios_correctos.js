const pool = require('../config/db');

async function insertarSubserviciosCorrectos() {
  try {
    console.log('🔧 INSERTANDO SUBSERVICIOS CON ESTRUCTURA CORRECTA...\n');
    
    // Obtener IDs de servicios
    const servicios = await pool.query("SELECT id, name FROM services WHERE area = 'laboratorio' ORDER BY name");
    console.log('📋 Servicios disponibles:');
    servicios.rows.forEach(servicio => {
      console.log(`   ${servicio.id}. ${servicio.name}`);
    });
    
    // Datos de subservicios de ENSAYO ESTÁNDAR
    const ensayoEstandar = [
      { codigo: 'SU04', descripcion: 'Contenido de humedad con Speedy.', norma: 'NTP 339.25', precio: 30 },
      { codigo: 'SU16', descripcion: 'Ensayo de Penetración Estándar (SPT).', norma: 'NTP 339.133', precio: 0 },
      { codigo: 'SU18', descripcion: 'Capacidad de carga del Suelo (Placa de Carga).', norma: 'ASTM D-1194', precio: 2000 },
      { codigo: 'SU19', descripcion: 'Próctor modificado (*).', norma: 'ASTM D1557-12 (Reapproved 2021)', precio: 150 },
      { codigo: 'SU20', descripcion: 'Contenido de humedad en suelos (*).', norma: 'ASTM D2216-19', precio: 30 },
      { codigo: 'SU20A', descripcion: 'Contenido de humedad en Roca.', norma: 'ASTM D2216-19', precio: 30 },
      { codigo: 'SU21', descripcion: 'Equivalente de arena (*).', norma: 'ASTM D2419-22', precio: 150 },
      { codigo: 'SU22', descripcion: 'Clasificación suelo SUCS - AASHTO (*).', norma: 'ASTM D2487-17 (Reapproved 2025) / ASTM D3282-24', precio: 20 },
      { codigo: 'SU23', descripcion: 'Límite líquido y Límite Plástico del Suelo (*).', norma: 'ASTM D4318-17*', precio: 90 },
      { codigo: 'SU24', descripcion: 'Análisis granulométrico por tamizado en Suelo (*).', norma: 'ASTM D6913/D6913M-17', precio: 100 },
      { codigo: 'SU27', descripcion: 'Método de prueba estándar para la medición de sólidos en agua.', norma: 'ASTM C1603', precio: 120 },
      { codigo: 'SU30', descripcion: 'Ensayo de Compactación Próctor Estándar.', norma: 'ASTM D698', precio: 150 },
      { codigo: 'SU31', descripcion: 'Corrección de Peso Unitario para Partícula de gran tamaño.', norma: 'ASTM D4718-87', precio: 20 },
      { codigo: 'SU32', descripcion: 'Gravedad específica de los sólidos del suelo.', norma: 'ASTM D854-14', precio: 120 },
      { codigo: 'SU34', descripcion: 'Densidad y peso unitario de muestra suelo.', norma: 'ASTM D 7263', precio: 70 },
      { codigo: 'SU35', descripcion: 'Densidad del peso unitario máximo del suelo.', norma: 'NTP 339.137', precio: 350 },
      { codigo: 'SU36', descripcion: 'Densidad del peso unitario mínimo del suelo.', norma: 'NTP 339.138', precio: 150 },
      { codigo: 'SU38', descripcion: 'Determinación de sólidos totales suspendidos.', norma: 'NTP 214.039', precio: 150 },
      { codigo: 'SU39', descripcion: 'Análisis granulométrico por hidrómetro (incl. Granulometría por tamizado).', norma: 'NTP 339.128 1999 (revisada el 2019)', precio: 350 },
      { codigo: 'SU40', descripcion: 'Conductividad térmica / Resistividad térmica.', norma: 'ASTM D5334-14', precio: 1500 }
    ];
    
    // Obtener ID de ENSAYO ESTÁNDAR
    const estandarResult = await pool.query("SELECT id FROM services WHERE name = 'ENSAYO ESTÁNDAR'");
    if (estandarResult.rows.length === 0) {
      throw new Error('Servicio ENSAYO ESTÁNDAR no encontrado');
    }
    const estandarId = estandarResult.rows[0].id;
    
    console.log(`\n📝 Insertando ${ensayoEstandar.length} subservicios de ENSAYO ESTÁNDAR...`);
    
    let insertados = 0;
    let omitidos = 0;
    
    for (const subservice of ensayoEstandar) {
      try {
        // Verificar si ya existe
        const existing = await pool.query(
          'SELECT id FROM subservices WHERE codigo = $1',
          [subservice.codigo]
        );
        
        if (existing.rows.length > 0) {
          console.log(`   ⚠️  ${subservice.codigo}: Ya existe (omitido)`);
          omitidos++;
        } else {
          // Insertar nuevo subservicio
          await pool.query(
            `INSERT INTO subservices (codigo, descripcion, norma, precio, service_id) 
             VALUES ($1, $2, $3, $4, $5)`,
            [subservice.codigo, subservice.descripcion, subservice.norma, subservice.precio, estandarId]
          );
          console.log(`   ✅ ${subservice.codigo}: ${subservice.descripcion.substring(0, 50)}...`);
          insertados++;
        }
      } catch (error) {
        console.log(`   ❌ Error con ${subservice.codigo}: ${error.message}`);
      }
    }
    
    console.log(`\n📊 RESUMEN ENSAYO ESTÁNDAR:`);
    console.log(`   ✅ Insertados: ${insertados}`);
    console.log(`   ⚠️  Omitidos: ${omitidos}`);
    console.log(`   📋 Total procesados: ${ensayoEstandar.length}`);
    
    // Verificar total final
    const totalResult = await pool.query('SELECT COUNT(*) FROM subservices');
    console.log(`\n🎯 TOTAL DE SUBSERVICIOS EN LA BASE DE DATOS: ${totalResult.rows[0].count}`);
    
    if (totalResult.rows[0].count > 0) {
      console.log('\n🎉 ¡SUBSERVICIOS INSERTADOS EXITOSAMENTE!');
      console.log('🚀 Ahora el autocompletado debería funcionar en el frontend.');
    } else {
      console.log('\n⚠️  No se insertaron subservicios. Revisar errores.');
    }
    
  } catch (error) {
    console.error('💥 Error crítico:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  insertarSubserviciosCorrectos().catch(error => {
    console.error('💥 Error en el script:', error);
    process.exit(1);
  });
}

module.exports = { insertarSubserviciosCorrectos };
