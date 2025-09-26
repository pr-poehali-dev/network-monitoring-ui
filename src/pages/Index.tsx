import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import Map from '@/components/Map';
import Layout from '@/components/Layout';
import WebSocketStatus from '@/components/WebSocketStatus';
import { useWebSocket, useStations } from '@/hooks/useWebSocket';

interface ChargingStation {
  id: string;
  name: string;
  location: string;
  status: 'available' | 'charging' | 'error' | 'offline';
  connectors: Connector[];
  totalSessions: number;
  lastActivity: string;
  coordinates: [number, number];
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

const mockStations: ChargingStation[] = [
  {
    id: '1',
    name: 'ЭЗС Центральная',
    location: 'ул. Ленина, 15',
    status: 'charging',
    coordinates: [55.7558, 37.6176],
    totalSessions: 145,
    lastActivity: '2 мин назад',
    connectors: [
      { id: 'c1', type: 'Type 2', status: 'charging', power: '22 кВт', currentSession: { startTime: '14:30', energy: 12.5, cost: 450 } },
      { id: 'c2', type: 'CCS', status: 'available', power: '50 кВт' }
    ]
  },
  {
    id: '2',
    name: 'ЭЗС Северная',
    location: 'пр. Мира, 45',
    status: 'available',
    coordinates: [55.7665, 37.6177],
    totalSessions: 87,
    lastActivity: '15 мин назад',
    connectors: [
      { id: 'c3', type: 'Type 2', status: 'available', power: '22 кВт' },
      { id: 'c4', type: 'CHAdeMO', status: 'available', power: '50 кВт' }
    ]
  },
  {
    id: '3',
    name: 'ЭЗС Южная',
    location: 'ул. Победы, 12',
    status: 'error',
    coordinates: [55.7430, 37.6156],
    totalSessions: 203,
    lastActivity: '1 час назад',
    connectors: [
      { id: 'c5', type: 'Type 2', status: 'error', power: '22 кВт' },
      { id: 'c6', type: 'CCS', status: 'available', power: '150 кВт' }
    ]
  }
];

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'available': return 'Доступна';
    case 'active': return 'Активна';
    case 'charging': return 'Зарядка';
    case 'inactive': return 'Неактивна';
    case 'maintenance': return 'Обслуживание';
    case 'error': return 'Ошибка';
    case 'offline': return 'Офлайн';
    default: return 'Неизвестно';
  }
};

export default function Index() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // WebSocket подключение и данные
  const { isConnected, isConnecting, error } = useWebSocket();
  const { stations, loading, loadStationsForMap, loadStationsForList } = useStations();

  const currentTab = searchParams.get('tab') || 'map';

  // Автоматическая загрузка данных при переходе на список или карту
  useEffect(() => {
    if (isConnected && stations.length === 0) {
      if (currentTab === 'map') {
        loadStationsForMap();
      } else if (currentTab === 'list') {
        loadStationsForList();
      }
    }
  }, [currentTab, isConnected, stations.length, loadStationsForMap, loadStationsForList]);

  // Используем данные с сервера для обеих вкладок, fallback на моковые данные
  const displayStations = stations.length > 0 ? stations : mockStations;
  
  const filteredStations = displayStations.filter(station =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStationClick = (stationId: string) => {
    navigate(`/station/${stationId}`);
  };

  return (
    <Layout>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentTab === 'map' ? 'Карта станций' : 'Список станций'}
              </h1>
              <p className="text-sm text-gray-500">
                Мониторинг и управление зарядными станциями
              </p>
            </div>
            <div className="flex items-center gap-4">
              <WebSocketStatus />
              {/* Кнопка для тестирования загрузки данных */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => currentTab === 'map' ? loadStationsForMap() : loadStationsForList()}
                disabled={!isConnected || loading}
              >
                {loading ? 'Загрузка...' : 'Обновить данные'}
              </Button>
              <Badge variant="outline" className="gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Онлайн: 18
              </Badge>
              <Badge variant="outline" className="gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Ошибки: 3
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
        <div className="space-y-6">

        {/* Map view */}
        {currentTab === 'map' && (
          <div className="space-y-4">
            {loading && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Icon name="Loader2" className="animate-spin" size={16} />
                    <span className="text-sm">Загружаем станции для карты...</span>
                  </div>
                </CardContent>
              </Card>
            )}
            <Card className="h-[600px] relative">
              <CardContent className="p-0 h-full">
                <Map 
                  stations={displayStations} 
                  onStationClick={handleStationClick}
                />
              </CardContent>
            </Card>

            {/* Legend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Легенда</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-station-available rounded-full"></div>
                    <span className="text-sm">Доступна</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-station-charging rounded-full"></div>
                    <span className="text-sm">Зарядка</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-station-error rounded-full"></div>
                    <span className="text-sm">Ошибка</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-station-offline rounded-full"></div>
                    <span className="text-sm">Офлайн</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* List view */}
        {currentTab === 'list' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Поиск станций..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Ошибки WebSocket */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-600">
                    <Icon name="AlertCircle" size={16} />
                    <span className="text-sm">Ошибка соединения: {error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stations Table */}
            <Card>
              <CardHeader>
                <CardTitle>Зарядные станции</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Название</TableHead>
                      <TableHead>Город</TableHead>
                      <TableHead>Владелец</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Энергия</TableHead>
                      <TableHead>Мощность</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex items-center justify-center gap-2">
                            <Icon name="Loader2" className="animate-spin" size={20} />
                            Загружаем данные...
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {!loading && filteredStations.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          {currentTab === 'list' && !isConnected ? 'Нет подключения к серверу' : 'Нет данных'}
                        </TableCell>
                      </TableRow>
                    )}
                    {!loading && filteredStations.map((station) => (
                      <TableRow key={station.id}>
                        <TableCell className="font-medium">{station.name}</TableCell>
                        <TableCell>{currentTab === 'list' ? station.city : station.location}</TableCell>
                        <TableCell>{currentTab === 'list' ? station.owner : '-'}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={station.status === 'error' ? 'destructive' : 'default'}
                            className={
                              station.status === 'available' || station.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                              station.status === 'charging' || station.status === 'inactive' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' :
                              station.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                              ''
                            }
                          >
                            {getStatusLabel(station.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {currentTab === 'list' ? 
                            `${station.totalEnergy?.toLocaleString() || 0} кВт⋅ч` : 
                            station.connectors?.length || 0
                          }
                        </TableCell>
                        <TableCell>
                          {currentTab === 'list' ? 
                            `${station.currentPower || 0} кВт` : 
                            station.totalSessions || 0
                          }
                        </TableCell>
                        <TableCell>
                          <Link to={`/station/${station.id}`}>
                            <Button variant="outline" size="sm">
                              Подробнее
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        </div>
      </div>
    </Layout>
  );
}