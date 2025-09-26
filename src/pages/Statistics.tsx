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
import { useStatistics } from '@/hooks/useStatistics';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function Statistics() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [cityFilter, setCityFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [appFilter, setAppFilter] = useState('');
  const [chartType, setChartType] = useState('energy');
  const [chartPeriod, setChartPeriod] = useState('week');

  // Используем WebSocket данные
  const { globalStats, statisticsData, loading, error, loadStatisticsData, loadChartData } = useStatistics();
  
  // Загружаем данные при изменении фильтров
  useEffect(() => {
    const filters = {
      city: cityFilter,
      owner: ownerFilter,
      app: appFilter
    };
    loadStatisticsData(filters);
  }, [cityFilter, ownerFilter, appFilter, loadStatisticsData]);

  // Загружаем данные для графиков
  useEffect(() => {
    loadChartData(chartType, chartPeriod);
  }, [chartType, chartPeriod, loadChartData]);

  // Используем WebSocket данные если есть, иначе mock
  const globalStatsToUse = globalStats || calculateGlobalStats(mockStationsStats);
  const stationsToUse = statisticsData?.stations || mockStationsStats;

  const filteredStations = filterAndSortStations(
    stationsToUse,
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
        {loading && (
          <Card className="mb-4 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-blue-600">
                <Icon name="Loader2" className="animate-spin" size={16} />
                <span className="text-sm">Загружаем статистику...</span>
              </div>
            </CardContent>
          </Card>
        )}
        
        <GlobalStatsCards globalStats={globalStatsToUse} />

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