const pool = require('../config/db');

async function createSequenceTable() {
  try {
    console.log('🔧 Creando tabla de secuencias para números de cotización...\n');
    
    // Crear tabla de secuencias si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quote_sequences (
        date_part VARCHAR(6) PRIMARY KEY,
        sequence INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('✅ Tabla quote_sequences creada/verificada');
    
    // Crear función para obtener el siguiente número de secuencia
    await pool.query(`
      CREATE OR REPLACE FUNCTION get_next_quote_sequence(date_part_param VARCHAR(6))
      RETURNS INTEGER AS $$
      DECLARE
        next_seq INTEGER;
      BEGIN
        INSERT INTO quote_sequences (date_part, sequence)
        VALUES (date_part_param, 1)
        ON CONFLICT (date_part) 
        DO UPDATE SET 
          sequence = quote_sequences.sequence + 1,
          updated_at = NOW()
        RETURNING sequence INTO next_seq;
        
        RETURN next_seq;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    console.log('✅ Función get_next_quote_sequence creada');
    
    // Probar la función
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const datePart = `${year}${month}${day}`;
    
    console.log(`\n🧪 Probando función con fecha: ${datePart}`);
    
    for (let i = 1; i <= 3; i++) {
      const result = await pool.query('SELECT get_next_quote_sequence($1) as sequence', [datePart]);
      const sequence = result.rows[0].sequence;
      console.log(`   Secuencia ${i}: ${sequence}`);
    }
    
    console.log('\n✅ Sistema de secuencias configurado correctamente');
    
  } catch (error) {
    console.error('❌ Error creando tabla de secuencias:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createSequenceTable().then(() => {
    console.log('\n✅ Script completado');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { createSequenceTable };
