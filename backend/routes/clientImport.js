const express = require('express');
const multer = require('multer');
const path = require('path');
const clientImportController = require('../controllers/clientImportController');
const auth = require('../middlewares/auth');
const rolePermissions = require('../middlewares/rolePermissions');

const router = express.Router();

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'backend/tmp/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'client-import-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Aceptar solo archivos CSV
  if (file.mimetype === 'text/csv' || path.extname(file.originalname).toLowerCase() === '.csv') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos CSV'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB límite
  }
});

// Middleware para verificar permisos de administrador
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Solo los administradores pueden acceder a esta funcionalidad'
    });
  }
  next();
};

/**
 * @swagger
 * /api/client-import/clean:
 *   post:
 *     summary: Limpiar datos existentes antes de importación
 *     description: Elimina todos los usuarios, proyectos y clientes existentes, manteniendo solo usuarios administradores
 *     tags: [Client Import]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos limpiados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       500:
 *         description: Error del servidor
 */
router.post('/clean', auth, requireAdmin, clientImportController.cleanExistingData);

/**
 * @swagger
 * /api/client-import/import:
 *   post:
 *     summary: Importar clientes desde archivo CSV
 *     description: Importa clientes desde un archivo CSV con el formato de seguimiento de clientes
 *     tags: [Client Import]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Archivo CSV con datos de clientes
 *     responses:
 *       200:
 *         description: Importación completada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Error en la solicitud
 *       500:
 *         description: Error del servidor
 */
router.post('/import', auth, requireAdmin, upload.single('file'), clientImportController.importClients);

/**
 * @swagger
 * /api/client-import/stats:
 *   get:
 *     summary: Obtener estadísticas de clientes importados
 *     description: Retorna estadísticas de los clientes importados
 *     tags: [Client Import]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       500:
 *         description: Error del servidor
 */
router.get('/stats', auth, clientImportController.getImportStats);

module.exports = router;
