const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middlewares/auth');

// Reporte: Ventas por vendedor y mes
router.get('/ventas-por-vendedor', auth(['jefa_comercial']), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, EXTRACT(YEAR FROM p.created_at) AS year, EXTRACT(MONTH FROM p.created_at) AS month, COUNT(p.id) AS total_proyectos
      FROM users u
      JOIN projects p ON p.vendedor_id = u.id
      GROUP BY u.id, year, month
      ORDER BY year DESC, month DESC, u.name
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al generar reporte' });
  }
});

// Reporte: Totales por proyecto, categorías y subcategorías
router.get('/proyectos-categorias', auth(), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id AS project_id, p.name AS project_name, c.name AS category, sc.name AS subcategory
      FROM projects p
      LEFT JOIN quotes q ON q.project_id = p.id
      LEFT JOIN categories c ON c.id = q.id
      LEFT JOIN subcategories sc ON sc.category_id = c.id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al generar reporte' });
  }
});

// Reporte: Dashboard resumen

// Dashboard resumen con total de usuarios
router.get('/dashboard', auth(), async (req, res) => {
  try {
    const [totalUsuarios, totalEmpresas, totalProyectos, totalCotizaciones] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM companies'),
      pool.query('SELECT COUNT(*) FROM projects'),
      pool.query('SELECT COUNT(*) FROM quotes')
    ]);
    res.json({
      totalUsuarios: parseInt(totalUsuarios.rows[0].count),
      totalEmpresas: parseInt(totalEmpresas.rows[0].count),
      totalProyectos: parseInt(totalProyectos.rows[0].count),
      totalCotizaciones: parseInt(totalCotizaciones.rows[0].count)
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al generar dashboard' });
  }
});

module.exports = router;
