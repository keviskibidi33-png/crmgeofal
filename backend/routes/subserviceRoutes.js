const express = require('express');
const router = express.Router();
const {
  getAllSubservices,
  searchSubservices,
  getSubserviceByCode,
  getSuggestionsByCategory
} = require('../controllers/subserviceController');

// Obtener todos los subservicios (endpoint principal)
router.get('/', getAllSubservices);

// Buscar subservicios para autocompletado
router.get('/search', searchSubservices);

// Obtener subservicio por código
router.get('/by-code/:codigo', getSubserviceByCode);

// Obtener sugerencias por categoría
router.get('/suggestions', getSuggestionsByCategory);

module.exports = router;