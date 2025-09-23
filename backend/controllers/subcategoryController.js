const ProjectSubcategory = require('../models/projectSubcategory');

const subcategoryController = {
  // Obtener todas las subcategorías
  async getAll(req, res) {
    try {
      const { category_id } = req.query;
      
      console.log('🔍 Subcategorías - category_id recibido:', category_id);
      console.log('🔍 Subcategorías - tipo de category_id:', typeof category_id);
      
      let subcategories;
      if (category_id) {
        subcategories = await ProjectSubcategory.getByCategory(category_id);
      } else {
        subcategories = await ProjectSubcategory.getAll();
      }
      
      res.json(subcategories);
    } catch (error) {
      console.error('Error al obtener subcategorías:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Obtener subcategoría por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const subcategory = await ProjectSubcategory.getById(id);
      
      if (!subcategory) {
        return res.status(404).json({ error: 'Subcategoría no encontrada' });
      }

      res.json(subcategory);
    } catch (error) {
      console.error('Error al obtener subcategoría:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Crear nueva subcategoría
  async create(req, res) {
    try {
      const { category_id, name, description } = req.body;

      if (!category_id || !name) {
        return res.status(400).json({ error: 'El ID de categoría y el nombre son requeridos' });
      }

      const subcategory = await ProjectSubcategory.create({ category_id, name, description });
      res.status(201).json(subcategory);
    } catch (error) {
      console.error('Error al crear subcategoría:', error);
      if (error.code === '23505') { // Violación de restricción única
        res.status(400).json({ error: 'Ya existe una subcategoría con ese nombre en esta categoría' });
      } else {
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    }
  },

  // Actualizar subcategoría
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'El nombre es requerido' });
      }

      const subcategory = await ProjectSubcategory.update(id, { name, description });
      
      if (!subcategory) {
        return res.status(404).json({ error: 'Subcategoría no encontrada' });
      }

      res.json(subcategory);
    } catch (error) {
      console.error('Error al actualizar subcategoría:', error);
      if (error.code === '23505') { // Violación de restricción única
        res.status(400).json({ error: 'Ya existe una subcategoría con ese nombre en esta categoría' });
      } else {
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    }
  },

  // Eliminar subcategoría
  async delete(req, res) {
    try {
      const { id } = req.params;
      const subcategory = await ProjectSubcategory.delete(id);
      
      if (!subcategory) {
        return res.status(404).json({ error: 'Subcategoría no encontrada' });
      }

      res.json({ message: 'Subcategoría eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar subcategoría:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = subcategoryController;