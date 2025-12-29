import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import StatisticsHeader from '@/components/statistics/StatisticsHeader';
import GlobalStatsCards from '@/components/statistics/GlobalStatsCards';
import AdvancedMetrics from '@/components/statistics/AdvancedMetrics';
import TopStationsCards from '@/components/statistics/TopStationsCards';
import RegionalBreakdown from '@/components/statistics/RegionalBreakdown';
import DetailedTable from '@/components/statistics/DetailedTable';
import FiltersAndSearch from '@/components/statistics/FiltersAndSearch';
import PeriodFilter from '@/components/statistics/PeriodFilter';
import { useAllStationsStatistics } from '@/hooks/useWebSocket';
import { GlobalStats } from '@/components/statistics/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

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

  const stationsData = statistics?.stations || [];

  const filteredStations = stationsData.filter((station: any) => {
    const matchesSearch = !searchTerm || 
      (station.name && station.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (station.serialNumber && station.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (station.region && station.region.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCity = !cityFilter || station.region === cityFilter;
    const matchesOwner = !ownerFilter || station.owner === ownerFilter;
    
    return matchesSearch && matchesCity && matchesOwner;
  });

  const sortedStations = [...filteredStations].sort((a: any, b: any) => {
    switch (sortBy) {
      case 'name':
        return (a.name || a.serialNumber).localeCompare(b.name || b.serialNumber);
      case 'energy':
        return (b.energyKwhTotal || 0) - (a.energyKwhTotal || 0);
      case 'sessions':
        return (b.totalSessions || 0) - (a.totalSessions || 0);
      case 'success':
        return (b.effectiveSuccessRatePct || 0) - (a.effectiveSuccessRatePct || 0);
      default:
        return 0;
    }
  });

  return (
    <Layout>
      <StatisticsHeader />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-gray-500">
              <Icon name="Loader2" className="h-6 w-6 animate-spin" />
              <span>Загрузка статистики...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
            <Icon name="AlertCircle" className="h-5 w-5" />
            <div>
              <div className="font-medium">Ошибка загрузки данных</div>
              <div className="text-sm">{error}</div>
            </div>
          </div>
        )}

        {!loading && !error && statistics && (
          <>
            <PeriodFilter value={periodFilter} onChange={setPeriodFilter} />
            
            <GlobalStatsCards globalStats={globalStats} />
            
            <AdvancedMetrics totals={statistics.totals} />

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 max-w-md">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Icon name="LayoutDashboard" size={16} />
                  Обзор
                </TabsTrigger>
                <TabsTrigger value="regions" className="flex items-center gap-2">
                  <Icon name="Map" size={16} />
                  Регионы
                </TabsTrigger>
                <TabsTrigger value="detailed" className="flex items-center gap-2">
                  <Icon name="Table" size={16} />
                  Детально
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <TopStationsCards stations={stationsData} />
              </TabsContent>

              <TabsContent value="regions" className="space-y-6">
                <RegionalBreakdown stations={stationsData} />
              </TabsContent>

              <TabsContent value="detailed" className="space-y-6">
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

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div>
                    Показано станций: <span className="font-medium">{sortedStations.length}</span> из <span className="font-medium">{stationsData.length}</span>
                  </div>
                  {statistics.totals.unknownStationsInInflux > 0 && (
                    <div className="flex items-center gap-2 text-orange-600">
                      <Icon name="AlertTriangle" size={14} />
                      {statistics.totals.unknownStationsInInflux} неопознанных в Influx
                    </div>
                  )}
                </div>

                <DetailedTable stations={sortedStations} />
              </TabsContent>
            </Tabs>

            <div className="text-center text-xs text-gray-400 border-t pt-4">
              Период: {statistics.totals.from} — {statistics.totals.to}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}