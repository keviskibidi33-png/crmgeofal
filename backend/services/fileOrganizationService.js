const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');

class FileOrganizationService {
  constructor() {
    this.baseUploadDir = path.join(__dirname, '../uploads');
    this.maxStorageSize = 5 * 1024 * 1024 * 1024; // 5GB límite
    this.compressionThreshold = 0.9; // 90%
    this.alertThresholds = {
      yellow: 0.7,  // 70%
      orange: 0.85, // 85%
      red: 0.95     // 95%
    };
  }

  // Obtener la ruta del mes actual
  getCurrentMonthPath() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return path.join(this.baseUploadDir, year.toString(), month);
  }

  // Obtener la ruta del mes siguiente
  getNextMonthPath() {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const year = nextMonth.getFullYear();
    const month = String(nextMonth.getMonth() + 1).padStart(2, '0');
    return path.join(this.baseUploadDir, year.toString(), month);
  }

  // Crear carpetas anticipadamente (versión inteligente)
  async createAnticipatoryFolders() {
    try {
      const now = new Date();
      const currentMonthPath = this.getCurrentMonthPath();
      const nextMonthPath = this.getNextMonthPath();
      const createdFolders = [];
      const existingFolders = [];

      // Verificar y crear carpeta del mes actual
      try {
        await fs.access(currentMonthPath);
        existingFolders.push({
          path: currentMonthPath,
          type: 'current',
          status: 'exists'
        });
        console.log(`✅ Carpeta del mes actual ya existe: ${currentMonthPath}`);
      } catch (error) {
        await fs.mkdir(currentMonthPath, { recursive: true });
        createdFolders.push({
          path: currentMonthPath,
          type: 'current',
          status: 'created'
        });
        console.log(`📁 Carpeta del mes actual creada: ${currentMonthPath}`);
      }

      // Verificar y crear carpeta del mes siguiente
      try {
        await fs.access(nextMonthPath);
        existingFolders.push({
          path: nextMonthPath,
          type: 'next',
          status: 'exists'
        });
        console.log(`✅ Carpeta del mes siguiente ya existe: ${nextMonthPath}`);
      } catch (error) {
        await fs.mkdir(nextMonthPath, { recursive: true });
        createdFolders.push({
          path: nextMonthPath,
          type: 'next',
          status: 'created'
        });
        console.log(`📁 Carpeta del mes siguiente creada: ${nextMonthPath}`);
      }

      // Crear carpetas para los próximos 2 meses si estamos cerca del final del mes
      const daysUntilMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();
      
      if (daysUntilMonthEnd <= 7) { // Si quedan 7 días o menos
        console.log(`⚠️ Quedan ${daysUntilMonthEnd} días para el final del mes. Creando carpetas adicionales...`);
        
        // Crear carpeta del mes +2
        const monthAfterNext = new Date(now.getFullYear(), now.getMonth() + 2, 1);
        const yearAfterNext = monthAfterNext.getFullYear();
        const monthAfterNextNum = String(monthAfterNext.getMonth() + 1).padStart(2, '0');
        const monthAfterNextPath = path.join(this.baseUploadDir, yearAfterNext.toString(), monthAfterNextNum);
        
        try {
          await fs.access(monthAfterNextPath);
          existingFolders.push({
            path: monthAfterNextPath,
            type: 'future',
            status: 'exists'
          });
          console.log(`✅ Carpeta del mes +2 ya existe: ${monthAfterNextPath}`);
        } catch (error) {
          await fs.mkdir(monthAfterNextPath, { recursive: true });
          createdFolders.push({
            path: monthAfterNextPath,
            type: 'future',
            status: 'created'
          });
          console.log(`📁 Carpeta del mes +2 creada: ${monthAfterNextPath}`);
        }
      }

      return {
        currentMonth: currentMonthPath,
        nextMonth: nextMonthPath,
        createdFolders,
        existingFolders,
        daysUntilMonthEnd,
        message: createdFolders.length > 0 
          ? `Se crearon ${createdFolders.length} carpetas nuevas`
          : `Todas las carpetas necesarias ya existen (${existingFolders.length} verificadas)`
      };
    } catch (error) {
      console.error('❌ Error creando carpetas anticipatorias:', error);
      throw error;
    }
  }

  // Calcular tamaño total de archivos
  async calculateTotalSize() {
    try {
      let totalSize = 0;
      
      const calculateDirSize = async (dirPath) => {
        try {
          const items = await fs.readdir(dirPath);
          
          for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stats = await fs.stat(itemPath);
            
            if (stats.isDirectory()) {
              totalSize += await calculateDirSize(itemPath);
            } else {
              totalSize += stats.size;
            }
          }
        } catch (error) {
          // Ignorar errores de directorios que no existen
        }
        
        return totalSize;
      };

      // Verificar si el directorio base existe
      try {
        await fs.access(this.baseUploadDir);
        totalSize = await calculateDirSize(this.baseUploadDir);
      } catch (error) {
        // Si no existe, crear el directorio
        await fs.mkdir(this.baseUploadDir, { recursive: true });
        totalSize = 0;
      }
      
      return totalSize;
    } catch (error) {
      console.error('❌ Error calculando tamaño total:', error);
      return 0;
    }
  }

  // Obtener estadísticas de almacenamiento
  async getStorageStats() {
    try {
      const totalSize = await this.calculateTotalSize();
      const usagePercentage = (totalSize / this.maxStorageSize) * 100;
      
      const stats = {
        totalSize,
        maxSize: this.maxStorageSize,
        usagePercentage: Math.round(usagePercentage * 100) / 100,
        freeSpace: this.maxStorageSize - totalSize,
        alertLevel: this.getAlertLevel(usagePercentage / 100),
        folders: await this.getFolderStats()
      };

      return stats;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  // Determinar nivel de alerta
  getAlertLevel(usageRatio) {
    if (usageRatio >= this.alertThresholds.red) return 'red';
    if (usageRatio >= this.alertThresholds.orange) return 'orange';
    if (usageRatio >= this.alertThresholds.yellow) return 'yellow';
    return 'green';
  }

  // Obtener estadísticas por carpetas
  async getFolderStats() {
    try {
      const folders = [];
      
      // Verificar si el directorio base existe
      try {
        await fs.access(this.baseUploadDir);
      } catch (error) {
        await fs.mkdir(this.baseUploadDir, { recursive: true });
        return folders;
      }
      
      const years = await fs.readdir(this.baseUploadDir).catch(() => []);
      
      for (const year of years) {
        const yearPath = path.join(this.baseUploadDir, year);
        const yearStats = await fs.stat(yearPath).catch(() => null);
        
        if (yearStats && yearStats.isDirectory()) {
          const months = await fs.readdir(yearPath).catch(() => []);
          
          for (const month of months) {
            const monthPath = path.join(yearPath, month);
            const monthStats = await fs.stat(monthPath).catch(() => null);
            
            if (monthStats && monthStats.isDirectory()) {
              const size = await this.calculateDirSize(monthPath);
              folders.push({
                year,
                month,
                path: monthPath,
                size,
                fileCount: await this.countFiles(monthPath)
              });
            }
          }
        }
      }
      
      return folders.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de carpetas:', error);
      return [];
    }
  }

  // Contar archivos en un directorio
  async countFiles(dirPath) {
    try {
      let count = 0;
      const items = await fs.readdir(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = await fs.stat(itemPath);
        
        if (stats.isFile()) {
          count++;
        } else if (stats.isDirectory()) {
          count += await this.countFiles(itemPath);
        }
      }
      
      return count;
    } catch (error) {
      return 0;
    }
  }

  // Comprimir carpetas antiguas
  async compressOldFolders() {
    try {
      const stats = await this.getStorageStats();
      
      if (stats.usagePercentage / 100 >= this.compressionThreshold) {
        console.log('🗜️ Iniciando compresión de carpetas antiguas...');
        
        const folders = stats.folders;
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        
        // Comprimir carpetas de más de 3 meses
        for (const folder of folders) {
          const folderYear = parseInt(folder.year);
          const folderMonth = parseInt(folder.month);
          
          const folderDate = new Date(folderYear, folderMonth - 1);
          const monthsDiff = (currentYear - folderYear) * 12 + (currentMonth - folderMonth);
          
          if (monthsDiff > 3) {
            await this.compressFolder(folder.path);
            console.log(`✅ Carpeta comprimida: ${folder.year}/${folder.month}`);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error comprimiendo carpetas:', error);
    }
  }

  // Comprimir una carpeta específica
  async compressFolder(folderPath) {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(`${folderPath}.zip`);
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      output.on('close', () => {
        console.log(`📦 Archivo comprimido: ${archive.pointer()} bytes`);
        resolve();
      });
      
      archive.on('error', (err) => {
        reject(err);
      });
      
      archive.pipe(output);
      archive.directory(folderPath, false);
      archive.finalize();
    });
  }

  // Obtener ruta optimizada para un archivo
  async getOptimalPath(filename, projectId) {
    try {
      // Crear carpetas anticipatorias
      const { currentMonth } = await this.createAnticipatoryFolders();
      
      // Crear subcarpeta por proyecto
      const projectPath = path.join(currentMonth, `project_${projectId}`);
      await fs.mkdir(projectPath, { recursive: true });
      
      return path.join(projectPath, filename);
    } catch (error) {
      console.error('❌ Error obteniendo ruta óptima:', error);
      throw error;
    }
  }

  // Monitoreo automático
  async startMonitoring() {
    console.log('🔍 Iniciando monitoreo de almacenamiento...');
    
    // Verificar cada hora
    setInterval(async () => {
      try {
        const stats = await this.getStorageStats();
        
        // Crear carpetas anticipatorias
        await this.createAnticipatoryFolders();
        
        // Comprimir si es necesario
        if (stats.alertLevel === 'red') {
          await this.compressOldFolders();
        }
        
        // Log de estado
        console.log(`📊 Almacenamiento: ${stats.usagePercentage}% (${stats.alertLevel})`);
        
      } catch (error) {
        console.error('❌ Error en monitoreo:', error);
      }
    }, 60 * 60 * 1000); // Cada hora
  }
}

module.exports = new FileOrganizationService();
