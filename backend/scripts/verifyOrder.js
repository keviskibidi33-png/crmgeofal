const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

async function verifyOrder() {
  console.log('🔍 VERIFICANDO ORDEN DE ENSAYOS SEGÚN CSV...\n');

  try {
    // 1. Leer CSV y extraer orden exacto
    const csvPath = path.join(__dirname, '../../DocumentosExcel/LISTA DE PRECIOS GEOFAL 2025 NUEVO.csv');
    const csvContent = fs.readFileSync(csvPath, 'latin1');
    const lines = csvContent.split('\n');
    
    const csvOrder = [];
    let currentCategory = '';
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const columns = line.split(';');
      const codigo = columns[0]?.trim();
      const descripcion = columns[1]?.trim();
      const norma = columns[2]?.trim();
      const precio = columns[5]?.trim();
      
      // Si es una categoría
      if (!codigo && descripcion && !norma && !precio) {
        currentCategory = descripcion;
        csvOrder.push({ type: 'category', name: currentCategory, line: i + 1 });
        continue;
      }
      
      // Si es un ensayo
      if (codigo && descripcion && precio) {
        csvOrder.push({ 
          type: 'ensayo', 
          codigo, 
          descripcion, 
          categoria: currentCategory, 
          line: i + 1 
        });
      }
    }
    
    console.log(`📊 Total elementos en CSV: ${csvOrder.length}`);
    console.log(`📊 Categorías: ${csvOrder.filter(item => item.type === 'category').length}`);
    console.log(`📊 Ensayos: ${csvOrder.filter(item => item.type === 'ensayo').length}`);
    
    // 2. Obtener orden de la BD
    const dbResult = await pool.query(`
      SELECT codigo, descripcion, categoria, orden 
      FROM ensayos 
      ORDER BY categoria, COALESCE(orden, 999), codigo
    `);
    
    console.log(`📊 Total ensayos en BD: ${dbResult.rows.length}`);
    
    // 3. Verificar orden por categoría
    console.log('\n🔍 VERIFICANDO ORDEN POR CATEGORÍA:\n');
    
    let csvIndex = 0;
    let categoryMatches = 0;
    let orderMatches = 0;
    let totalEnsayos = 0;
    
    for (const item of csvOrder) {
      if (item.type === 'category') {
        console.log(`\n📂 CATEGORÍA: ${item.name} (línea ${item.line})`);
        
        // Buscar ensayos de esta categoría en el CSV
        const csvEnsayos = csvOrder.filter((ensayo, index) => 
          ensayo.type === 'ensayo' && 
          ensayo.categoria === item.name &&
          index > csvIndex
        );
        
        // Buscar ensayos de esta categoría en la BD
        const dbEnsayos = dbResult.rows.filter(row => row.categoria === item.name);
        
        console.log(`  CSV: ${csvEnsayos.length} ensayos`);
        console.log(`  BD:  ${dbEnsayos.length} ensayos`);
        
        if (csvEnsayos.length === dbEnsayos.length) {
          categoryMatches++;
          console.log(`  ✅ Cantidad correcta`);
        } else {
          console.log(`  ❌ Cantidad incorrecta`);
        }
        
        // Verificar orden dentro de la categoría
        let orderCorrect = true;
        for (let i = 0; i < Math.min(csvEnsayos.length, dbEnsayos.length); i++) {
          if (csvEnsayos[i].codigo !== dbEnsayos[i].codigo) {
            orderCorrect = false;
            console.log(`  ❌ Orden incorrecto en posición ${i + 1}: CSV=${csvEnsayos[i].codigo}, BD=${dbEnsayos[i].codigo}`);
            break;
          }
        }
        
        if (orderCorrect && csvEnsayos.length === dbEnsayos.length) {
          orderMatches++;
          console.log(`  ✅ Orden correcto`);
        } else if (csvEnsayos.length === dbEnsayos.length) {
          console.log(`  ⚠️  Orden parcialmente correcto`);
        }
        
        // Mostrar primeros 3 ensayos de cada categoría
        console.log(`  📋 Primeros ensayos en CSV:`);
        csvEnsayos.slice(0, 3).forEach((ensayo, i) => {
          console.log(`    ${i + 1}. ${ensayo.codigo}: ${ensayo.descripcion}`);
        });
        
        console.log(`  📋 Primeros ensayos en BD:`);
        dbEnsayos.slice(0, 3).forEach((ensayo, i) => {
          console.log(`    ${i + 1}. ${ensayo.codigo}: ${ensayo.descripcion}`);
        });
        
        totalEnsayos += csvEnsayos.length;
      }
    }
    
    // 4. Resumen final
    console.log('\n📈 RESUMEN DE ORDEN:');
    console.log(`✅ Categorías con cantidad correcta: ${categoryMatches}`);
    console.log(`✅ Categorías con orden correcto: ${orderMatches}`);
    console.log(`📊 Total ensayos verificados: ${totalEnsayos}`);
    
    const totalCategories = csvOrder.filter(item => item.type === 'category').length;
    console.log(`📊 Total categorías: ${totalCategories}`);
    
    if (categoryMatches === totalCategories && orderMatches === totalCategories) {
      console.log('\n🎉 ¡PERFECTO! Todos los ensayos están en el orden correcto del CSV');
    } else if (categoryMatches === totalCategories) {
      console.log('\n✅ Todas las categorías tienen la cantidad correcta, pero el orden puede variar');
    } else {
      console.log('\n⚠️  Algunas categorías tienen problemas de cantidad o orden');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    pool.end();
  }
}

verifyOrder();
