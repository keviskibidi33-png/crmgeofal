const pool = require('../config/db');

async function testCompaniesAPI() {
  try {
    console.log('🧪 PROBANDO API DE COMPANIES...\n');
    
    // 1. Probar función getAll
    console.log('1️⃣ Probando Company.getAll...');
    const Company = require('../models/company');
    const result = await Company.getAll({ page: 1, limit: 5 });
    console.log(`   ✅ getAll: ${result.rows.length} registros, total: ${result.total}`);
    
    // 2. Probar función getStats
    console.log('\n2️⃣ Probando Company.getStats...');
    const stats = await Company.getStats();
    console.log('   ✅ getStats:', stats);
    
    // 3. Probar función getFilterOptions
    console.log('\n3️⃣ Probando Company.getFilterOptions...');
    const options = await Company.getFilterOptions();
    console.log('   ✅ getFilterOptions:', {
      cities: options.cities.length,
      sectors: options.sectors.length,
      types: options.types.length
    });
    
    // 4. Verificar datos en la base de datos
    console.log('\n4️⃣ Verificando datos en la base de datos...');
    const totalCompanies = await pool.query('SELECT COUNT(*) as total FROM companies');
    const companiesWithEmail = await pool.query('SELECT COUNT(*) as total FROM companies WHERE email IS NOT NULL AND email <> \'\'');
    const companiesWithPhone = await pool.query('SELECT COUNT(*) as total FROM companies WHERE phone IS NOT NULL AND phone <> \'\'');
    
    console.log(`   📊 Total empresas: ${totalCompanies.rows[0].total}`);
    console.log(`   📧 Con email: ${companiesWithEmail.rows[0].total}`);
    console.log(`   📞 Con teléfono: ${companiesWithPhone.rows[0].total}`);
    
    // 5. Verificar tipos de empresas
    console.log('\n5️⃣ Verificando tipos de empresas...');
    const typeStats = await pool.query(`
      SELECT type, COUNT(*) as count 
      FROM companies 
      GROUP BY type 
      ORDER BY type
    `);
    
    typeStats.rows.forEach(row => {
      console.log(`   ${row.type}: ${row.count} empresas`);
    });
    
    console.log('\n✅ TODAS LAS PRUEBAS COMPLETADAS');
    console.log('🎯 La API de companies está funcionando correctamente');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  } finally {
    await pool.end();
  }
}

testCompaniesAPI();
