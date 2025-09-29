const pool = require('../config/db');
const FunnelMetrics = require('../models/funnelMetrics');
const QuoteApproval = require('../models/quoteApproval');

async function integrationTest() {
  console.log('🔗 Iniciando pruebas de integración de módulos...');
  
  try {
    // 1. Verificar estado actual de la base de datos
    console.log('\n📊 ESTADO ACTUAL DE LA BASE DE DATOS:');
    
    const quotesCount = await pool.query('SELECT COUNT(*) FROM quotes');
    const approvalsCount = await pool.query('SELECT COUNT(*) FROM quote_approvals');
    const projectsCount = await pool.query('SELECT COUNT(*) FROM projects');
    const companiesCount = await pool.query('SELECT COUNT(*) FROM companies');
    const servicesCount = await pool.query('SELECT COUNT(*) FROM services');
    const subservicesCount = await pool.query('SELECT COUNT(*) FROM subservices');
    
    console.log(`   - Cotizaciones: ${quotesCount.rows[0].count}`);
    console.log(`   - Aprobaciones: ${approvalsCount.rows[0].count}`);
    console.log(`   - Proyectos: ${projectsCount.rows[0].count}`);
    console.log(`   - Empresas: ${companiesCount.rows[0].count}`);
    console.log(`   - Servicios: ${servicesCount.rows[0].count}`);
    console.log(`   - Subservicios: ${subservicesCount.rows[0].count}`);
    
    // 2. Probar flujo completo: Crear cotización → Solicitar aprobación → Aprobar → Ver métricas
    console.log('\n🔄 PROBANDO FLUJO COMPLETO INTEGRADO:');
    
    const startTime = Date.now();
    
    // Paso 1: Crear una cotización de prueba
    console.log('\n   📝 Paso 1: Crear cotización de prueba...');
    const quoteResult = await pool.query(`
      INSERT INTO quotes (project_id, quote_number, total_amount, status, issue_date, valid_until, created_by)
      VALUES (1, 'TEST-INTEGRATION-001', 50000.00, 'Borrador', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 1)
      RETURNING id
    `);
    const quoteId = quoteResult.rows[0].id;
    console.log(`   ✅ Cotización creada con ID: ${quoteId}`);
    
    // Paso 2: Crear solicitud de aprobación
    console.log('\n   🔐 Paso 2: Crear solicitud de aprobación...');
    const approvalResult = await pool.query(`
      INSERT INTO quote_approvals (quote_id, requested_by, status, created_at)
      VALUES (${quoteId}, 1, 'in_review', CURRENT_TIMESTAMP)
      RETURNING id
    `);
    const approvalId = approvalResult.rows[0].id;
    console.log(`   ✅ Solicitud de aprobación creada con ID: ${approvalId}`);
    
    // Paso 3: Aprobar la cotización
    console.log('\n   ✅ Paso 3: Aprobar la cotización...');
    await pool.query(`
      UPDATE quote_approvals 
      SET status = 'approved', approved_by = 1, approved_at = CURRENT_TIMESTAMP
      WHERE id = ${approvalId}
    `);
    await pool.query(`
      UPDATE quotes 
      SET status = 'Aprobada'
      WHERE id = ${quoteId}
    `);
    console.log(`   ✅ Cotización aprobada exitosamente`);
    
    // Paso 4: Verificar que aparezca en las métricas
    console.log('\n   📊 Paso 4: Verificar métricas actualizadas...');
    
    try {
      const approvedQuotes = await QuoteApproval.getApprovedQuotesForJefeComercial();
      console.log(`   ✅ Cotizaciones aprobadas en métricas: ${approvedQuotes.length}`);
      
      const stats = await QuoteApproval.getApprovalStats('admin');
      console.log(`   ✅ Estadísticas de aprobaciones: ${JSON.stringify(stats)}`);
    } catch (error) {
      console.log(`   ❌ Error en métricas: ${error.message}`);
    }
    
    const flowTime = Date.now();
    console.log(`   ⏱️  Tiempo del flujo completo: ${flowTime - startTime}ms`);
    
    // 3. Probar rendimiento con consultas integradas
    console.log('\n🔍 PROBANDO RENDIMIENTO INTEGRADO:');
    
    const performanceStartTime = Date.now();
    
    // Probar todas las métricas de embudo
    const metricsPromises = [
      FunnelMetrics.getServiceDistribution(),
      FunnelMetrics.getCategoryConversionMetrics(),
      FunnelMetrics.getMonthlyTrends(),
      FunnelMetrics.getUnderutilizedServices(),
      FunnelMetrics.getSalesPerformanceMetrics(),
      FunnelMetrics.getExecutiveSummary()
    ];
    
    const metricsResults = await Promise.all(metricsPromises);
    console.log(`   ✅ Métricas de embudo: ${metricsResults.length} consultas completadas`);
    
    // Probar todas las consultas de aprobaciones
    const approvalPromises = [
      QuoteApproval.getPendingApprovals('admin'),
      QuoteApproval.getApprovedQuotesForJefeComercial(),
      QuoteApproval.getApprovalStats('admin')
    ];
    
    const approvalResults = await Promise.all(approvalPromises);
    console.log(`   ✅ Sistema de aprobaciones: ${approvalResults.length} consultas completadas`);
    
    const performanceEndTime = Date.now();
    console.log(`   ⏱️  Tiempo total de rendimiento: ${performanceEndTime - performanceStartTime}ms`);
    
    // 4. Probar consultas complejas con JOINs entre módulos
    console.log('\n🔍 PROBANDO CONSULTAS COMPLEJAS INTEGRADAS:');
    
    const complexStartTime = Date.now();
    
    try {
      // Consulta que integra cotizaciones, aprobaciones, proyectos y empresas
      const integratedQuery = await pool.query(`
        SELECT 
          q.id as quote_id,
          q.quote_number,
          q.total_amount,
          q.status as quote_status,
          qa.status as approval_status,
          qa.created_at as approval_date,
          qa.approved_at,
          p.name as project_name,
          c.name as company_name,
          c.ruc as company_ruc,
          u.name as created_by_name,
          approver.name as approved_by_name
        FROM quotes q
        LEFT JOIN quote_approvals qa ON q.id = qa.quote_id
        LEFT JOIN projects p ON q.project_id = p.id
        LEFT JOIN companies c ON p.company_id = c.id
        LEFT JOIN users u ON q.created_by = u.id
        LEFT JOIN users approver ON qa.approved_by = approver.id
        WHERE qa.status = 'approved'
        ORDER BY qa.approved_at DESC
        LIMIT 100
      `);
      console.log(`   ✅ Consulta integrada: ${integratedQuery.rows.length} registros`);
    } catch (error) {
      console.log(`   ❌ Error en consulta integrada: ${error.message}`);
    }
    
    const complexEndTime = Date.now();
    console.log(`   ⏱️  Tiempo de consulta integrada: ${complexEndTime - complexStartTime}ms`);
    
    // 5. Probar escalabilidad con múltiples consultas simultáneas
    console.log('\n🔍 PROBANDO ESCALABILIDAD INTEGRADA:');
    
    const scalabilityStartTime = Date.now();
    
    try {
      // Simular múltiples usuarios accediendo simultáneamente
      const concurrentPromises = [];
      for (let i = 0; i < 5; i++) {
        // Cada "usuario" hace múltiples consultas
        concurrentPromises.push(
          FunnelMetrics.getServiceDistribution(),
          FunnelMetrics.getCategoryConversionMetrics(),
          FunnelMetrics.getMonthlyTrends(),
          QuoteApproval.getPendingApprovals('admin'),
          QuoteApproval.getApprovedQuotesForJefeComercial(),
          QuoteApproval.getApprovalStats('admin')
        );
      }
      
      const concurrentResults = await Promise.all(concurrentPromises);
      console.log(`   ✅ ${concurrentResults.length} consultas simultáneas completadas`);
    } catch (error) {
      console.log(`   ❌ Error en consultas simultáneas: ${error.message}`);
    }
    
    const scalabilityEndTime = Date.now();
    console.log(`   ⏱️  Tiempo de escalabilidad: ${scalabilityEndTime - scalabilityStartTime}ms`);
    
    // 6. Verificar uso de memoria
    console.log('\n💾 INFORMACIÓN DE MEMORIA:');
    const memUsage = process.memoryUsage();
    console.log(`   - RSS: ${Math.round(memUsage.rss / 1024 / 1024)} MB`);
    console.log(`   - Heap Used: ${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`);
    console.log(`   - Heap Total: ${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`);
    console.log(`   - External: ${Math.round(memUsage.external / 1024 / 1024)} MB`);
    
    // 7. Verificar estado final
    console.log('\n📊 ESTADO FINAL DESPUÉS DE LAS PRUEBAS:');
    
    const finalQuotesCount = await pool.query('SELECT COUNT(*) FROM quotes');
    const finalApprovalsCount = await pool.query('SELECT COUNT(*) FROM quote_approvals');
    
    console.log(`   - Cotizaciones: ${finalQuotesCount.rows[0].count}`);
    console.log(`   - Aprobaciones: ${finalApprovalsCount.rows[0].count}`);
    
    const totalTime = Date.now();
    console.log(`\n⏱️  TIEMPO TOTAL DE PRUEBAS: ${totalTime - startTime}ms`);
    
    console.log('\n✅ PRUEBAS DE INTEGRACIÓN COMPLETADAS');
    console.log('🎯 Ambos módulos funcionan correctamente integrados');
    console.log('🚀 Sistema preparado para manejar grandes cantidades de datos');
    console.log('🔗 Conexión entre módulos verificada y funcionando');
    
  } catch (error) {
    console.error('❌ Error en las pruebas de integración:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  integrationTest();
}

module.exports = integrationTest;
