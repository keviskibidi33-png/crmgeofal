// Script de depuración para verificar el problema con las estadísticas de companies
import { getCompanyStats } from './services/companies';

export async function debugCompaniesStats() {
  console.log('🔍 DEBUG: Iniciando verificación de estadísticas de companies...');
  
  try {
    console.log('🔍 DEBUG: Llamando a getCompanyStats...');
    const result = await getCompanyStats();
    console.log('✅ DEBUG: Respuesta de getCompanyStats:', result);
    
    if (result && result.data) {
      console.log('📊 DEBUG: Datos extraídos:');
      console.log(`   Total: ${result.data.total}`);
      console.log(`   Empresas: ${result.data.empresas}`);
      console.log(`   Personas: ${result.data.personas}`);
      console.log(`   Con email: ${result.data.withEmail}`);
      console.log(`   Con teléfono: ${result.data.withPhone}`);
    } else {
      console.warn('⚠️ DEBUG: No se recibieron datos válidos');
    }
    
    return result;
  } catch (error) {
    console.error('❌ DEBUG: Error en getCompanyStats:', error);
    console.error('❌ DEBUG: Error details:', {
      message: error.message,
      status: error.status,
      body: error.body
    });
    throw error;
  }
}

// Función para probar la API directamente
export async function testDirectAPI() {
  console.log('🔍 DEBUG: Probando API directamente...');
  
  try {
    const response = await fetch('/api/companies/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    console.log('📊 DEBUG: Status de respuesta:', response.status);
    console.log('📊 DEBUG: Headers de respuesta:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ DEBUG: Datos de API directa:', data);
    
    return data;
  } catch (error) {
    console.error('❌ DEBUG: Error en API directa:', error);
    throw error;
  }
}
