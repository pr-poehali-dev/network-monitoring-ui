import { useState, useEffect, useCallback } from 'react';
import { wsService } from '@/services/websocket';
import { useWebSocket } from './useWebSocket';

export function useMap() {
  const { isConnected } = useWebSocket();
  const [mapData, setMapData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных для карты
  const loadMapData = useCallback(async () => {
    if (!isConnected) return;

    setLoading(true);
    setError(null);

    try {
      const data = await wsService.getMapData();
      setMapData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load map data');
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  // Подписка на real-time обновления
  useEffect(() => {
    if (!isConnected) return;

    // Загружаем начальные данные
    loadMapData();

    // Обработчик обновлений станций
    const handleUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const updates = customEvent.detail?.updates || [];
      
      // Обновляем станции на карте
      setMapData(current => {
        if (!current) return null;
        
        const updatedStations = current.stations.map(station => {
          const update = updates.find(u => u.stationId === station.id);
          if (update) {
            return {
              ...station,
              ...update.updates
            };
          }
          return station;
        });

        return {
          ...current,
          stations: updatedStations
        };
      });
    };

    window.addEventListener('stationUpdate', handleUpdate);

    return () => {
      window.removeEventListener('stationUpdate', handleUpdate);
    };
  }, [isConnected, loadMapData]);

  return {
    mapData,
    loading,
    error,
    refresh: loadMapData
  };
}