import { useState } from 'react';
import Layout from '@/components/Layout';
import StatisticsHeader from '@/components/statistics/StatisticsHeader';
import GlobalStatsCards from '@/components/statistics/GlobalStatsCards';
import FiltersAndSearch from '@/components/statistics/FiltersAndSearch';
import StationsTable from '@/components/statistics/StationsTable';
import { mockStationsStats } from '@/components/statistics/mockData';
import { calculateGlobalStats, filterAndSortStations } from '@/components/statistics/utils';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export default function Statistics() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [cityFilter, setCityFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [appFilter, setAppFilter] = useState('');

  const { isConnected, isConnecting, error: wsError } = useWebSocket();

  const globalStats = calculateGlobalStats(mockStationsStats);

  const filteredStations = filterAndSortStations(
    mockStationsStats,
    searchTerm,
    cityFilter,
    ownerFilter,
    appFilter,
    sortBy
  );

  const clearFilters = () => {
    setCityFilter('');
    setOwnerFilter('');
    setAppFilter('');
  };

  const hasActiveFilters = cityFilter !== '' || ownerFilter !== '' || appFilter !== '';

  if (isConnecting) {
    return (
      <Layout showSidebar={false}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center px-4">
            <div className="mb-6">
              <Icon name="Loader2" size={64} className="mx-auto text-blue-500 animate-spin" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Подключение к серверу</h1>
            <p className="text-gray-600">
              Устанавливаем соединение с системой мониторинга...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isConnected) {
    return (
      <Layout showSidebar={false}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center px-4">
            <div className="mb-6">
              <Icon name="WifiOff" size={64} className="mx-auto text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Нет подключения к серверу</h1>
            <p className="text-gray-600 mb-6">
              {wsError || 'Не удалось установить соединение с WebSocket сервером'}
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2"
            >
              <Icon name="RotateCw" size={18} />
              Обновить страницу
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <StatisticsHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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
        />

        <StationsTable stations={filteredStations} />
      </div>
    </Layout>
  );
}