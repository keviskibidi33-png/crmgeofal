const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

// Función para parsear el CSV
function parseCSV(csvContent) {
  const lines = csvContent.split('\n');
  const ensayos = [];
  
  for (let i = 1; i < lines.length; i++) { // Saltar header
    const line = lines[i].trim();
    if (!line) continue;
    
    const columns = line.split(';');
    if (columns.length < 8) continue;
    
    const codigo = columns[0]?.trim();
    const descripcion = columns[1]?.trim();
    
    // Solo procesar si tiene código y descripción
    if (!codigo || !descripcion || codigo === '' || descripcion === '') continue;
    
    // Extraer categoría de la descripción si es un encabezado
    let categoria = '';
    if (descripcion.includes('ENSAYO ESTÁNDAR SUELO')) {
      categoria = 'ENSAYO ESTÁNDAR SUELO';
    } else if (descripcion.includes('ENSAYOS ESPECIALES SUELO')) {
      categoria = 'ENSAYOS ESPECIALES SUELO';
    } else if (descripcion.includes('ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO')) {
      categoria = 'ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO';
    } else if (descripcion.includes('ENSAYOS DE CAMPO EN SUELO')) {
      categoria = 'ENSAYOS DE CAMPO EN SUELO';
    } else if (descripcion.includes('ENSAYO AGREGADO')) {
      categoria = 'ENSAYO AGREGADO';
    } else if (descripcion.includes('ENSAYO QUÍMICO AGREGADO')) {
      categoria = 'ENSAYO QUÍMICO AGREGADO';
    } else if (descripcion.includes('ENSAYO CONCRETO')) {
      categoria = 'ENSAYO CONCRETO';
    } else if (descripcion.includes('ENSAYO ALBAÑILERÍA')) {
      categoria = 'ENSAYO ALBAÑILERÍA';
    } else if (descripcion.includes('ENSAYO ROCA')) {
      categoria = 'ENSAYO ROCA';
    } else if (descripcion.includes('CEMENTO')) {
      categoria = 'CEMENTO';
    } else if (descripcion.includes('ENSAYO PAVIMENTO')) {
      categoria = 'ENSAYO PAVIMENTO';
    } else if (descripcion.includes('ENSAYO MEZCLA ASFÁLTICA')) {
      categoria = 'ENSAYO MEZCLA ASFÁLTICA';
    } else if (descripcion.includes('EVALUACIONES ESTRUCTURALES')) {
      categoria = 'EVALUACIONES ESTRUCTURALES';
    } else if (descripcion.includes('OTROS SERVICIOS')) {
      categoria = 'OTROS SERVICIOS';
    }
    
    // Si es un encabezado de categoría, no crear ensayo
    if (categoria && !codigo) continue;
    
    // Si no tiene categoría pero tiene código, usar la última categoría conocida
    if (!categoria && codigo) {
      categoria = getLastCategory(ensayos);
    }
    
    const ensayo = {
      codigo,
      descripcion,
      norma: columns[2]?.trim() || '',
      referencia_otra_norma: columns[3]?.trim() || '',
      ubicacion: columns[4]?.trim() === 'CAMPO' ? 'CAMPO' : 'LABORATORIO',
      precio: parseFloat(columns[5]?.trim() || '0') || 0,
      comentarios: columns[6]?.trim() || '',
      nota_comercial: columns[7]?.trim() || '',
      categoria: categoria || 'OTROS SERVICIOS'
    };
    
    // Extraer ensayos requeridos de los comentarios
    if (ensayo.comentarios) {
      const ensayosRequeridos = extractRequiredTests(ensayo.comentarios);
      ensayo.ensayos_requeridos = ensayosRequeridos.join(',');
    }
    
    ensayos.push(ensayo);
  }
  
  return ensayos;
}

// Función para obtener la última categoría conocida
function getLastCategory(ensayos) {
  for (let i = ensayos.length - 1; i >= 0; i--) {
    if (ensayos[i].categoria) {
      return ensayos[i].categoria;
    }
  }
  return 'OTROS SERVICIOS';
}

