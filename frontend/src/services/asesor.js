import api from './api';

// Obtener estadísticas del asesor
export const getAsesorStats = async () => {
  try {
    const response = await api('/api/asesor/stats');
    return response;
  } catch (error) {
    console.error('Error fetching asesor stats:', error);
    throw error;
  }
};
