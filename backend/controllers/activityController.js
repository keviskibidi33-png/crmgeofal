const Activity = require('../models/activity');

// Obtener actividades recientes
exports.getRecentActivities = async (req, res) => {
  try {
    const { limit = 10, offset = 0, entityType } = req.query;
    const userId = req.user?.id; // Opcional: filtrar por usuario actual
    
    const activities = await Activity.getRecent({
      limit: parseInt(limit),
      offset: parseInt(offset),
      userId: userId,
      entityType: entityType
    });

    res.json({
      activities,
      total: activities.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (err) {
    console.error('Error getting recent activities:', err);
    res.status(500).json({ error: 'Error al obtener actividades recientes' });
  }
};

// Obtener actividades por tipo
exports.getActivitiesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    
    const activities = await Activity.getByType(type, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      activities,
      total: activities.length,
      type
    });
  } catch (err) {
    console.error('Error getting activities by type:', err);
    res.status(500).json({ error: 'Error al obtener actividades por tipo' });
  }
};

// Obtener actividades por entidad
exports.getActivitiesByEntity = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    
    const activities = await Activity.getByEntity(entityType, entityId, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      activities,
      total: activities.length,
      entityType,
      entityId
    });
  } catch (err) {
    console.error('Error getting activities by entity:', err);
    res.status(500).json({ error: 'Error al obtener actividades por entidad' });
  }
};

// Obtener actividades del usuario actual
exports.getUserActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, offset = 0 } = req.query;
    
    const activities = await Activity.getByUser(userId, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      activities,
      total: activities.length,
      userId
    });
  } catch (err) {
    console.error('Error getting user activities:', err);
    res.status(500).json({ error: 'Error al obtener actividades del usuario' });
  }
};

// Obtener estadísticas de actividades
exports.getActivityStats = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const userId = req.user?.id; // Opcional: estadísticas del usuario actual
    
    const stats = await Activity.getStats({
      userId: userId,
      days: parseInt(days)
    });

    res.json(stats);
  } catch (err) {
    console.error('Error getting activity stats:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas de actividades' });
  }
};

// Crear actividad (para uso interno del sistema)
exports.createActivity = async (req, res) => {
  try {
    const { userId, type, title, description, entityType, entityId, metadata } = req.body;
    
    const activity = await Activity.create({
      userId,
      type,
      title,
      description,
      entityType,
      entityId,
      metadata
    });

    res.status(201).json({ success: true, activity });
  } catch (err) {
    console.error('Error creating activity:', err);
    res.status(500).json({ error: 'Error al crear actividad' });
  }
};
