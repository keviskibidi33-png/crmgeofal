const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const Company = require('../models/company');
const User = require('../models/user');
const Project = require('../models/project');
const Quote = require('../models/quote');

class ClientImportController {
  
  /**
   * Limpiar todos los datos existentes excepto el usuario administrador
   */
  async cleanExistingData(req, res) {
    try {
      console.log('🧹 Iniciando limpieza de datos existentes...');
      
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Deshabilitar temporalmente las restricciones de llaves foráneas
        console.log('🔧 Deshabilitando restricciones de llaves foráneas...');
        await client.query('SET session_replication_role = replica;');
        
        // 1. Eliminar todas las cotizaciones
        console.log('🗑️ Eliminando cotizaciones...');
        await client.query('DELETE FROM quote_items');
        await client.query('DELETE FROM quotes');
        
        // 2. Eliminar todos los proyectos
        console.log('🗑️ Eliminando proyectos...');
        await client.query('DELETE FROM projects');
        
        // 3. Eliminar todos los clientes/empresas
        console.log('🗑️ Eliminando clientes...');
        await client.query('DELETE FROM companies');
        
        // 4. Eliminar todos los usuarios excepto administradores
        console.log('🗑️ Eliminando usuarios no administradores...');
        await client.query("DELETE FROM users WHERE role != 'admin'");
        
        // 5. Limpiar tablas de auditoría y logs
        console.log('🗑️ Limpiando logs y auditoría...');
        try {
          await client.query('DELETE FROM audit_log');
          await client.query('DELETE FROM audit_quotes');
          await client.query('DELETE FROM exports');
          await client.query('DELETE FROM uploads');
        } catch (e) { 
          console.log('Algunas tablas de auditoría no existen o ya están vacías'); 
        }
        
        // Restaurar restricciones de llaves foráneas
        console.log('🔧 Restaurando restricciones de llaves foráneas...');
        await client.query('SET session_replication_role = DEFAULT;');
        
        // 6. Verificar que existe al menos un administrador
        const adminCheck = await client.query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
        if (parseInt(adminCheck.rows[0].count) === 0) {
          throw new Error('No se puede proceder: debe existir al menos un usuario administrador');
        }
        
        await client.query('COMMIT');
        
        console.log('✅ Limpieza completada exitosamente');
        
        res.json({
          success: true,
          message: 'Datos existentes eliminados correctamente. Se mantuvieron solo los usuarios administradores.',
          data: {
            deletedQuotes: 'Todas las cotizaciones eliminadas',
            deletedProjects: 'Todos los proyectos eliminados',
            deletedClients: 'Todos los clientes eliminados',
            deletedUsers: 'Usuarios no administradores eliminados',
            remainingAdmins: parseInt(adminCheck.rows[0].count)
          }
        });
        
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
      
    } catch (error) {
      console.error('❌ Error en limpieza de datos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al limpiar datos existentes',
        error: error.message
      });
    }
  }

  /**
   * Procesar y validar archivo CSV
   */
  async processCSVFile(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      const errors = [];
      let rowNumber = 0;

      fs.createReadStream(filePath)
        .pipe(csv({
          separator: ';',
          skipEmptyLines: true,
          skipLinesWithError: true
        }))
        .on('data', (data) => {
          rowNumber++;
          
          // Saltar filas vacías o de encabezado
          if (rowNumber <= 4 || !data['No'] || data['No'].trim() === '' || data['No'].trim() === 'No') {
            return;
          }
          
          // Validar datos requeridos
          const validation = this.validateClientData(data, rowNumber);
          if (validation.isValid) {
            results.push(validation.data);
          } else {
            errors.push(...validation.errors);
          }
        })
        .on('end', () => {
          console.log(`📊 Procesamiento completado: ${results.length} registros válidos, ${errors.length} errores`);
          resolve({ validClients: results, errors });
        })
        .on('error', (error) => {
          console.error('❌ Error procesando CSV:', error);
          reject(error);
        });
    });
  }

  /**
   * Validar datos de cliente
   */
  validateClientData(row, rowNumber) {
    const errors = [];
    
    // Datos requeridos
    if (!row['PERSONA CONTACTO'] || row['PERSONA CONTACTO'].trim() === '') {
      errors.push(`Fila ${rowNumber}: Persona contacto es requerida`);
    }
    
    if (!row['RAZON SOCIAL'] || row['RAZON SOCIAL'].trim() === '') {
      errors.push(`Fila ${rowNumber}: Razón social es requerida`);
    }
    
    // Validar email si existe
    if (row['E-MAIL'] && row['E-MAIL'].trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row['E-MAIL'].trim())) {
        errors.push(`Fila ${rowNumber}: Email inválido: ${row['E-MAIL']}`);
      }
    }
    
    // Validar RUC si existe
    if (row['RUC'] && row['RUC'].trim() !== '') {
      const rucRegex = /^\d{11}$/;
      if (!rucRegex.test(row['RUC'].trim())) {
        errors.push(`Fila ${rowNumber}: RUC inválido: ${row['RUC']}`);
      }
    }
    
    if (errors.length > 0) {
      return { isValid: false, errors };
    }
    
    // Mapear datos a estructura de la base de datos
    const clientData = {
      // Información básica
      name: row['RAZON SOCIAL'].trim(),
      contact_name: row['PERSONA CONTACTO'].trim(),
      email: row['E-MAIL'] ? row['E-MAIL'].trim() : null,
      phone: row['NÚMERO CELULAR'] ? row['NÚMERO CELULAR'].trim() : null,
      
      // Identificación
      ruc: row['RUC'] ? row['RUC'].trim() : null,
      dni: null, // No hay DNI en el CSV
      
      // Tipo de cliente (determinar por RUC)
      type: row['RUC'] && row['RUC'].trim() !== '' ? 'empresa' : 'persona',
      
      // Estado del cliente
      status: this.mapClientStatus(row['ESTADO']),
      
      // Prioridad basada en alerta de actividad
      priority: this.determinePriority(row['ALERTA ACTIVIDAD']),
      
      // Información adicional
      address: null, // No disponible en CSV
      city: this.extractCityFromComments(row['COMENTARIOS']),
      sector: this.createSectorWithPriority(row['SERVICIO'], row['COMENTARIOS'], this.determinePriority(row['ALERTA ACTIVIDAD'])),
      
      // Metadatos de importación
      import_metadata: {
        original_row: rowNumber,
        fecha_creacion: row['FECHA CREACIÓN'],
        fecha_cierre: row['FECHA CIERRE'],
        actividad: row['ACTIVIDAD'],
        fecha_proxima_actividad: row['FECHA PRÓXIMO ACTIVIDAD'],
        alerta_actividad: row['ALERTA ACTIVIDAD'],
        comentarios: row['COMENTARIOS'],
        servicio: row['SERVICIO'],
        numero_cotizacion: row['N° COTIZACIÓN'],
        costo_sin_igv: row['COSTO SIN IGV']
      }
    };
    
    return { isValid: true, data: clientData };
  }

  /**
   * Mapear estado del cliente
   */
  mapClientStatus(estado) {
    if (!estado) return 'prospeccion';
    
    const estadoMap = {
      'PROSPECTO': 'prospeccion',
      'CONTACTADO': 'interesado',
      'ENVÍO DE COTIZACIÓN': 'cotizacion_enviada',
      'CIERRE-GANADO': 'ganado',
      'NO CONTESTO': 'perdido',
      'PENDIENTE': 'pendiente_cotizacion',
      'NEGOCIACIÓN': 'negociacion'
    };
    
    return estadoMap[estado.toUpperCase()] || 'prospeccion';
  }

  /**
   * Extraer ciudad de los comentarios
   */
  extractCityFromComments(comentarios) {
    if (!comentarios) return null;
    
    const cities = ['Lima', 'Arequipa', 'Cusco', 'Trujillo', 'Piura', 'Chiclayo', 'Iquitos', 'Huancayo', 'Jesús María'];
    
    for (const city of cities) {
      if (comentarios.toLowerCase().includes(city.toLowerCase())) {
        return city;
      }
    }
    
    return null;
  }

  /**
   * Determinar sector basado en servicio y comentarios
   */
  determineSector(servicio, comentarios) {
    if (servicio && servicio.trim() !== '') {
      return servicio.trim();
    }
    
    if (!comentarios) return 'General';
    
    const text = comentarios.toLowerCase();
    
    if (text.includes('construcción') || text.includes('construccion')) return 'Construcción';
    if (text.includes('minería') || text.includes('mineria')) return 'Minería';
    if (text.includes('ingeniería') || text.includes('ingenieria')) return 'Ingeniería';
    if (text.includes('laboratorio')) return 'Laboratorio';
    if (text.includes('consultoría') || text.includes('consultoria')) return 'Consultoría';
    if (text.includes('inmobiliaria')) return 'Inmobiliaria';
    
    return 'General';
  }

  /**
   * Determinar prioridad basada en alerta de actividad
   * Valores más negativos = menos urgente, valores menos negativos = más urgente
   */
  determinePriority(alertaActividad) {
    if (!alertaActividad || alertaActividad.trim() === '') {
      return 'normal';
    }
    
    const alerta = parseInt(alertaActividad.trim());
    
    // Si no es un número válido, retornar normal
    if (isNaN(alerta)) {
      return 'normal';
    }
    
    // Lógica invertida: valores menos negativos = más urgente
    if (alerta >= -3) {
      return 'urgent'; // Muy urgente (0 a -3 días)
    } else if (alerta >= -7) {
      return 'high'; // Alta prioridad (-4 a -7 días)
    } else if (alerta >= -14) {
      return 'normal'; // Prioridad normal (-8 a -14 días)
    } else {
      return 'low'; // Baja prioridad (-15 días o más)
    }
  }

  /**
   * Crear sector con prioridad integrada
   * Combina el sector original con la prioridad para usar el campo sector existente
   */
  createSectorWithPriority(servicio, comentarios, prioridad) {
    let sectorBase = 'General';
    
    // Determinar sector base
    if (servicio && servicio.trim() !== '') {
      sectorBase = servicio.trim();
    } else if (comentarios) {
      const text = comentarios.toLowerCase();
      
      if (text.includes('construcción') || text.includes('construccion')) sectorBase = 'Construcción';
      else if (text.includes('minería') || text.includes('mineria')) sectorBase = 'Minería';
      else if (text.includes('ingeniería') || text.includes('ingenieria')) sectorBase = 'Ingeniería';
      else if (text.includes('laboratorio')) sectorBase = 'Laboratorio';
      else if (text.includes('consultoría') || text.includes('consultoria')) sectorBase = 'Consultoría';
      else if (text.includes('inmobiliaria')) sectorBase = 'Inmobiliaria';
    }
    
    // Agregar prioridad al sector usando un formato especial
    // Formato: "SECTOR [PRIORIDAD: nivel]"
    const prioridadTexto = {
      'urgent': 'URGENTE',
      'high': 'ALTA',
      'normal': 'NORMAL',
      'low': 'BAJA'
    };
    
    return `${sectorBase} [PRIORIDAD: ${prioridadTexto[prioridad] || 'NORMAL'}]`;
  }

  /**
   * Extraer prioridad del sector
   * Parsea el campo sector para extraer la prioridad
   */
  extractPriorityFromSector(sector) {
    if (!sector) return 'normal';
    
    if (sector.includes('[PRIORIDAD: URGENTE]')) return 'urgent';
    if (sector.includes('[PRIORIDAD: ALTA]')) return 'high';
    if (sector.includes('[PRIORIDAD: BAJA]')) return 'low';
    
    return 'normal';
  }

  /**
   * Limpiar sector para mostrar
   * Remueve la información de prioridad del sector para mostrar solo el sector base
   */
  cleanSectorForDisplay(sector) {
    if (!sector) return 'General';
    
    // Remover la información de prioridad
    return sector.replace(/\s*\[PRIORIDAD:\s*\w+\]/g, '').trim() || 'General';
  }

  /**
   * Importar clientes desde archivo CSV
   */
  async importClients(req, res) {
    try {
      console.log('📥 Iniciando importación de clientes...');
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó archivo CSV'
        });
      }
      
      const filePath = req.file.path;
      console.log('📁 Archivo recibido:', filePath);
      
      // Procesar archivo CSV
      const { validClients, errors } = await this.processCSVFile(filePath);
      
      if (validClients.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se encontraron registros válidos en el archivo',
          errors
        });
      }
      
      // Importar clientes a la base de datos
      const importResults = await this.importClientsToDatabase(validClients);
      
      // Limpiar archivo temporal
      fs.unlinkSync(filePath);
      
      console.log('✅ Importación completada exitosamente');
      
      res.json({
        success: true,
        message: `Importación completada: ${importResults.successful} clientes importados, ${importResults.failed} fallaron`,
        data: {
          totalProcessed: validClients.length,
          successful: importResults.successful,
          failed: importResults.failed,
          errors: [...errors, ...importResults.errors],
          importedClients: importResults.importedClients
        }
      });
      
    } catch (error) {
      console.error('❌ Error en importación:', error);
      
      // Limpiar archivo temporal en caso de error
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.error('Error limpiando archivo temporal:', cleanupError);
        }
      }
      
      res.status(500).json({
        success: false,
        message: 'Error durante la importación',
        error: error.message
      });
    }
  }

  /**
   * Importar clientes a la base de datos
   */
  async importClientsToDatabase(clients) {
    const results = {
      successful: 0,
      failed: 0,
      errors: [],
      importedClients: []
    };
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      for (const clientData of clients) {
        try {
          // Verificar si el cliente ya existe (por RUC o email)
          let existingClient = null;
          
          if (clientData.ruc) {
            const rucCheck = await client.query(
              'SELECT id FROM companies WHERE ruc = $1',
              [clientData.ruc]
            );
            existingClient = rucCheck.rows[0];
          }
          
          if (!existingClient && clientData.email) {
            const emailCheck = await client.query(
              'SELECT id FROM companies WHERE email = $1',
              [clientData.email]
            );
            existingClient = emailCheck.rows[0];
          }
          
          if (existingClient) {
            // Actualizar cliente existente
            const updateQuery = `
              UPDATE companies SET
                name = $1,
                contact_name = $2,
                email = $3,
                phone = $4,
                type = $5,
                status = $6,
                city = $7,
                sector = $8,
                updated_at = NOW()
              WHERE id = $9
              RETURNING id, name, type, status, sector
            `;
            
            const updateResult = await client.query(updateQuery, [
              clientData.name,
              clientData.contact_name,
              clientData.email,
              clientData.phone,
              clientData.type,
              clientData.status,
              clientData.city,
              clientData.sector,
              existingClient.id
            ]);
            
            results.successful++;
            results.importedClients.push({
              id: updateResult.rows[0].id,
              name: updateResult.rows[0].name,
              type: updateResult.rows[0].type,
              status: updateResult.rows[0].status,
              action: 'updated'
            });
            
          } else {
            // Crear nuevo cliente
            const insertQuery = `
              INSERT INTO companies (
                name, contact_name, email, phone, ruc, dni, type, status,
                address, city, sector, created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
              RETURNING id, name, type, status, sector
            `;
            
            const insertResult = await client.query(insertQuery, [
              clientData.name,
              clientData.contact_name,
              clientData.email,
              clientData.phone,
              clientData.ruc,
              clientData.dni,
              clientData.type,
              clientData.status,
              clientData.address,
              clientData.city,
              clientData.sector
            ]);
            
            results.successful++;
            results.importedClients.push({
              id: insertResult.rows[0].id,
              name: insertResult.rows[0].name,
              type: insertResult.rows[0].type,
              status: insertResult.rows[0].status,
              action: 'created'
            });
          }
          
        } catch (error) {
          results.failed++;
          results.errors.push(`Error procesando cliente "${clientData.name}": ${error.message}`);
          console.error(`❌ Error procesando cliente:`, error);
        }
      }
      
      await client.query('COMMIT');
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
    return results;
  }

  /**
   * Obtener estadísticas de importación
   */
  async getImportStats(req, res) {
    try {
      const stats = await Company.getStats();
      
      res.json({
        success: true,
        data: stats
      });
      
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas',
        error: error.message
      });
    }
  }
}

module.exports = new ClientImportController();
