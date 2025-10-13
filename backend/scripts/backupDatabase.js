const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

async function backupDatabase() {
  try {
    console.log('💾 Iniciando backup de la base de datos...\n');
    
    // Crear directorio de backups si no existe
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
      console.log('📁 Directorio de backups creado');
    }
    
    // Generar nombre del archivo con timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupFileName = `crmgeofal_backup_${timestamp}.sql`;
    const backupPath = path.join(backupDir, backupFileName);
    
    console.log(`📋 Archivo de backup: ${backupFileName}`);
    
    // Configuración de la base de datos (ajustar según tu configuración)
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || '5432',
      database: process.env.DB_NAME || 'crmgeofal',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password'
    };
    
    // Comando pg_dump
    const pgDumpCommand = `pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.username} -d ${dbConfig.database} --no-password --verbose --clean --if-exists --create > "${backupPath}"`;
    
    console.log('🔄 Ejecutando pg_dump...');
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   Puerto: ${dbConfig.port}`);
    console.log(`   Base de datos: ${dbConfig.database}`);
    console.log(`   Usuario: ${dbConfig.username}`);
    
    // Ejecutar el comando
    await new Promise((resolve, reject) => {
      const child = exec(pgDumpCommand, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Error ejecutando pg_dump:', error.message);
          reject(error);
          return;
        }
        
        if (stderr) {
          console.log('📝 Salida de pg_dump:', stderr);
        }
        
        resolve();
      });
      
      // Configurar variables de entorno para la contraseña
      child.env = {
        ...process.env,
        PGPASSWORD: dbConfig.password
      };
    });
    
    // Verificar que el archivo se creó
    if (fs.existsSync(backupPath)) {
      const stats = fs.statSync(backupPath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      
      console.log('\n✅ Backup completado exitosamente');
      console.log(`📁 Archivo: ${backupPath}`);
      console.log(`📊 Tamaño: ${fileSizeMB} MB`);
      console.log(`📅 Fecha: ${new Date().toLocaleString()}`);
      
      // Crear también un backup comprimido
      const compressedFileName = `crmgeofal_backup_${timestamp}.tar.gz`;
      const compressedPath = path.join(backupDir, compressedFileName);
      
      console.log('\n🗜️ Creando versión comprimida...');
      
      await new Promise((resolve, reject) => {
        exec(`tar -czf "${compressedPath}" -C "${backupDir}" "${backupFileName}"`, (error) => {
          if (error) {
            console.log('⚠️ No se pudo crear versión comprimida:', error.message);
            resolve(); // No es crítico
          } else {
            const compressedStats = fs.statSync(compressedPath);
            const compressedSizeMB = (compressedStats.size / (1024 * 1024)).toFixed(2);
            console.log(`✅ Versión comprimida creada: ${compressedSizeMB} MB`);
            resolve();
          }
        });
      });
      
      // Listar archivos de backup
      console.log('\n📋 Archivos de backup disponibles:');
      const backupFiles = fs.readdirSync(backupDir)
        .filter(file => file.startsWith('crmgeofal_backup_'))
        .sort()
        .reverse()
        .slice(0, 5); // Mostrar solo los últimos 5
      
      backupFiles.forEach(file => {
        const filePath = path.join(backupDir, file);
        const fileStats = fs.statSync(filePath);
        const fileSizeMB = (fileStats.size / (1024 * 1024)).toFixed(2);
        const fileDate = fileStats.mtime.toLocaleString();
        console.log(`   - ${file} (${fileSizeMB} MB) - ${fileDate}`);
      });
      
    } else {
      throw new Error('El archivo de backup no se creó');
    }
    
  } catch (error) {
    console.error('❌ Error durante el backup:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  backupDatabase().then(() => {
    console.log('\n🎉 Backup de base de datos completado');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { backupDatabase };
