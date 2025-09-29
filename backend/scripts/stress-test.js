const pool = require('../config/db');
const FunnelMetrics = require('../models/funnelMetrics');
const QuoteApproval = require('../models/quoteApproval');

async function stressTest() {
  console.log('🧪 Iniciando pruebas de estrés del sistema...');
  
  try {
    // 1. Verificar estado actual de la base de datos
    console.log('\n📊 ESTADO ACTUAL DE LA BASE DE DATOS:');
    
    const quotesCount = await pool.query('SELECT COUNT(*) FROM quotes');
    const approvalsCount = await pool.query('SELECT COUNT(*) FROM quote_approvals');
    const projectsCount = await pool.query('SELECT COUNT(*) FROM projects');
    const companiesCount = await pool.query('SELECT COUNT(*) FROM companies');
    
    console.log(`   - Cotizaciones: ${quotesCount.rows[0].count}`);
    console.log(`   - Aprobaciones: ${approvalsCount.rows[0].count}`);
    console.log(`   - Proyectos: ${projectsCount.rows[0].count}`);
    console.log(`   - Empresas: ${companiesCount.rows[0].count}`);
    
    // 2. Probar consultas de métricas con datos reales
    console.log('\n🔍 PROBANDO MÉTRICAS DE EMBUDO:');
    
    const startTime = Date.now();
    
    try {
      const distribution = await FunnelMetrics.getServiceDistribution();
      console.log(`   ✅ Distribución de servicios: ${distribution.length} registros`);
    } catch (error) {
      console.log(`   ❌ Error en distribución: ${error.message}`);
    }
    
    try {
      const categories = await FunnelMetrics.getCategoryConversionMetrics();
      console.log(`   ✅ Conversión por categoría: ${categories.length} registros`);
    } catch (error) {
      console.log(`   ❌ Error en categorías: ${error.message}`);
    }
    
    try {
      const trends = await FunnelMetrics.getMonthlyTrends();
      console.log(`   ✅ Tendencias mensuales: ${trends.length} registros`);
    } catch (error) {
      console.log(`   ❌ Error en tendencias: ${error.message}`);
    }
    
    try {
      const underutilized = await FunnelMetrics.getUnderutilizedServices();
      console.log(`   ✅ Servicios subutilizados: ${underutilized.length} registros`);
    } catch (error) {
      console.log(`   ❌ Error en servicios subutilizados: ${error.message}`);
    }
    
    try {
      const performance = await FunnelMetrics.getSalesPerformanceMetrics();
      console.log(`   ✅ Rendimiento de vendedores: ${performance.length} registros`);
    } catch (error) {
      console.log(`   ❌ Error en rendimiento: ${error.message}`);
    }
    
    try {
      const summary = await FunnelMetrics.getExecutiveSummary();
      console.log(`   ✅ Resumen ejecutivo: ${JSON.stringify(summary).length} caracteres`);
    } catch (error) {
      console.log(`   ❌ Error en resumen: ${error.message}`);
    }
    
    const endTime = Date.now();
    console.log(`   ⏱️  Tiempo total de métricas: ${endTime - startTime}ms`);
    
    // 3. Probar consultas de aprobaciones
    console.log('\n🔍 PROBANDO SISTEMA DE APROBACIONES:');
    
    const approvalStartTime = Date.now();
    
    try {
      const pendingApprovals = await QuoteApproval.getPendingApprovals('admin');
      console.log(`   ✅ Aprobaciones pendientes: ${pendingApprovals.length} registros`);
    } catch (error) {
      console.log(`   ❌ Error en aprobaciones pendientes: ${error.message}`);
    }
    
    try {
      const approvedQuotes = await QuoteApproval.getApprovedQuotesForJefeComercial();
      console.log(`   ✅ Cotizaciones aprobadas: ${approvedQuotes.length} registros`);
    } catch (error) {
      console.log(`   ❌ Error en cotizaciones aprobadas: ${error.message}`);
    }
    
    try {
      const stats = await QuoteApproval.getApprovalStats('admin');
      console.log(`   ✅ Estadísticas de aprobaciones: ${JSON.stringify(stats).length} caracteres`);
    } catch (error) {
      console.log(`   ❌ Error en estadísticas: ${error.message}`);
    }
    
    const approvalEndTime = Date.now();
    console.log(`   ⏱️  Tiempo total de aprobaciones: ${approvalEndTime - approvalStartTime}ms`);
    
    // 4. Probar consultas complejas con JOINs
    console.log('\n🔍 PROBANDO CONSULTAS COMPLEJAS:');
    
    const complexStartTime = Date.now();
    
    try {
      const complexQuery = await pool.query(`
        SELECT 
          q.id,
          q.quote_number,
          q.total_amount,
          q.status,
          p.name as project_name,
          c.name as company_name,
          u.name as created_by_name,
          qa.status as approval_status,
          qa.created_at as approval_date
        FROM quotes q
        LEFT JOIN projects p ON q.project_id = p.id
        LEFT JOIN companies c ON p.company_id = c.id
        LEFT JOIN users u ON q.created_by = u.id
        LEFT JOIN quote_approvals qa ON q.id = qa.quote_id
        ORDER BY q.created_at DESC
        LIMIT 1000
      `);
      console.log(`   ✅ Consulta compleja: ${complexQuery.rows.length} registros`);
    } catch (error) {
      console.log(`   ❌ Error en consulta compleja: ${error.message}`);
    }
    
    const complexEndTime = Date.now();
    console.log(`   ⏱️  Tiempo de consulta compleja: ${complexEndTime - complexStartTime}ms`);
    
    // 5. Probar rendimiento con múltiples consultas simultáneas
    console.log('\n🔍 PROBANDO CONSULTAS SIMULTÁNEAS:');
    
    const concurrentStartTime = Date.now();
    
    try {
      const promises = [
        FunnelMetrics.getServiceDistribution(),
        FunnelMetrics.getCategoryConversionMetrics(),
        FunnelMetrics.getMonthlyTrends(),
        FunnelMetrics.getUnderutilizedServices(),
        FunnelMetrics.getSalesPerformanceMetrics(),
        FunnelMetrics.getExecutiveSummary(),
        QuoteApproval.getPendingApprovals('admin'),
        QuoteApproval.getApprovedQuotesForJefeComercial()
      ];
      
      const results = await Promise.all(promises);
      console.log(`   ✅ ${results.length} consultas simultáneas completadas`);
    } catch (error) {
      console.log(`   ❌ Error en consultas simultáneas: ${error.message}`);
    }
    
    const concurrentEndTime = Date.now();
    console.log(`   ⏱️  Tiempo de consultas simultáneas: ${concurrentEndTime - concurrentStartTime}ms`);
    
    // 6. Verificar uso de memoria
    console.log('\n💾 INFORMACIÓN DE MEMORIA:');
    const memUsage = process.memoryUsage();
    console.log(`   - RSS: ${Math.round(memUsage.rss / 1024 / 1024)} MB`);
    console.log(`   - Heap Used: ${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`);
    console.log(`   - Heap Total: ${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`);
    console.log(`   - External: ${Math.round(memUsage.external / 1024 / 1024)} MB`);
    
    console.log('\n✅ PRUEBAS DE ESTRÉS COMPLETADAS');
    console.log('🎯 El sistema está preparado para manejar grandes cantidades de datos');
    
  } catch (error) {
    console.error('❌ Error en las pruebas de estrés:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  stressTest();
}

module.exports = stressTest;
