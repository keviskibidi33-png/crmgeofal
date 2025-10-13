const pool = require('../config/db');

// Obtener distribución de servicios por categoría
exports.getServiceDistribution = async (req, res) => {
  try {
    const query = `
      SELECT 
        category_main as category_name,
        COUNT(*) as items_count,
        COUNT(DISTINCT quote_id) as quote_count,
        COALESCE(SUM(item_total), 0) as total_amount,
        COALESCE(AVG(item_total), 0) as average_amount,
        COALESCE(SUM(item_total), 0) as items_total_amount
      FROM funnel_metrics
      GROUP BY category_main
      ORDER BY items_count DESC, total_amount DESC
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting service distribution:', error);
    res.status(500).json({ error: 'Error obteniendo distribución de servicios' });
  }
};

// Obtener conversión por categoría (borradores vs aprobadas)
exports.getConversionByCategory = async (req, res) => {
  try {
    const query = `
      SELECT 
        category_main as category_name,
        COUNT(DISTINCT quote_id) as draft_count,
        COUNT(DISTINCT quote_id) as approved_count,
        COUNT(DISTINCT quote_id) as invoiced_count,
        COALESCE(SUM(item_total), 0) as draft_amount,
        COALESCE(SUM(item_total), 0) as approved_amount,
        COALESCE(SUM(item_total), 0) as invoiced_amount,
        100.0 as conversion_rate
      FROM funnel_metrics
      GROUP BY category_main
      ORDER BY conversion_rate DESC, approved_amount DESC
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting conversion by category:', error);
    res.status(500).json({ error: 'Error obteniendo conversión por categoría' });
  }
};

// Obtener tendencias mensuales
exports.getMonthlyTrends = async (req, res) => {
  try {
    const query = `
      SELECT 
        DATE_TRUNC('month', q.created_at) as month,
        COUNT(q.id) as quote_count,
        COALESCE(SUM(q.total), 0) as total_amount,
        COUNT(CASE WHEN q.status = 'aprobada' THEN 1 END) as approved_count,
        COUNT(CASE WHEN q.status = 'facturada' THEN 1 END) as invoiced_count
      FROM quotes q
      WHERE q.created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', q.created_at)
      ORDER BY month DESC
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting monthly trends:', error);
    res.status(500).json({ error: 'Error obteniendo tendencias mensuales' });
  }
};

// Obtener servicios subutilizados
exports.getUnderutilizedServices = async (req, res) => {
  try {
    const query = `
      SELECT 
        service_name,
        category_main as category_name,
        COUNT(*) as usage_count,
        COALESCE(SUM(item_total), 0) as total_revenue
      FROM funnel_metrics
      GROUP BY service_name, category_main
      HAVING COUNT(*) < 3
      ORDER BY usage_count ASC, total_revenue ASC
      LIMIT 10
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting underutilized services:', error);
    res.status(500).json({ error: 'Error obteniendo servicios subutilizados' });
  }
};

// Obtener rendimiento de vendedores
exports.getSalespersonPerformance = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id,
        u.name,
        u.apellido,
        u.area,
        COUNT(q.id) as total_quotes,
        COUNT(CASE WHEN q.status = 'aprobada' THEN 1 END) as approved_quotes,
        COUNT(CASE WHEN q.status = 'facturada' THEN 1 END) as invoiced_quotes,
        COALESCE(SUM(q.total), 0) as total_amount,
        COALESCE(SUM(CASE WHEN q.status = 'aprobada' THEN q.total ELSE 0 END), 0) as approved_amount,
        COALESCE(SUM(CASE WHEN q.status = 'facturada' THEN q.total ELSE 0 END), 0) as invoiced_amount,
        CASE 
          WHEN COUNT(q.id) > 0 
          THEN ROUND(
            (COUNT(CASE WHEN q.status = 'aprobada' THEN 1 END)::decimal / COUNT(q.id)) * 100, 2
          )
          ELSE 0 
        END as approval_rate
      FROM users u
      LEFT JOIN quotes q ON u.id = q.created_by
      WHERE u.role IN ('vendedor_comercial', 'jefa_comercial') 
        AND u.active IS NOT FALSE
        AND q.created_at >= NOW() - INTERVAL '6 months'
      GROUP BY u.id, u.name, u.apellido, u.area
      ORDER BY approved_amount DESC, approval_rate DESC
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting salesperson performance:', error);
    res.status(500).json({ error: 'Error obteniendo rendimiento de vendedores' });
  }
};

