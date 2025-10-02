const pool = require('./config/db');

async function validarIntegridadDatos() {
  try {
    console.log('🔍 VALIDACIÓN DE INTEGRIDAD DE DATOS - CRMGeoFal\n');
    console.log('=' .repeat(80));
    
    // 1. Verificar usuarios del sistema
    console.log('\n👥 VALIDACIÓN DE USUARIOS:');
    console.log('-'.repeat(40));
    
    const usuarios = await pool.query('SELECT COUNT(*) as total FROM users');
    const usuariosActivos = await pool.query('SELECT COUNT(*) as total FROM users WHERE notification_enabled = true');
    const roles = await pool.query(`
      SELECT role, COUNT(*) as cantidad 
      FROM users 
      GROUP BY role 
      ORDER BY cantidad DESC
    `);
    
    console.log(`✅ Total usuarios: ${usuarios.rows[0].total}`);
    console.log(`✅ Usuarios activos: ${usuariosActivos.rows[0].total}`);
    console.log('📊 Distribución por roles:');
    roles.rows.forEach(rol => {
      console.log(`   • ${rol.role}: ${rol.cantidad} usuarios`);
    });
    
    // 2. Verificar empresas
    console.log('\n🏢 VALIDACIÓN DE EMPRESAS:');
    console.log('-'.repeat(40));
    
    const empresas = await pool.query('SELECT COUNT(*) as total FROM companies');
    const empresasConRuc = await pool.query('SELECT COUNT(*) as total FROM companies WHERE ruc IS NOT NULL AND ruc != \'\'');
    const empresasConDni = await pool.query('SELECT COUNT(*) as total FROM companies WHERE dni IS NOT NULL AND dni != \'\'');
    const tiposEmpresa = await pool.query(`
      SELECT type, COUNT(*) as cantidad 
      FROM companies 
      GROUP BY type 
      ORDER BY cantidad DESC
    `);
    
    console.log(`✅ Total empresas: ${empresas.rows[0].total}`);
    console.log(`✅ Empresas con RUC: ${empresasConRuc.rows[0].total}`);
    console.log(`✅ Personas naturales (DNI): ${empresasConDni.rows[0].total}`);
    console.log('📊 Distribución por tipo:');
    tiposEmpresa.rows.forEach(tipo => {
      console.log(`   • ${tipo.type}: ${tipo.cantidad} registros`);
    });
    
    // 3. Verificar proyectos
    console.log('\n📋 VALIDACIÓN DE PROYECTOS:');
    console.log('-'.repeat(40));
    
    const proyectos = await pool.query('SELECT COUNT(*) as total FROM projects');
    const proyectosConVendedor = await pool.query('SELECT COUNT(*) as total FROM projects WHERE vendedor_id IS NOT NULL');
    const proyectosConLaboratorio = await pool.query('SELECT COUNT(*) as total FROM projects WHERE laboratorio_id IS NOT NULL');
    const estadosProyecto = await pool.query(`
      SELECT status, COUNT(*) as cantidad 
      FROM projects 
      GROUP BY status 
      ORDER BY cantidad DESC
    `);
    
    console.log(`✅ Total proyectos: ${proyectos.rows[0].total}`);
    console.log(`✅ Proyectos con vendedor: ${proyectosConVendedor.rows[0].total}`);
    console.log(`✅ Proyectos con laboratorio: ${proyectosConLaboratorio.rows[0].total}`);
    console.log('📊 Distribución por estado:');
    estadosProyecto.rows.forEach(estado => {
      console.log(`   • ${estado.status}: ${estado.cantidad} proyectos`);
    });
    
    // 4. Verificar servicios y subservicios
    console.log('\n🧪 VALIDACIÓN DE SERVICIOS:');
    console.log('-'.repeat(40));
    
    const servicios = await pool.query('SELECT COUNT(*) as total FROM services');
    const serviciosActivos = await pool.query('SELECT COUNT(*) as total FROM services WHERE is_active = true');
    const subservicios = await pool.query('SELECT COUNT(*) as total FROM subservices');
    const subserviciosActivos = await pool.query('SELECT COUNT(*) as total FROM subservices WHERE is_active = true');
    const areasServicios = await pool.query(`
      SELECT area, COUNT(*) as cantidad 
      FROM services 
      GROUP BY area 
      ORDER BY cantidad DESC
    `);
    
    console.log(`✅ Total servicios: ${servicios.rows[0].total}`);
    console.log(`✅ Servicios activos: ${serviciosActivos.rows[0].total}`);
    console.log(`✅ Total subservicios: ${subservicios.rows[0].total}`);
    console.log(`✅ Subservicios activos: ${subserviciosActivos.rows[0].total}`);
    console.log('📊 Distribución por área:');
    areasServicios.rows.forEach(area => {
      console.log(`   • ${area.area}: ${area.cantidad} servicios`);
    });
    
    // 5. Verificar cotizaciones
    console.log('\n💰 VALIDACIÓN DE COTIZACIONES:');
    console.log('-'.repeat(40));
    
    const cotizaciones = await pool.query('SELECT COUNT(*) as total FROM quotes');
    const cotizacionesConNumero = await pool.query('SELECT COUNT(*) as total FROM quotes WHERE quote_number IS NOT NULL');
    const estadosCotizacion = await pool.query(`
      SELECT status, COUNT(*) as cantidad 
      FROM quotes 
      GROUP BY status 
      ORDER BY cantidad DESC
    `);
    const cotizacionesConTotal = await pool.query('SELECT COUNT(*) as total FROM quotes WHERE total IS NOT NULL AND total > 0');
    
    console.log(`✅ Total cotizaciones: ${cotizaciones.rows[0].total}`);
    console.log(`✅ Cotizaciones con número: ${cotizacionesConNumero.rows[0].total}`);
    console.log(`✅ Cotizaciones con total: ${cotizacionesConTotal.rows[0].total}`);
    console.log('📊 Distribución por estado:');
    estadosCotizacion.rows.forEach(estado => {
      console.log(`   • ${estado.status}: ${estado.cantidad} cotizaciones`);
    });
    
    // 6. Verificar integridad referencial
    console.log('\n🔗 VALIDACIÓN DE INTEGRIDAD REFERENCIAL:');
    console.log('-'.repeat(40));
    
    // Proyectos sin empresa
    const proyectosSinEmpresa = await pool.query(`
      SELECT COUNT(*) as total 
      FROM projects p 
      LEFT JOIN companies c ON p.company_id = c.id 
      WHERE c.id IS NULL
    `);
    
    // Cotizaciones sin proyecto
    const cotizacionesSinProyecto = await pool.query(`
      SELECT COUNT(*) as total 
      FROM quotes q 
      LEFT JOIN projects p ON q.project_id = p.id 
      WHERE p.id IS NULL
    `);
    
    // Subservicios sin servicio
    const subserviciosSinServicio = await pool.query(`
      SELECT COUNT(*) as total 
      FROM subservices s 
      LEFT JOIN services ser ON s.service_id = ser.id 
      WHERE ser.id IS NULL
    `);
    
    console.log(`⚠️  Proyectos sin empresa válida: ${proyectosSinEmpresa.rows[0].total}`);
    console.log(`⚠️  Cotizaciones sin proyecto válido: ${cotizacionesSinProyecto.rows[0].total}`);
    console.log(`⚠️  Subservicios sin servicio válido: ${subserviciosSinServicio.rows[0].total}`);
    
    // 7. Verificar datos de ejemplo
    console.log('\n📊 VERIFICACIÓN DE DATOS DE EJEMPLO:');
    console.log('-'.repeat(40));
    
    const usuariosEjemplo = await pool.query(`
      SELECT name, email, role 
      FROM users 
      WHERE email LIKE '%@crmgeofal.com' 
      ORDER BY role, name
    `);
    
    const empresasEjemplo = await pool.query(`
      SELECT name, type, ruc, dni 
      FROM companies 
      ORDER BY created_at 
      LIMIT 5
    `);
    
    console.log('👥 Usuarios del sistema:');
    usuariosEjemplo.rows.forEach(user => {
      console.log(`   • ${user.name} (${user.email}) - ${user.role}`);
    });
    
    console.log('\n🏢 Empresas de ejemplo:');
    empresasEjemplo.rows.forEach(empresa => {
      const identificacion = empresa.ruc || empresa.dni || 'Sin identificación';
      console.log(`   • ${empresa.name} (${empresa.type}) - ${identificacion}`);
    });
    
    // 8. Verificar métricas del sistema
    console.log('\n📈 MÉTRICAS DEL SISTEMA:');
    console.log('-'.repeat(40));
    
    const totalRegistros = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as usuarios,
        (SELECT COUNT(*) FROM companies) as empresas,
        (SELECT COUNT(*) FROM projects) as proyectos,
        (SELECT COUNT(*) FROM quotes) as cotizaciones,
        (SELECT COUNT(*) FROM services) as servicios,
        (SELECT COUNT(*) FROM subservices) as subservicios,
        (SELECT COUNT(*) FROM activities) as actividades,
        (SELECT COUNT(*) FROM notifications) as notificaciones,
        (SELECT COUNT(*) FROM tickets) as tickets
    `);
    
    const metricas = totalRegistros.rows[0];
    console.log(`📊 Resumen de registros en el sistema:`);
    console.log(`   • Usuarios: ${metricas.usuarios}`);
    console.log(`   • Empresas: ${metricas.empresas}`);
    console.log(`   • Proyectos: ${metricas.proyectos}`);
    console.log(`   • Cotizaciones: ${metricas.cotizaciones}`);
    console.log(`   • Servicios: ${metricas.servicios}`);
    console.log(`   • Subservicios: ${metricas.subservicios}`);
    console.log(`   • Actividades: ${metricas.actividades}`);
    console.log(`   • Notificaciones: ${metricas.notificaciones}`);
    console.log(`   • Tickets: ${metricas.tickets}`);
    
    // 9. Verificar fechas y timestamps
    console.log('\n📅 VERIFICACIÓN DE FECHAS:');
    console.log('-'.repeat(40));
    
    const fechasRecientes = await pool.query(`
      SELECT 
        'users' as tabla, MAX(created_at) as ultima_creacion
      FROM users
      UNION ALL
      SELECT 
        'companies' as tabla, MAX(created_at) as ultima_creacion
      FROM companies
      UNION ALL
      SELECT 
        'projects' as tabla, MAX(created_at) as ultima_creacion
      FROM projects
      UNION ALL
      SELECT 
        'quotes' as tabla, MAX(created_at) as ultima_creacion
      FROM quotes
      ORDER BY ultima_creacion DESC
    `);
    
    console.log('📅 Últimas creaciones por tabla:');
    fechasRecientes.rows.forEach(fecha => {
      console.log(`   • ${fecha.tabla}: ${fecha.ultima_creacion}`);
    });
    
    // 10. Resumen final
    console.log('\n🎯 RESUMEN DE VALIDACIÓN:');
    console.log('=' .repeat(80));
    
    const problemas = [];
    if (proyectosSinEmpresa.rows[0].total > 0) problemas.push(`${proyectosSinEmpresa.rows[0].total} proyectos sin empresa`);
    if (cotizacionesSinProyecto.rows[0].total > 0) problemas.push(`${cotizacionesSinProyecto.rows[0].total} cotizaciones sin proyecto`);
    if (subserviciosSinServicio.rows[0].total > 0) problemas.push(`${subserviciosSinServicio.rows[0].total} subservicios sin servicio`);
    
    if (problemas.length === 0) {
      console.log('✅ ¡VALIDACIÓN EXITOSA! No se encontraron problemas de integridad.');
    } else {
      console.log('⚠️  PROBLEMAS ENCONTRADOS:');
      problemas.forEach(problema => {
        console.log(`   • ${problema}`);
      });
    }
    
    console.log('\n📊 ESTADO GENERAL DEL SISTEMA:');
    console.log(`   • Total de registros: ${Object.values(metricas).reduce((a, b) => parseInt(a) + parseInt(b), 0)}`);
    console.log(`   • Sistema funcional: ${problemas.length === 0 ? 'SÍ' : 'CON PROBLEMAS'}`);
    console.log(`   • Datos de ejemplo: ${usuariosEjemplo.rows.length > 0 ? 'PRESENTES' : 'FALTANTES'}`);
    
  } catch (error) {
    console.error('❌ Error durante la validación:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await pool.end();
  }
}

// Ejecutar validación
validarIntegridadDatos();
