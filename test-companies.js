const fetch = require('node-fetch');

async function testCompanies() {
  try {
    console.log('🔍 Probando endpoint /api/companies...');
    
    const response = await fetch('http://localhost:4000/api/companies?limit=5', {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Status:', response.status);
    console.log('📊 Headers:', response.headers.raw());
    
    const data = await response.text();
    console.log('📊 Response:', data);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCompanies();
