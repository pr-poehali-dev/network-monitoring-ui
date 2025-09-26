import { StationStats, GlobalStats } from './types';

export const calculateGlobalStats = (stations: StationStats[]): GlobalStats => {
  const totalSessions = stations.reduce((sum, s) => sum + s.totalSessions, 0);
  const successfulSessions = stations.reduce((sum, s) => sum + s.successfulSessions, 0);
  const totalEnergy = stations.reduce((sum, s) => sum + s.totalEnergy, 0);
  const totalErrors = stations.reduce((sum, s) => sum + s.errorsCount, 0);
  const avgUtilization = stations.reduce((sum, s) => sum + s.utilization, 0) / stations.length;
  
  return {
    totalStations: stations.length,
    totalSessions,
    successfulSessions,
    totalEnergy,
    avgSuccessRate: totalSessions > 0 ? (successfulSessions / totalSessions) * 100 : 0,
    totalErrors,
    activeStations: stations.filter(s => s.status === 'online').length,
    offlineStations: stations.filter(s => s.status === 'offline').length,
    maintenanceStations: stations.filter(s => s.status === 'maintenance').length,
    avgUtilization: Math.round(avgUtilization)
  };
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'online': return 'text-green-600 bg-green-50';
    case 'offline': return 'text-red-600 bg-red-50';
    case 'maintenance': return 'text-yellow-600 bg-yellow-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'online': return 'Онлайн';
    case 'offline': return 'Оффлайн';
    case 'maintenance': return 'Обслуживание';
    default: return 'Неизвестно';
  }
};

export const filterAndSortStations = (
  stations: StationStats[],
  searchTerm: string,
  cityFilter: string,
  ownerFilter: string,
  appFilter: string,
  sortBy: string
): StationStats[] => {
  // Фильтрация
  const filteredStations = stations.filter(station => {
    const matchesSearch = station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         station.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         station.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = cityFilter === '' || station.city.toLowerCase().includes(cityFilter.toLowerCase());
    const matchesOwner = ownerFilter === '' || station.owner.toLowerCase().includes(ownerFilter.toLowerCase());
    const matchesApp = appFilter === '' || station.connectedApp.toLowerCase().includes(appFilter.toLowerCase());
    
    return matchesSearch && matchesCity && matchesOwner && matchesApp;
  });

  // Сортировка
  filteredStations.sort((a, b) => {
    switch (sortBy) {
      case 'sessions':
        return b.totalSessions - a.totalSessions;
      case 'energy':
        return b.totalEnergy - a.totalEnergy;
      case 'errors':
        return b.errorsCount - a.errorsCount;
      case 'utilization':
        return b.utilization - a.utilization;
      case 'city':
        return a.city.localeCompare(b.city);
      case 'owner':
        return a.owner.localeCompare(b.owner);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return filteredStations;
};