const pool = require('./config/db');
const fs = require('fs');
const path = require('path');

async function generarReporteValidacion() {
  try {
    console.log('📊 GENERANDO REPORTE COMPLETO DE VALIDACIÓN...\n');
    
    const reporteData = {
      timestamp: new Date().toISOString(),
      tablas: [],
      metricas: {},
      problemas: [],
      recomendaciones: []
    };
    
    // 1. Obtener información de todas las tablas
    console.log('🔍 Analizando estructura de tablas...');
    const tablasQuery = `
      SELECT 
        schemaname,
        tablename,
        tableowner
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    
    const tablas = await pool.query(tablasQuery);
    
    for (const tabla of tablas.rows) {
      console.log(`   Analizando tabla: ${tabla.tablename}`);
      
      // Obtener columnas
      const columnasQuery = `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns 
        WHERE table_name = $1 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `;
      
      const columnas = await pool.query(columnasQuery, [tabla.tablename]);
      
      // Obtener índices
      const indicesQuery = `
        SELECT 
          indexname,
          indexdef
        FROM pg_indexes 
        WHERE tablename = $1 
        AND schemaname = 'public'
        ORDER BY indexname
      `;
      
      const indices = await pool.query(indicesQuery, [tabla.tablename]);
      
      // Obtener claves foráneas
      const fkQuery = `
        SELECT 
          tc.constraint_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = $1
        AND tc.table_schema = 'public'
      `;
      
      const fks = await pool.query(fkQuery, [tabla.tablename]);
      
      // Contar registros
      let totalRegistros = 0;
      try {
        const countQuery = `SELECT COUNT(*) as total FROM ${tabla.tablename}`;
        const count = await pool.query(countQuery);
        totalRegistros = parseInt(count.rows[0].total);
      } catch (error) {
        console.log(`     ⚠️  No se pudo contar registros en ${tabla.tablename}`);
      }
      
      reporteData.tablas.push({
        nombre: tabla.tablename,
        propietario: tabla.tableowner,
        columnas: columnas.rows,
        indices: indices.rows,
        clavesForaneas: fks.rows,
        totalRegistros: totalRegistros
      });
    }
    
    // 2. Obtener métricas del sistema
    console.log('📈 Calculando métricas del sistema...');
    const metricasQuery = `
      SELECT 
        (SELECT COUNT(*) FROM users) as usuarios,
        (SELECT COUNT(*) FROM companies) as empresas,
        (SELECT COUNT(*) FROM projects) as proyectos,
        (SELECT COUNT(*) FROM quotes) as cotizaciones,
        (SELECT COUNT(*) FROM services) as servicios,
        (SELECT COUNT(*) FROM subservices) as subservicios,
        (SELECT COUNT(*) FROM activities) as actividades,
        (SELECT COUNT(*) FROM notifications) as notificaciones,
        (SELECT COUNT(*) FROM tickets) as tickets,
        (SELECT COUNT(*) FROM invoices) as facturas,
        (SELECT COUNT(*) FROM leads) as leads
    `;
    
    const metricas = await pool.query(metricasQuery);
    reporteData.metricas = metricas.rows[0];
    
    // 3. Verificar problemas de integridad
    console.log('🔍 Verificando problemas de integridad...');
    
    // Proyectos sin empresa
    const proyectosSinEmpresa = await pool.query(`
      SELECT COUNT(*) as total 
      FROM projects p 
      LEFT JOIN companies c ON p.company_id = c.id 
      WHERE c.id IS NULL
    `);
    
    if (proyectosSinEmpresa.rows[0].total > 0) {
      reporteData.problemas.push({
        tipo: 'Integridad Referencial',
        descripcion: 'Proyectos sin empresa válida',
        cantidad: proyectosSinEmpresa.rows[0].total,
        severidad: 'Alta'
      });
    }
    
    // Cotizaciones sin proyecto
    const cotizacionesSinProyecto = await pool.query(`
      SELECT COUNT(*) as total 
      FROM quotes q 
      LEFT JOIN projects p ON q.project_id = p.id 
      WHERE p.id IS NULL
    `);
    
    if (cotizacionesSinProyecto.rows[0].total > 0) {
      reporteData.problemas.push({
        tipo: 'Integridad Referencial',
        descripcion: 'Cotizaciones sin proyecto válido',
        cantidad: cotizacionesSinProyecto.rows[0].total,
        severidad: 'Alta'
      });
    }
    
    // 4. Generar recomendaciones
    console.log('💡 Generando recomendaciones...');
    
    if (reporteData.metricas.usuarios < 3) {
      reporteData.recomendaciones.push({
        tipo: 'Configuración',
        descripcion: 'Agregar más usuarios de ejemplo para testing',
        prioridad: 'Media'
      });
    }
    
    if (reporteData.metricas.empresas < 5) {
      reporteData.recomendaciones.push({
        tipo: 'Datos',
        descripcion: 'Agregar más empresas de ejemplo',
        prioridad: 'Baja'
      });
    }
    
    if (reporteData.problemas.length > 0) {
      reporteData.recomendaciones.push({
        tipo: 'Integridad',
        descripcion: 'Resolver problemas de integridad referencial',
        prioridad: 'Alta'
      });
    }
    
    // 5. Generar reporte HTML
    console.log('📄 Generando reporte HTML...');
    const htmlContent = generarHTMLReporte(reporteData);
    
    const reportePath = path.join(__dirname, 'reporte-validacion.html');
    fs.writeFileSync(reportePath, htmlContent, 'utf8');
    
    console.log(`✅ Reporte generado exitosamente: ${reportePath}`);
    console.log(`📊 Resumen:`);
    console.log(`   • Tablas analizadas: ${reporteData.tablas.length}`);
    console.log(`   • Problemas encontrados: ${reporteData.problemas.length}`);
    console.log(`   • Recomendaciones: ${reporteData.recomendaciones.length}`);
    
    return reporteData;
    
  } catch (error) {
    console.error('❌ Error generando reporte:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

function generarHTMLReporte(data) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Validación - CRMGeoFal</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .section {
            margin-bottom: 40px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
        }
        .section-header {
            background: #f8f9fa;
            padding: 15px 20px;
            border-bottom: 1px solid #e0e0e0;
            font-weight: 600;
            font-size: 1.2em;
        }
        .section-content {
            padding: 20px;
        }
        .metric-card {
            display: inline-block;
            background: #f8f9fa;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            padding: 15px;
            margin: 5px;
            text-align: center;
            min-width: 120px;
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }
        .metric-label {
            font-size: 0.9em;
            color: #666;
            margin-top: 5px;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        .table th, .table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e0e0e0;
        }
        .table th {
            background: #f8f9fa;
            font-weight: 600;
        }
        .table tr:hover {
            background: #f8f9fa;
        }
        .status-ok {
            color: #28a745;
            font-weight: bold;
        }
        .status-warning {
            color: #ffc107;
            font-weight: bold;
        }
        .status-error {
            color: #dc3545;
            font-weight: bold;
        }
        .problem-item {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 15px;
            margin: 10px 0;
        }
        .recommendation-item {
            background: #d1ecf1;
            border: 1px solid #bee5eb;
            border-radius: 6px;
            padding: 15px;
            margin: 10px 0;
        }
        .severity-high {
            border-left: 4px solid #dc3545;
        }
        .severity-medium {
            border-left: 4px solid #ffc107;
        }
        .severity-low {
            border-left: 4px solid #28a745;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e0e0e0;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Reporte de Validación</h1>
            <p>Sistema CRMGeoFal - ${new Date(data.timestamp).toLocaleString('es-ES')}</p>
        </div>
        
        <div class="content">
            <!-- Métricas Generales -->
            <div class="section">
                <div class="section-header">📊 Métricas Generales del Sistema</div>
                <div class="section-content">
                    <div class="metric-card">
                        <div class="metric-value">${data.metricas.usuarios}</div>
                        <div class="metric-label">Usuarios</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${data.metricas.empresas}</div>
                        <div class="metric-label">Empresas</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${data.metricas.proyectos}</div>
                        <div class="metric-label">Proyectos</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${data.metricas.cotizaciones}</div>
                        <div class="metric-label">Cotizaciones</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${data.metricas.servicios}</div>
                        <div class="metric-label">Servicios</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${data.metricas.subservicios}</div>
                        <div class="metric-label">Subservicios</div>
                    </div>
                </div>
            </div>
            
            <!-- Tablas del Sistema -->
            <div class="section">
                <div class="section-header">🗂️ Tablas del Sistema (${data.tablas.length} tablas)</div>
                <div class="section-content">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Tabla</th>
                                <th>Columnas</th>
                                <th>Índices</th>
                                <th>Claves Foráneas</th>
                                <th>Registros</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.tablas.map(tabla => `
                                <tr>
                                    <td><strong>${tabla.nombre}</strong></td>
                                    <td>${tabla.columnas.length}</td>
                                    <td>${tabla.indices.length}</td>
                                    <td>${tabla.clavesForaneas.length}</td>
                                    <td>${tabla.totalRegistros.toLocaleString()}</td>
                                    <td>
                                        <span class="status-ok">✓ OK</span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Problemas Encontrados -->
            <div class="section">
                <div class="section-header">
                    ${data.problemas.length > 0 ? '⚠️ Problemas Encontrados' : '✅ Sin Problemas'}
                    ${data.problemas.length > 0 ? `(${data.problemas.length})` : ''}
                </div>
                <div class="section-content">
                    ${data.problemas.length === 0 ? 
                        '<p class="status-ok">¡Excelente! No se encontraron problemas en la base de datos.</p>' :
                        data.problemas.map(problema => `
                            <div class="problem-item severity-${problema.severidad.toLowerCase()}">
                                <strong>${problema.tipo}</strong><br>
                                ${problema.descripcion}<br>
                                <small>Cantidad: ${problema.cantidad} | Severidad: ${problema.severidad}</small>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
            
            <!-- Recomendaciones -->
            <div class="section">
                <div class="section-header">💡 Recomendaciones (${data.recomendaciones.length})</div>
                <div class="section-content">
                    ${data.recomendaciones.length === 0 ? 
                        '<p>No hay recomendaciones específicas en este momento.</p>' :
                        data.recomendaciones.map(rec => `
                            <div class="recommendation-item">
                                <strong>${rec.tipo}</strong> - Prioridad: ${rec.prioridad}<br>
                                ${rec.descripcion}
                            </div>
                        `).join('')
                    }
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>Reporte generado automáticamente por el sistema de validación CRMGeoFal</p>
            <p>Fecha: ${new Date(data.timestamp).toLocaleString('es-ES')}</p>
        </div>
    </div>
</body>
</html>
  `;
}

// Ejecutar generación de reporte
generarReporteValidacion();
