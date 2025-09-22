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
      const { projectId } = req.params;
      const attachments = await ProjectAttachment.getByProject(projectId);
      res.json(attachments);
    } catch (error) {
      console.error('Error al obtener adjuntos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
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
      const { projectId } = req.params;
      const { category_id, subcategory_id, description } = req.body;

      if (!req.file) {
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

      const attachment = await ProjectAttachment.create(attachmentData);
      res.status(201).json(attachment);
    } catch (error) {
      console.error('Error al subir adjunto:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Actualizar adjunto
  async update(req, res) {
    try {
      const { id } = req.params;
      const { description } = req.body;

      const attachment = await ProjectAttachment.getById(id);
      if (!attachment) {
        return res.status(404).json({ error: 'Adjunto no encontrado' });
      }

      // Actualizar solo la descripción por ahora
      const updatedAttachment = await ProjectAttachment.update(id, { description });
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
      const folders = await fileOrganizationService.createAnticipatoryFolders();
      res.json({ 
        message: 'Carpetas anticipatorias creadas exitosamente',
        folders 
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
  }
};

module.exports = attachmentController;
