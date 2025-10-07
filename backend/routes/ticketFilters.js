const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authenticateToken = require('../middlewares/auth');

// Obtener usuarios para asignación
router.get('/users', authenticateToken(['admin', 'jefa_comercial', 'soporte']), async (req, res) => {
  try {
    const query = `
      SELECT id, name, apellido, email, role, area 
      FROM users 
      WHERE active = true 
      ORDER BY name, apellido
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener módulos disponibles
router.get('/modules', authenticateToken(['admin', 'jefa_comercial', 'soporte']), async (req, res) => {
  try {
    // Retornar módulos estáticos por ahora para evitar errores de base de datos
    const modules = [
      { value: 'sistema', label: 'Sistema' },
      { value: 'comercial', label: 'Comercial' },
      { value: 'laboratorio', label: 'Laboratorio' },
      { value: 'facturacion', label: 'Facturación' },
      { value: 'soporte', label: 'Soporte' },
      { value: 'gerencia', label: 'Gerencia' }
    ];
    res.json(modules);
  } catch (error) {
    console.error('Error obteniendo módulos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener categorías disponibles
router.get('/categories', authenticateToken(['admin', 'jefa_comercial', 'soporte']), async (req, res) => {
  try {
    // Retornar categorías estáticas por ahora para evitar errores de base de datos
    const categories = [
      { value: 'tecnico', label: 'Técnico' },
      { value: 'funcional', label: 'Funcional' },
      { value: 'usuario', label: 'Usuario' },
      { value: 'sistema', label: 'Sistema' },
      { value: 'reporte', label: 'Reporte' },
      { value: 'integracion', label: 'Integración' }
    ];
    res.json(categories);
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener tipos disponibles
router.get('/types', authenticateToken(['admin', 'jefa_comercial', 'soporte']), async (req, res) => {
  try {
    // Retornar tipos estáticos por ahora para evitar errores de base de datos
    const types = [
      { value: 'bug', label: 'Bug/Error' },
      { value: 'mejora', label: 'Mejora' },
      { value: 'consulta', label: 'Consulta' },
      { value: 'solicitud', label: 'Solicitud' },
      { value: 'incidente', label: 'Incidente' }
    ];
    res.json(types);
  } catch (error) {
    console.error('Error obteniendo tipos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener estadísticas de tickets
router.get('/stats', authenticateToken(['admin', 'jefa_comercial', 'soporte']), async (req, res) => {
  try {
    // Retornar estadísticas básicas por ahora para evitar errores de base de datos
    const stats = {
      total: 0,
      abierto: 0,
      en_progreso: 0,
      resuelto: 0,
      cerrado: 0,
      cancelado: 0,
      prioridad_baja: 0,
      prioridad_media: 0,
      prioridad_alta: 0,
      prioridad_critica: 0
    };
    res.json(stats);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
