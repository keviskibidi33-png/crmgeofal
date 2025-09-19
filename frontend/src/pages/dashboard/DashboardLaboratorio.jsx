import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getLaboratorioDashboardData } from '../../services/dashboardService';

const DashboardLaboratorio = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getLaboratorioDashboardData(token);
        setData(res);
      } catch (err) {
        setError('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading) return <div>Cargando dashboard...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Dashboard Laboratorio</h2>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #ececec', padding: 20, minWidth: 180 }}>
          <div>Proyectos asignados</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{data?.totalProyectos ?? 0}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #ececec', padding: 20, minWidth: 180 }}>
          <div>Documentos de muestras</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{data?.totalMuestras ?? 0}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #ececec', padding: 20, minWidth: 180 }}>
          <div>Reportes pendientes</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{data?.totalReportesPendientes ?? 0}</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLaboratorio;
