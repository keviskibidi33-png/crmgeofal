const ProjectAttachment = require('../models/projectAttachment');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const fileOrganizationService = require('../services/fileOrganizationService');

// Configuración de multer para subida de archivos con sistema inteligente
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const { projectId } = req.params;
      const optimalPath = await fileOrganizationService.getOptimalPath('', projectId);
      const uploadDir = path.dirname(optimalPath);
      
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      console.error('Error creando directorio:', error);
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB límite
  },
  fileFilter: (req, file, cb) => {
    // Permitir solo ciertos tipos de archivo
    const allowedTypes = /pdf|doc|docx|xls|xlsx|ppt|pptx|jpg|jpeg|png|gif|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  }
});

const attachmentController = {
  // Middleware para subida de archivos
  uploadMiddleware: upload.single('file'),

  // Obtener adjuntos de un proyecto
  async getByProject(req, res) {
    try {
      console.log('🔍 getByProject - Iniciando...');
      const { projectId } = req.params;
      console.log('🔍 getByProject - ProjectId:', projectId);
      
      const attachments = await ProjectAttachment.getByProject(projectId);
      console.log('✅ getByProject - Adjuntos encontrados:', attachments.length);
      
      res.json(attachments);
    } catch (error) {
      console.error('❌ Error al obtener adjuntos:', error);
      console.error('❌ Stack trace:', error.stack);
      res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
  },

  // Obtener adjunto por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const attachment = await ProjectAttachment.getById(id);
      
      if (!attachment) {
        return res.status(404).json({ error: 'Adjunto no encontrado' });
      }

      res.json(attachment);
    } catch (error) {
      console.error('Error al obtener adjunto:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Subir nuevo adjunto
  async upload(req, res) {
    try {
      console.log('🔍 upload - Iniciando subida...');
      console.log('🔍 upload - File:', req.file);
      console.log('🔍 upload - Body:', req.body);
      console.log('🔍 upload - User:', req.user);
      
      const { projectId } = req.params;
      const { category_id, subcategory_id, description } = req.body;

      if (!req.file) {
        console.log('❌ upload - No se proporcionó archivo');
        return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
      }

      const attachmentData = {
        projectId: parseInt(projectId),
        categoryId: category_id ? parseInt(category_id) : null,
        subcategoryId: subcategory_id ? parseInt(subcategory_id) : null,
        filename: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        description: description || '',
        uploadedBy: req.user.id
      };

      console.log('🔍 upload - AttachmentData:', attachmentData);
      const attachment = await ProjectAttachment.create(attachmentData);
      console.log('✅ upload - Adjunto creado:', attachment.id);
      res.status(201).json(attachment);
    } catch (error) {
      console.error('❌ Error al subir adjunto:', error);
      console.error('❌ Stack trace:', error.stack);
      res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
  },

  // Actualizar adjunto
  async update(req, res) {
    try {
      const { id } = req.params;
      const { 
        description, 
        category_id, 
        subcategory_id,
        requiere_laboratorio,
        requiere_ingenieria,
        requiere_consultoria,
        requiere_capacitacion,
        requiere_auditoria
      } = req.body;

      console.log('🔄 update - ID:', id);
      console.log('🔄 update - Body:', req.body);
      console.log('🔄 update - Category ID:', category_id);
      console.log('🔄 update - Subcategory ID:', subcategory_id);
      console.log('🔄 update - Servicios:', {
        requiere_laboratorio,
        requiere_ingenieria,
        requiere_consultoria,
        requiere_capacitacion,
        requiere_auditoria
      });

      const attachment = await ProjectAttachment.getById(id);
      if (!attachment) {
        return res.status(404).json({ error: 'Adjunto no encontrado' });
      }

      // Preparar datos de actualización
      const updateData = {
        description: description || attachment.description,
        category_id: category_id || null,
        subcategory_id: subcategory_id || null,
        requiere_laboratorio: requiere_laboratorio === 'true' || requiere_laboratorio === true,
        requiere_ingenieria: requiere_ingenieria === 'true' || requiere_ingenieria === true,
        requiere_consultoria: requiere_consultoria === 'true' || requiere_consultoria === true,
        requiere_capacitacion: requiere_capacitacion === 'true' || requiere_capacitacion === true,
        requiere_auditoria: requiere_auditoria === 'true' || requiere_auditoria === true
      };

      // Si hay un nuevo archivo, manejarlo
      if (req.file) {
        // Eliminar archivo anterior si existe
        if (attachment.file_path) {
          try {
            await fs.unlink(attachment.file_path);
          } catch (error) {
            console.log('Archivo anterior no encontrado o ya eliminado');
          }
        }

        // Actualizar información del archivo
        updateData.file_path = req.file.path;
        updateData.original_name = req.file.originalname;
        updateData.file_size = req.file.size;
        updateData.mime_type = req.file.mimetype;
      }

      const updatedAttachment = await ProjectAttachment.update(id, updateData);
      res.json(updatedAttachment);
    } catch (error) {
      console.error('Error al actualizar adjunto:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Eliminar adjunto
  async delete(req, res) {
    try {
      const { id } = req.params;
      const attachment = await ProjectAttachment.delete(id);
      
      if (!attachment) {
        return res.status(404).json({ error: 'Adjunto no encontrado' });
      }

      res.json({ message: 'Adjunto eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar adjunto:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Descargar adjunto
  async download(req, res) {
    try {
      const { id } = req.params;
      const attachment = await ProjectAttachment.getById(id);
      
      if (!attachment) {
        return res.status(404).json({ error: 'Adjunto no encontrado' });
      }

      // Verificar que el archivo existe
      try {
        await fs.access(attachment.file_path);
      } catch (error) {
        return res.status(404).json({ error: 'Archivo no encontrado en el servidor' });
      }

      // Configurar headers para descarga
      res.setHeader('Content-Disposition', `attachment; filename="${attachment.original_name}"`);
      res.setHeader('Content-Type', attachment.file_type);
      
      // Enviar archivo
      res.sendFile(path.resolve(attachment.file_path));
    } catch (error) {
      console.error('Error al descargar adjunto:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Visualizar adjunto (sin forzar descarga)
  async view(req, res) {
    try {
      const { id } = req.params;
      const attachment = await ProjectAttachment.getById(id);
      
      if (!attachment) {
        return res.status(404).json({ error: 'Adjunto no encontrado' });
      }

      // Verificar que el archivo existe
      try {
        await fs.access(attachment.file_path);
      } catch (error) {
        return res.status(404).json({ error: 'Archivo no encontrado en el servidor' });
      }

      // Configurar headers para visualización (no forzar descarga)
      res.setHeader('Content-Type', attachment.file_type);
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache por 1 hora
      
      // Enviar archivo para visualización
      res.sendFile(path.resolve(attachment.file_path));
    } catch (error) {
      console.error('Error al visualizar adjunto:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Obtener estadísticas de adjuntos por proyecto
  async getStats(req, res) {
    try {
      const { projectId } = req.params;
      const stats = await ProjectAttachment.getStatsByProject(projectId);
      res.json(stats);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Obtener estadísticas de almacenamiento del sistema
  async getStorageStats(req, res) {
    try {
      const stats = await fileOrganizationService.getStorageStats();
      res.json(stats);
    } catch (error) {
      console.error('Error al obtener estadísticas de almacenamiento:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Crear carpetas anticipatorias manualmente
  async createAnticipatoryFolders(req, res) {
    try {
      const result = await fileOrganizationService.createAnticipatoryFolders();
      res.json({ 
        message: result.message,
        currentMonth: result.currentMonth,
        nextMonth: result.nextMonth,
        createdFolders: result.createdFolders,
        existingFolders: result.existingFolders,
        daysUntilMonthEnd: result.daysUntilMonthEnd,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error creando carpetas anticipatorias:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Comprimir carpetas antiguas manualmente
  async compressOldFolders(req, res) {
    try {
      await fileOrganizationService.compressOldFolders();
      res.json({ message: 'Compresión de carpetas antiguas completada' });
    } catch (error) {
      console.error('Error comprimiendo carpetas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Obtener todos los adjuntos con información completa
  async getAllAttachments(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const search = req.query.search || '';
      const project_id = req.query.project_id || '';
      const file_type = req.query.file_type || '';
      
      console.log('🔍 getAllAttachments - Parámetros:', { page, limit, search, project_id, file_type });
      
      const result = await ProjectAttachment.getAllWithDetails({
        page,
        limit,
        search,
        project_id,
        file_type
      });
      
      res.json(result);
    } catch (error) {
      console.error('Error obteniendo adjuntos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = attachmentController;
