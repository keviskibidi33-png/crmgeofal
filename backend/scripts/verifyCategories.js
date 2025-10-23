const pool = require('../config/db');

async function verifyCategories() {
  console.log('🔍 Verificación meticulosa de categorías...\n');

  try {
    // Mapeo exacto según el CSV
    const correctMappings = {
      // ENSAYO ESTÁNDAR SUELO
      'ENSAYO ESTÁNDAR SUELO': [
        'SU04', 'SU19', 'SU20', 'SU21', 'SU22', 'SU23', 'SU24', 'SU30', 'SU31', 'SU32', 
        'SU34', 'SU35', 'SU36', 'SU38', 'SU39'
      ],
      
      // ENSAYOS ESPECIALES SUELO
      'ENSAYOS ESPECIALES SUELO': [
        'SU05', 'SU33', 'SU37', 'SU40', 'SU41', 'SU42', 'SU43', 'SU44', 'SU45', 'SU46', 'SU47',
        'EE01', 'EE02', 'EE03'
      ],
      
      // ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO
      'ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO': [
        'SU03', 'SU13', 'SU14', 'SU15', 'SU26'
      ],
      
      // ENSAYOS DE CAMPO EN SUELO
      'ENSAYOS DE CAMPO EN SUELO': [
        'SU02', 'SU06A', 'SU06B', 'SU06C', 'SU06D', 'SU16', 'SU18', 'SU28', 'SU29'
      ],
      
      // ENSAYO AGREGADO
      'ENSAYO AGREGADO': [
        'AG08A', 'AG08B', 'AG09', 'AG18', 'AG19', 'AG20', 'AG22', 'AG23', 'AG26', 'AG28',
        'AG33', 'AG34', 'AG35', 'AG36'
      ],
      
      // ENSAYO QUÍMICO AGREGADO
      'ENSAYO QUÍMICO AGREGADO': [
        'AG11', 'AG16', 'AG17', 'AG29', 'AG30', 'AG24', 'AG25', 'AG12', 'AG13'
      ],
      
      // ENSAYO CONCRETO
      'ENSAYO CONCRETO': [
        'CO07', 'CO08', 'CO12', 'CO12A', 'CO14', 'CO19', 'DIS01', 'DIS02', 'DIS03'
      ],
      
      // ENSAYO CONCRETO DE CAMPO
      'ENSAYO CONCRETO DE CAMPO': [
        'CO03A', 'CO03B', 'CO03C', 'CO03D', 'CO04', 'CO11'
      ],
      
      // ENSAYO QUÍMICO EN CONCRETO
      'ENSAYO QUÍMICO EN CONCRETO': [
        'CO15', 'CO16', 'CO17', 'SU27', 'CO10', 'CO13'
      ],
      
      // ENSAYO ALBAÑILERÍA
      'ENSAYO ALBAÑILERÍA': [
        'ALB01', 'ALB02', 'ALB03', 'ALB04', 'ALB04A', 'ALB05', 'ALB06', 'ALB07', 'ALB08',
        'ALB09', 'ALB10', 'ALB11', 'ALB12', 'ALB13', 'ALB14', 'ALB15', 'ALB16', 'ALB17', 'ALB18'
      ],
      
      // ENSAYO ROCA
      'ENSAYO ROCA': [
        'RO01', 'RO02', 'RO03', 'RO04'
      ],
      
      // CEMENTO
      'CEMENTO': [
        'CEM01', 'CEM02', 'CEM03'
      ],
      
      // ENSAYO PAVIMENTO EN CAMPO Y LABORATORIO
      'ENSAYO PAVIMENTO EN CAMPO Y LABORATORIO': [
        'PAV01', 'PAV02', 'PAV02A', 'PAV03', 'PAV04', 'PAV05', 'PAV06', 'PAV07', 'PAV08',
        'PAV09', 'PAV10', 'PAV11', 'PAV12'
      ],
      
      // ENSAYO MEZCLA ASFÁLTICA
      'ENSAYO MEZCLA ASFÁLTICA': [
        'MA02', 'MA02A', 'MA03', 'MA04', 'MA05', 'MA08', 'MA11', 'MA13', 'MA14'
      ],
      
      // EVALUACIONES ESTRUCTURALES
      'EVALUACIONES ESTRUCTURALES': [
        'E01', 'E02', 'E03', 'E04'
      ],
      
      // OTROS SERVICIOS
      'OTROS SERVICIOS': [
        'SER01', 'SER02', 'SER03', 'SER04'
      ]
    };

    // Obtener todos los ensayos de la base de datos
    const result = await pool.query('SELECT codigo, categoria FROM ensayos ORDER BY codigo');
    const ensayos = result.rows;

    console.log(`📊 Total de ensayos en BD: ${ensayos.length}\n`);

    let correctos = 0;
    let incorrectos = 0;
    const errores = [];

    // Verificar cada ensayo
    for (const ensayo of ensayos) {
      let categoriaCorrecta = null;
      
      // Buscar la categoría correcta
      for (const [categoria, codigos] of Object.entries(correctMappings)) {
        if (codigos.includes(ensayo.codigo)) {
          categoriaCorrecta = categoria;
          break;
        }
      }

      if (categoriaCorrecta) {
        if (ensayo.categoria === categoriaCorrecta) {
          correctos++;
          console.log(`✅ ${ensayo.codigo}: ${ensayo.categoria} (CORRECTO)`);
        } else {
          incorrectos++;
          errores.push({
            codigo: ensayo.codigo,
            actual: ensayo.categoria,
            correcta: categoriaCorrecta
          });
          console.log(`❌ ${ensayo.codigo}: ${ensayo.categoria} → DEBERÍA SER: ${categoriaCorrecta}`);
        }
      } else {
        // Ensayo no encontrado en el mapeo
        if (ensayo.categoria === 'OTROS SERVICIOS') {
          correctos++;
          console.log(`✅ ${ensayo.codigo}: ${ensayo.categoria} (CORRECTO - No mapeado)`);
        } else {
          incorrectos++;
          errores.push({
            codigo: ensayo.codigo,
            actual: ensayo.categoria,
            correcta: 'OTROS SERVICIOS'
          });
          console.log(`❌ ${ensayo.codigo}: ${ensayo.categoria} → DEBERÍA SER: OTROS SERVICIOS`);
        }
      }
    }

    console.log(`\n📈 RESUMEN DE VERIFICACIÓN:`);
    console.log(`✅ Correctos: ${correctos}`);
    console.log(`❌ Incorrectos: ${incorrectos}`);
    console.log(`📊 Total: ${ensayos.length}`);

    if (errores.length > 0) {
      console.log(`\n🔧 ENSAYOS QUE NECESITAN CORRECCIÓN:`);
      errores.forEach(error => {
        console.log(`  ${error.codigo}: ${error.actual} → ${error.correcta}`);
      });
    }

    // Mostrar estadísticas por categoría
    const stats = await pool.query(`
      SELECT categoria, COUNT(*) as count 
      FROM ensayos 
      GROUP BY categoria 
      ORDER BY count DESC
    `);

    console.log(`\n📋 DISTRIBUCIÓN ACTUAL POR CATEGORÍAS:`);
    stats.rows.forEach(row => {
      console.log(`  ${row.categoria}: ${row.count} ensayos`);
    });

  } catch (error) {
    console.error('❌ Error en la verificación:', error);
  } finally {
    pool.end();
  }
}

verifyCategories();
