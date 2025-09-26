import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatisticsHeader from '@/components/statistics/StatisticsHeader';
import GlobalStatsCards from '@/components/statistics/GlobalStatsCards';
import FiltersAndSearch from '@/components/statistics/FiltersAndSearch';
import StationsTable from '@/components/statistics/StationsTable';
import ChartsView from '@/components/statistics/ChartsView';
import { mockStationsStats } from '@/components/statistics/mockData';
import { calculateGlobalStats, filterAndSortStations } from '@/components/statistics/utils';
import { useWebSocket, useStations } from '@/hooks/useWebSocket';

export default function Statistics() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [cityFilter, setCityFilter] = useState('');
  
  // WebSocket данные
  const { isConnected } = useWebSocket();
  const { stations, loading, loadStationsForStats } = useStations();

  // Автоматическая загрузка данных при подключении
  useEffect(() => {
    if (isConnected && stations.length === 0) {
      loadStationsForStats();
    }
  }, [isConnected, stations.length, loadStationsForStats]);
  const [ownerFilter, setOwnerFilter] = useState('');
  const [appFilter, setAppFilter] = useState('');

  // Используем данные с сервера если есть, иначе моковые
  const stationsData = stations.length > 0 ? stations : mockStationsStats;
  const globalStats = calculateGlobalStats(stationsData);

  const filteredStations = filterAndSortStations(
    stationsData,
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

  return (
    <Layout>
      <StatisticsHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <GlobalStatsCards globalStats={globalStats} />

        <Tabs defaultValue="table" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="table">Таблица</TabsTrigger>
              <TabsTrigger value="charts">Графики</TabsTrigger>
            </TabsList>
          </div>

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

          <TabsContent value="table">
            <StationsTable stations={filteredStations} />
          </TabsContent>

          <TabsContent value="charts">
            <ChartsView stations={filteredStations} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}