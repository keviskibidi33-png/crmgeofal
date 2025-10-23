const Ensayo = require('../models/ensayo');

const ensayoController = {
  // Obtener todos los ensayos
  async getAll(req, res) {
    try {
      const { search, categoria, ubicacion, page = 1, limit = 50 } = req.query;
      
      const result = await Ensayo.getAll({
        search,
        categoria,
        ubicacion,
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.total,
          pages: Math.ceil(result.total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error obteniendo ensayos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Obtener ensayo por código
  async getByCodigo(req, res) {
    try {
      const { codigo } = req.params;
      
      const ensayo = await Ensayo.getByCodigo(codigo);
      
      if (!ensayo) {
        return res.status(404).json({
          success: false,
          message: 'Ensayos no encontrado'
        });
      }

      // Obtener ensayos requeridos si existen
      const ensayosRequeridos = await Ensayo.getEnsayosRequeridos(codigo);
      ensayo.ensayos_requeridos_detalle = ensayosRequeridos;

      res.json({
        success: true,
        data: ensayo
      });
    } catch (error) {
      console.error('Error obteniendo ensayo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Crear nuevo ensayo
  async create(req, res) {
    try {
      const ensayoData = req.body;
      
      // Validar datos requeridos
      if (!ensayoData.codigo || !ensayoData.descripcion) {
        return res.status(400).json({
          success: false,
          message: 'Código y descripción son requeridos'
        });
      }

      const ensayo = await Ensayo.create(ensayoData);

      res.status(201).json({
        success: true,
        message: 'Ensayos creado exitosamente',
        data: ensayo
      });
    } catch (error) {
      console.error('Error creando ensayo:', error);
      
      if (error.code === '23505') { // Violación de clave única
        return res.status(400).json({
          success: false,
          message: 'El código del ensayo ya existe'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Actualizar ensayo
  async update(req, res) {
    try {
      const { id } = req.params;
      const ensayoData = req.body;

      const ensayo = await Ensayo.update(parseInt(id), ensayoData);

      if (!ensayo) {
        return res.status(404).json({
          success: false,
          message: 'Ensayos no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Ensayos actualizado exitosamente',
        data: ensayo
      });
    } catch (error) {
      console.error('Error actualizando ensayo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Actualizar precio de un ensayo
  async updatePrecio(req, res) {
    try {
      const { codigo } = req.params;
      const { precio } = req.body;

      if (!precio || precio < 0) {
        return res.status(400).json({
          success: false,
          message: 'Precio válido es requerido'
        });
      }

      const ensayo = await Ensayo.updatePrecio(codigo, parseFloat(precio));

      if (!ensayo) {
        return res.status(404).json({
          success: false,
          message: 'Ensayos no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Precio actualizado exitosamente',
        data: ensayo
      });
    } catch (error) {
      console.error('Error actualizando precio:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Actualizar múltiples precios
  async updatePreciosMasivos(req, res) {
    try {
      const { actualizaciones } = req.body;

      if (!Array.isArray(actualizaciones) || actualizaciones.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Array de actualizaciones es requerido'
        });
      }

      // Validar estructura de datos
      for (const item of actualizaciones) {
        if (!item.codigo || !item.precio || item.precio < 0) {
          return res.status(400).json({
            success: false,
            message: 'Cada actualización debe tener código y precio válido'
          });
        }
      }

      const resultados = await Ensayo.updatePreciosMasivos(actualizaciones);

      res.json({
        success: true,
        message: `${resultados.length} precios actualizados exitosamente`,
        data: resultados
      });
    } catch (error) {
      console.error('Error actualizando precios masivos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Obtener estadísticas
  async getStats(req, res) {
    try {
      const stats = await Ensayo.getStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Buscar ensayos para cotización
  async searchForQuote(req, res) {
    try {
      const { q } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Término de búsqueda debe tener al menos 2 caracteres'
        });
      }

      const ensayos = await Ensayo.searchForQuote(q.trim());

      res.json({
        success: true,
        data: ensayos
      });
    } catch (error) {
      console.error('Error buscando ensayos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Importar ensayos desde CSV
  async importFromCSV(req, res) {
    try {
      const { ensayos } = req.body;

      if (!Array.isArray(ensayos) || ensayos.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Array de ensayos es requerido'
        });
      }

      const resultados = [];
      const errores = [];

      for (const ensayoData of ensayos) {
        try {
          // Validar datos requeridos
          if (!ensayoData.codigo || !ensayoData.descripcion) {
            errores.push({
              codigo: ensayoData.codigo || 'N/A',
              error: 'Código y descripción son requeridos'
            });
            continue;
          }

          // Verificar si ya existe
          const existente = await Ensayo.getByCodigo(ensayoData.codigo);
          if (existente) {
            errores.push({
              codigo: ensayoData.codigo,
              error: 'Ensayos ya existe'
            });
            continue;
          }

          const ensayo = await Ensayo.create(ensayoData);
          resultados.push(ensayo);
        } catch (error) {
          errores.push({
            codigo: ensayoData.codigo || 'N/A',
            error: error.message
          });
        }
      }

      res.json({
        success: true,
        message: `Importación completada: ${resultados.length} ensayos importados, ${errores.length} errores`,
        data: {
          importados: resultados,
          errores: errores
        }
      });
    } catch (error) {
      console.error('Error importando ensayos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
};

module.exports = ensayoController;
