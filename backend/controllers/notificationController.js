const Notification = require('../models/notification');

// Obtener notificaciones del usuario actual
exports.getNotifications = async (req, res) => {
  try {
    console.log('🔔 getNotifications - Iniciando...');
    console.log('🔔 getNotifications - req.user:', req.user);
    
    const userId = req.user.id;
    const { limit = 10, offset = 0, unreadOnly = false } = req.query;
    
    console.log('🔔 getNotifications - userId:', userId);
    console.log('🔔 getNotifications - params:', { limit, offset, unreadOnly });
    
    const notifications = await Notification.getByUserId(userId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      unreadOnly: unreadOnly === 'true'
    });

    console.log('🔔 getNotifications - notifications obtenidas:', notifications.length);

    const unreadCount = await Notification.countUnread(userId);
    
    console.log('🔔 getNotifications - unreadCount:', unreadCount);

    res.json({
      notifications,
      unreadCount,
      total: notifications.length
    });
  } catch (err) {
    console.error('❌ Error getting notifications:', err);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
};

// Marcar notificación como leída
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const notification = await Notification.markAsRead(id, userId);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }

    res.json({ success: true, notification });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ error: 'Error al marcar notificación como leída' });
  }
};

// Marcar todas las notificaciones como leídas
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await Notification.markAllAsRead(userId);
    
    res.json({ 
      success: true, 
      message: `${result.count} notificaciones marcadas como leídas` 
    });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({ error: 'Error al marcar notificaciones como leídas' });
  }
};

// Crear notificación (para uso interno del sistema)
exports.createNotification = async (req, res) => {
  try {
    const { userId, type, title, message, data, priority } = req.body;
    
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      data,
      priority
    });

    res.status(201).json({ success: true, notification });
  } catch (err) {
    console.error('Error creating notification:', err);
    res.status(500).json({ error: 'Error al crear notificación' });
  }
};

// Crear notificaciones masivas por rol
exports.createForRole = async (req, res) => {
  try {
    const { role, type, title, message, data, priority } = req.body;
    
    const notifications = await Notification.createForRole(role, {
      type,
      title,
      message,
      data,
      priority
    });

    res.status(201).json({ 
      success: true, 
      message: `${notifications.length} notificaciones creadas para rol ${role}`,
      notifications 
    });
  } catch (err) {
    console.error('Error creating notifications for role:', err);
    res.status(500).json({ error: 'Error al crear notificaciones para rol' });
  }
};

// Obtener estadísticas de notificaciones
exports.getStats = async (req, res) => {
  try {
    console.log('📊 getStats - Iniciando...');
    console.log('📊 getStats - req.user:', req.user);
    
    const userId = req.user.id;
    console.log('📊 getStats - userId:', userId);
    
    const unreadCount = await Notification.countUnread(userId);
    
    console.log('📊 getStats - unreadCount:', unreadCount);
    
    res.json({
      unreadCount,
      totalNotifications: unreadCount // Se puede expandir con más estadísticas
    });
  } catch (err) {
    console.error('❌ Error getting notification stats:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas de notificaciones' });
  }
};
