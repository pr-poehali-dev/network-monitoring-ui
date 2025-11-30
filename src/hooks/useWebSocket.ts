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
    // Автоматическое подключение при загрузке только если не подключены
    if (!wsService.isConnected()) {
      connect();
    }

    // Проверяем состояние соединения
    const interval = setInterval(() => {
      setIsConnected(wsService.isConnected());
    }, 1000);

    return () => {
      clearInterval(interval);
      // НЕ отключаем при размонтировании - оставляем соединение активным
    };
  }, [connect]);

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

  const loadStations = useCallback(async (filters?: { region?: string; station_status?: string }) => {
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

  const getStationBySerialNumber = useCallback(async (serialNumber: string): Promise<StationData | null> => {
    try {
      return await wsService.getStationBySerialNumber(serialNumber);
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
        const changes = update.changes || update.updates || {};
        
        const updated = current.map(station => 
          station.id === update.stationId 
            ? { ...station, ...changes }
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
    getStationBySerialNumber,
    setStations
  };
}

export function useStation(serialNumber: string | undefined) {
  const [station, setStation] = useState<StationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStation = useCallback(async () => {
    console.log('🎯 loadStation called with serialNumber:', serialNumber);
    if (!serialNumber) {
      console.log('⚠️ No serial number provided, skipping load');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📡 Fetching station data...');
      const data = await wsService.getStationBySerialNumber(serialNumber);
      console.log('✅ Station data received:', data);
      setStation(data);
      
      if (data) {
        await wsService.subscribeToUpdates();
      } else {
        console.log('❌ Station not found');
      }
    } catch (err) {
      console.error('❌ Error loading station:', err);
      setError(err instanceof Error ? err.message : 'Failed to load station');
    } finally {
      setLoading(false);
    }
  }, [serialNumber]);

  useEffect(() => {
    const handleStationUpdate = (event: CustomEvent) => {
      const update = event.detail;
      
      if (!station || update.stationId !== station.id) {
        return;
      }

      const changes = update.changes || update.updates || {};
      setStation(current => current ? { ...current, ...changes } : null);
    };

    window.addEventListener('stationUpdate', handleStationUpdate as EventListener);
    
    return () => {
      window.removeEventListener('stationUpdate', handleStationUpdate as EventListener);
    };
  }, [station]);

  return {
    station,
    loading,
    error,
    loadStation
  };
}