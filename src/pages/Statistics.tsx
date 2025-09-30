import { useState } from 'react';
import Layout from '@/components/Layout';
import StatisticsHeader from '@/components/statistics/StatisticsHeader';
import GlobalStatsCards from '@/components/statistics/GlobalStatsCards';
import FiltersAndSearch from '@/components/statistics/FiltersAndSearch';
import StationsTable from '@/components/statistics/StationsTable';
import { mockStationsStats } from '@/components/statistics/mockData';
import { calculateGlobalStats, filterAndSortStations } from '@/components/statistics/utils';

export default function Statistics() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [cityFilter, setCityFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [appFilter, setAppFilter] = useState('');

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