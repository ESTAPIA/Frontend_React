// scripts/test-api.js
/**
 * Script de testing para verificar conectividad con la API
 * Uso: node scripts/test-api.js
 */

const axios = require('axios');

const API_BASE_URL = 'https://backmotos.onrender.com/api';

const testEndpoints = [
  {
    name: 'Health Check',
    url: `${API_BASE_URL}/productos/todos`,
    method: 'get'
  },
  {
    name: 'Auth Endpoint',
    url: `${API_BASE_URL}/auth/login`,
    method: 'options' // Test CORS
  }
];

async function testAPI() {
  console.log('🚀 Iniciando test de conectividad API...\n');
  console.log(`Base URL: ${API_BASE_URL}\n`);

  for (const endpoint of testEndpoints) {
    try {
      console.log(`🔍 Testing ${endpoint.name}...`);
      
      const startTime = Date.now();
      const response = await axios({
        method: endpoint.method,
        url: endpoint.url,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const duration = Date.now() - startTime;
      
      console.log(`✅ ${endpoint.name}: OK (${response.status}) - ${duration}ms`);
      
      if (response.data && Array.isArray(response.data)) {
        console.log(`   📊 Data: Array con ${response.data.length} elementos`);
      } else if (response.data) {
        console.log(`   📊 Data: ${typeof response.data}`);
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ERROR`);
      
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Message: ${error.response.statusText}`);
      } else if (error.request) {
        console.log(`   Error de red: ${error.message}`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
    }
    
    console.log(''); // Línea en blanco
  }
  
  console.log('🏁 Test completado');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  testAPI();
}

module.exports = testAPI;
