const pool = require('../config/db');

async function fixCompaniesConstraint() {
  try {
    console.log('🔧 Iniciando corrección de restricción UNIQUE en tabla companies...');
    
    // Eliminar la restricción UNIQUE existente
    console.log('📝 Eliminando restricción UNIQUE existente...');
    await pool.query('ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_ruc_key');
    
    // Crear una restricción UNIQUE parcial que solo aplique a valores no-null
    console.log('📝 Creando índice único parcial para RUC...');
    try {
      await pool.query('CREATE UNIQUE INDEX companies_ruc_unique_idx ON companies (ruc) WHERE ruc IS NOT NULL');
    } catch (error) {
      if (error.code === '42P07') {
        console.log('✅ Índice RUC ya existe, continuando...');
      } else {
        throw error;
      }
    }
    
    // También crear un índice único para DNI cuando no sea null
    console.log('📝 Creando índice único parcial para DNI...');
    try {
      await pool.query('CREATE UNIQUE INDEX companies_dni_unique_idx ON companies (dni) WHERE dni IS NOT NULL');
    } catch (error) {
      if (error.code === '42P07') {
        console.log('✅ Índice DNI ya existe, continuando...');
      } else {
        throw error;
      }
    }
    
    console.log('✅ Corrección completada exitosamente!');
    console.log('✅ Ahora se pueden crear personas naturales sin RUC');
    console.log('✅ Y empresas sin DNI');
    
  } catch (error) {
    console.error('❌ Error al corregir restricción:', error);
  } finally {
    await pool.end();
  }
}

fixCompaniesConstraint();
