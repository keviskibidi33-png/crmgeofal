import apiFetch from './api';

// Servicios para adjuntos de proyectos
export const listProjectAttachments = (projectId) => {
  return apiFetch(`/api/attachments/${projectId}/attachments`);
};

export const getAttachmentById = (id) => {
  return apiFetch(`/api/attachments/${id}`);
};

export const uploadAttachment = (projectId, formData) => {
  return apiFetch(`/api/attachments/${projectId}/attachments`, {
    method: 'POST',
    body: formData, // FormData para archivos
  });
};

export const updateAttachment = (id, data) => {
  return apiFetch(`/api/attachments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteAttachment = (id) => {
  return apiFetch(`/api/attachments/${id}`, {
    method: 'DELETE',
  });
};

export const downloadAttachment = (id) => {
  return apiFetch(`/api/attachments/${id}/download`, {
    method: 'GET',
  });
};

// Función para descargar archivo
export const downloadFile = async (attachment) => {
  try {
    const response = await fetch(`/api/attachments/${attachment.id}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al descargar el archivo');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = attachment.original_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al descargar archivo:', error);
    throw error;
  }
};