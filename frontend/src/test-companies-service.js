// Script de prueba para verificar el servicio de companies
import { getCompanyStats, listCompanies } from './services/companies';

export async function testCompaniesService() {
  console.log('🧪 PROBANDO SERVICIO DE COMPANIES...\n');
  
  try {
    // 1. Probar getCompanyStats
    console.log('1️⃣ Probando getCompanyStats...');
    const stats = await getCompanyStats();
    console.log('✅ getCompanyStats resultado:', stats);
    
    if (stats && stats.data) {
      console.log('📊 Estadísticas extraídas:');
      console.log(`   Total: ${stats.data.total}`);
      console.log(`   Empresas: ${stats.data.empresas}`);
      console.log(`   Personas: ${stats.data.personas}`);
      console.log(`   Con email: ${stats.data.withEmail}`);
      console.log(`   Con teléfono: ${stats.data.withPhone}`);
    }
    
    // 2. Probar listCompanies
    console.log('\n2️⃣ Probando listCompanies...');
    const companies = await listCompanies({ page: 1, limit: 5 });
    console.log('✅ listCompanies resultado:', companies);
    
    if (companies && companies.data) {
      console.log(`📋 Lista de companies: ${companies.data.length} registros`);
      console.log(`📊 Total en paginación: ${companies.pagination?.total || 'N/A'}`);
    }
    
    return { stats, companies };
  } catch (error) {
    console.error('❌ Error en testCompaniesService:', error);
    console.error('❌ Error details:', {
      message: error.message,
      status: error.status,
      body: error.body
    });
    throw error;
  }
}

// Función para probar la API directamente sin el servicio
export async function testDirectAPI() {
  console.log('🔍 PROBANDO API DIRECTAMENTE...\n');
  
  try {
    const response = await fetch('/api/companies/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    console.log('📊 Status de respuesta:', response.status);
    console.log('📊 Headers de respuesta:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Datos de API directa:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Error en API directa:', error);
    throw error;
  }
}
