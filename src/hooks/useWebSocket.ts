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

  const loadStations = useCallback(async (options?: {
    fields?: string[];
    filters?: any;
    pagination?: { page: number; limit: number };
  }) => {
    setLoading(true);
    setError(null);

    try {
      const data = await wsService.getStations(options);
      setStations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stations');
    } finally {
      setLoading(false);
    }
  }, []);

  const getStationById = useCallback(async (stationId: string): Promise<StationData | null> => {
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
      setStations(current => 
        current.map(station => 
          station.id === update.stationId 
            ? { ...station, ...update.updates }
            : station
        )
      );
    };

    window.addEventListener('stationUpdate', handleStationUpdate as EventListener);
    return () => {
      window.removeEventListener('stationUpdate', handleStationUpdate as EventListener);
    };
  }, []);

  // Специализированные методы для разных view
  const loadStationsForMap = useCallback(async () => {
    console.log('🗺️ Loading stations for map with minimal fields...');
    return loadStations({
      fields: ['id', 'name', 'city', 'status', 'coordinates', 'owner']
    });
  }, [loadStations]);

  const loadStationsForList = useCallback(async () => {
    console.log('📋 Loading stations for list with full fields...');
    return loadStations({
      fields: ['id', 'name', 'city', 'owner', 'status', 'totalEnergy', 'currentPower', 'connectedApp', 'lastUpdate']
    });
  }, [loadStations]);

  const loadStationsForStats = useCallback(async () => {
    console.log('📊 Loading stations for statistics...');
    return loadStations({
      fields: ['id', 'city', 'owner', 'connectedApp', 'totalEnergy']
    });
  }, [loadStations]);

  return {
    stations,
    loading,
    error,
    loadStations,
    loadStationsForMap,
    loadStationsForList,
    loadStationsForStats,
    getStationById
  };
}