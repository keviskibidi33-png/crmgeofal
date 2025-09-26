const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {
  getProyectosAsignados,
  getEstadisticasLaboratorio,
  actualizarEstadoProyecto,
  subirArchivosLaboratorio,
  obtenerArchivosProyecto
} = require('../controllers/laboratorioController');

// Aplicar middleware de autenticación a todas las rutas
router.use(auth);

// Obtener proyectos asignados al laboratorio
router.get('/proyectos', getProyectosAsignados);

// Obtener estadísticas del laboratorio
router.get('/estadisticas', getEstadisticasLaboratorio);

// Actualizar estado de un proyecto
router.put('/proyectos/:projectId/estado', actualizarEstadoProyecto);

// Subir archivos del laboratorio
router.post('/proyectos/:projectId/archivos', subirArchivosLaboratorio);

// Obtener archivos de un proyecto
router.get('/proyectos/:projectId/archivos', obtenerArchivosProyecto);

module.exports = router;
