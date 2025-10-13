import apiFetch from './api';

const clientImportService = {
  /**
   * Limpiar datos existentes
   */
  async cleanData() {
    try {
      console.log('🧹 Iniciando limpieza de datos...');
      const response = await apiFetch('/api/client-import/clean', {
        method: 'POST'
      });
      console.log('✅ Limpieza completada:', response);
      return response;
    } catch (error) {
      console.error('❌ Error en limpieza:', error);
      throw error;
    }
  },

  /**
   * Importar clientes desde archivo CSV
   */
  async importClients(formData) {
    try {
      console.log('📥 Iniciando importación de clientes...');
      const response = await apiFetch('/api/client-import/import', {
        method: 'POST',
        body: formData
      });
      console.log('✅ Importación completada:', response);
      return response;
    } catch (error) {
      console.error('❌ Error en importación:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de importación
   */
  async getStats() {
    try {
      console.log('📊 Obteniendo estadísticas...');
      const response = await apiFetch('/api/client-import/stats', {
        method: 'GET'
      });
      console.log('✅ Estadísticas obtenidas:', response);
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      throw error;
    }
  }
};

export { clientImportService };