// Obtener resumen ejecutivo
exports.getExecutiveSummary = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(DISTINCT fm.quote_id) as approved_quotes,
        COUNT(DISTINCT fm.quote_id) as invoiced_quotes,
        COALESCE(SUM(fm.item_total), 0) as approved_amount,
        COALESCE(SUM(fm.item_total), 0) as invoiced_amount,
        COALESCE(SUM(fm.item_total) / COUNT(DISTINCT fm.quote_id), 0) as average_approved_amount,
        COALESCE(SUM(fm.real_amount_paid) / COUNT(DISTINCT fm.quote_id), 0) as average_invoiced_amount,
        COUNT(DISTINCT q.created_by) as active_salespeople,
        COUNT(DISTINCT q.project_id) as unique_projects
      FROM funnel_metrics fm
      LEFT JOIN quotes q ON fm.quote_id = q.id
      WHERE fm.real_amount_paid > 0
    `;
    
    const result = await pool.query(query);
    
    // Forzar redondeo de decimales
    const summary = result.rows[0];
    const processedSummary = {
      ...summary,
      approved_amount: parseFloat(summary.approved_amount).toFixed(2),
      invoiced_amount: parseFloat(summary.invoiced_amount).toFixed(2),
      average_approved_amount: parseFloat(summary.average_approved_amount).toFixed(2),
      average_invoiced_amount: parseFloat(summary.average_invoiced_amount).toFixed(2)
    };
    
    res.json(processedSummary);
  } catch (error) {
    console.error('Error getting executive summary:', error);
    res.status(500).json({ error: 'Error obteniendo resumen ejecutivo' });
  }
};

// Obtener embudo por área (Laboratorio vs Ingeniería)
exports.getFunnelByArea = async (req, res) => {
  try {
    const query = `
      SELECT 
        s.area,
        COUNT(q.id) as total_quotes,
        COUNT(CASE WHEN q.status = 'borrador' THEN 1 END) as draft_count,
        COUNT(CASE WHEN q.status = 'aprobada' THEN 1 END) as approved_count,
        COUNT(CASE WHEN q.status = 'facturada' THEN 1 END) as invoiced_count,
        COALESCE(SUM(CASE WHEN q.status = 'borrador' THEN q.total ELSE 0 END), 0) as draft_amount,
        COALESCE(SUM(CASE WHEN q.status = 'aprobada' THEN q.total ELSE 0 END), 0) as approved_amount,
        COALESCE(SUM(CASE WHEN q.status = 'facturada' THEN q.total ELSE 0 END), 0) as invoiced_amount
      FROM services s
      LEFT JOIN subservices ss ON s.id = ss.service_id
      LEFT JOIN quote_items qi ON ss.id = qi.subservice_id
      LEFT JOIN quotes q ON qi.quote_id = q.id
      WHERE s.is_active = true
        AND q.created_at >= NOW() - INTERVAL '6 months'
      GROUP BY s.area
      ORDER BY approved_amount DESC
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting funnel by area:', error);
    res.status(500).json({ error: 'Error obteniendo embudo por área' });
  }
};

// Obtener métricas de tiempo de aprobación
exports.getApprovalMetrics = async (req, res) => {
  try {
    const query = `
      SELECT 
        AVG(EXTRACT(EPOCH FROM (q.updated_at - q.created_at))/3600) as avg_approval_hours,
        MIN(EXTRACT(EPOCH FROM (q.updated_at - q.created_at))/3600) as min_approval_hours,
        MAX(EXTRACT(EPOCH FROM (q.updated_at - q.created_at))/3600) as max_approval_hours,
        COUNT(CASE WHEN q.status = 'aprobada' AND q.updated_at - q.created_at <= INTERVAL '24 hours' THEN 1 END) as fast_approvals,
        COUNT(CASE WHEN q.status = 'aprobada' THEN 1 END) as total_approvals
      FROM quotes q
      WHERE q.status = 'aprobada'
        AND q.created_at >= NOW() - INTERVAL '3 months'
    `;
    
    const result = await pool.query(query);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting approval metrics:', error);
    res.status(500).json({ error: 'Error obteniendo métricas de aprobación' });
  }
};

