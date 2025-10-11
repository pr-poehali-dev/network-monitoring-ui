export interface Connector {
  id: string;
  status: 'available' | 'charging' | 'occupied' | 'error' | 'offline';
  type: string;
  power: number; // кВт
}

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
  status: 'online' | 'offline' | 'error';
  lastUpdate: string;
  utilization: number; // процент загруженности
  coordinates?: [number, number]; // [latitude, longitude]
  connectors: Connector[];
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