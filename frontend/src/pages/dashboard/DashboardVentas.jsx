import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getVentasDashboardData } from '../../services/dashboardService';

const DashboardVentas = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getVentasDashboardData(token);
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
      <h2>Dashboard Ventas</h2>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #ececec', padding: 20, minWidth: 180 }}>
          <div>Mis clientes</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{data?.totalClientes ?? 0}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #ececec', padding: 20, minWidth: 180 }}>
          <div>Mis proyectos</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{data?.totalProyectos ?? 0}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #ececec', padding: 20, minWidth: 180 }}>
          <div>Cotizaciones recientes</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{data?.totalCotizaciones ?? 0}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <a href="/adjuntos" style={{ color: '#ff5722', fontWeight: 500 }}>Adjuntos</a>
        <a href="/tickets" style={{ color: '#ff5722', fontWeight: 500 }}>Tickets</a>
      </div>
    </div>
  );
};

export default DashboardVentas;
