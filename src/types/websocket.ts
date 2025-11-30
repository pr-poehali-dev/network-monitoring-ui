// WebSocket типы и структуры данных

export interface ConnectorData {
  id: string;
  status: number;
  type: number;
}

export type StationStatus = 'initializing' | 'connected' | 'error' | 'disconnected';

export interface StationData {
  id: number;
  station_id: string;
  name: string;
  ip_address: string;
  ssh_port: number;
  address: string;
  region: string;
  created_at: string;
  lat: number | null;
  lon: number | null;
  station_status: StationStatus;
  error_info: string;
  connectors: ConnectorData[];
  owner?: string;
}

// Структура сообщений клиент -> сервер
export interface WSClientMessage {
  type: 'request';
  action: 'getAllStations' | 'getStationById' | 'getStationBySerialNumber' | 'subscribeUpdates' | 'unsubscribeUpdates';
  requestId: string;
  stationId?: number;
  serialNumber?: string;
  filters?: {
    region?: string;
    station_status?: string;
  };
}

// Структура сообщений сервер -> клиент
export interface WSServerMessage {
  type: 'response' | 'update' | 'error';
  action: string;
  data?: any;
  requestId?: string;
  code?: 'INVALID_REQUEST' | 'INVALID_ACTION' | 'NOT_FOUND';
  message?: string;
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
}

// Статус WebSocket соединения
export interface WSConnectionStatus {
  connected: boolean;
  reconnecting: boolean;
  error: string | null;
}