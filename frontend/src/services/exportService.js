import apiFetch from './api';

const exportService = {
  /**
   * Exportar clientes a CSV
   */
  async exportClientsCSV(filters = {}) {
    try {
      console.log('📊 Exportando clientes a CSV...');
      
      const response = await fetch('/api/export/clients/csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ filters })
      });

      if (!response.ok) {
        throw new Error('Error al exportar CSV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ CSV exportado exitosamente');
      return { success: true };
    } catch (error) {
      console.error('❌ Error exportando CSV:', error);
      throw error;
    }
  },

  /**
   * Exportar clientes a JSON
   */
  async exportClientsJSON(filters = {}) {
    try {
      console.log('📊 Exportando clientes a JSON...');
      
      const response = await fetch('/api/export/clients/json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ filters })
      });

      if (!response.ok) {
        throw new Error('Error al exportar JSON');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `clientes_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ JSON exportado exitosamente');
      return { success: true };
    } catch (error) {
      console.error('❌ Error exportando JSON:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas para exportación
   */
  async getExportStats(filters = {}) {
    try {
      console.log('📊 Obteniendo estadísticas de exportación...');
      const response = await apiFetch('/api/export/clients/stats', {
        method: 'POST',
        body: JSON.stringify({ filters })
      });
      console.log('✅ Estadísticas obtenidas:', response);
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      throw error;
    }
  }
};

export default exportService;
