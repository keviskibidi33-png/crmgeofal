const express = require('express');
const router = express.Router();
const ensayoController = require('../controllers/ensayoController');
const auth = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/rolePermissions');

// Ruta de prueba sin autenticación
router.get('/test', async (req, res) => {
  try {
    const pool = require('../config/db');
    const result = await pool.query('SELECT COUNT(*) as total FROM ensayos');
    res.json({
      success: true,
      message: 'API funcionando',
      totalEnsayos: result.rows[0].total,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Ruta temporal para obtener ensayos sin autenticación (para debugging)
router.get('/temp', async (req, res) => {
  try {
    const { page = 1, limit = 50, search, categoria, ubicacion } = req.query;
    const pool = require('../config/db');

    let whereClause = '';
    let queryParams = [];
    let paramCount = 0;

    // Construir filtros
    if (search) {
      paramCount++;
      whereClause += ` AND (codigo ILIKE $${paramCount} OR descripcion ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    if (categoria) {
      paramCount++;
      whereClause += ` AND categoria = $${paramCount}`;
      queryParams.push(categoria);
    }

    if (ubicacion) {
      paramCount++;
      whereClause += ` AND ubicacion = $${paramCount}`;
      queryParams.push(ubicacion);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    paramCount++;
    queryParams.push(parseInt(limit));
    paramCount++;
    queryParams.push(offset);

    const result = await pool.query(`
      SELECT * FROM ensayos
      WHERE 1=1 ${whereClause}
      ORDER BY codigo
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `, queryParams);

    const countQuery = `SELECT COUNT(*) as total FROM ensayos WHERE 1=1 ${whereClause}`;
    const countResult = await pool.query(countQuery, queryParams.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error en ruta temporal:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// Middleware de autenticación para todas las rutas
router.use(auth);

// Rutas públicas (solo autenticación requerida)
router.get('/search', ensayoController.searchForQuote);

// Rutas que requieren permisos específicos
router.get('/', ensayoController.getAll);

router.get('/stats', ensayoController.getStats);

router.get('/:codigo', ensayoController.getByCodigo);

// Rutas de administración (solo admin y jefe de laboratorio)
router.post('/', ensayoController.create);

router.put('/:id', ensayoController.update);

router.put('/:codigo/precio', ensayoController.updatePrecio);

router.put('/precios/masivos', ensayoController.updatePreciosMasivos);

router.post('/import', ensayoController.importFromCSV);

module.exports = router;
