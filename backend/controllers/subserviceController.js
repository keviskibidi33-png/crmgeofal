const Subservice = require('../models/subservice');

// Búsqueda inteligente para autocompletado
exports.search = async (req, res) => {
  try {
    const { q, service_id } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ subservices: [] });
    }
    
    const results = await Subservice.search(q, service_id);
    res.json({ subservices: results });
  } catch (err) {
    console.error('Error en búsqueda de subservicios:', err);
    res.status(500).json({ error: 'Error al buscar subservicios' });
  }
};

// Obtener todos los subservicios
exports.getAll = async (req, res) => {
  try {
    const { service_id, area, q, page, limit } = req.query;
    const { rows, total } = await Subservice.getAll({ 
      serviceId: service_id, 
      area, 
      q, 
      page: parseInt(page) || 1, 
      limit: parseInt(limit) || 20 
    });
    
    res.json({ 
      subservices: rows, 
      total,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });
  } catch (err) {
    console.error('Error al obtener subservicios:', err);
    res.status(500).json({ error: 'Error al obtener subservicios' });
  }
};

// Obtener subservicio por ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const subservice = await Subservice.getById(id);
    
    if (!subservice) {
      return res.status(404).json({ error: 'Subservicio no encontrado' });
    }
    
    res.json(subservice);
  } catch (err) {
    console.error('Error al obtener subservicio:', err);
    res.status(500).json({ error: 'Error al obtener subservicio' });
  }
};

// Obtener subservicio por código
exports.getByCodigo = async (req, res) => {
  try {
    const { codigo } = req.params;
    const subservice = await Subservice.getByCodigo(codigo);
    
    if (!subservice) {
      return res.status(404).json({ error: 'Subservicio no encontrado' });
    }
    
    res.json(subservice);
  } catch (err) {
    console.error('Error al obtener subservicio por código:', err);
    res.status(500).json({ error: 'Error al obtener subservicio' });
  }
};

// Crear subservicio
exports.create = async (req, res) => {
  try {
    const { codigo, descripcion, norma, precio, service_id } = req.body;
    
    // Validaciones
    if (!codigo || !descripcion || !service_id) {
      return res.status(400).json({ 
        error: 'Código, descripción y servicio son requeridos' 
      });
    }
    
    if (precio < 0) {
      return res.status(400).json({ 
        error: 'El precio no puede ser negativo' 
      });
    }
    
    const subservice = await Subservice.create({
      codigo,
      descripcion,
      norma: norma || null,
      precio: parseFloat(precio) || 0,
      service_id
    });
    
    res.status(201).json(subservice);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ 
        error: 'Ya existe un subservicio con ese código' 
      });
    }
    console.error('Error al crear subservicio:', err);
    res.status(500).json({ error: 'Error al crear subservicio' });
  }
};

// Actualizar subservicio
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, descripcion, norma, precio, service_id } = req.body;
    
    if (precio < 0) {
      return res.status(400).json({ 
        error: 'El precio no puede ser negativo' 
      });
    }
    
    const subservice = await Subservice.update(id, {
      codigo,
      descripcion,
      norma: norma || null,
      precio: parseFloat(precio) || 0,
      service_id
    });
    
    if (!subservice) {
      return res.status(404).json({ error: 'Subservicio no encontrado' });
    }
    
    res.json(subservice);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ 
        error: 'Ya existe un subservicio con ese código' 
      });
    }
    console.error('Error al actualizar subservicio:', err);
    res.status(500).json({ error: 'Error al actualizar subservicio' });
  }
};

// Eliminar subservicio
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const subservice = await Subservice.remove(id);
    
    if (!subservice) {
      return res.status(404).json({ error: 'Subservicio no encontrado' });
    }
    
    res.status(204).end();
  } catch (err) {
    console.error('Error al eliminar subservicio:', err);
    res.status(500).json({ error: 'Error al eliminar subservicio' });
  }
};

// Eliminar permanentemente
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Subservice.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Subservicio no encontrado' });
    }
    
    res.status(204).end();
  } catch (err) {
    console.error('Error al eliminar subservicio:', err);
    res.status(500).json({ error: 'Error al eliminar subservicio' });
  }
};