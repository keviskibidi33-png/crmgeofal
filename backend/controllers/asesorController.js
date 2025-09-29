const pool = require('../config/db');

// Obtener estadísticas del asesor
exports.getAsesorStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Obtener cotizaciones del asesor
    const quotesResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved
      FROM quotes 
      WHERE created_by = $1
    `, [userId]);

    // Obtener comprobantes del asesor
    const proofsResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved
      FROM payment_proofs 
      WHERE uploaded_by = $1
    `, [userId]);

    // Obtener cotizaciones recientes
    const recentQuotes = await pool.query(`
      SELECT 
        q.*,
        p.name as project_name,
        c.name as company_name
      FROM quotes q
      LEFT JOIN projects p ON q.project_id = p.id
      LEFT JOIN companies c ON p.company_id = c.id
      WHERE q.created_by = $1
      ORDER BY q.created_at DESC
      LIMIT 5
    `, [userId]);

    // Obtener comprobantes recientes
    const recentProofs = await pool.query(`
      SELECT 
        pp.*,
        q.quote_number
      FROM payment_proofs pp
      JOIN quotes q ON pp.quote_id = q.id
      WHERE pp.uploaded_by = $1
      ORDER BY pp.created_at DESC
      LIMIT 5
    `, [userId]);

    const stats = {
      quotes: {
        total: parseInt(quotesResult.rows[0].total),
        pending: parseInt(quotesResult.rows[0].pending),
        approved: parseInt(quotesResult.rows[0].approved)
      },
      proofs: {
        total: parseInt(proofsResult.rows[0].total),
        pending: parseInt(proofsResult.rows[0].pending),
        approved: parseInt(proofsResult.rows[0].approved)
      },
      recentQuotes: recentQuotes.rows,
      recentProofs: recentProofs.rows
    };

    res.json(stats);
  } catch (error) {
    console.error('Error getting asesor stats:', error);
    res.status(500).json({ error: error.message });
  }
};
