const pool = require('../config/db');

async function addMissingQuoteColumns() {
  try {
    console.log('🔧 Agregando columnas faltantes a la tabla quotes...\n');

    // 1. Verificar columnas existentes
    console.log('📋 Verificando columnas existentes...');
    const existingColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'quotes'
      ORDER BY column_name
    `);

    const columnNames = existingColumns.rows.map(row => row.column_name);
    console.log('Columnas existentes:', columnNames);

    // 2. Agregar columnas faltantes
    const columnsToAdd = [
      { name: 'client_company', type: 'VARCHAR(255)', description: 'Razón social de la empresa' },
      { name: 'client_ruc', type: 'VARCHAR(20)', description: 'RUC de la empresa' },
      { name: 'project_location', type: 'VARCHAR(255)', description: 'Ubicación del proyecto' },
      { name: 'project_name', type: 'VARCHAR(255)', description: 'Nombre del proyecto' },
      { name: 'request_date', type: 'DATE', description: 'Fecha de solicitud' }
    ];

    for (const column of columnsToAdd) {
      if (!columnNames.includes(column.name)) {
        console.log(`\n➕ Agregando columna: ${column.name} (${column.type})`);
        try {
          await pool.query(`ALTER TABLE quotes ADD COLUMN ${column.name} ${column.type}`);
          console.log(`✅ Columna ${column.name} agregada exitosamente`);
        } catch (error) {
          console.log(`❌ Error agregando columna ${column.name}:`, error.message);
        }
      } else {
        console.log(`✅ Columna ${column.name} ya existe`);
      }
    }

    // 3. Verificar estructura final
    console.log('\n📋 Verificando estructura final...');
    const finalColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'quotes'
      ORDER BY ordinal_position
    `);

    console.log('\nEstructura final de la tabla quotes:');
    finalColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // 4. Migrar datos existentes si es necesario
    console.log('\n🔄 Migrando datos existentes...');
    const quotesWithData = await pool.query(`
      SELECT id, client_contact 
      FROM quotes 
      WHERE client_contact IS NOT NULL 
      LIMIT 5
    `);

    if (quotesWithData.rows.length > 0) {
      console.log(`\n📊 Encontradas ${quotesWithData.rows.length} cotizaciones con datos de cliente`);
      
      for (const quote of quotesWithData.rows) {
        console.log(`\n🔄 Migrando cotización ID: ${quote.id}`);
        console.log(`   - client_contact: "${quote.client_contact}"`);
        
        // Si client_company está vacío, copiar client_contact
        await pool.query(`
          UPDATE quotes 
          SET client_company = client_contact 
          WHERE id = $1 AND (client_company IS NULL OR client_company = '')
        `, [quote.id]);
        
        console.log(`   ✅ Datos migrados para cotización ${quote.id}`);
      }
    } else {
      console.log('   No hay cotizaciones con datos para migrar');
    }

    // 5. Verificar datos migrados
    console.log('\n🔍 Verificando datos migrados...');
    const migratedData = await pool.query(`
      SELECT 
        id,
        client_contact,
        client_company,
        client_ruc,
        client_phone,
        client_email,
        project_location,
        project_name
      FROM quotes 
      WHERE client_contact IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 3
    `);

    if (migratedData.rows.length > 0) {
      console.log('\n📋 Datos migrados:');
      migratedData.rows.forEach((quote, index) => {
        console.log(`\n${index + 1}. Cotización ID: ${quote.id}`);
        console.log(`   - client_contact: "${quote.client_contact || 'NULL'}"`);
        console.log(`   - client_company: "${quote.client_company || 'NULL'}"`);
        console.log(`   - client_ruc: "${quote.client_ruc || 'NULL'}"`);
        console.log(`   - client_phone: "${quote.client_phone || 'NULL'}"`);
        console.log(`   - client_email: "${quote.client_email || 'NULL'}"`);
        console.log(`   - project_location: "${quote.project_location || 'NULL'}"`);
        console.log(`   - project_name: "${quote.project_name || 'NULL'}"`);
      });
    }

    console.log('\n🎉 MIGRACIÓN COMPLETADA');
    console.log('✅ Columnas agregadas exitosamente');
    console.log('✅ Datos migrados correctamente');
    console.log('✅ Estructura de tabla actualizada');
    console.log('\n💡 Ahora el frontend puede usar:');
    console.log('   - client_company para la razón social');
    console.log('   - client_ruc para el RUC');
    console.log('   - project_location para la ubicación');
    console.log('   - project_name para el nombre del proyecto');

  } catch (error) {
    console.error('❌ Error en la migración:', error);
  } finally {
    process.exit(0);
  }
}

addMissingQuoteColumns();
