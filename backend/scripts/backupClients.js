const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

async function backupClients() {
  try {
    console.log('💾 Iniciando backup de clientes...\n');
    
    // 1. Obtener todos los clientes con información completa
    console.log('📋 Obteniendo datos de clientes...');
    const clientsResult = await pool.query(`
      SELECT 
        c.*,
        u.name as created_by_name,
        u.email as created_by_email
      FROM companies c
      LEFT JOIN users u ON c.created_by = u.id
      ORDER BY c.created_at DESC
    `);
    
    console.log(`📊 Clientes encontrados: ${clientsResult.rows.length}`);
    
    if (clientsResult.rows.length === 0) {
      console.log('⚠️ No hay clientes para hacer backup');
      return;
    }
    
    // 2. Obtener proyectos relacionados
    console.log('📋 Obteniendo proyectos relacionados...');
    const projectsResult = await pool.query(`
      SELECT 
        p.*,
        u.name as vendedor_name,
        u.email as vendedor_email
      FROM projects p
      LEFT JOIN users u ON p.vendedor_id = u.id
      WHERE p.company_id IN (${clientsResult.rows.map(c => c.id).join(',')})
      ORDER BY p.created_at DESC
    `);
    
    console.log(`📊 Proyectos encontrados: ${projectsResult.rows.length}`);
    
    // 3. Obtener cotizaciones relacionadas
    console.log('📋 Obteniendo cotizaciones relacionadas...');
    const quotesResult = await pool.query(`
      SELECT 
        q.*,
        u.name as created_by_name,
        u.email as created_by_email
      FROM quotes q
      LEFT JOIN users u ON q.created_by = u.id
      WHERE q.project_id IN (${projectsResult.rows.map(p => p.id).join(',')})
      ORDER BY q.created_at DESC
    `);
    
    console.log(`📊 Cotizaciones encontradas: ${quotesResult.rows.length}`);
    
    // 4. Obtener items de cotizaciones
    console.log('📋 Obteniendo items de cotizaciones...');
    const quoteItemsResult = await pool.query(`
      SELECT qi.*
      FROM quote_items qi
      WHERE qi.quote_id IN (${quotesResult.rows.map(q => q.id).join(',')})
      ORDER BY qi.id
    `);
    
    console.log(`📊 Items de cotizaciones encontrados: ${quoteItemsResult.rows.length}`);
    
    // 5. Estructurar datos para backup
    const backupData = {
      metadata: {
        created_at: new Date().toISOString(),
        version: "1.0",
        description: "Backup completo de clientes, proyectos y cotizaciones",
        total_clients: clientsResult.rows.length,
        total_projects: projectsResult.rows.length,
        total_quotes: quotesResult.rows.length,
        total_quote_items: quoteItemsResult.rows.length
      },
      clients: clientsResult.rows.map(client => {
        // Remover campos que no necesitamos en el backup
        const { created_by_name, created_by_email, ...clientData } = client;
        return {
          ...clientData,
          backup_metadata: {
            created_by_name,
            created_by_email
          }
        };
      }),
      projects: projectsResult.rows.map(project => {
        const { vendedor_name, vendedor_email, ...projectData } = project;
        return {
          ...projectData,
          backup_metadata: {
            vendedor_name,
            vendedor_email
          }
        };
      }),
      quotes: quotesResult.rows.map(quote => {
        const { created_by_name, created_by_email, ...quoteData } = quote;
        return {
          ...quoteData,
          backup_metadata: {
            created_by_name,
            created_by_email
          }
        };
      }),
      quote_items: quoteItemsResult.rows
    };
    
    // 6. Crear directorio de backups si no existe
    const backupDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // 7. Generar nombre de archivo con timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `clients_backup_${timestamp}.json`;
    const filepath = path.join(backupDir, filename);
    
    // 8. Guardar backup
    console.log(`\n💾 Guardando backup en: ${filepath}`);
    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2), 'utf8');
    
    // 9. Mostrar resumen
    console.log('\n📊 RESUMEN DEL BACKUP:');
    console.log(`   📁 Archivo: ${filename}`);
    console.log(`   📍 Ubicación: ${filepath}`);
    console.log(`   📏 Tamaño: ${(fs.statSync(filepath).size / 1024).toFixed(2)} KB`);
    console.log(`   🏢 Clientes: ${backupData.metadata.total_clients}`);
    console.log(`   📋 Proyectos: ${backupData.metadata.total_projects}`);
    console.log(`   💰 Cotizaciones: ${backupData.metadata.total_quotes}`);
    console.log(`   📦 Items: ${backupData.metadata.total_quote_items}`);
    
    console.log('\n✅ Backup completado exitosamente!');
    
    return {
      success: true,
      filepath,
      filename,
      metadata: backupData.metadata
    };
    
  } catch (error) {
    console.error('❌ Error durante el backup:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Función para listar backups existentes
async function listBackups() {
  try {
    const backupDir = path.join(__dirname, '..', 'backups');
    
    if (!fs.existsSync(backupDir)) {
      console.log('📁 No hay directorio de backups');
      return [];
    }
    
    const files = fs.readdirSync(backupDir)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filepath = path.join(backupDir, file);
        const stats = fs.statSync(filepath);
        return {
          filename: file,
          filepath,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        };
      })
      .sort((a, b) => b.created - a.created);
    
    console.log('📁 Backups disponibles:');
    files.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.filename}`);
      console.log(`      📏 Tamaño: ${(file.size / 1024).toFixed(2)} KB`);
      console.log(`      📅 Creado: ${file.created.toLocaleString()}`);
      console.log('');
    });
    
    return files;
    
  } catch (error) {
    console.error('❌ Error listando backups:', error);
    return [];
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--list') || args.includes('-l')) {
    await listBackups();
  } else {
    await backupClients();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().then(() => {
    console.log('\n🎉 Proceso completado');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { backupClients, listBackups };
