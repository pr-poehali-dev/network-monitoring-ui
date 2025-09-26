import { useState, useEffect, useCallback } from 'react';
import { wsService } from '@/services/websocket';
import { useWebSocket } from './useWebSocket';
import { GlobalStats } from '@/types/websocket';

export function useStatistics() {
  const { isConnected } = useWebSocket();
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [statisticsData, setStatisticsData] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка глобальной статистики
  const loadGlobalStats = useCallback(async () => {
    if (!isConnected) return;

    try {
      const stats = await wsService.getGlobalStats();
      setGlobalStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load global stats');
    }
  }, [isConnected]);

  // Загрузка данных статистики с фильтрами
  const loadStatisticsData = useCallback(async (filters?: any) => {
    if (!isConnected) return;

    setLoading(true);
    setError(null);

    try {
      const data = await wsService.getStatisticsData(filters);
      setStatisticsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  // Загрузка данных для графиков
  const loadChartData = useCallback(async (chartType: string, period: string = 'week') => {
    if (!isConnected) return;

    try {
      const data = await wsService.getChartData(chartType, period);
      setChartData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chart data');
    }
  }, [isConnected]);

  // Автозагрузка при подключении
  useEffect(() => {
    if (isConnected) {
      loadGlobalStats();
    }
  }, [isConnected, loadGlobalStats]);

  return {
    globalStats,
    statisticsData,
    chartData,
    loading,
    error,
    loadGlobalStats,
    loadStatisticsData,
    loadChartData
  };
}