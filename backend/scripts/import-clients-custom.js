const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

// Mapeo de columnas del CSV a campos de la base de datos (nombres exactos del CSV)
const COLUMN_MAPPING = {
  'No': 'numero',
  'FECHA CREACIN': 'fecha_creacion',
  'ASESOR': 'asesor',
  'PERSONA CONTACTO': 'persona_contacto',
  'NéMERO CELULAR': 'phone',  // Nombre exacto del CSV
  'E-MAIL': 'email',
  'RAZON SOCIAL': 'razon_social',
  'RUC': 'ruc',
  'ESTADO': 'estado',
  'FECHA  CIERRE': 'fecha_cierre',
  'ACTIVIDAD': 'actividad',
  'FECHA PRXIMO ACTIVIDAD': 'fecha_proximo_actividad',
  'ALERTA ACTIVIDAD': 'alerta_actividad',
  'COMENTARIOS': 'comentarios',
  'SERVICIO': 'servicio',
  'N                 COTIZACIN': 'numero_cotizacion',
  'COSTO          SIN IGV': 'costo_sin_igv',
  'RUTA': 'ruta'
};

// Función para determinar prioridad basada en ALERTA ACTIVIDAD
function determinePriority(alertaActividad) {
  if (!alertaActividad || alertaActividad.trim() === '') {
    return 'normal';
  }
  const alerta = parseInt(alertaActividad.trim());
  if (isNaN(alerta)) {
    return 'normal';
  }
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

// Función para mapear estado del CSV a estado de la base de datos
function mapStatusToDB(estado) {
  if (!estado || estado === 'Sin especificar') return 'prospeccion';
  
  const estadoLower = estado.toLowerCase();
  if (estadoLower.includes('prospecto')) return 'prospeccion';
  if (estadoLower.includes('interesado')) return 'interesado';
  if (estadoLower.includes('cotización') || estadoLower.includes('cotizacion')) return 'cotizacion_enviada';
  if (estadoLower.includes('negociación') || estadoLower.includes('negociacion')) return 'negociacion';
  if (estadoLower.includes('ganado') || estadoLower.includes('cierre-ganado')) return 'ganado';
  if (estadoLower.includes('perdido')) return 'perdido';
  if (estadoLower.includes('pendiente')) return 'pendiente_cotizacion';
  if (estadoLower.includes('contactado')) return 'prospeccion'; // Mapear a prospección
  if (estadoLower.includes('no contesto')) return 'prospeccion'; // Mapear a prospección
  
  return 'prospeccion'; // Valor por defecto
}

// Función para crear sector con prioridad
function createSectorWithPriority(servicio, comentarios, prioridad) {
  let sectorBase = 'General';
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
  
  const prioridadTexto = {
    'urgent': 'URG',
    'high': 'ALTA',
    'normal': 'NORM',
    'low': 'BAJA'
  };
  
  const sector = `${sectorBase} [${prioridadTexto[prioridad] || 'NORM'}]`;
  
  // Truncar si excede 50 caracteres
  if (sector.length > 50) {
    const maxBaseLength = 50 - 8; // 8 caracteres para "[PRIORIDAD]"
    return `${sectorBase.substring(0, maxBaseLength)} [${prioridadTexto[prioridad] || 'NORM'}]`;
  }
  
  return sector;
}

// Función para procesar una línea de datos
function processDataLine(line, headers) {
  const parts = line.split(';');
  const data = {};
  
  // Límites de longitud para cada campo (ajustados según la base de datos)
  const FIELD_LIMITS = {
    'numero': 10,        // Límite real de la DB
    'fecha_creacion': 30,
    'asesor': 20,        // Límite real de la DB
    'persona_contacto': 100,
    'phone': 30,
    'email': 100,
    'razon_social': 150, // Límite real de la DB
    'ruc': 20,           // Límite real de la DB
    'estado': 50,        // Límite real de la DB
    'fecha_cierre': 30,
    'actividad': 50,
    'fecha_proximo_actividad': 30,
    'alerta_actividad': 10,
    'comentarios': 200,
    'servicio': 30,      // Reducido para dejar espacio al sector
    'numero_cotizacion': 30,
    'costo_sin_igv': 30,
    'ruta': 100
  };
  
  headers.forEach((header, index) => {
    if (COLUMN_MAPPING[header]) {
      // Los datos están desplazados una posición porque la primera columna está vacía
      const dataIndex = index + 1;
      let value = parts[dataIndex] ? parts[dataIndex].trim() : '';
      
      // Limpiar comillas y espacios extra
      value = value.replace(/^["']|["']$/g, '').trim();
      
      // Truncar si es necesario
      const fieldName = COLUMN_MAPPING[header];
      const limit = FIELD_LIMITS[fieldName];
      if (limit && value.length > limit) {
        value = value.substring(0, limit);
      }
      
      data[fieldName] = value;
    }
  });
  
  return data;
}

// Función para validar datos de cliente
function validateClientData(data) {
  const errors = [];
  
  // Solo validar que tenga al menos un identificador (RUC, email o nombre)
  const hasRuc = data.ruc && data.ruc.trim() !== '';
  const hasEmail = data.email && data.email.trim() !== '';
  const hasName = data.razon_social && data.razon_social.trim() !== '';
  const hasContact = data.persona_contacto && data.persona_contacto.trim() !== '';
  
  if (!hasRuc && !hasEmail && !hasName) {
    errors.push('Se requiere al menos RUC, email o razón social');
  }
  
  // Si no tiene nombre, usar el contacto como nombre
  if (!hasName && hasContact) {
    data.razon_social = data.persona_contacto;
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    data
  };
}

async function importClients() {
  try {
    console.log('🚀 Iniciando importación de clientes...');
    
    const csvPath = path.join(__dirname, '../../DocumentosExcel/SEGUIMIENTO DE CLIENTES 2025 (1).csv');
    
    if (!fs.existsSync(csvPath)) {
      throw new Error(`Archivo CSV no encontrado: ${csvPath}`);
    }
    
    console.log('📁 Archivo encontrado:', csvPath);
    
    // Leer el archivo como texto
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n');
    
    // Encontrar la línea de encabezados (línea 4)
    const headerLine = lines[3]; // Índice 3 = línea 4
    const headers = headerLine.split(';').map(h => h.trim()).filter(h => h !== '');
    
    console.log('📋 Encabezados encontrados:', headers);
    
    // Procesar líneas de datos (desde línea 5 hasta línea 42 = 38 registros)
    const validClients = [];
    const errors = [];
    const maxLines = 42; // Línea 5 + 38 registros = línea 42
    
    for (let i = 4; i < Math.min(lines.length, maxLines); i++) { // Índice 4 = línea 5
      const line = lines[i].trim();
      if (!line || line === '') continue;
      
      const data = processDataLine(line, headers);
      
      // Aplicar valores por defecto para campos faltantes
      const processedData = {
        numero: data.numero || 'Sin especificar',
        fecha_creacion: data.fecha_creacion || 'Sin especificar',
        asesor: data.asesor || 'Sin especificar',
        persona_contacto: data.persona_contacto || 'Sin especificar',
        phone: data.phone || 'Sin especificar',
        email: data.email || 'Sin especificar',
        razon_social: data.razon_social || data.persona_contacto || 'Sin especificar',
        ruc: data.ruc || 'Sin especificar',
        estado: data.estado || 'Sin especificar',
        fecha_cierre: data.fecha_cierre || 'Sin especificar',
        actividad: data.actividad || 'Sin especificar',
        fecha_proximo_actividad: data.fecha_proximo_actividad || 'Sin especificar',
        alerta_actividad: data.alerta_actividad || '0',
        comentarios: data.comentarios || 'Sin especificar',
        servicio: data.servicio || 'Sin especificar',
        numero_cotizacion: data.numero_cotizacion || 'Sin especificar',
        costo_sin_igv: data.costo_sin_igv || 'Sin especificar',
        ruta: data.ruta || 'Sin especificar'
      };
      
      // Calcular prioridad y sector
      const prioridad = determinePriority(processedData.alerta_actividad);
      const sector = createSectorWithPriority(processedData.servicio, processedData.comentarios, prioridad);
      const status = mapStatusToDB(processedData.estado);
      
      validClients.push({
        ...processedData,
        sector,
        type: 'client',
        status: status,
        created_at: new Date()
      });
    }
    
    console.log(`📊 Procesamiento completado: ${validClients.length} registros válidos, ${errors.length} errores`);
    
    if (validClients.length === 0) {
      throw new Error('No se encontraron registros válidos en el archivo');
    }
    
    // Insertar en la base de datos
    console.log('💾 Insertando datos en la base de datos...');
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      let insertedCount = 0;
      let updatedCount = 0;
      
      for (const clientData of validClients) {
        // Verificar si ya existe por RUC o por nombre (para evitar duplicados)
        const existing = await client.query(
          'SELECT id FROM companies WHERE ruc = $1 OR name = $2',
          [clientData.ruc, clientData.razon_social]
        );
        
        if (existing.rows.length > 0) {
          // Saltar registro existente
          console.log(`⏭️  Saltando cliente existente: ${clientData.razon_social}`);
          continue;
        } else {
          // Insertar nuevo registro solo si no existe
          await client.query(`
            INSERT INTO companies (
              type, ruc, name, contact_name, phone, email, sector, status, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `, [
            clientData.type,
            clientData.ruc,
            clientData.razon_social,
            clientData.persona_contacto,
            clientData.phone,
            clientData.email,
            clientData.sector,
            clientData.status,
            clientData.created_at
          ]);
          insertedCount++;
          console.log(`✅ Cliente insertado: ${clientData.razon_social}`);
        }
      }
      
      await client.query('COMMIT');
      
      console.log('✅ Importación completada exitosamente');
      console.log(`📊 Estadísticas:`);
      console.log(`   - Registros insertados: ${insertedCount}`);
      console.log(`   - Registros saltados (ya existían): ${validClients.length - insertedCount}`);
      console.log(`   - Errores: ${errors.length}`);
      
      if (errors.length > 0) {
        console.log('\n❌ Errores encontrados:');
        errors.forEach(error => console.log(`   - ${error}`));
      }
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Error en importación:', error);
    process.exit(1);
  }
}

// Ejecutar la importación
importClients();
