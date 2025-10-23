const fs = require('fs');
const path = require('path');

function analyzeJSON() {
  console.log('📊 ANALIZANDO JSON DE BASE DE DATOS...\n');

  try {
    const jsonPath = path.join(__dirname, '../exports/ensayos_database_complete.json');
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    console.log('📋 METADATOS:');
    console.log(`  Fecha de exportación: ${data.metadata.export_date}`);
    console.log(`  Total ensayos: ${data.metadata.total_ensayos}`);
    console.log(`  Total categorías: ${data.metadata.total_categorias}`);
    console.log(`  Versión: ${data.metadata.version}`);
    
    console.log('\n📈 ESTADÍSTICAS GENERALES:');
    console.log(`  Precio total estimado: S/ ${data.estadisticas.resumen_general.precio_total_estimado.toFixed(2)}`);
    console.log(`  Ensayos con conexiones: ${data.estadisticas.resumen_general.ensayos_con_conexiones}`);
    
    console.log('\n📂 DISTRIBUCIÓN POR CATEGORÍA:');
    data.estadisticas.por_categoria.forEach(stat => {
      console.log(`  ${stat.categoria}:`);
      console.log(`    - Ensayos: ${stat.total_ensayos}`);
      console.log(`    - Precio promedio: S/ ${stat.precio_promedio.toFixed(2)}`);
      console.log(`    - Rango: S/ ${stat.precio_minimo} - S/ ${stat.precio_maximo}`);
      console.log(`    - Sin precio: ${stat.sin_precio}`);
      console.log('');
    });
    
    console.log('🏢 DISTRIBUCIÓN POR UBICACIÓN:');
    console.log(`  Laboratorio: ${data.ubicaciones.laboratorio} ensayos`);
    console.log(`  Campo: ${data.ubicaciones.campo} ensayos`);
    console.log(`  Mixto: ${data.ubicaciones.mixto} ensayos`);
    console.log(`  Sin ubicación: ${data.ubicaciones.sin_ubicacion} ensayos`);
    
    console.log('\n💰 RANGOS DE PRECIO:');
    console.log(`  Sin precio: ${data.rangos_precio.sin_precio} ensayos`);
    console.log(`  Bajo (S/ 1-100): ${data.rangos_precio.bajo} ensayos`);
    console.log(`  Medio (S/ 101-500): ${data.rangos_precio.medio} ensayos`);
    console.log(`  Alto (S/ 501-1000): ${data.rangos_precio.alto} ensayos`);
    console.log(`  Muy alto (S/ 1000+): ${data.rangos_precio.muy_alto} ensayos`);
    
    console.log('\n🔗 ENSAYOS CON CONEXIONES:');
    data.conexiones.forEach(conexion => {
      console.log(`  ${conexion.codigo}: ${conexion.descripcion}`);
      if (Array.isArray(conexion.ensayos_requeridos)) {
        console.log(`    Requiere: ${conexion.ensayos_requeridos.join(', ')}`);
      } else {
        console.log(`    Requiere: ${conexion.ensayos_requeridos}`);
      }
      console.log(`    Total requeridos: ${conexion.total_requeridos}`);
      console.log('');
    });
    
    console.log('📊 ESTRUCTURA DEL JSON:');
    console.log(`  - metadata: Información general`);
    console.log(`  - estadisticas: Estadísticas por categoría y generales`);
    console.log(`  - categorias: Ensayos organizados por categoría`);
    console.log(`  - ensayos: Lista completa de todos los ensayos`);
    console.log(`  - conexiones: Ensayos que requieren otros ensayos`);
    console.log(`  - ubicaciones: Distribución por ubicación`);
    console.log(`  - rangos_precio: Distribución por rangos de precio`);
    
    console.log('\n✅ Análisis completado');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

analyzeJSON();
