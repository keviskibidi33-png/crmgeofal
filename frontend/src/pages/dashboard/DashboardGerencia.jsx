import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getGerenciaDashboardData } from '../../services/dashboardService';

const DashboardGerencia = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getGerenciaDashboardData(token);
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
      <h2>Dashboard Gerencia</h2>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #ececec', padding: 20, minWidth: 180 }}>
          <div>KPI globales</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{data?.totalKPI ?? 0}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #ececec', padding: 20, minWidth: 180 }}>
          <div>Reportes estratégicos</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{data?.totalReportesEstrategicos ?? 0}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #ececec', padding: 20, minWidth: 180 }}>
          <div>Alertas de auditoría</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{data?.totalAlertasAuditoria ?? 0}</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardGerencia;
