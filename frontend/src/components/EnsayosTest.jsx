import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

const EnsayosTest = () => {
  const [ensayos, setEnsayos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEnsayos = async () => {
      try {
        console.log('🔄 Cargando ensayos...');
        const data = await apiFetch('/ensayos');
        console.log('✅ Datos recibidos:', data);
        setEnsayos(data.data || []);
      } catch (err) {
        console.error('❌ Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadEnsayos();
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Ensayos Test ({ensayos.length})</h2>
      <div>
        {ensayos.slice(0, 5).map(ensayo => (
          <div key={ensayo.id}>
            {ensayo.codigo} - {ensayo.descripcion} - S/ {ensayo.precio}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnsayosTest;
