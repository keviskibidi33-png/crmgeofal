import { useQuery } from 'react-query';
import { listAudit } from '../services/audit';
import { getAuditAnalytics, getActiveUsers } from '../services/auditActions';

export const useAuditStats = () => {
  return useQuery(['audit-stats-global'], async () => {
    try {
      // Intentar obtener analytics del servidor
      const [analyticsResp, activeUsersResp] = await Promise.all([
        getAuditAnalytics().catch(() => null),
        getActiveUsers().catch(() => null)
      ]);
      
      // Si el servidor tiene analytics, usarlos
      if (analyticsResp && analyticsResp.data) {
        return {
          ...analyticsResp.data,
          activeUsers: activeUsersResp?.data || []
        };
      }
      
      // Fallback: calcular localmente
      const resp = await listAudit({ page: 1, limit: 10000 });
      const rows = Array.isArray(resp?.data) ? resp.data : (resp?.rows || resp || []);
      const total = Number(resp?.total || rows.length || 0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayActivities = rows.filter(row => {
        const activityDate = new Date(row.performed_at || row.created_at);
        return activityDate >= today;
      }).length;
      
      const uniqueUsers = [...new Set(rows.map(row => row.user_name || row.performed_by || row.user_id))].length;
      const uniqueActions = [...new Set(rows.map(row => row.action))].length;
      
      const actionCounts = rows.reduce((acc, row) => {
        acc[row.action] = (acc[row.action] || 0) + 1;
        return acc;
      }, {});
      
      const mostCommonAction = Object.entries(actionCounts).reduce((a, b) => 
        actionCounts[a[0]] > actionCounts[b[0]] ? a : b, ['N/A', 0]
      );
      
      const last24Hours = new Date();
      last24Hours.setHours(last24Hours.getHours() - 24);
      
      const recentActivities = rows.filter(row => {
        const activityDate = new Date(row.performed_at || row.created_at);
        return activityDate >= last24Hours;
      }).length;
      
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      const weekActivities = rows.filter(row => {
        const activityDate = new Date(row.performed_at || row.created_at);
        return activityDate >= lastWeek;
      }).length;
      
      // Obtener usuarios activos
      const activeUsers = activeUsersResp?.data || [];
      
      return {
        total,
        todayActivities,
        uniqueUsers,
        uniqueActions,
        mostCommonAction: mostCommonAction[0],
        mostCommonCount: mostCommonAction[1],
        recentActivities,
        weekActivities,
        actionCounts,
        activeUsers
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return {
        total: 0,
        todayActivities: 0,
        uniqueUsers: 0,
        uniqueActions: 0,
        mostCommonAction: 'N/A',
        mostCommonCount: 0,
        recentActivities: 0,
        weekActivities: 0,
        actionCounts: {},
        activeUsers: []
      };
    }
  }, {
    staleTime: 0,
    cacheTime: 1 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};
