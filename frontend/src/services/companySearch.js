import apiFetch from './api';

// Buscar empresas/personas por tipo y término
export const searchCompanies = async (type, searchTerm) => {
  try {
    const params = new URLSearchParams({
      type,
      q: searchTerm
    });
    
    const response = await apiFetch(`/companies/search?${params.toString()}`);
    return response;
  } catch (error) {
    console.error('Error en búsqueda de empresas:', error);
    throw error;
  }
};

export default {
  searchCompanies
};
