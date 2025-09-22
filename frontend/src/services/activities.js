import { apiFetch } from './api';

// Obtener actividades recientes
export const getRecentActivities = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const path = qs ? `/api/activities/recent?${qs}` : '/api/activities/recent';
  return apiFetch(path);
};

// Obtener actividades del usuario actual
export const getUserActivities = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const path = qs ? `/api/activities/user?${qs}` : '/api/activities/user';
  return apiFetch(path);
};

// Obtener actividades por tipo
export const getActivitiesByType = (type, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const path = qs ? `/api/activities/type/${type}?${qs}` : `/api/activities/type/${type}`;
  return apiFetch(path);
};

// Obtener actividades por entidad
export const getActivitiesByEntity = (entityType, entityId, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const path = qs ? `/api/activities/entity/${entityType}/${entityId}?${qs}` : `/api/activities/entity/${entityType}/${entityId}`;
  return apiFetch(path);
};

// Obtener estadísticas de actividades
export const getActivityStats = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const path = qs ? `/api/activities/stats?${qs}` : '/api/activities/stats';
  return apiFetch(path);
};

// Crear actividad (solo admin)
export const createActivity = (activityData) => {
  return apiFetch('/api/activities/create', {
    method: 'POST',
    body: JSON.stringify(activityData)
  });
};

// Tipos de actividades según el flujo de trabajo
export const ACTIVITY_TYPES = {
  // Cotizaciones
  QUOTE_CREATED: 'quote_created',
  QUOTE_ASSIGNED: 'quote_assigned',
  QUOTE_APPROVED: 'quote_approved',
  QUOTE_REJECTED: 'quote_rejected',
  QUOTE_COMPLETED: 'quote_completed',
  
  // Proyectos
  PROJECT_CREATED: 'project_created',
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
  USER_REGISTERED: 'user_registered',
  USER_ASSIGNED: 'user_assigned',
  USER_ROLE_CHANGED: 'user_role_changed',
  
  // Clientes
  CLIENT_CREATED: 'client_created',
  CLIENT_UPDATED: 'client_updated',
  
  // Sistema
  SYSTEM_MAINTENANCE: 'system_maintenance',
  SYSTEM_UPDATE: 'system_update'
};

// Entidades del sistema
export const ENTITY_TYPES = {
  QUOTE: 'quote',
  PROJECT: 'project',
  TICKET: 'ticket',
  EVIDENCE: 'evidence',
  USER: 'user',
  CLIENT: 'client',
  SYSTEM: 'system'
};

// Configuración de actividades por rol
export const ROLE_ACTIVITY_CONFIG = {
  admin: {
    types: Object.values(ACTIVITY_TYPES),
    priority: 'high'
  },
  jefa_comercial: {
    types: [
      ACTIVITY_TYPES.QUOTE_CREATED,
      ACTIVITY_TYPES.QUOTE_APPROVED,
      ACTIVITY_TYPES.QUOTE_REJECTED,
      ACTIVITY_TYPES.PROJECT_CREATED,
      ACTIVITY_TYPES.PROJECT_COMPLETED,
      ACTIVITY_TYPES.TICKET_ESCALATED,
      ACTIVITY_TYPES.CLIENT_CREATED,
      ACTIVITY_TYPES.CLIENT_UPDATED
    ],
    priority: 'high'
  },
  vendedor_comercial: {
    types: [
      ACTIVITY_TYPES.QUOTE_CREATED,
      ACTIVITY_TYPES.QUOTE_ASSIGNED,
      ACTIVITY_TYPES.PROJECT_CREATED,
      ACTIVITY_TYPES.PROJECT_ASSIGNED,
      ACTIVITY_TYPES.TICKET_CREATED,
      ACTIVITY_TYPES.CLIENT_CREATED,
      ACTIVITY_TYPES.CLIENT_UPDATED
    ],
    priority: 'normal'
  },
  jefe_laboratorio: {
    types: [
      ACTIVITY_TYPES.QUOTE_ASSIGNED,
      ACTIVITY_TYPES.QUOTE_COMPLETED,
      ACTIVITY_TYPES.PROJECT_ASSIGNED,
      ACTIVITY_TYPES.PROJECT_COMPLETED,
      ACTIVITY_TYPES.EVIDENCE_UPLOADED,
      ACTIVITY_TYPES.EVIDENCE_APPROVED,
      ACTIVITY_TYPES.EVIDENCE_REJECTED,
      ACTIVITY_TYPES.TICKET_ASSIGNED
    ],
    priority: 'high'
  },
  usuario_laboratorio: {
    types: [
      ACTIVITY_TYPES.QUOTE_ASSIGNED,
      ACTIVITY_TYPES.QUOTE_COMPLETED,
      ACTIVITY_TYPES.PROJECT_ASSIGNED,
      ACTIVITY_TYPES.PROJECT_COMPLETED,
      ACTIVITY_TYPES.EVIDENCE_UPLOADED,
      ACTIVITY_TYPES.TICKET_ASSIGNED
    ],
    priority: 'normal'
  },
  laboratorio: {
    types: [
      ACTIVITY_TYPES.QUOTE_ASSIGNED,
      ACTIVITY_TYPES.QUOTE_COMPLETED,
      ACTIVITY_TYPES.PROJECT_ASSIGNED,
      ACTIVITY_TYPES.PROJECT_COMPLETED,
      ACTIVITY_TYPES.EVIDENCE_UPLOADED,
      ACTIVITY_TYPES.TICKET_ASSIGNED
    ],
    priority: 'normal'
  },
  soporte: {
    types: [
      ACTIVITY_TYPES.TICKET_CREATED,
      ACTIVITY_TYPES.TICKET_ASSIGNED,
      ACTIVITY_TYPES.TICKET_RESOLVED,
      ACTIVITY_TYPES.TICKET_ESCALATED,
      ACTIVITY_TYPES.SYSTEM_MAINTENANCE
    ],
    priority: 'high'
  },
  gerencia: {
    types: [
      ACTIVITY_TYPES.PROJECT_COMPLETED,
      ACTIVITY_TYPES.PROJECT_DELAYED,
      ACTIVITY_TYPES.QUOTE_APPROVED,
      ACTIVITY_TYPES.TICKET_ESCALATED,
      ACTIVITY_TYPES.SYSTEM_UPDATE,
      ACTIVITY_TYPES.USER_REGISTERED,
      ACTIVITY_TYPES.USER_ROLE_CHANGED
    ],
    priority: 'high'
  }
};

export default {
  getRecentActivities,
  getUserActivities,
  getActivitiesByType,
  getActivitiesByEntity,
  getActivityStats,
  createActivity,
  ACTIVITY_TYPES,
  ENTITY_TYPES,
  ROLE_ACTIVITY_CONFIG
};
