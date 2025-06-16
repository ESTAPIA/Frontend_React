// src/components/dev/ApiStatus.jsx
import React, { useState, useEffect } from 'react';
import useProducts from '../../hooks/useProducts';

/**
 * Componente de desarrollo para monitorear el estado de la API
 * Sólo se muestra en modo desarrollo
 */
const ApiStatus = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { apiAvailable, dataSource, testApiConnection } = useProducts({ fetchOnMount: false });
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  // Solo mostrar en desarrollo
  useEffect(() => {
    setIsVisible(process.env.NODE_ENV === 'development');
  }, []);

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const result = await testApiConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult(false);
    } finally {
      setTesting(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px 15px',
        borderRadius: '8px',
        fontSize: '12px',
        zIndex: 9999,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        maxWidth: '250px'
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
        🔧 API Status (Dev)
      </div>
      <div>
        Estado: {apiAvailable === null ? '🟡 Verificando' : apiAvailable ? '🟢 Conectado' : '🔴 Desconectado'}
      </div>
      <div>
        Fuente: {dataSource === 'api' ? '🌐 API' : dataSource === 'mock' ? '📦 Mock' : '❌ None'}
      </div>
      <div style={{ marginTop: '8px' }}>
        <button
          onClick={handleTestConnection}
          disabled={testing}
          style={{
            fontSize: '11px',
            padding: '4px 8px',
            backgroundColor: testing ? '#666' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: testing ? 'not-allowed' : 'pointer'
          }}
        >
          {testing ? '⏳ Testing...' : '🔄 Test API'}
        </button>
        {testResult !== null && (
          <span style={{ marginLeft: '8px', fontSize: '11px' }}>
            {testResult ? '✅' : '❌'}
          </span>
        )}
      </div>
    </div>
  );
};

export default ApiStatus;
