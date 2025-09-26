const pool = require('../config/db');

async function adaptTablesLaboratorio() {
  console.log('🔧 ADAPTANDO TABLAS PARA FLUJO DE LABORATORIO...\n');

  try {
    // 1. Modificar tabla projects
    console.log('1️⃣ Modificando tabla projects...');
    
    // Agregar columna estado si no existe
    await pool.query(`
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS estado VARCHAR(50) DEFAULT 'borrador'
    `);
    
    // Agregar columna cotizacion_id si no existe
    await pool.query(`
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS cotizacion_id INTEGER REFERENCES quotes(id)
    `);
    
    // Agregar columna usuario_laboratorio_id si no existe
    await pool.query(`
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS usuario_laboratorio_id INTEGER REFERENCES users(id)
    `);
    
    // Agregar columnas de fechas si no existen
    await pool.query(`
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS fecha_envio_laboratorio TIMESTAMP
    `);
    
    await pool.query(`
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS fecha_completado_laboratorio TIMESTAMP
    `);
    
    // Agregar columna de notas si no existe
    await pool.query(`
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS notas_laboratorio TEXT
    `);
    
    console.log('   ✅ Tabla projects modificada');

    // 2. Modificar tabla quotes
    console.log('\n2️⃣ Modificando tabla quotes...');
    
    // Agregar columna es_contrato si no existe
    await pool.query(`
      ALTER TABLE quotes 
      ADD COLUMN IF NOT EXISTS es_contrato BOOLEAN DEFAULT false
    `);
    
    // Agregar columnas de archivos si no existen
    await pool.query(`
      ALTER TABLE quotes 
      ADD COLUMN IF NOT EXISTS archivos_cotizacion JSONB
    `);
    
    await pool.query(`
      ALTER TABLE quotes 
      ADD COLUMN IF NOT EXISTS archivos_laboratorio JSONB
    `);
    
    // Agregar columnas de notas si no existen
    await pool.query(`
      ALTER TABLE quotes 
      ADD COLUMN IF NOT EXISTS notas_vendedor TEXT
    `);
    
    await pool.query(`
      ALTER TABLE quotes 
      ADD COLUMN IF NOT EXISTS notas_laboratorio TEXT
    `);
    
    console.log('   ✅ Tabla quotes modificada');

    // 3. Crear tabla de estados de proyecto si no existe
    console.log('\n3️⃣ Creando tabla de estados de proyecto...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_states (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id),
        estado_anterior VARCHAR(50),
        estado_nuevo VARCHAR(50),
        usuario_id INTEGER REFERENCES users(id),
        fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notas TEXT
      )
    `);
    
    console.log('   ✅ Tabla project_states creada');

    // 4. Crear tabla de archivos de proyecto si no existe
    console.log('\n4️⃣ Creando tabla de archivos de proyecto...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_files (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id),
        quote_id INTEGER REFERENCES quotes(id),
        tipo_archivo VARCHAR(50), -- 'cotizacion', 'laboratorio', 'entrega'
        nombre_archivo VARCHAR(255),
        ruta_archivo VARCHAR(500),
        tamaño_archivo BIGINT,
        tipo_mime VARCHAR(100),
        usuario_id INTEGER REFERENCES users(id),
        fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        version INTEGER DEFAULT 1,
        es_activo BOOLEAN DEFAULT true
      )
    `);
    
    console.log('   ✅ Tabla project_files creada');

    // 5. Crear índices para optimizar consultas
    console.log('\n5️⃣ Creando índices...');
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_projects_estado ON projects(estado)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_projects_laboratorio ON projects(usuario_laboratorio_id)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_quotes_contrato ON quotes(es_contrato)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_project_files_tipo ON project_files(tipo_archivo)
    `);
    
    console.log('   ✅ Índices creados');

    // 6. Verificar cambios
    console.log('\n6️⃣ Verificando cambios...');
    
    const projectsColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'projects' 
      AND column_name IN ('estado', 'cotizacion_id', 'usuario_laboratorio_id', 'fecha_envio_laboratorio', 'fecha_completado_laboratorio', 'notas_laboratorio')
      ORDER BY column_name
    `);
    
    console.log('   📋 Columnas agregadas a projects:');
    projectsColumns.rows.forEach(col => {
      console.log(`      - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    const quotesColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'quotes' 
      AND column_name IN ('es_contrato', 'archivos_cotizacion', 'archivos_laboratorio', 'notas_vendedor', 'notas_laboratorio')
      ORDER BY column_name
    `);
    
    console.log('   📋 Columnas agregadas a quotes:');
    quotesColumns.rows.forEach(col => {
      console.log(`      - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

    console.log('\n🎉 ADAPTACIÓN COMPLETADA EXITOSAMENTE');
    console.log('✅ Tablas modificadas para flujo de laboratorio');
    console.log('✅ Estructura de archivos preparada');
    console.log('✅ Índices optimizados');
    console.log('✅ Listo para implementar módulos');

  } catch (error) {
    console.error('❌ Error adaptando tablas:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

adaptTablesLaboratorio();