// Obtener ranking de categorías por ítems y dinero
exports.getCategoryRanking = async (req, res) => {
  try {
    const query = `
      SELECT 
        category_main as category_name,
        COUNT(*) as total_items,
        COUNT(DISTINCT quote_id) as total_quotes,
        COALESCE(SUM(real_amount_paid), 0) as total_money,
        ROUND(COALESCE(AVG(real_amount_paid), 0), 2) as average_money_per_quote,
        COALESCE(SUM(item_total), 0) as items_total_value,
        ROUND(
          (COUNT(*)::decimal / (SELECT COUNT(*) FROM funnel_metrics)) * 100, 2
        ) as percentage_of_items
      FROM funnel_metrics
      GROUP BY category_main
      ORDER BY total_items DESC, total_money DESC
    `;
    
    const result = await pool.query(query);
    
    // Forzar redondeo de decimales para evitar 1026.6000000000000000
    const processedRows = result.rows.map(row => ({
      ...row,
      total_money: parseFloat(row.total_money).toFixed(2),
      average_money_per_quote: parseFloat(row.average_money_per_quote).toFixed(2),
      items_total_value: parseFloat(row.items_total_value).toFixed(2)
    }));
    
    res.json(processedRows);
  } catch (error) {
    console.error('Error getting category ranking:', error);
    res.status(500).json({ error: 'Error obteniendo ranking de categorías' });
  }
};

// Obtener ranking de ensayos (servicios padre) por hijos cotizados
exports.getEnsayosRanking = async (req, res) => {
  try {
    const query = `
      SELECT 
        service_name as ensayo_name,
        category_main,
        COUNT(*) as total_hijos_cotizados,
        COUNT(DISTINCT quote_id) as total_quotes,
        COALESCE(SUM(real_amount_paid), 0) as total_money,
        ROUND(COALESCE(AVG(real_amount_paid), 0), 2) as average_money_per_quote,
        COALESCE(SUM(item_total), 0) as items_total_value,
        ROUND(
          (COUNT(*)::decimal / (SELECT COUNT(*) FROM funnel_metrics)) * 100, 2
        ) as percentage_of_items
      FROM funnel_metrics
      WHERE service_name != 'Servicio no especificado'
      GROUP BY service_name, category_main
      ORDER BY total_hijos_cotizados DESC, total_money DESC
    `;
    
    const result = await pool.query(query);
    
    // Forzar redondeo de decimales para evitar 1026.6000000000000000
    const processedRows = result.rows.map(row => ({
      ...row,
      total_money: parseFloat(row.total_money).toFixed(2),
      average_money_per_quote: parseFloat(row.average_money_per_quote).toFixed(2),
      items_total_value: parseFloat(row.items_total_value).toFixed(2)
    }));
    
    res.json(processedRows);
  } catch (error) {
    console.error('Error getting ensayos ranking:', error);
    res.status(500).json({ error: 'Error obteniendo ranking de ensayos' });
  }
};

// Obtener estructura jerárquica completa (Categorías → Ensayos → Subservicios)
exports.getHierarchicalStructure = async (req, res) => {
  try {
    const query = `
      WITH category_totals AS (
        SELECT 
          category_main,
          COUNT(*) as total_items,
          COUNT(DISTINCT quote_id) as total_quotes,
          COALESCE(SUM(item_total), 0) as total_money
        FROM funnel_metrics
        GROUP BY category_main
      ),
      ensayo_totals AS (
        SELECT 
          service_name as ensayo_name,
          category_main,
          COUNT(*) as total_hijos_cotizados,
          COUNT(DISTINCT quote_id) as total_quotes,
          COALESCE(SUM(item_total), 0) as total_money
        FROM funnel_metrics
        WHERE service_name != 'Servicio no especificado'
        GROUP BY service_name, category_main
      ),
      subservicio_totals AS (
        SELECT 
          item_name as subservicio_name,
          service_name as ensayo_name,
          category_main,
          COUNT(*) as veces_cotizado,
          COUNT(DISTINCT quote_id) as total_quotes,
          COALESCE(SUM(item_total), 0) as total_money
        FROM funnel_metrics
        WHERE item_name != 'Ítem sin nombre'
        GROUP BY item_name, service_name, category_main
      )
      SELECT 
        'category' as level,
        category_main as name,
        NULL::text as parent_name,
        total_items::integer as total_items,
        total_quotes::integer as total_quotes,
        total_money::decimal as total_money,
        NULL::integer as veces_cotizado,
        1 as sort_order
      FROM category_totals
      
      UNION ALL
      
      SELECT 
        'ensayo' as level,
        ensayo_name as name,
        category_main as parent_name,
        total_hijos_cotizados::integer as total_items,
        total_quotes::integer as total_quotes,
        total_money::decimal as total_money,
        NULL::integer as veces_cotizado,
        2 as sort_order
      FROM ensayo_totals
      
      UNION ALL
      
      SELECT 
        'subservicio' as level,
        subservicio_name as name,
        ensayo_name as parent_name,
        NULL::integer as total_items,
        total_quotes::integer as total_quotes,
        total_money::decimal as total_money,
        veces_cotizado::integer as veces_cotizado,
        3 as sort_order
      FROM subservicio_totals
      
      ORDER BY sort_order, total_money DESC, total_items DESC
    `;
    
    const result = await pool.query(query);
    
    // Forzar redondeo de decimales para evitar 1026.6000000000000000
    const processedRows = result.rows.map(row => ({
      ...row,
      total_money: parseFloat(row.total_money).toFixed(2)
    }));
    
    res.json(processedRows);
  } catch (error) {
    console.error('Error getting hierarchical structure:', error);
    res.status(500).json({ error: 'Error obteniendo estructura jerárquica' });
  }
};

