import apiFetch from './api';

// Aprobar cotización (vendedor autónomo)
export const approveQuote = async (quoteId) => {
  try {
    const response = await apiFetch(`/api/quote-approval/${quoteId}/approve`, {
      method: 'POST',
    });
    return response;
  } catch (error) {
    console.error('Error approving quote:', error);
    throw error;
  }
};

// Revertir cotización a borrador (vendedor autónomo)
export const revertQuoteToDraft = async (quoteId) => {
  try {
    const response = await apiFetch(`/api/quote-approval/${quoteId}/revert`, {
      method: 'POST',
    });
    return response;
  } catch (error) {
    console.error('Error reverting quote:', error);
    throw error;
  }
};

// Marcar como facturada (solo facturación)
export const markQuoteAsInvoiced = async (quoteId) => {
  try {
    const response = await apiFetch(`/api/quote-approval/${quoteId}/invoice`, {
      method: 'POST',
    });
    return response;
  } catch (error) {
    console.error('Error marking quote as invoiced:', error);
    throw error;
  }
};

// Obtener mis cotizaciones (con filtros)
export const getMyQuotes = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    const queryString = queryParams.toString();
    const url = `/api/quote-approval/my-quotes${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiFetch(url);
    return response;
  } catch (error) {
    console.error('Error getting my quotes:', error);
    throw error;
  }
};
