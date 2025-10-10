const QuoteEvidence = require('../models/QuoteEvidence');
const fs = require('fs').promises;
const path = require('path');

/**
 * Subir una nueva evidencia
 */
exports.uploadEvidence = async (req, res) => {
  try {
    const { quoteId } = req.params;
    const { evidence_type, notes } = req.body;

    // Validar que se subió un archivo
    if (!req.file) {
      return res.status(400).json({ message: 'No se proporcionó ningún archivo' });
    }

    // Validar tipo de evidencia
    const validTypes = ['primer_contacto', 'aceptacion', 'finalizacion'];
    if (!validTypes.includes(evidence_type)) {
      // Eliminar archivo subido
      await fs.unlink(req.file.path);
      return res.status(400).json({ 
        message: 'Tipo de evidencia inválido. Debe ser: primer_contacto, aceptacion o finalizacion' 
      });
    }

    // Validar tipo de archivo (PDF, Excel, imágenes)
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/png',
      'image/jpeg',
      'image/jpg'
    ];

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      // Eliminar archivo subido
      await fs.unlink(req.file.path);
      return res.status(400).json({ 
        message: 'Tipo de archivo no permitido. Solo se aceptan PDF, Excel (.xlsx) e imágenes (PNG, JPG)' 
      });
    }

    // Crear registro en base de datos
    const evidence = await QuoteEvidence.create({
      quote_id: quoteId,
      evidence_type,
      file_name: req.file.originalname,
      file_path: req.file.path,
      file_type: req.file.mimetype,
      file_size: req.file.size,
      uploaded_by: req.user?.id || null,
      notes: notes || null
    });

    res.status(201).json({
      message: 'Evidencia subida correctamente',
      evidence
    });

  } catch (error) {
    console.error('Error al subir evidencia:', error);
    // Intentar eliminar el archivo si hubo error
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error al eliminar archivo:', unlinkError);
      }
    }
    res.status(500).json({ 
      message: 'Error al subir evidencia', 
      error: error.message 
    });
  }
};

/**
 * Listar evidencias de una cotización
 */
exports.listEvidences = async (req, res) => {
  try {
    const { quoteId } = req.params;
    const { type } = req.query;

    let evidences;
    if (type) {
      evidences = await QuoteEvidence.findByQuoteAndType(quoteId, type);
    } else {
      evidences = await QuoteEvidence.findByQuoteId(quoteId);
    }

    // Agrupar por tipo
    const grouped = {
      primer_contacto: evidences.filter(e => e.evidence_type === 'primer_contacto'),
      aceptacion: evidences.filter(e => e.evidence_type === 'aceptacion'),
      finalizacion: evidences.filter(e => e.evidence_type === 'finalizacion')
    };

    res.json({
      evidences,
      grouped,
      count: evidences.length
    });

  } catch (error) {
    console.error('Error al listar evidencias:', error);
    res.status(500).json({ 
      message: 'Error al listar evidencias', 
      error: error.message 
    });
  }
};

/**
 * Obtener estadísticas de evidencias
 */
exports.getEvidencesStats = async (req, res) => {
  try {
    const { quoteId } = req.params;
    const stats = await QuoteEvidence.countByQuote(quoteId);

    res.json(stats);

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      message: 'Error al obtener estadísticas', 
      error: error.message 
    });
  }
};

/**
 * Descargar una evidencia
 */
exports.downloadEvidence = async (req, res) => {
  try {
    const { id } = req.params;

    const evidence = await QuoteEvidence.findById(id);
    if (!evidence) {
      return res.status(404).json({ message: 'Evidencia no encontrada' });
    }

    // Verificar que el archivo existe
    try {
      await fs.access(evidence.file_path);
    } catch (error) {
      return res.status(404).json({ message: 'Archivo no encontrado en el servidor' });
    }

    // Enviar archivo
    res.download(evidence.file_path, evidence.file_name);

  } catch (error) {
    console.error('Error al descargar evidencia:', error);
    res.status(500).json({ 
      message: 'Error al descargar evidencia', 
      error: error.message 
    });
  }
};

/**
 * Eliminar una evidencia
 */
exports.deleteEvidence = async (req, res) => {
  try {
    const { id } = req.params;

    const evidence = await QuoteEvidence.findById(id);
    if (!evidence) {
      return res.status(404).json({ message: 'Evidencia no encontrada' });
    }

    // Eliminar archivo del sistema
    try {
      await fs.unlink(evidence.file_path);
    } catch (error) {
      console.error('Error al eliminar archivo físico:', error);
      // Continuar con la eliminación del registro aunque falle el archivo
    }

    // Eliminar registro de base de datos
    await QuoteEvidence.delete(id);

    res.json({ 
      message: 'Evidencia eliminada correctamente',
      deletedId: id
    });

  } catch (error) {
    console.error('Error al eliminar evidencia:', error);
    res.status(500).json({ 
      message: 'Error al eliminar evidencia', 
      error: error.message 
    });
  }
};

/**
 * Actualizar notas de una evidencia
 */
exports.updateEvidenceNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const evidence = await QuoteEvidence.updateNotes(id, notes);
    if (!evidence) {
      return res.status(404).json({ message: 'Evidencia no encontrada' });
    }

    res.json({
      message: 'Notas actualizadas correctamente',
      evidence
    });

  } catch (error) {
    console.error('Error al actualizar notas:', error);
    res.status(500).json({ 
      message: 'Error al actualizar notas', 
      error: error.message 
    });
  }
};