// Función para extraer códigos de ensayos requeridos de los comentarios
function extractRequiredTests(comentarios) {
  const codigos = [];
  const regex = /\b(SU\d+|AG\d+|CO\d+|ALB\d+|RO\d+|CEM\d+|PAV\d+|MA\d+|E\d+|SER\d+|DIS\d+|EE\d+)\b/g;
  const matches = comentarios.match(regex);
  
  if (matches) {
    codigos.push(...matches);
  }
  
  return [...new Set(codigos)]; // Eliminar duplicados
}

// Función principal de importación
async function importEnsayos() {
  try {
    console.log('🚀 Iniciando importación de ensayos...');
    
    // Leer archivo CSV
    const csvPath = path.join(__dirname, '../../DocumentosExcel/LISTA DE PRECIOS GEOFAL 2025 NUEVO.csv');
    
    if (!fs.existsSync(csvPath)) {
      throw new Error('Archivo CSV no encontrado: ' + csvPath);
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    console.log('📄 Archivo CSV leído correctamente');
    
    // Parsear CSV
    const ensayos = parseCSV(csvContent);
    console.log(`📊 ${ensayos.length} ensayos parseados del CSV`);
    
    // Verificar que la tabla existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ensayos (
        id SERIAL PRIMARY KEY,
        codigo VARCHAR(20) UNIQUE NOT NULL,
        descripcion TEXT NOT NULL,
        norma VARCHAR(100),
        referencia_otra_norma VARCHAR(100),
        ubicacion VARCHAR(50) CHECK (ubicacion IN ('LABORATORIO', 'CAMPO')),
        precio DECIMAL(10,2) DEFAULT 0.00,
        comentarios TEXT,
        nota_comercial TEXT,
        categoria VARCHAR(100),
        ensayos_requeridos TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Tabla ensayos verificada/creada');
    
    // Limpiar datos existentes
    await pool.query('DELETE FROM ensayos');
    console.log('🗑️ Datos existentes eliminados');
    
    // Insertar nuevos datos
    let insertados = 0;
    let errores = 0;
    
    for (const ensayo of ensayos) {
      try {
        await pool.query(`
          INSERT INTO ensayos (
            codigo, descripcion, norma, referencia_otra_norma, ubicacion,
            precio, comentarios, nota_comercial, categoria, ensayos_requeridos
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          ensayo.codigo,
          ensayo.descripcion,
          ensayo.norma,
          ensayo.referencia_otra_norma,
          ensayo.ubicacion,
          ensayo.precio,
          ensayo.comentarios,
          ensayo.nota_comercial,
          ensayo.categoria,
          ensayo.ensayos_requeridos
        ]);
        
        insertados++;
        
        if (insertados % 50 === 0) {
          console.log(`📝 ${insertados} ensayos insertados...`);
        }
      } catch (error) {
        console.error(`❌ Error insertando ${ensayo.codigo}:`, error.message);
        errores++;
      }
    }
    
    console.log('\n🎉 Importación completada!');
    console.log(`✅ ${insertados} ensayos insertados exitosamente`);
    console.log(`❌ ${errores} errores`);
    
    // Mostrar estadísticas por categoría
    const stats = await pool.query(`
      SELECT categoria, COUNT(*) as cantidad, AVG(precio) as precio_promedio
      FROM ensayos
      GROUP BY categoria
      ORDER BY cantidad DESC
    `);
    
    console.log('\n📊 Estadísticas por categoría:');
    stats.rows.forEach(stat => {
      console.log(`  ${stat.categoria}: ${stat.cantidad} ensayos (Precio promedio: S/ ${parseFloat(stat.precio_promedio).toFixed(2)})`);
    });
    
  } catch (error) {
    console.error('❌ Error en la importación:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  importEnsayos()
    .then(() => {
      console.log('✅ Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error ejecutando script:', error);
      process.exit(1);
    });
}

module.exports = { importEnsayos, parseCSV, extractRequiredTests };
