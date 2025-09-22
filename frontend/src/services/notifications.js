import { apiFetch } from './api';

// Obtener notificaciones del usuario actual
export const getNotifications = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const path = qs ? `/api/notifications?${qs}` : '/api/notifications';
  return apiFetch(path);
};

// Obtener estadísticas de notificaciones
export const getNotificationStats = () => {
  return apiFetch('/api/notifications/stats');
};

// Marcar notificación como leída
export const markNotificationAsRead = (notificationId) => {
  return apiFetch(`/api/notifications/${notificationId}/read`, {
    method: 'PUT'
  });
};

// Marcar todas las notificaciones como leídas
export const markAllNotificationsAsRead = () => {
  return apiFetch('/api/notifications/mark-all-read', {
    method: 'PUT'
  });
};

// Crear notificación (solo admin)
export const createNotification = (notificationData) => {
  return apiFetch('/api/notifications/create', {
    method: 'POST',
    body: JSON.stringify(notificationData)
  });
};

// Crear notificaciones masivas por rol (solo admin)
export const createNotificationsForRole = (roleData) => {
  return apiFetch('/api/notifications/create-for-role', {
    method: 'POST',
    body: JSON.stringify(roleData)
  });
};

// Tipos de notificaciones según el flujo de trabajo
export const NOTIFICATION_TYPES = {
  // Cotizaciones
  QUOTE_ASSIGNED: 'quote_assigned',
  QUOTE_APPROVED: 'quote_approved',
  QUOTE_REJECTED: 'quote_rejected',
  QUOTE_COMPLETED: 'quote_completed',
  
  // Proyectos
  PROJECT_ASSIGNED: 'project_assigned',
  PROJECT_STARTED: 'project_started',
  PROJECT_COMPLETED: 'project_completed',
  PROJECT_DELAYED: 'project_delayed',
  
  // Tickets
  TICKET_CREATED: 'ticket_created',
  TICKET_ASSIGNED: 'ticket_assigned',
  TICKET_RESOLVED: 'ticket_resolved',
  TICKET_ESCALATED: 'ticket_escalated',
  
  // Evidencias
  EVIDENCE_UPLOADED: 'evidence_uploaded',
  EVIDENCE_APPROVED: 'evidence_approved',
  EVIDENCE_REJECTED: 'evidence_rejected',
  
  // Usuarios
  USER_ASSIGNED: 'user_assigned',
  USER_ROLE_CHANGED: 'user_role_changed',
  
  // Sistema
  SYSTEM_MAINTENANCE: 'system_maintenance',
  SYSTEM_UPDATE: 'system_update'
};

// Prioridades de notificaciones
export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Configuración de notificaciones por rol
export const ROLE_NOTIFICATION_CONFIG = {
  admin: {
    types: Object.values(NOTIFICATION_TYPES),
    priority: NOTIFICATION_PRIORITIES.HIGH
  },
  jefa_comercial: {
    types: [
      NOTIFICATION_TYPES.QUOTE_ASSIGNED,
      NOTIFICATION_TYPES.QUOTE_APPROVED,
      NOTIFICATION_TYPES.QUOTE_REJECTED,
      NOTIFICATION_TYPES.PROJECT_ASSIGNED,
      NOTIFICATION_TYPES.PROJECT_COMPLETED,
      NOTIFICATION_TYPES.TICKET_ESCALATED
    ],
    priority: NOTIFICATION_PRIORITIES.HIGH
  },
  vendedor_comercial: {
    types: [
      NOTIFICATION_TYPES.QUOTE_ASSIGNED,
      NOTIFICATION_TYPES.QUOTE_APPROVED,
      NOTIFICATION_TYPES.QUOTE_REJECTED,
      NOTIFICATION_TYPES.PROJECT_ASSIGNED,
      NOTIFICATION_TYPES.PROJECT_COMPLETED,
      NOTIFICATION_TYPES.TICKET_CREATED
    ],
    priority: NOTIFICATION_PRIORITIES.NORMAL
  },
  jefe_laboratorio: {
    types: [
      NOTIFICATION_TYPES.QUOTE_ASSIGNED,
      NOTIFICATION_TYPES.PROJECT_ASSIGNED,
      NOTIFICATION_TYPES.EVIDENCE_UPLOADED,
      NOTIFICATION_TYPES.EVIDENCE_APPROVED,
      NOTIFICATION_TYPES.EVIDENCE_REJECTED,
      NOTIFICATION_TYPES.TICKET_ASSIGNED
    ],
    priority: NOTIFICATION_PRIORITIES.HIGH
  },
  usuario_laboratorio: {
    types: [
      NOTIFICATION_TYPES.QUOTE_ASSIGNED,
      NOTIFICATION_TYPES.PROJECT_ASSIGNED,
      NOTIFICATION_TYPES.EVIDENCE_UPLOADED,
      NOTIFICATION_TYPES.TICKET_ASSIGNED
    ],
    priority: NOTIFICATION_PRIORITIES.NORMAL
  },
  laboratorio: {
    types: [
      NOTIFICATION_TYPES.QUOTE_ASSIGNED,
      NOTIFICATION_TYPES.PROJECT_ASSIGNED,
      NOTIFICATION_TYPES.EVIDENCE_UPLOADED,
      NOTIFICATION_TYPES.TICKET_ASSIGNED
    ],
    priority: NOTIFICATION_PRIORITIES.NORMAL
  },
  soporte: {
    types: [
      NOTIFICATION_TYPES.TICKET_CREATED,
      NOTIFICATION_TYPES.TICKET_ASSIGNED,
      NOTIFICATION_TYPES.TICKET_ESCALATED,
      NOTIFICATION_TYPES.SYSTEM_MAINTENANCE
    ],
    priority: NOTIFICATION_PRIORITIES.HIGH
  },
  gerencia: {
    types: [
      NOTIFICATION_TYPES.PROJECT_COMPLETED,
      NOTIFICATION_TYPES.PROJECT_DELAYED,
      NOTIFICATION_TYPES.QUOTE_APPROVED,
      NOTIFICATION_TYPES.TICKET_ESCALATED,
      NOTIFICATION_TYPES.SYSTEM_UPDATE
    ],
    priority: NOTIFICATION_PRIORITIES.HIGH
  }
};

export default {
  getNotifications,
  getNotificationStats,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification,
  createNotificationsForRole,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES,
  ROLE_NOTIFICATION_CONFIG
};
