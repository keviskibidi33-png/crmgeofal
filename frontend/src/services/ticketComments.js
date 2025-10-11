import { apiFetch } from './api';

// Crear un nuevo comentario
export const createComment = async (commentData) => {
  return apiFetch('/api/ticket-comments', {
    method: 'POST',
    body: JSON.stringify(commentData),
  });
};

// Obtener comentarios de un ticket
export const getCommentsByTicket = async (ticketId) => {
  return apiFetch(`/api/ticket-comments/ticket/${ticketId}`);
};

// Obtener comentarios recientes
export const getRecentComments = async (limit = 10) => {
  return apiFetch(`/api/ticket-comments/recent?limit=${limit}`);
};

// Obtener comentarios no leídos
export const getUnreadComments = async () => {
  return apiFetch('/api/ticket-comments/unread');
};

// Marcar comentarios como leídos
export const markCommentsAsRead = async (ticketId) => {
  return apiFetch(`/api/ticket-comments/ticket/${ticketId}/read`, {
    method: 'PUT',
  });
};
