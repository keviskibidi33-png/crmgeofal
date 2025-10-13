const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const pool = require('../config/db');
const ClientImportController = require('../controllers/clientImportController');

async function importClients() {
  try {
    console.log('🚀 Iniciando importación de clientes...');
    
    const csvPath = path.join(__dirname, '../../DocumentosExcel/SEGUIMIENTO DE CLIENTES 2025 (1).csv');
    
    if (!fs.existsSync(csvPath)) {
      throw new Error(`Archivo CSV no encontrado: ${csvPath}`);
    }
    
    console.log('📁 Archivo encontrado:', csvPath);
    
    // Leer el archivo CSV con separador punto y coma
    const rows = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv({
          separator: ';',
          skipEmptyLines: true,
          skipLinesWithError: true
        }))
        .on('data', (row) => {
          rows.push(row);
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    console.log(`📊 Total de filas leídas: ${rows.length}`);
    
    if (rows.length === 0) {
      throw new Error('El archivo CSV está vacío');
    }
    
    // Mostrar las primeras filas para verificar
    console.log('📋 Primeras 3 filas del archivo:');
    rows.slice(0, 3).forEach((row, index) => {
      console.log(`Fila ${index + 1}:`, Object.keys(row).map(key => `${key}: ${row[key]}`).join(', '));
    });
    
    // Simular la importación usando el controlador
    const mockReq = {
      file: {
        path: csvPath,
        originalname: 'SEGUIMIENTO DE CLIENTES 2025 (1).csv'
      }
    };
    
    const mockRes = {
      json: (data) => {
        console.log('✅ Importación completada:', JSON.stringify(data, null, 2));
      },
      status: (code) => ({
        json: (data) => {
          console.log(`❌ Error ${code}:`, JSON.stringify(data, null, 2));
        }
      })
    };
    
    await ClientImportController.importClients(mockReq, mockRes);
    
  } catch (error) {
    console.error('❌ Error en importación:', error);
    process.exit(1);
  }
}

// Ejecutar la importación
importClients();
