const pool = require('../config/db');

async function createEnsayoCategories() {
  try {
    console.log('🔧 Creando categorías de ensayos...');
    
    // Primero, eliminar el servicio "Laboratorio" genérico
    await pool.query('DELETE FROM services WHERE name = $1', ['Laboratorio']);
    
    // Crear las categorías de ensayos
    const categories = [
      {
        name: 'ENSAYO ESTÁNDAR',
        area: 'laboratorio',
        description: 'Ensayos estándar de laboratorio',
        code: 'EST'
      },
      {
        name: 'ENSAYOS ESPECIALES',
        area: 'laboratorio', 
        description: 'Ensayos especiales de laboratorio',
        code: 'ESP'
      },
      {
        name: 'ENSAYO AGREGADO',
        area: 'laboratorio',
        description: 'Ensayos de agregados',
        code: 'AGR'
      },
      {
        name: 'ENSAYOS DE CAMPO',
        area: 'laboratorio',
        description: 'Ensayos de campo',
        code: 'CAM'
      },
      {
        name: 'ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO',
        area: 'laboratorio',
        description: 'Ensayos químicos de suelo y agua subterránea',
        code: 'QUI'
      },
      {
        name: 'ENSAYO QUÍMICO AGREGADO',
        area: 'laboratorio',
        description: 'Ensayos químicos de agregados',
        code: 'QAG'
      },
      {
        name: 'ENSAYO CONCRETO',
        area: 'laboratorio',
        description: 'Ensayos de concreto',
        code: 'CON'
      },
      {
        name: 'ENSAYO ALBAÑILERÍA',
        area: 'laboratorio',
        description: 'Ensayos de albañilería',
        code: 'ALB'
      },
      {
        name: 'ENSAYO ROCA',
        area: 'laboratorio',
        description: 'Ensayos de roca',
        code: 'ROC'
      },
      {
        name: 'CEMENTO',
        area: 'laboratorio',
        description: 'Ensayos de cemento',
        code: 'CEM'
      },
      {
        name: 'ENSAYO PAVIMENTO',
        area: 'laboratorio',
        description: 'Ensayos de pavimento',
        code: 'PAV'
      },
      {
        name: 'ENSAYO ASFALTO',
        area: 'laboratorio',
        description: 'Ensayos de asfalto',
        code: 'ASF'
      },
      {
        name: 'ENSAYO MEZCLA ASFÁLTICO',
        area: 'laboratorio',
        description: 'Ensayos de mezcla asfáltica',
        code: 'MAF'
      },
      {
        name: 'EVALUACIONES ESTRUCTURALES',
        area: 'laboratorio',
        description: 'Evaluaciones estructurales',
        code: 'EST'
      },
      {
        name: 'IMPLEMENTACIÓN LABORATORIO EN OBRA',
        area: 'laboratorio',
        description: 'Implementación de laboratorio en obra',
        code: 'IMP'
      },
      {
        name: 'OTROS SERVICIOS',
        area: 'laboratorio',
        description: 'Otros servicios de laboratorio',
        code: 'OTH'
      }
    ];
    
    // Insertar categorías
    for (const category of categories) {
      const result = await pool.query(`
        INSERT INTO services (name, area, description, code, created_at, updated_at, is_active)
        VALUES ($1, $2, $3, $4, NOW(), NOW(), true)
        RETURNING id, name
      `, [category.name, category.area, category.description, category.code]);
      
      console.log(`✅ Creada categoría: ${result.rows[0].name} (ID: ${result.rows[0].id})`);
    }
    
    console.log('🎉 Categorías de ensayos creadas exitosamente');
    
  } catch (error) {
    console.error('❌ Error creando categorías:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createEnsayoCategories();
}

module.exports = createEnsayoCategories;
