import { useQuery, useQueryClient } from 'react-query';
import { getRecentActivities } from '../services/activities';
import { useSocketNotification } from './useSocket';

// Hook personalizado para manejar actividades recientes de manera eficiente
export const useActivities = (options = {}) => {
  const queryClient = useQueryClient();
  const {
    limit = 4,
    refetchInterval = 300000, // 5 minutos por defecto
    staleTime = 60000, // 1 minuto por defecto
    enabled = true
  } = options;

  // WebSocket para actualizaciones en tiempo real
  useSocketNotification({
    onNewNotification: (notification) => {
      // Solo invalidar si la notificación es relevante para actividades
      if (notification.type && (
        notification.type.includes('quote') ||
        notification.type.includes('project') ||
        notification.type.includes('ticket') ||
        notification.type.includes('evidence') ||
        notification.type.includes('user') ||
        notification.type.includes('client')
      )) {
        queryClient.invalidateQueries(['recentActivities']);
      }
    },
    onUnreadCountUpdate: () => {
      // Invalidar cuando se actualiza el contador de notificaciones
      queryClient.invalidateQueries(['recentActivities']);
    }
  });

  // Query principal para actividades
  const activitiesQuery = useQuery(
    ['recentActivities', { limit }],
    () => getRecentActivities({ limit }),
    {
      enabled,
      refetchInterval,
      staleTime,
      refetchOnWindowFocus: true, // Refrescar cuando el usuario vuelve a la pestaña
      refetchOnMount: true, // Refrescar al montar el componente
      retry: 2, // Reintentar solo 2 veces en caso de error
      retryDelay: 5000, // Esperar 5s entre reintentos
      // Configuración de cache inteligente
      cacheTime: 300000, // Mantener en cache por 5 minutos
      // Configuración de red
      networkMode: 'online', // Solo hacer requests cuando hay conexión
      // Configuración de error
      onError: (error) => {
        console.warn('Error loading activities:', error);
        // No mostrar error al usuario, usar datos de cache si están disponibles
      }
    }
  );

  // Función para refrescar manualmente
  const refreshActivities = () => {
    queryClient.invalidateQueries(['recentActivities']);
  };

  // Función para obtener datos de cache sin hacer request
  const getCachedActivities = () => {
    return queryClient.getQueryData(['recentActivities', { limit }]);
  };

  return {
    ...activitiesQuery,
    refreshActivities,
    getCachedActivities,
    // Estado derivado
    hasActivities: activitiesQuery.data?.activities?.length > 0,
    activitiesCount: activitiesQuery.data?.activities?.length || 0,
    // Configuración de rendimiento
    isOptimized: true,
    lastFetch: activitiesQuery.dataUpdatedAt,
    nextFetch: activitiesQuery.dataUpdatedAt + refetchInterval
  };
};

// Hook para actividades con configuración de alto rendimiento
export const useActivitiesHighPerformance = (options = {}) => {
  return useActivities({
    ...options,
    refetchInterval: 600000, // 10 minutos
    staleTime: 300000, // 5 minutos
    enabled: true
  });
};

// Hook para actividades con configuración de tiempo real
export const useActivitiesRealTime = (options = {}) => {
  return useActivities({
    ...options,
    refetchInterval: 60000, // 1 minuto
    staleTime: 30000, // 30 segundos
    enabled: true
  });
};

export default useActivities;
