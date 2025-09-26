// WebSocket типы и структуры данных

export interface StationData {
  id: string;
  name: string;
  city: string;
  owner: string;
  connectedApp: string;
  status: 'active' | 'inactive' | 'maintenance' | 'error' | 'offline';
  totalEnergy: number;
  currentPower: number;
  lastUpdate: string; // ISO timestamp
  coordinates?: {
    lat: number;
    lng: number;
  };
  
  // Дополнительные поля для карточки станции
  address?: string;
  description?: string;
  connectors?: Array<{
    type: string;
    power: number;
    status: string;
    price?: number;
  }>;
  workingHours?: string;
  phone?: string;
  email?: string;
  rating?: number;
  reviewsCount?: number;
  amenities?: string[];
  installationDate?: string;
  lastMaintenance?: string;
  firmware?: string;
  serialNumber?: string;
  manufacturer?: string;
  
  // Статистика и аналитика
  totalSessions?: number;
  successfulSessions?: number;
  errorsCount?: number;
  utilization?: number;
  chargingHistory?: Array<{
    date: string;
    sessions: number;
    energy: number;
    revenue: number;
  }>;
  hourlyStats?: Array<{
    hour: number;
    sessions: number;
    utilization: number;
  }>;
  recentSessions?: Array<{
    id: string;
    startTime: string;
    endTime: string;
    duration: number;
    energy: number;
    cost: number;
    connector: string;
    status: string;
  }>;
  totalRevenue?: number;
  averageSessionDuration?: number;
  todayStats?: {
    sessions: number;
    energy: number;
    revenue: number;
    utilization: number;
  };
}

// Структура сообщений клиент -> сервер
export interface WSClientMessage {
  type: 'request';
  action: 'getStations' | 'getStationById' | 'getStationDetail' | 'getStationHistory' | 'getStationSessions' | 'getStationStats' | 'getAvailableStations';
  data?: {
    stationId?: string;
    fields?: string[];
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