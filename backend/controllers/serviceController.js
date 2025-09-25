const Service = require('../models/service');

// Obtener todos los servicios
exports.getAll = async (req, res) => {
  try {
    const { type, search, page = 1, limit = 20 } = req.query;
    const { rows, total } = await Service.getAll({ type, search, page, limit });
    res.json({ data: rows, total });
  } catch (err) {
    console.error('Error obteniendo servicios:', err);
    res.status(500).json({ error: 'Error al obtener servicios' });
  }
};

// Obtener servicio por ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.getById(id);
    if (!service) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }
    res.json({ data: service });
  } catch (err) {
    console.error('Error obteniendo servicio:', err);
    res.status(500).json({ error: 'Error al obtener servicio' });
  }
};

// Obtener subservicios de un servicio
exports.getSubservices = async (req, res) => {
  try {
    const { id } = req.params;
    const { search, page = 1, limit = 50 } = req.query;
    const { rows, total } = await Service.getSubservices(id, { search, page, limit });
    res.json({ data: rows, total });
  } catch (err) {
    console.error('Error obteniendo subservicios:', err);
    res.status(500).json({ error: 'Error al obtener subservicios' });
  }
};

// Crear nuevo servicio
exports.create = async (req, res) => {
  try {
    const serviceData = req.body;
    const newService = await Service.create(serviceData);
    res.status(201).json({ data: newService });
  } catch (err) {
    console.error('Error creando servicio:', err);
    res.status(500).json({ error: 'Error al crear servicio' });
  }
};

// Actualizar servicio
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const serviceData = req.body;
    const updatedService = await Service.update(id, serviceData);
    if (!updatedService) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }
    res.json({ data: updatedService });
  } catch (err) {
    console.error('Error actualizando servicio:', err);
    res.status(500).json({ error: 'Error al actualizar servicio' });
  }
};

// Eliminar servicio
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Service.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }
    res.json({ message: 'Servicio eliminado correctamente' });
  } catch (err) {
    console.error('Error eliminando servicio:', err);
    res.status(500).json({ error: 'Error al eliminar servicio' });
  }
};

// Obtener estadísticas de servicios
exports.getStats = async (req, res) => {
  try {
    const stats = await Service.getStats();
    res.json({ data: stats });
  } catch (err) {
    console.error('Error obteniendo estadísticas:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};