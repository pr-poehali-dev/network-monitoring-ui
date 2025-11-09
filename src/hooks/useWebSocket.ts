import { useState, useEffect, useCallback } from 'react';
import { wsService } from '@/services/websocket';
import { StationData } from '@/types/websocket';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      await wsService.connect();
      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    wsService.disconnect();
    setIsConnected(false);
  }, []);

  useEffect(() => {
    // Автоматическое подключение при загрузке
    connect();

    // Проверяем состояние соединения
    const interval = setInterval(() => {
      setIsConnected(wsService.isConnected());
    }, 1000);

    return () => {
      clearInterval(interval);
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect
  };
}

export function useStations() {
  const [stations, setStations] = useState<StationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStations = useCallback(async (filters?: { region?: string; is_active?: number }) => {
    setLoading(true);
    setError(null);

    try {
      const data = await wsService.getAllStations(filters);
      setStations(data);
      
      // Подписываемся на обновления после первой загрузки
      await wsService.subscribeToUpdates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stations');
    } finally {
      setLoading(false);
    }
  }, []);

  const getStationById = useCallback(async (stationId: number): Promise<StationData | null> => {
    try {
      return await wsService.getStationById(stationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load station');
      return null;
    }
  }, []);

  // Подписка на real-time обновления
  useEffect(() => {
    const handleStationUpdate = (event: CustomEvent) => {
      const update = event.detail;
      console.log('🔄 Station update received:', update);
      
      setStations(current => {
        const updated = current.map(station => 
          station.id === update.stationId 
            ? { ...station, ...update.updates }
            : station
        );
        
        // Если станции нет в списке, добавим
        if (!current.some(s => s.id === update.stationId) && update.station) {
          return [...current, update.station];
        }
        
        return updated;
      });
    };

    window.addEventListener('stationUpdate', handleStationUpdate as EventListener);
    
    return () => {
      window.removeEventListener('stationUpdate', handleStationUpdate as EventListener);
    };
  }, []);
  
  // Отписка при размонтировании
  useEffect(() => {
    return () => {
      wsService.unsubscribeFromUpdates().catch(console.error);
    };
  }, []);

  return {
    stations,
    loading,
    error,
    loadStations,
    getStationById,
    setStations
  };
}