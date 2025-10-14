const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

async function restoreClients(backupFile) {
  try {
    console.log('🔄 Iniciando restauración de clientes...\n');
    
    // 1. Verificar que el archivo existe
    if (!fs.existsSync(backupFile)) {
      console.error(`❌ Archivo de backup no encontrado: ${backupFile}`);
      return { success: false, error: 'Archivo no encontrado' };
    }
    
    // 2. Leer y parsear el archivo de backup
    console.log(`📖 Leyendo archivo de backup: ${backupFile}`);
    const backupContent = fs.readFileSync(backupFile, 'utf8');
    const backupData = JSON.parse(backupContent);
    
    console.log('📊 Información del backup:');
    console.log(`   📅 Creado: ${backupData.metadata.created_at}`);
    console.log(`   🏢 Clientes: ${backupData.metadata.total_clients}`);
    console.log(`   📋 Proyectos: ${backupData.metadata.total_projects}`);
    console.log(`   💰 Cotizaciones: ${backupData.metadata.total_quotes}`);
    console.log(`   📦 Items: ${backupData.metadata.total_quote_items}`);
    
    // 3. Obtener usuarios actuales para mapear IDs
    console.log('\n👥 Obteniendo usuarios actuales...');
    const usersResult = await pool.query(`
      SELECT id, name, email, role 
      FROM users 
      ORDER BY role, name
    `);
    
    console.log(`📊 Usuarios encontrados: ${usersResult.rows.length}`);
    usersResult.rows.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
    });
    
    // 4. Crear mapeo de usuarios (por email)
    const userMap = new Map();
    usersResult.rows.forEach(user => {
      userMap.set(user.email, user.id);
    });
    
    // 5. Restaurar clientes
    console.log('\n🏢 Restaurando clientes...');
    const clientIdMap = new Map(); // Mapeo de IDs antiguos a nuevos
    
    for (const client of backupData.clients) {
      const oldId = client.id;
      
      // Buscar usuario por email o usar el primero disponible
      let createdBy = null;
      if (client.backup_metadata?.created_by_email) {
        createdBy = userMap.get(client.backup_metadata.created_by_email);
      }
      if (!createdBy && usersResult.rows.length > 0) {
        createdBy = usersResult.rows[0].id; // Usar el primer usuario disponible
      }
      
      // Remover campos que no necesitamos
      const { id, backup_metadata, ...clientData } = client;
      
      // Insertar cliente
      const insertResult = await pool.query(`
        INSERT INTO companies (
          name, ruc, address, phone, email, contact_name, 
          sector, city, priority, actividad, servicios, 
          status, type, dni, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING id
      `, [
        clientData.name,
        clientData.ruc,
        clientData.address,
        clientData.phone,
        clientData.email,
        clientData.contact_name,
        clientData.sector,
        clientData.city,
        clientData.priority,
        clientData.actividad,
        clientData.servicios,
        clientData.status || 'prospeccion',
        clientData.type || 'empresa',
        clientData.dni || null,
        clientData.created_at || new Date(),
        clientData.updated_at || new Date()
      ]);
      
      const newId = insertResult.rows[0].id;
      clientIdMap.set(oldId, newId);
      
      console.log(`   ✅ ${clientData.name} (${clientData.ruc}) - ID: ${oldId} → ${newId}`);
    }
    
    // 6. Restaurar proyectos
    console.log('\n📋 Restaurando proyectos...');
    const projectIdMap = new Map();
    
    for (const project of backupData.projects) {
      const oldId = project.id;
      const newCompanyId = clientIdMap.get(project.company_id);
      
      if (!newCompanyId) {
        console.log(`   ⚠️ Saltando proyecto ${project.name} - cliente no encontrado`);
        continue;
      }
      
      // Buscar vendedor por email o usar el primero disponible
      let vendedorId = null;
      if (project.backup_metadata?.vendedor_email) {
        vendedorId = userMap.get(project.backup_metadata.vendedor_email);
      }
      if (!vendedorId && usersResult.rows.length > 0) {
        vendedorId = usersResult.rows[0].id;
      }
      
      const { id, backup_metadata, ...projectData } = project;
      
      // Insertar proyecto
      const insertResult = await pool.query(`
        INSERT INTO projects (
          company_id, name, location, vendedor_id, description,
          start_date, end_date, budget, priority, status,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id
      `, [
        newCompanyId,
        projectData.name,
        projectData.location,
        vendedorId,
        projectData.description,
        projectData.start_date,
        projectData.end_date,
        projectData.budget,
        projectData.priority,
        projectData.status || 'activo',
        projectData.created_at || new Date(),
        projectData.updated_at || new Date()
      ]);
      
      const newId = insertResult.rows[0].id;
      projectIdMap.set(oldId, newId);
      
      console.log(`   ✅ ${projectData.name} - ID: ${oldId} → ${newId}`);
    }
    
    // 7. Restaurar cotizaciones
    console.log('\n💰 Restaurando cotizaciones...');
    const quoteIdMap = new Map();
    
    for (const quote of backupData.quotes) {
      const oldId = quote.id;
      const newProjectId = projectIdMap.get(quote.project_id);
      
      if (!newProjectId) {
        console.log(`   ⚠️ Saltando cotización ${quote.quote_number} - proyecto no encontrado`);
        continue;
      }
      
      // Buscar usuario por email o usar el primero disponible
      let createdBy = null;
      if (quote.backup_metadata?.created_by_email) {
        createdBy = userMap.get(quote.backup_metadata.created_by_email);
      }
      if (!createdBy && usersResult.rows.length > 0) {
        createdBy = usersResult.rows[0].id;
      }
      
      const { id, backup_metadata, ...quoteData } = quote;
      
      // Insertar cotización
      const insertResult = await pool.query(`
        INSERT INTO quotes (
          project_id, quote_number, subtotal, igv, total_amount, igv_amount,
          status, meta, created_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id
      `, [
        newProjectId,
        quoteData.quote_number,
        quoteData.subtotal,
        quoteData.igv,
        quoteData.total_amount,
        quoteData.igv_amount,
        quoteData.status || 'borrador',
        JSON.stringify(quoteData.meta),
        createdBy,
        quoteData.created_at || new Date(),
        quoteData.updated_at || new Date()
      ]);
      
      const newId = insertResult.rows[0].id;
      quoteIdMap.set(oldId, newId);
      
      console.log(`   ✅ ${quoteData.quote_number} - ID: ${oldId} → ${newId}`);
    }
    
    // 8. Restaurar items de cotizaciones
    console.log('\n📦 Restaurando items de cotizaciones...');
    let itemsRestored = 0;
    
    for (const item of backupData.quote_items) {
      const newQuoteId = quoteIdMap.get(item.quote_id);
      
      if (!newQuoteId) {
        console.log(`   ⚠️ Saltando item - cotización no encontrada`);
        continue;
      }
      
      const { id, ...itemData } = item;
      
      // Insertar item
      await pool.query(`
        INSERT INTO quote_items (
          quote_id, code, description, norm, quantity,
          unit_price, partial_price, total_price, subservice_id, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        newQuoteId,
        itemData.code,
        itemData.description,
        itemData.norm,
        itemData.quantity,
        itemData.unit_price,
        itemData.partial_price,
        itemData.total_price,
        itemData.subservice_id,
        itemData.created_at || new Date()
      ]);
      
      itemsRestored++;
    }
    
    console.log(`   ✅ Items restaurados: ${itemsRestored}`);
    
    // 9. Mostrar resumen final
    console.log('\n📊 RESUMEN DE RESTAURACIÓN:');
    console.log(`   🏢 Clientes restaurados: ${clientIdMap.size}`);
    console.log(`   📋 Proyectos restaurados: ${projectIdMap.size}`);
    console.log(`   💰 Cotizaciones restauradas: ${quoteIdMap.size}`);
    console.log(`   📦 Items restaurados: ${itemsRestored}`);
    
    console.log('\n✅ Restauración completada exitosamente!');
    
    return {
      success: true,
      restored: {
        clients: clientIdMap.size,
        projects: projectIdMap.size,
        quotes: quoteIdMap.size,
        items: itemsRestored
      }
    };
    
  } catch (error) {
    console.error('❌ Error durante la restauración:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Función para listar backups disponibles
async function listAvailableBackups() {
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
          created: stats.birthtime
        };
      })
      .sort((a, b) => b.created - a.created);
    
    console.log('📁 Backups disponibles para restauración:');
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
    await listAvailableBackups();
  } else if (args.length > 0) {
    const backupFile = args[0];
    await restoreClients(backupFile);
  } else {
    console.log('❌ Uso: node restoreClients.js <archivo_backup.json>');
    console.log('   o: node restoreClients.js --list (para listar backups disponibles)');
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

module.exports = { restoreClients, listAvailableBackups };
