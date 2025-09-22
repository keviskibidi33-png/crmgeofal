const ProjectCategory = require('../models/projectCategory');
const ProjectSubcategory = require('../models/projectSubcategory');

const categoryController = {
  // Obtener todas las categorías
  async getAll(req, res) {
    try {
      const categories = await ProjectCategory.getAll();
      res.json(categories);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Obtener categoría por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const category = await ProjectCategory.getById(id);
      
      if (!category) {
        return res.status(404).json({ error: 'Categoría no encontrada' });
      }

      // Obtener subcategorías de esta categoría
      const subcategories = await ProjectCategory.getSubcategories(id);
      category.subcategories = subcategories;

      res.json(category);
    } catch (error) {
      console.error('Error al obtener categoría:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Crear nueva categoría
  async create(req, res) {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'El nombre es requerido' });
      }

      const category = await ProjectCategory.create({ name, description });
      res.status(201).json(category);
    } catch (error) {
      console.error('Error al crear categoría:', error);
      if (error.code === '23505') { // Violación de restricción única
        res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
      } else {
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    }
  },

  // Actualizar categoría
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'El nombre es requerido' });
      }

      const category = await ProjectCategory.update(id, { name, description });
      
      if (!category) {
        return res.status(404).json({ error: 'Categoría no encontrada' });
      }

      res.json(category);
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      if (error.code === '23505') { // Violación de restricción única
        res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
      } else {
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    }
  },

  // Eliminar categoría
  async delete(req, res) {
    try {
      const { id } = req.params;
      const category = await ProjectCategory.delete(id);
      
      if (!category) {
        return res.status(404).json({ error: 'Categoría no encontrada' });
      }

      res.json({ message: 'Categoría eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = categoryController;