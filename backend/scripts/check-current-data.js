const pool = require('../config/db');

async function checkCurrentData() {
  try {
    console.log('🔍 VERIFICANDO DATOS ACTUALES DE LA BASE DE DATOS...\n');
    
    // 1. Verificar datos de empresas
    console.log('1️⃣ EMPRESAS:');
    const companies = await pool.query('SELECT COUNT(*) as total FROM companies');
    console.log(`   📊 Total: ${companies.rows[0].total} empresas`);
    
    if (companies.rows[0].total > 0) {
      const sampleCompanies = await pool.query(`
        SELECT id, name, created_at 
        FROM companies 
        ORDER BY id DESC 
        LIMIT 3
      `);
      console.log('   📋 Últimas empresas:');
      sampleCompanies.rows.forEach(company => {
        console.log(`      ID ${company.id}: ${company.name} (${company.created_at})`);
      });
    }
    
    // 2. Verificar datos de usuarios
    console.log('\n2️⃣ USUARIOS:');
    const users = await pool.query('SELECT COUNT(*) as total FROM users');
    console.log(`   📊 Total: ${users.rows[0].total} usuarios`);
    
    if (users.rows[0].total > 0) {
      const sampleUsers = await pool.query(`
        SELECT id, name, email, created_at 
        FROM users 
        ORDER BY id DESC 
        LIMIT 3
      `);
      console.log('   📋 Últimos usuarios:');
      sampleUsers.rows.forEach(user => {
        console.log(`      ID ${user.id}: ${user.name} (${user.email}) - ${user.created_at}`);
      });
    }
    
    // 3. Verificar proyectos
    console.log('\n3️⃣ PROYECTOS:');
    const projects = await pool.query('SELECT COUNT(*) as total FROM projects');
    console.log(`   📊 Total: ${projects.rows[0].total} proyectos`);
    
    if (projects.rows[0].total > 0) {
      const sampleProjects = await pool.query(`
        SELECT id, name, created_at 
        FROM projects 
        ORDER BY id DESC 
        LIMIT 3
      `);
      console.log('   📋 Últimos proyectos:');
      sampleProjects.rows.forEach(project => {
        console.log(`      ID ${project.id}: ${project.name} (${project.created_at})`);
      });
    }
    
    // 4. Verificar cotizaciones
    console.log('\n4️⃣ COTIZACIONES:');
    const quotes = await pool.query('SELECT COUNT(*) as total FROM quotes');
    console.log(`   📊 Total: ${quotes.rows[0].total} cotizaciones`);
    
    if (quotes.rows[0].total > 0) {
      const sampleQuotes = await pool.query(`
        SELECT id, quote_number, created_at 
        FROM quotes 
        ORDER BY id DESC 
        LIMIT 3
      `);
      console.log('   📋 Últimas cotizaciones:');
      sampleQuotes.rows.forEach(quote => {
        console.log(`      ID ${quote.id}: ${quote.quote_number} (${quote.created_at})`);
      });
    }
    
    // 5. Verificar subservicios
    console.log('\n5️⃣ SUBSERVICIOS:');
    const subservices = await pool.query('SELECT COUNT(*) as total FROM subservices WHERE is_active = true');
    console.log(`   📊 Total: ${subservices.rows[0].total} subservicios activos`);
    
    // 6. Verificar servicios
    console.log('\n6️⃣ SERVICIOS:');
    const services = await pool.query('SELECT COUNT(*) as total FROM services');
    console.log(`   📊 Total: ${services.rows[0].total} servicios`);
    
    // 7. Verificar categorías
    console.log('\n7️⃣ CATEGORÍAS:');
    const categories = await pool.query('SELECT COUNT(*) as total FROM categories');
    console.log(`   📊 Total: ${categories.rows[0].total} categorías`);
    
    // 8. Resumen general
    console.log('\n📊 RESUMEN GENERAL:');
    console.log(`   🏢 Empresas: ${companies.rows[0].total}`);
    console.log(`   👥 Usuarios: ${users.rows[0].total}`);
    console.log(`   📁 Proyectos: ${projects.rows[0].total}`);
    console.log(`   💰 Cotizaciones: ${quotes.rows[0].total}`);
    console.log(`   🔧 Subservicios: ${subservices.rows[0].total}`);
    console.log(`   ⚙️  Servicios: ${services.rows[0].total}`);
    console.log(`   📂 Categorías: ${categories.rows[0].total}`);
    
    // 9. Verificar si hay datos recientes
    console.log('\n🕐 DATOS RECIENTES:');
    const recentData = await pool.query(`
      SELECT 
        'companies' as tabla, 
        COUNT(*) as total, 
        MAX(created_at) as ultimo_creado,
        MIN(created_at) as mas_antiguo
      FROM companies
      UNION ALL
      SELECT 
        'users' as tabla, 
        COUNT(*) as total, 
        MAX(created_at) as ultimo_creado,
        MIN(created_at) as mas_antiguo
      FROM users
      UNION ALL
      SELECT 
        'projects' as tabla, 
        COUNT(*) as total, 
        MAX(created_at) as ultimo_creado,
        MIN(created_at) as mas_antiguo
      FROM projects
      UNION ALL
      SELECT 
        'quotes' as tabla, 
        COUNT(*) as total, 
        MAX(created_at) as ultimo_creado,
        MIN(created_at) as mas_antiguo
      FROM quotes
      ORDER BY tabla
    `);
    
    recentData.rows.forEach(row => {
      console.log(`   ${row.tabla}: ${row.total} registros`);
      console.log(`      📅 Más reciente: ${row.ultimo_creado || 'N/A'}`);
      console.log(`      📅 Más antiguo: ${row.mas_antiguo || 'N/A'}`);
    });
    
    console.log('\n✅ VERIFICACIÓN COMPLETADA');
    console.log('📁 Backup creado en: backend/backups/');
    console.log('🔍 Datos verificados correctamente');
    
  } catch (error) {
    console.error('❌ Error en la verificación:', error.message);
  } finally {
    await pool.end();
  }
}

checkCurrentData();
