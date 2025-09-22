const Activity = require('../models/activity');

// Obtener actividades recientes
exports.getRecentActivities = async (req, res) => {
  try {
    const { limit = 10, offset = 0, entityType, userId: queryUserId, role } = req.query;
    const currentUserId = req.user?.id;
    const currentUserRole = req.user?.role;
    
    // Determinar qué actividades mostrar según el rol
    let filterUserId = null;
    let allowedTypes = null;
    
    if (currentUserRole === 'admin') {
      // Admin ve todo
      filterUserId = queryUserId || null;
    } else {
      // Otros roles ven solo sus actividades y las relevantes a su rol
      filterUserId = currentUserId;
      
      // Filtrar tipos de actividades según el rol
      const roleActivityTypes = {
        'vendedor_comercial': [
          'quote_created', 'quote_assigned', 'quote_approved', 'quote_rejected',
          'project_created', 'project_assigned', 'project_completed',
          'ticket_created', 'ticket_assigned', 'ticket_resolved',
          'client_created', 'client_updated'
        ],
        'jefa_comercial': [
          'quote_created', 'quote_assigned', 'quote_approved', 'quote_rejected', 'quote_completed',
          'project_created', 'project_assigned', 'project_completed', 'project_delayed',
          'ticket_created', 'ticket_assigned', 'ticket_resolved', 'ticket_escalated',
          'client_created', 'client_updated', 'user_registered'
        ],
        'jefe_laboratorio': [
          'quote_assigned', 'quote_completed', 'project_assigned', 'project_completed',
          'evidence_uploaded', 'evidence_approved', 'evidence_rejected',
          'ticket_assigned', 'ticket_resolved'
        ],
        'usuario_laboratorio': [
          'quote_assigned', 'quote_completed', 'project_assigned', 'project_completed',
          'evidence_uploaded', 'ticket_assigned'
        ],
        'laboratorio': [
          'quote_assigned', 'quote_completed', 'project_assigned', 'project_completed',
          'evidence_uploaded', 'ticket_assigned'
        ],
        'soporte': [
          'ticket_created', 'ticket_assigned', 'ticket_resolved', 'ticket_escalated',
          'system_maintenance'
        ],
        'gerencia': [
          'project_completed', 'project_delayed', 'quote_approved', 'ticket_escalated',
          'system_update', 'user_registered', 'user_role_changed'
        ]
      };
      
      allowedTypes = roleActivityTypes[currentUserRole] || [];
    }
    
    const activities = await Activity.getRecent({
      limit: parseInt(limit),
      offset: parseInt(offset),
      userId: filterUserId,
      entityType: entityType,
      allowedTypes: allowedTypes
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
