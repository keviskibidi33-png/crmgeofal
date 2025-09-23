import apiFetch from './api';

// Servicios para adjuntos de proyectos
export const listProjectAttachments = (projectId) => {
  return apiFetch(`/api/attachments/${projectId}/attachments`);
};

// Obtener todos los adjuntos con información completa
export const getAllAttachments = (params = {}) => {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', params.page);
  if (params.limit) sp.set('limit', params.limit);
  if (params.search) sp.set('search', params.search);
  if (params.project_id) sp.set('project_id', params.project_id);
  if (params.file_type) sp.set('file_type', params.file_type);
  
  const qs = sp.toString();
  const path = qs ? `/api/attachments/all?${qs}` : '/api/attachments/all';
  
  console.log('🔍 getAllAttachments - Llamando a:', path);
  
  return apiFetch(path).then(data => {
    console.log('✅ getAllAttachments - Respuesta recibida:', data);
    return data;
  }).catch(error => {
    console.error('❌ getAllAttachments - Error:', error);
    throw error;
  });
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
  // Si data es FormData, no agregar Content-Type header
  const options = {
    method: 'PUT',
    body: data,
  };
  
  // Solo agregar Content-Type si no es FormData
  if (!(data instanceof FormData)) {
    options.headers = {
      'Content-Type': 'application/json',
    };
    options.body = JSON.stringify(data);
  }
  
  return apiFetch(`/api/attachments/${id}`, options);
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