// ✅ NUEVO: Alimentar embudo de ventas automáticamente
exports.alimentarEmbudo = async (req, res) => {
  try {
    const { quoteId, realAmountPaid } = req.body;
    
    console.log('🍯 alimentarEmbudo - Iniciando proceso:', { quoteId, realAmountPaid });
    
    // 1. Obtener datos completos de la cotización
    const quoteResult = await pool.query(`
      SELECT 
        q.id, q.quote_code, q.category_main, q.total, q.status,
        p.name as project_name,
        c.name as company_name
      FROM quotes q
      LEFT JOIN projects p ON q.project_id = p.id
      LEFT JOIN companies c ON p.company_id = c.id
      WHERE q.id = $1
    `, [quoteId]);
    
    if (quoteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }
    
    const quote = quoteResult.rows[0];
    console.log('📋 Cotización encontrada:', quote);
    
    // 2. Obtener todos los ítems de la cotización con sus servicios
    const itemsResult = await pool.query(`
      SELECT 
        qi.name as item_name,
        qi.total_price as item_total,
        s.name as service_name,
        s.area as service_area,
        sub.codigo as subservice_code,
        sub.descripcion as subservice_description
      FROM quote_items qi
      LEFT JOIN subservices sub ON qi.subservice_id = sub.id
      LEFT JOIN services s ON sub.service_id = s.id
      WHERE qi.quote_id = $1
    `, [quoteId]);
    
    console.log('📊 Ítems encontrados:', itemsResult.rows.length);
    
    // 3. Calcular distribución proporcional del monto real
    const totalItemsValue = itemsResult.rows.reduce((sum, item) => sum + parseFloat(item.item_total || 0), 0);
    console.log('💰 Total de ítems:', totalItemsValue);
    console.log('💰 Monto real pagado:', realAmountPaid);
    
    // 4. Insertar cada ítem en funnel_metrics con distribución proporcional
    for (const item of itemsResult.rows) {
      const itemValue = parseFloat(item.item_total || 0);
      const proportionalAmount = totalItemsValue > 0 ? (itemValue / totalItemsValue) * parseFloat(realAmountPaid) : 0;
      
      await pool.query(`
        INSERT INTO funnel_metrics (
          quote_id, quote_code, category_main, service_name, 
          item_name, item_total, total_amount, real_amount_paid, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      `, [
        quoteId,
        quote.quote_code,
        quote.category_main,
        item.service_name || 'Servicio no especificado',
        item.item_name || 'Ítem sin nombre',
        itemValue,
        quote.total,
        proportionalAmount
      ]);
      
      console.log('✅ Ítem insertado en embudo:', {
        service: item.service_name,
        item: item.item_name,
        itemValue: itemValue,
        proportionalAmount: proportionalAmount
      });
    }
    
    // 4. Actualizar estado de la cotización
    await pool.query(`
      UPDATE quotes 
      SET status = 'aprobada', status_payment = 'pagado', updated_at = NOW()
      WHERE id = $1
    `, [quoteId]);
    
    console.log('🎉 Embudo alimentado exitosamente');
    
    res.json({ 
      success: true, 
      message: 'Embudo alimentado exitosamente',
      itemsProcessed: itemsResult.rows.length,
      quoteCode: quote.quote_code,
      category: quote.category_main
    });
    
  } catch (error) {
    console.error('❌ Error alimentando embudo:', error);
    res.status(500).json({ error: 'Error alimentando embudo: ' + error.message });
  }
};