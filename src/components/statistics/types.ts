export interface StationStats {
  id: string;
  name: string;
  city: string;
  owner: string;
  connectedApp: string;
  totalSessions: number;
  successfulSessions: number;
  totalEnergy: number; // kWh
  errorsCount: number;
  avgSessionDuration: number; // минуты
  status: 'online' | 'offline' | 'maintenance';
  lastUpdate: string;
  utilization: number; // процент загруженности
}

export interface GlobalStats {
  totalStations: number;
  totalSessions: number;
  successfulSessions: number;
  totalEnergy: number;
  avgSuccessRate: number;
  totalErrors: number;
  activeStations: number;
  offlineStations: number;
  maintenanceStations: number;
  avgUtilization: number;
}