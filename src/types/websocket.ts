// WebSocket типы и структуры данных

export interface StationData {
  id: string;
  name: string;
  city: string;
  owner: string;
  connectedApp: string;
  status: 'active' | 'inactive' | 'maintenance';
  totalEnergy: number;
  currentPower: number;
  lastUpdate: string; // ISO timestamp
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Структура сообщений клиент -> сервер
export interface WSClientMessage {
  type: 'request';
  action: 'getStations' | 'getStationById' | 'getStationStats';
  data?: {
    stationId?: string;
    fields?: string[]; // Какие поля возвращать ['id', 'name', 'status', 'coordinates']
    filters?: {
      city?: string;
      owner?: string;
      status?: string;
      connectedApp?: string;
    };
    pagination?: {
      page: number;
      limit: number;
    };
  };
  requestId: string; // Уникальный ID для сопоставления запроса и ответа
}

// Структура сообщений сервер -> клиент
export interface WSServerMessage {
  type: 'response' | 'update' | 'error';
  action: string;
  data?: any;
  requestId?: string; // Для сопоставления с запросом
  error?: {
    code: string;
    message: string;
  };
}

// Ответ с данными станций
export interface StationsResponse {
  stations: StationData[];
  total: number;
  page: number;
  limit: number;
}

// Ответ с данными конкретной станции
export interface StationResponse {
  station: StationData;
}

// Real-time обновления
export interface StationUpdate {
  stationId: string;
  updates: Partial<StationData>;
  timestamp: string;
}