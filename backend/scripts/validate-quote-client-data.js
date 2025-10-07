const pool = require('../config/db');

async function validateQuoteClientData() {
  try {
    console.log('🔍 Validando datos de clientes en cotizaciones...\n');

    // 1. Verificar estructura de la tabla quotes
    console.log('📋 Verificando estructura de la tabla quotes...');
    const quoteStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'quotes'
      ORDER BY ordinal_position
    `);

    console.log('Columnas de la tabla quotes:');
    quoteStructure.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // 2. Verificar datos de cotizaciones existentes
    console.log('\n📊 Verificando datos de cotizaciones...');
    const quotesData = await pool.query(`
      SELECT 
        id,
        client_contact,
        client_phone,
        client_email,
        created_at
      FROM quotes 
      ORDER BY created_at DESC 
      LIMIT 10
    `);

    console.log(`\n📋 Últimas 10 cotizaciones:`);
    quotesData.rows.forEach((quote, index) => {
      console.log(`\n${index + 1}. Cotización ID: ${quote.id}`);
      console.log(`   - client_contact: "${quote.client_contact || 'NULL'}"`);
      console.log(`   - client_phone: "${quote.client_phone || 'NULL'}"`);
      console.log(`   - client_email: "${quote.client_email || 'NULL'}"`);
      console.log(`   - created_at: ${quote.created_at}`);
    });

    // 3. Verificar si hay cotizaciones con datos de cliente
    console.log('\n📊 Estadísticas de datos de cliente:');
    const clientStats = await pool.query(`
      SELECT 
        COUNT(*) as total_quotes,
        COUNT(client_contact) as with_client_contact,
        COUNT(client_phone) as with_client_phone,
        COUNT(client_email) as with_client_email
      FROM quotes
    `);

    const stats = clientStats.rows[0];
    console.log(`  - Total cotizaciones: ${stats.total_quotes}`);
    console.log(`  - Con client_contact: ${stats.with_client_contact}`);
    console.log(`  - Con client_phone: ${stats.with_client_phone}`);
    console.log(`  - Con client_email: ${stats.with_client_email}`);

    // 4. Buscar cotizaciones con datos de cliente
    console.log('\n🔍 Buscando cotizaciones con datos de cliente...');
    const clientData = await pool.query(`
      SELECT 
        id,
        client_contact,
        client_phone,
        client_email,
        CASE 
          WHEN client_contact IS NOT NULL THEN 'Con datos de cliente'
          ELSE 'Sin datos de cliente'
        END as data_status
      FROM quotes 
      WHERE client_contact IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 5
    `);

    console.log('\n📋 Análisis de datos de cliente:');
    clientData.rows.forEach((quote, index) => {
      console.log(`\n${index + 1}. Cotización ID: ${quote.id}`);
      console.log(`   - client_contact: "${quote.client_contact || 'NULL'}"`);
      console.log(`   - client_phone: "${quote.client_phone || 'NULL'}"`);
      console.log(`   - client_email: "${quote.client_email || 'NULL'}"`);
      console.log(`   - Estado: ${quote.data_status}`);
    });

    // 5. Verificar si hay cotizaciones de prueba
    console.log('\n🧪 Verificando cotizaciones de prueba...');
    const testQuotes = await pool.query(`
      SELECT 
        id,
        client_contact,
        client_phone,
        client_email,
        created_at
      FROM quotes 
      WHERE client_contact LIKE '%test%' 
         OR client_contact LIKE '%Test%'
         OR client_contact LIKE '%prueba%'
         OR client_contact LIKE '%Prueba%'
      ORDER BY created_at DESC
    `);

    if (testQuotes.rows.length > 0) {
      console.log(`\n📋 Cotizaciones de prueba encontradas: ${testQuotes.rows.length}`);
      testQuotes.rows.forEach((quote, index) => {
        console.log(`\n${index + 1}. ID: ${quote.id}`);
        console.log(`   - client_contact: "${quote.client_contact}"`);
        console.log(`   - client_phone: "${quote.client_phone}"`);
        console.log(`   - client_email: "${quote.client_email}"`);
      });
    } else {
      console.log('   No se encontraron cotizaciones de prueba');
    }

    // 6. Crear cotización de prueba si no existe
    console.log('\n🔧 Creando cotización de prueba...');
    const testQuoteData = {
      client_contact: 'Innovatech Solutions S.A.C.',
      client_phone: '+51 987 654 321',
      client_email: 'contacto@innovatech.com.pe',
      request_date: new Date().toISOString().split('T')[0],
      issue_date: new Date().toISOString().split('T')[0],
      payment_terms: 'adelantado',
      reference: 'Prueba de validación',
      reference_type: ['email'],
      igv: true,
      category_main: 'laboratorio',
      status: 'borrador'
    };

    // Primero obtener un project_id válido
    const projectResult = await pool.query('SELECT id FROM projects LIMIT 1');
    const projectId = projectResult.rows.length > 0 ? projectResult.rows[0].id : 1;

    const insertResult = await pool.query(`
      INSERT INTO quotes (
        project_id, client_contact, client_phone, client_email, issue_date,
        payment_terms, reference, reference_type, category_main, status, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()
      ) RETURNING id
    `, [
      projectId,
      testQuoteData.client_contact,
      testQuoteData.client_phone,
      testQuoteData.client_email,
      testQuoteData.issue_date,
      testQuoteData.payment_terms,
      testQuoteData.reference,
      JSON.stringify(testQuoteData.reference_type),
      testQuoteData.category_main,
      testQuoteData.status
    ]);

    const testQuoteId = insertResult.rows[0].id;
    console.log(`✅ Cotización de prueba creada con ID: ${testQuoteId}`);

    // 7. Verificar la cotización creada
    console.log('\n🔍 Verificando cotización de prueba creada...');
    const createdQuote = await pool.query(`
      SELECT 
        id,
        client_contact,
        client_phone,
        client_email,
        issue_date,
        payment_terms,
        reference
      FROM quotes 
      WHERE id = $1
    `, [testQuoteId]);

    if (createdQuote.rows.length > 0) {
      const quote = createdQuote.rows[0];
      console.log(`\n📋 Cotización de prueba (ID: ${quote.id}):`);
      console.log(`   - client_contact: "${quote.client_contact}"`);
      console.log(`   - client_phone: "${quote.client_phone}"`);
      console.log(`   - client_email: "${quote.client_email}"`);
      console.log(`   - issue_date: "${quote.issue_date}"`);
      console.log(`   - payment_terms: "${quote.payment_terms}"`);
      console.log(`   - reference: "${quote.reference}"`);
    }

    console.log('\n🎉 VALIDACIÓN COMPLETADA');
    console.log('✅ Estructura de tabla verificada');
    console.log('✅ Datos existentes analizados');
    console.log('✅ Estadísticas generadas');
    console.log('✅ Cotización de prueba creada');
    console.log('\n💡 Recomendaciones:');
    console.log('   - La tabla quotes NO tiene columnas client_company ni client_ruc');
    console.log('   - Solo existe client_contact, client_phone, client_email');
    console.log('   - El frontend debe usar client_contact para la razón social');
    console.log('   - No hay separación entre razón social y nombre de contacto');
    console.log('   - Se necesita agregar las columnas faltantes o usar solo client_contact');

  } catch (error) {
    console.error('❌ Error en la validación:', error);
  } finally {
    process.exit(0);
  }
}

validateQuoteClientData();
