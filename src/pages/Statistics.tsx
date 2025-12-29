import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import StatisticsHeader from '@/components/statistics/StatisticsHeader';
import GlobalStatsCards from '@/components/statistics/GlobalStatsCards';
import FiltersAndSearch from '@/components/statistics/FiltersAndSearch';
import StationsTable from '@/components/statistics/StationsTable';
import { useAllStationsStatistics } from '@/hooks/useWebSocket';
import { GlobalStats, StationStats } from '@/components/statistics/types';

export default function Statistics() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('energy');
  const [cityFilter, setCityFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [appFilter, setAppFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('all');
  
  const { statistics, loading, error, loadStatistics } = useAllStationsStatistics();

  useEffect(() => {
    const filters: Record<string, any> = {};
    if (cityFilter) filters.region = cityFilter;
    
    let from: string | undefined;
    let to: string | undefined;
    const now = new Date();
    
    switch (periodFilter) {
      case 'today':
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        to = now.toISOString();
        break;
      case 'week':
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        to = now.toISOString();
        break;
      case 'month':
        from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        to = now.toISOString();
        break;
      case 'year':
        from = new Date(now.getFullYear(), 0, 1).toISOString();
        to = now.toISOString();
        break;
    }
    
    loadStatistics(from, to, Object.keys(filters).length > 0 ? filters : undefined);
  }, [loadStatistics, cityFilter, periodFilter]);

  const clearFilters = () => {
    setCityFilter('');
    setOwnerFilter('');
    setAppFilter('');
  };

  const hasActiveFilters = cityFilter !== '' || ownerFilter !== '' || appFilter !== '';

  const globalStats: GlobalStats = statistics?.totals ? {
    totalStations: statistics.totals.totalStations || 0,
    totalSessions: statistics.totals.totalSessions || 0,
    successfulSessions: statistics.totals.successfulSessions || 0,
    totalEnergy: statistics.totals.energyKwhTotal || 0,
    avgSuccessRate: statistics.totals.successRatePct || 0,
    totalErrors: statistics.totals.failedSessions || 0,
    activeStations: statistics.totals.stationsWithSessions || 0,
    offlineStations: statistics.totals.totalStations - (statistics.totals.stationsWithSessions || 0),
    maintenanceStations: 0,
    avgUtilization: 0
  } : {
    totalStations: 0,
    totalSessions: 0,
    successfulSessions: 0,
    totalEnergy: 0,
    avgSuccessRate: 0,
    totalErrors: 0,
    activeStations: 0,
    offlineStations: 0,
    maintenanceStations: 0,
    avgUtilization: 0
  };

  const stationsData: StationStats[] = statistics?.stations?.map((station: any) => ({
    id: String(station.stationId || station.serialNumber),
    name: station.name || station.serialNumber,
    city: station.region || '',
    owner: station.owner || '-',
    connectedApp: station.ocpp_connected ? 'OCPP' : '-',
    totalSessions: station.totalSessions || 0,
    successfulSessions: station.successfulSessions || 0,
    totalEnergy: station.energyKwhTotal || 0,
    errorsCount: station.failedSessions || 0,
    avgSessionDuration: Math.round((station.avgSessionDurationSec || 0) / 60),
    status: station.isOnline ? 'online' : 'offline' as 'online' | 'offline' | 'error',
    lastUpdate: station.lastSessionTime || '-',
    utilization: 0,
    coordinates: undefined,
    connectors: []
  })) || [];

  const filteredStations = stationsData.filter(station => {
    const matchesSearch = !searchTerm || 
      station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCity = !cityFilter || station.city === cityFilter;
    const matchesOwner = !ownerFilter || station.owner === ownerFilter;
    const matchesApp = !appFilter || station.connectedApp === appFilter;
    
    return matchesSearch && matchesCity && matchesOwner && matchesApp;
  });

  const sortedStations = [...filteredStations].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'energy':
        return b.totalEnergy - a.totalEnergy;
      case 'sessions':
        return b.totalSessions - a.totalSessions;
      case 'success':
        return (b.successfulSessions / b.totalSessions) - (a.successfulSessions / a.totalSessions);
      default:
        return 0;
    }
  });

  return (
    <Layout>
      <StatisticsHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {loading && (
          <div className="text-center py-8 text-gray-500">
            Загрузка статистики...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Ошибка загрузки: {error}
          </div>
        )}

        {!loading && !error && statistics && (
          <>
            <GlobalStatsCards globalStats={globalStats} />

            <FiltersAndSearch 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sortBy={sortBy}
              setSortBy={setSortBy}
              cityFilter={cityFilter}
              setCityFilter={setCityFilter}
              ownerFilter={ownerFilter}
              setOwnerFilter={setOwnerFilter}
              appFilter={appFilter}
              setAppFilter={setAppFilter}
              clearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
              periodFilter={periodFilter}
              setPeriodFilter={setPeriodFilter}
            />

            <StationsTable stations={sortedStations} />
          </>
        )}
      </div>
    </Layout>
  );
}