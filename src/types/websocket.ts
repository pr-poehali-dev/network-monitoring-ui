// WebSocket типы и структуры данных

export interface ConnectorData {
  id: string;
  status: number;
  type: number;
  max_power?: number;
}

export type StationStatus = 'connected' | 'disconnected' | 'error' | 'initializing';

export interface StationData {
  id: number;
  station_id: string;
  name: string | null;
  ip_address: string | null;
  ssh_port: number | null;
  address: string | null;
  region: string | null;
  station_status: StationStatus;
  error_info: string | null;
  created_at: string;
  lat: number | null;
  lon: number | null;
  connectors?: ConnectorData[];
}

// Структура сообщений клиент -> сервер
export interface WSClientMessage {
  type: 'request';
  action: 'getAllStations' | 'getStationById' | 'subscribeUpdates' | 'unsubscribeUpdates';
  requestId: string;
  stationId?: number;
  filters?: {
    region?: string;
    station_status?: StationStatus;
  };
}

// Структура сообщений сервер -> клиент
export interface WSServerMessage {
  type: 'response' | 'update' | 'error';
  action: string;
  data?: any;
  requestId?: string;
  code?: string;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

// Ответ с данными станций
export interface StationsResponse {
  stations: StationData[];
  total: number;
}

// Ответ с данными конкретной станции
export interface StationResponse {
  station: StationData;
}

// Real-time обновления
export interface StationUpdate {
  stationId: number;
  changes: Partial<StationData>;
  timestamp?: string;
}

// Статус WebSocket соединения
export interface WSConnectionStatus {
  connected: boolean;
  reconnecting: boolean;
  error: string | null;
}