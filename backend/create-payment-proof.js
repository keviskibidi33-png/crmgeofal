const pool = require('./config/db');

async function createPaymentProof() {
  try {
    console.log('💳 CREANDO COMPROBANTE DE PAGO PARA COTIZACIÓN 92...\n');

    // 1. Crear comprobante de pago
    console.log('📤 Creando comprobante de pago...');
    const proofResult = await pool.query(`
      INSERT INTO payment_proofs (
        quote_id, amount_paid, payment_date, payment_method, 
        description, uploaded_by, status, file_path, file_name, file_type, file_size, created_at
      ) VALUES (
        92, 1026.60, NOW(), 'transferencia', 
        'Pago de cotización 92', 1012, 'pendiente', 'comprobante-prueba.pdf', 'comprobante-prueba.pdf', 'application/pdf', 1024, NOW()
      ) RETURNING id
    `);
    
    const proofId = proofResult.rows[0].id;
    console.log(`✅ Comprobante creado con ID: ${proofId}`);

    // 2. Aprobar el comprobante
    console.log('✅ Aprobando comprobante...');
    await pool.query(`
      UPDATE payment_proofs 
      SET status = 'aprobado', approved_by = 1012, approved_at = NOW()
      WHERE id = $1
    `, [proofId]);
    console.log('✅ Comprobante aprobado');

    // 3. Alimentar el embudo manualmente
    console.log('🍯 Alimentando embudo de ventas...');
    
    // Obtener datos de la cotización
    const quoteResult = await pool.query(`
      SELECT id, quote_code, category_main, total, status
      FROM quotes WHERE id = 92
    `);
    
    if (quoteResult.rows.length === 0) {
      console.log('❌ Cotización 92 no encontrada');
      return;
    }
    
    const quote = quoteResult.rows[0];
    console.log(`📋 Cotización: ${quote.id} | Categoría: ${quote.category_main} | Total: S/ ${quote.total}`);
    
    // Obtener ítems de la cotización (desde meta)
    const metaResult = await pool.query(`
      SELECT meta FROM quotes WHERE id = 92
    `);
    
    if (metaResult.rows.length === 0 || !metaResult.rows[0].meta) {
      console.log('❌ No hay meta en la cotización');
      return;
    }
    
    // Parsear meta (es un objeto, no JSON string)
    const meta = metaResult.rows[0].meta;
    console.log('📋 Meta encontrado:', typeof meta);
    
    if (meta.items && meta.items.length > 0) {
      console.log(`📊 Procesando ${meta.items.length} ítems...`);
      
      for (const item of meta.items) {
        if (item.code && item.description) {
          // Mapear código a servicio (simplificado)
          let serviceName = 'Servicio no especificado';
          if (item.code.startsWith('AG')) {
            serviceName = 'ENSAYO AGREGADOS';
          } else if (item.code.startsWith('SU')) {
            serviceName = 'ENSAYO SUELOS';
          }
          
          await pool.query(`
            INSERT INTO funnel_metrics (
              quote_id, quote_code, category_main, service_name, 
              item_name, item_total, total_amount, real_amount_paid, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
          `, [
            92,
            `COT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-092`,
            quote.category_main,
            serviceName,
            `${item.code} - ${item.description}`,
            item.unit_price * item.quantity,
            quote.total,
            1026.60
          ]);
          
          console.log(`✅ Ítem insertado: ${item.code} - ${item.description} (S/ ${item.unit_price * item.quantity})`);
        }
      }
    }
    
    // 4. Actualizar estado de la cotización
    console.log('📋 Actualizando estado de cotización...');
    await pool.query(`
      UPDATE quotes 
      SET status = 'aprobada', status_payment = 'pagado', updated_at = NOW()
      WHERE id = 92
    `);
    console.log('✅ Cotización marcada como aprobada y pagada');

    console.log('\n🎉 EMBUDO ALIMENTADO EXITOSAMENTE!');
    console.log('📊 Ahora deberías ver los ensayos en el dashboard');

  } catch (error) {
    console.error('❌ Error creando comprobante:', error.message);
  } finally {
    await pool.end();
  }
}

createPaymentProof();
