import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

const EnsayosTestSimple = () => {
  const [ensayos, setEnsayos] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const loadEnsayos = async () => {
      try {
        console.log('🔄 Cargando ensayos...');
        const data = await apiFetch('/ensayos/temp?page=1&limit=5');
        console.log('✅ Datos recibidos:', data);
        
        setEnsayos(data.data || []);
      } catch (err) {
        console.error('❌ Error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEnsayos();
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Prueba de Caracteres UTF-8</h2>
      <p>Caracteres de prueba: á é í ó ú ñ Á É Í Ó Ú Ñ</p>
      
      <h3>Ensayos desde API:</h3>
      <div style={{ border: '1px solid #ccc', padding: '10px' }}>
        {ensayos.map(ensayo => (
          <div key={ensayo.id} style={{ marginBottom: '10px', padding: '5px', border: '1px solid #eee' }}>
            <strong>{ensayo.codigo}:</strong> {ensayo.descripcion}
            <br />
            <small>Norma: {ensayo.norma}</small>
            <br />
            <small>Categoría: {ensayo.categoria}</small>
          </div>
        ))}
      </div>
      
      <h3>Verificación de bytes:</h3>
      <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
        {ensayos.slice(0, 3).map(ensayo => (
          <div key={ensayo.id}>
            {ensayo.codigo}: {Buffer.from(ensayo.descripcion, 'utf8').toString('hex')}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnsayosTestSimple;
