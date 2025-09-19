import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getJefeDashboardData } from '../../services/dashboardService';

const DashboardJefe = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getJefeDashboardData(token);
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
      <h2>Dashboard Jefe Comercial</h2>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #ececec', padding: 20, minWidth: 180 }}>
          <div>Resumen de ventas</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{data?.totalVentas ?? 0}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #ececec', padding: 20, minWidth: 180 }}>
          <div>Proyectos del equipo</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{data?.totalProyectosEquipo ?? 0}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #ececec', padding: 20, minWidth: 180 }}>
          <div>Cotizaciones del equipo</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{data?.totalCotizacionesEquipo ?? 0}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #ececec', padding: 20, minWidth: 180 }}>
          <div>Alertas y aprobaciones</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{data?.totalAlertas ?? 0}</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardJefe;
