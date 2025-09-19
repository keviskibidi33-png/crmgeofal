import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getAdminDashboardData } from '../../services/dashboardService';
import styles from './DashboardAdmin.module.css';

const DashboardAdmin = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAdminDashboardData(token);
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
    <div className={styles.dashboardAdmin}>
      <h2>Dashboard Administrador</h2>
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div>Total usuarios</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{data?.totalUsuarios ?? '-'}</div>
        </div>
        <div className={styles.kpiCard}>
          <div>Total proyectos</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{data?.totalProyectos ?? '-'}</div>
        </div>
        <div className={styles.kpiCard}>
          <div>Total cotizaciones</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{data?.totalCotizaciones ?? '-'}</div>
        </div>
      </div>
      <div className={styles.quickLinks}>
        <a className={styles.quickLink} href="/usuarios">Gestionar usuarios</a>
        <a className={styles.quickLink} href="/proyectos">Ver proyectos</a>
        <a className={styles.quickLink} href="/cotizaciones">Ver cotizaciones</a>
        <a className={styles.quickLink} href="/reportes">Reportes</a>
      </div>
    </div>
  );
};

export default DashboardAdmin;
