import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import StationHeader from '@/components/station/StationHeader';
import StationTabs from '@/components/station/StationTabs';
import { useWebSocket } from '@/hooks/useWebSocket';
import { wsService } from '@/services/websocket';
import { StationData } from '@/types/websocket';

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
  status: 'available' | 'charging' | 'error';
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

const mockStations: ChargingStation[] = [
  {
    id: '1',
    name: 'ЭЗС Центральная',
    location: 'ул. Ленина, 15',
    status: 'available',
    coordinates: [55.7558, 37.6176],
    totalSessions: 145,
    lastActivity: '2 мин назад',
    manufacturer: 'Promenergo',
    serialNumber: '00053',
    ocppId: 'EDK6QDT0J59EK69A2WETY',
    connectors: [
      { id: '1', type: 'CCS Combo 2', status: 'available', power: '120 кВт' },
      { id: '2', type: 'GB/T DC', status: 'available', power: '120 кВт' },
      { id: '3', type: 'CHAdeMO', status: 'available', power: '90 кВт' }
    ]
  },
  {
    id: '2', 
    name: 'ЭЗС Торговый центр',
    location: 'ТЦ Метрополис',
    status: 'charging',
    coordinates: [55.7387, 37.6032],
    totalSessions: 89,
    lastActivity: '15 мин назад',
    manufacturer: 'ChargePoint',
    serialNumber: '00042',
    ocppId: 'TCP2QDT0J59EK69A2WETY',
    connectors: [
      { id: '1', type: 'Type 2', status: 'charging', power: '22 кВт', currentSession: { startTime: '14:30', energy: 12.5, cost: 450 } },
      { id: '2', type: 'CHAdeMO', status: 'available', power: '50 кВт' }
    ]
  },
  {
    id: '3',
    name: 'ЭЗС Парковая',
    location: 'Парк Сокольники',
    status: 'error',
    coordinates: [55.7942, 37.6816], 
    totalSessions: 203,
    lastActivity: '1 час назад',
    manufacturer: 'ABB',
    serialNumber: '00078',
    ocppId: 'ABB6QDT0J59EK69A2WETY',
    connectors: [
      { id: '1', type: 'Type 2', status: 'error', power: '22 кВт' },
      { id: '2', type: 'CCS', status: 'error', power: '50 кВт' }
    ]
  }
];

const mockLogs: LogEntry[] = [
  { id: '1', timestamp: '16:01:20 25.09.2025', type: 'request', message: 'Heartbeat.req\n{}' },
  { id: '2', timestamp: '16:01:20 25.09.2025', type: 'response', message: 'Heartbeat.res\n{"currentTime":"2025-09-25T13:01:20.275Z"}' },
  { id: '3', timestamp: '15:56:19 25.09.2025', type: 'response', message: 'Heartbeat.res\n{"currentTime":"2025-09-25T12:56:19.935Z"}' },
  { id: '4', timestamp: '15:56:19 25.09.2025', type: 'request', message: 'Heartbeat.req\n{}' },
  { id: '5', timestamp: '15:51:19 25.09.2025', type: 'response', message: 'Heartbeat.res\n{"currentTime":"2025-09-25T12:51:19.716Z"}' },
  { id: '6', timestamp: '15:51:19 25.09.2025', type: 'request', message: 'Heartbeat.req\n{}' },
];

export default function Station() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('management');
  const [station, setStation] = useState<StationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isConnected: connected } = useWebSocket();

  useEffect(() => {
    let isMounted = true;

    const loadStation = async () => {
      if (!connected || !wsService || !id) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('🔍 Загружаем станцию с ID:', id);
        console.log('🔌 WebSocket connected:', connected);
        console.log('🔌 WebSocket state:', wsService.isConnected());
        
        const stationData = await wsService.getStationDetail(id);
        console.log('📦 Получены данные станции:', stationData);
        
        if (isMounted) {
          if (stationData) {
            console.log('✅ Станция загружена:', stationData);
            setStation(stationData);
          } else {
            console.log('❌ Станция не найдена');
            setError(`Станция с ID ${id} не найдена`);
          }
        }
      } catch (err) {
        console.error('❌ Ошибка загрузки станции:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Ошибка загрузки станции');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (connected) {
      loadStation();
    }

    return () => {
      isMounted = false;
    };
  }, [connected, wsService, id]);

  // Показываем лоадер
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="text-blue-500 mx-auto mb-4 animate-spin" />
          <h1 className="text-2xl font-bold mb-2">Загрузка станции...</h1>
          <p className="text-gray-500">Получаем данные о станции {id}</p>
        </div>
      </div>
    );
  }

  // Показываем ошибку или "не найдена"
  if (error || !station) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Станция не найдена</h1>
          <p className="text-gray-500 mb-4">
            {error || `Станция с ID ${id} не существует`}
          </p>
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

  // Конвертируем данные из WebSocket в формат для компонентов
  const stationForComponent = {
    id: station.id,
    name: station.name,
    location: station.address || station.city,
    status: station.status as 'available' | 'charging' | 'error' | 'offline',
    coordinates: [station.coordinates?.lat || 0, station.coordinates?.lng || 0] as [number, number],
    totalSessions: station.totalSessions || 0,
    lastActivity: station.lastUpdate || 'Неизвестно',
    manufacturer: station.manufacturer || 'Неизвестно',
    serialNumber: station.serialNumber || 'Неизвестно',
    ocppId: station.id,
    connectors: (station.connectors || []).map((conn, index) => ({
      id: String(index + 1),
      type: conn.type || 'Неизвестно',
      status: conn.status as 'available' | 'charging' | 'error',
      power: `${conn.power || 0} кВт`
    }))
  };

  return (
    <Layout>
      <StationHeader station={stationForComponent} />

      {/* Одноколоночный лэйаут для всех разделов */}
      <div className="max-w-7xl mx-auto">
        <StationTabs 
          station={stationForComponent}
          mockLogs={mockLogs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAction={handleAction}
        />
      </div>
    </Layout>
  );
}