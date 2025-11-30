import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import StationHeader from '@/components/station/StationHeader';
import StationTabs from '@/components/station/StationTabs';
import { useWebSocket, useStation } from '@/hooks/useWebSocket';
import { StationData } from '@/types/websocket';
import { getConnectorType, getConnectorStatus, getStationOverallStatus } from '@/utils/connectors';

interface ChargingStation {
  id: string;
  name: string;
  location: string;
  status: 'available' | 'charging' | 'error' | 'offline';
  connectors: Connector[];
  totalSessions: number;
  lastActivity: string;
  coordinates: [number, number];
  manufacturer: string;
  serialNumber: string;
  ocppId: string;
}

interface Connector {
  id: string;
  type: string;
  status: string;
  statusColor: string;
  statusBg: string;
  statusBorder: string;
  statusLabel: string;
  power: string;
  currentSession?: {
    startTime: string;
    energy: number;
    cost: number;
  };
}

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'request' | 'response' | 'error' | 'info';
  message: string;
}

const mockLogs: LogEntry[] = [
  { id: '1', timestamp: '16:01:20 25.09.2025', type: 'request', message: 'Heartbeat.req\n{}' },
  { id: '2', timestamp: '16:01:20 25.09.2025', type: 'response', message: 'Heartbeat.res\n{"currentTime":"2025-09-25T13:01:20.275Z"}' },
  { id: '3', timestamp: '15:56:19 25.09.2025', type: 'response', message: 'Heartbeat.res\n{"currentTime":"2025-09-25T12:56:19.935Z"}' },
  { id: '4', timestamp: '15:56:19 25.09.2025', type: 'request', message: 'Heartbeat.req\n{}' },
  { id: '5', timestamp: '15:51:19 25.09.2025', type: 'response', message: 'Heartbeat.res\n{"currentTime":"2025-09-25T12:51:19.716Z"}' },
  { id: '6', timestamp: '15:51:19 25.09.2025', type: 'request', message: 'Heartbeat.req\n{}' },
];

function convertToChargingStation(data: StationData): ChargingStation {
  const connectors: Connector[] = data.connectors?.map(c => {
    const statusInfo = getConnectorStatus(c.status);
    return {
      id: String(c.id),
      type: getConnectorType(c.type),
      status: statusInfo.type,
      statusLabel: statusInfo.label,
      statusColor: statusInfo.color,
      statusBg: statusInfo.bgColor,
      statusBorder: statusInfo.borderColor,
      power: 'Неизвестно'
    };
  }) || [];

  const overallStatus = getStationOverallStatus(data.connectors || []);

  return {
    id: String(data.id),
    name: data.name || data.station_id,
    location: data.address || data.region || 'Адрес не указан',
    status: overallStatus.status,
    coordinates: [data.lat || 0, data.lon || 0],
    totalSessions: 0,
    lastActivity: 'Неизвестно',
    manufacturer: 'Неизвестно',
    serialNumber: data.station_id,
    ocppId: data.station_id,
    connectors
  };
}

export default function Station() {
  const { id: serialNumber } = useParams();
  const [activeTab, setActiveTab] = useState('management');
  const { isConnected, isConnecting } = useWebSocket();
  const { station: stationData, loading, loadStation } = useStation(serialNumber);
  const [station, setStation] = useState<ChargingStation | null>(null);
  
  useEffect(() => {
    if (isConnected) {
      loadStation();
    }
  }, [isConnected, loadStation]);

  useEffect(() => {
    if (stationData) {
      setStation(convertToChargingStation(stationData));
    } else {
      setStation(null);
    }
  }, [stationData]);

  if (loading || isConnecting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="text-blue-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-500">Загрузка данных станции...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="WifiOff" size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Нет подключения к серверу</h1>
          <p className="text-gray-500 mb-4">Пожалуйста, проверьте соединение</p>
          <Link to="/">
            <Button>Вернуться к списку</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  if (!station) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Станция не найдена</h1>
          <p className="text-gray-500 mb-4">Станция с серийным номером {serialNumber} не существует</p>
          <Link to="/">
            <Button>Вернуться к списку</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAction = (action: string) => {
    console.log(`Действие: ${action} для станции ${station.id}`);
  };

  return (
    <Layout>
      <StationHeader station={station} />

      {/* Одноколоночный лэйаут для всех разделов */}
      <div className="max-w-7xl mx-auto">
        <StationTabs 
          station={station}
          mockLogs={mockLogs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAction={handleAction}
        />
      </div>
    </Layout>
  );
}