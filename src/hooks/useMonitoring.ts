import { useState, useEffect, useCallback } from 'react';
import { wsService } from '@/services/websocket';
import { useWebSocket } from './useWebSocket';
import { MonitoringData, StationData } from '@/types/websocket';

export function useMonitoring() {
  const { isConnected } = useWebSocket();
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null);
  const [stations, setStations] = useState<StationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных мониторинга
  const loadMonitoringData = useCallback(async () => {
    if (!isConnected) return;

    setLoading(true);
    setError(null);

    try {
      // Загружаем данные мониторинга и станции параллельно
      const [monitoring, stationsData] = await Promise.all([
        wsService.getMonitoringData(),
        wsService.getStations()
      ]);

      setMonitoringData(monitoring);
      setStations(stationsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load monitoring data');
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  // Подписка на real-time обновления
  useEffect(() => {
    if (!isConnected) return;

    // Загружаем начальные данные
    loadMonitoringData();

    // Подписываемся на обновления станций
    const handleUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const updates = customEvent.detail?.updates || [];
      
      // Обновляем станции
      setStations(current => {
        const updatedStations = [...current];
        updates.forEach((update: any) => {
          const index = updatedStations.findIndex(s => s.id === update.stationId);
          if (index !== -1) {
            updatedStations[index] = {
              ...updatedStations[index],
              ...update.updates
            };
          }
        });
        return updatedStations;
      });

      // Обновляем сводку мониторинга
      setMonitoringData(current => {
        if (!current) return null;
        
        // Пересчитываем статистику на основе обновленных станций
        const activeCount = updates.filter((u: any) => 
          ['active', 'charging'].includes(u.updates.status)
        ).length;
        
        return {
          ...current,
          summary: {
            ...current.summary,
            activeStations: current.summary.activeStations + activeCount
          }
        };
      });
    };

    window.addEventListener('stationUpdate', handleUpdate);

    // Периодическое обновление данных мониторинга
    const interval = setInterval(() => {
      loadMonitoringData();
    }, 60000); // Каждую минуту

    return () => {
      window.removeEventListener('stationUpdate', handleUpdate);
      clearInterval(interval);
    };
  }, [isConnected, loadMonitoringData]);

  return {
    monitoringData,
    stations,
    loading,
    error,
    refresh: loadMonitoringData
  };
}