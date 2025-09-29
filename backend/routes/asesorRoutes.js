const express = require('express');
const router = express.Router();
const asesorController = require('../controllers/asesorController');
const auth = require('../middlewares/auth');

// Obtener estadísticas del asesor
router.get('/stats', auth(), asesorController.getAsesorStats);

module.exports = router;
