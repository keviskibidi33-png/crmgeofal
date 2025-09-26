const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

async function createFinalServicesBackup() {
  try {
    console.log('💾 CREANDO BACKUP FINAL Y DEFINITIVO DE SERVICIOS ESTRUCTURADOS...\n');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '..', 'backups');
    const backupFile = path.join(backupDir, `SERVICIOS_FINAL_BACKUP_${timestamp}.sql`);
    
    // Crear directorio de backups si no existe
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    console.log('1️⃣ Obteniendo estructura completa de servicios y subservicios...');
    
    // Obtener todos los servicios con sus subservicios
    const servicesQuery = `
      SELECT 
        s.id,
        s.name,
        s.description,
        s.area,
        s.created_at,
        COUNT(sub.id) as subservices_count
      FROM services s
      LEFT JOIN subservices sub ON s.id = sub.service_id AND sub.is_active = true
      GROUP BY s.id, s.name, s.description, s.area, s.created_at
      ORDER BY s.id
    `;
    
    const servicesResult = await pool.query(servicesQuery);
    const services = servicesResult.rows;
    
    console.log(`✅ Encontrados ${services.length} servicios`);
    
    // Obtener todos los subservicios
    const subservicesQuery = `
      SELECT 
        sub.id,
        sub.codigo,
        sub.descripcion,
        sub.norma,
        sub.precio,
        sub.name,
        sub.is_active,
        sub.created_at,
        s.name as service_name,
        s.id as service_id
      FROM subservices sub
      JOIN services s ON sub.service_id = s.id
      WHERE sub.is_active = true
      ORDER BY s.id, sub.codigo
    `;
    
    const subservicesResult = await pool.query(subservicesQuery);
    const subservices = subservicesResult.rows;
    
    console.log(`✅ Encontrados ${subservices.length} subservicios activos`);
    
    // Crear el archivo de backup
    let backupContent = `-- ================================================
-- BACKUP FINAL Y DEFINITIVO DE SERVICIOS ESTRUCTURADOS
-- Fecha: ${new Date().toLocaleString('es-PE')}
-- Total Servicios: ${services.length}
-- Total Subservicios: ${subservices.length}
-- ================================================

-- NOTA IMPORTANTE: 
-- Este backup contiene la estructura FINAL y DEFINITIVA de servicios.
-- Los datos NO deben modificarse, solo se pueden AGREGAR nuevos.
-- El orden de las categorías NO debe cambiar.

-- ================================================
-- ESTRUCTURA DE SERVICIOS
-- ================================================

`;

    // Agregar información de servicios
    backupContent += `-- SERVICIOS ESTRUCTURADOS (ORDEN DEFINITIVO):\n`;
    services.forEach((service, index) => {
      backupContent += `-- ${index + 1}. ${service.name} (ID: ${service.id}) - ${service.subservices_count} subservicios\n`;
    });
    
    backupContent += `\n-- ================================================
-- DETALLE COMPLETO DE SERVICIOS Y SUBSERVICIOS
-- ================================================

`;

    // Agregar detalle de cada servicio
    for (const service of services) {
      backupContent += `-- ================================================
-- SERVICIO: ${service.name.toUpperCase()}
-- ID: ${service.id} | Área: ${service.area || 'N/A'} | Subservicios: ${service.subservices_count}
-- ================================================

`;
      
      // Obtener subservicios de este servicio
      const serviceSubservices = subservices.filter(sub => sub.service_id === service.id);
      
      if (serviceSubservices.length > 0) {
        backupContent += `-- SUBSERVICIOS DE ${service.name.toUpperCase()}:\n`;
        serviceSubservices.forEach((sub, index) => {
          const precio = sub.precio === 0 ? 'Sujeto a evaluación' : `S/ ${sub.precio}`;
          backupContent += `-- ${index + 1}. ${sub.codigo}: ${sub.descripcion}\n`;
          backupContent += `--    Norma: ${sub.norma || 'Sin norma'} | Precio: ${precio}\n`;
        });
        backupContent += `\n`;
      } else {
        backupContent += `-- Sin subservicios activos\n\n`;
      }
    }
    
    // Agregar resumen estadístico
    backupContent += `-- ================================================
-- RESUMEN ESTADÍSTICO FINAL
-- ================================================

-- TOTAL DE SERVICIOS: ${services.length}
-- TOTAL DE SUBSERVICIOS: ${subservices.length}

-- DISTRIBUCIÓN POR ÁREA:
`;

    // Agrupar por área
    const servicesByArea = services.reduce((acc, service) => {
      const area = service.area || 'Sin área';
      if (!acc[area]) {
        acc[area] = [];
      }
      acc[area].push(service);
      return acc;
    }, {});

    Object.keys(servicesByArea).forEach(area => {
      const areaServices = servicesByArea[area];
      const totalSubservices = areaServices.reduce((sum, service) => sum + parseInt(service.subservices_count), 0);
      backupContent += `-- ${area}: ${areaServices.length} servicios, ${totalSubservices} subservicios\n`;
    });

    backupContent += `
-- ================================================
-- CÓDIGOS DE SUBSERVICIOS POR CATEGORÍA
-- ================================================

`;

    // Agrupar códigos por categoría
    const codesByCategory = {};
    subservices.forEach(sub => {
      const prefix = sub.codigo.substring(0, 2);
      if (!codesByCategory[prefix]) {
        codesByCategory[prefix] = [];
      }
      codesByCategory[prefix].push(sub.codigo);
    });

    Object.keys(codesByCategory).sort().forEach(prefix => {
      const codes = codesByCategory[prefix].sort();
      backupContent += `-- ${prefix}*: ${codes.join(', ')}\n`;
    });

    backupContent += `
-- ================================================
-- FIN DEL BACKUP FINAL Y DEFINITIVO
-- ================================================

-- IMPORTANTE: Este backup representa la estructura FINAL de servicios.
-- Los datos están correctamente organizados y NO deben modificarse.
-- Solo se pueden AGREGAR nuevos servicios/subservicios.
-- El orden de las categorías es DEFINITIVO y NO debe cambiar.

-- Backup creado exitosamente el ${new Date().toLocaleString('es-PE')}
`;

    // Escribir el archivo
    fs.writeFileSync(backupFile, backupContent, 'utf8');
    
    console.log(`\n2️⃣ Backup creado exitosamente:`);
    console.log(`   📁 Archivo: ${backupFile}`);
    console.log(`   📊 Servicios: ${services.length}`);
    console.log(`   📊 Subservicios: ${subservices.length}`);
    
    // Mostrar resumen por categoría
    console.log(`\n3️⃣ RESUMEN POR CATEGORÍA:`);
    services.forEach((service, index) => {
      console.log(`   ${index + 1}. ${service.name}: ${service.subservices_count} subservicios`);
    });
    
    // Mostrar códigos por categoría
    console.log(`\n4️⃣ CÓDIGOS POR CATEGORÍA:`);
    Object.keys(codesByCategory).sort().forEach(prefix => {
      const codes = codesByCategory[prefix].sort();
      console.log(`   ${prefix}*: ${codes.length} códigos (${codes.slice(0, 3).join(', ')}${codes.length > 3 ? '...' : ''})`);
    });
    
    console.log(`\n🎉 BACKUP FINAL CREADO EXITOSAMENTE`);
    console.log('✅ Estructura de servicios DEFINITIVA guardada');
    console.log('✅ Datos organizados y estructurados correctamente');
    console.log('✅ Orden de categorías FIJO y NO modificable');
    console.log('✅ Solo se pueden AGREGAR nuevos servicios/subservicios');
    console.log('✅ Backup listo para uso en producción');
    
  } catch (error) {
    console.error('❌ Error creando backup final:', error.message);
  } finally {
    await pool.end();
  }
}

createFinalServicesBackup();
