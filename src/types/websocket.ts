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
  action: 'getAllStations' | 'getStationById' | 'getStationBySerialNumber' | 'subscribeUpdates' | 'unsubscribeUpdates' | 'getStationTransactions' | 'getStationUptimeBuckets' | 'getTransactionDetails' | 'getRectifiersStatus' | 'getContactorsStatus' | 'getStationLogDates' | 'getStationLogFile' | 'getEnergyMeterMetrics';
  requestId: string;
  stationId?: number;
  serialNumber?: string;
  transactionId?: string | number;
  from?: string;
  to?: string;
  limit?: number;
  bucketMinutes?: number;
  date?: string;
  maxBytes?: number;
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

export interface Transaction {
  time: string;
  connectorId: number;
  transactionId: number;
  energyWh: number;
  energyKwh: number;
  durationSec: number;
  success: boolean;
  reason: string;
  meterStartWh: number;
  meterStopWh: number;
  isActive?: boolean;
}

export interface UptimeBucket {
  from: string;
  to: string;
  onlineMs: number;
  offlineMs: number;
}

export interface MetricPoint {
  time: string;
  value: number;
}

export interface TransactionMetrics {
  current: MetricPoint[];
  voltage: MetricPoint[];
  soc: MetricPoint[];
  power: MetricPoint[];
  energy: MetricPoint[];
}

export interface TransactionDetails {
  transaction: {
    serialNumber: string;
    transactionId: string;
    connectorId: string | null;
    startTime: string;
    endTime: string;
    durationSec: number;
    startSoc: number | null;
    endSoc: number | null;
    peakPowerKw: number;
    energyKwh: number;
    reason: string;
    success: boolean;
  };
  metrics: TransactionMetrics;
}

export interface RectifierModule {
  moduleId: string;
  time: string;
  temperatureC: number;
  voltageSet: number;
  currentSet: number;
  voltageOut: number;
  currentOut: number;
  moduleFault: boolean;
  moduleProtection: boolean;
  sciCommunicationFailureInModule: boolean;
  inputModeDetectionError: boolean;
  dcdcOvervoltage: boolean;
  abnormalPfcVoltage: boolean;
  acOvervoltage: boolean;
  acUndervoltage: boolean;
  canCommunicationFailure: boolean;
  temperatureLimitedPower: boolean;
  acPowerLimit: boolean;
  shortCircuitToDcdc: boolean;
  dcdcOvertemperature: boolean;
  dcdcOutputOvervoltage: boolean;
  notConnect: boolean;
  isOn: boolean;
}

export interface Contactor {
  id: number;
  in: boolean;
  out: boolean;
}

export interface ContactorsData {
  time: string;
  signals: number[];
  signalsCount: number;
  contactorsCount: number;
  contactors: Contactor[];
}

export interface EnergyMeterCurrent {
  connected: boolean | null;
  time: string;
  ts: number;
  voltageL1?: number;
  voltageL2?: number;
  voltageL3?: number;
  currentL1?: number;
  currentL2?: number;
  currentL3?: number;
  power_total?: number;
  energy_active?: number;
}

export interface EnergyMeterMetrics {
  voltageL1?: MetricPoint[];
  voltageL2?: MetricPoint[];
  voltageL3?: MetricPoint[];
  currentL1?: MetricPoint[];
  currentL2?: MetricPoint[];
  currentL3?: MetricPoint[];
  power_total?: MetricPoint[];
  energy_active?: MetricPoint[];
}

export interface EnergyMeterData {
  serialNumber: string;
  from: string;
  to: string;
  current: EnergyMeterCurrent;
  metrics: EnergyMeterMetrics;
}