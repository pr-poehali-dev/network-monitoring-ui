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
import StationFiltersAndSearch from '@/components/StationFiltersAndSearch';
import { useWebSocket, useStations } from '@/hooks/useWebSocket';
import { useMap } from '@/hooks/useMap';

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
  const [sortBy, setSortBy] = useState('name');
  const [cityFilter, setCityFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [appFilter, setAppFilter] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // WebSocket подключение и данные
  const { isConnected, isConnecting, error } = useWebSocket();
  const { stations, loading, loadStations } = useStations();
  const { mapData, loading: mapLoading } = useMap();

  const currentTab = searchParams.get('tab') || 'map';

  // Автоматическая загрузка данных при переходе на список или карту
  useEffect(() => {
    if (isConnected && stations.length === 0) {
      console.log(`🔄 Loading stations for ${currentTab} view...`);
      loadStations();
    }
  }, [currentTab, isConnected, stations.length, loadStations]);

  // Используем данные с сервера для обеих вкладок, fallback на моковые данные
  const displayStations = currentTab === 'map' && mapData?.stations 
    ? mapData.stations 
    : stations.length > 0 
    ? stations 
    : mockStations;
  
  const clearFilters = () => {
    setCityFilter('');
    setOwnerFilter('');
    setAppFilter('');
  };

  const hasActiveFilters = cityFilter !== '' || ownerFilter !== '' || appFilter !== '';
  
  // Продвинутая фильтрация как в статистике
  const filteredStations = displayStations
    .filter(station => {
      const matchesSearch = station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.city?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCity = !cityFilter || 
        station.city?.toLowerCase().includes(cityFilter.toLowerCase());
      
      const matchesOwner = !ownerFilter || 
        station.owner?.toLowerCase().includes(ownerFilter.toLowerCase());
        
      const matchesApp = !appFilter || 
        station.connectedApp?.toLowerCase().includes(appFilter.toLowerCase());

      return matchesSearch && matchesCity && matchesOwner && matchesApp;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'city':
          return (a.city || '').localeCompare(b.city || '');
        case 'owner':
          return (a.owner || '').localeCompare(b.owner || '');
        case 'sessions':
          return (b.totalSessions || 0) - (a.totalSessions || 0);
        case 'energy':
          return (b.totalEnergy || 0) - (a.totalEnergy || 0);
        case 'errors':
          return (b.errorsCount || 0) - (a.errorsCount || 0);
        default:
          return 0;
      }
    });

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
                onClick={() => loadStations()}
                disabled={!isConnected || loading}
              >
                {loading ? 'Загрузка...' : 'Загрузить данные'}
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
            {/* Filters and Search - копируем из статистики */}
            <StationFiltersAndSearch 
              searchTerm={searchQuery}
              setSearchTerm={setSearchQuery}
              sortBy={sortBy}
              setSortBy={setSortBy}
              cityFilter={cityFilter}
              setCityFilter={setCityFilter}
              ownerFilter={ownerFilter}
              setOwnerFilter={setOwnerFilter}
              appFilter={appFilter}
              setAppFilter={setAppFilter}
              clearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />

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

            {/* Stations Table - стиль как в статистике */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Станция</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Статус</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Коннекторы</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Сессии</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading && (
                        <tr>
                          <td colSpan={5} className="text-center py-8">
                            <div className="flex items-center justify-center gap-2">
                              <Icon name="Loader2" className="animate-spin" size={20} />
                              Загружаем данные...
                            </div>
                          </td>
                        </tr>
                      )}
                      {!loading && filteredStations.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-gray-500">
                            {!isConnected ? 'Нет подключения к серверу' : 'Нет данных'}
                          </td>
                        </tr>
                      )}
                      {!loading && filteredStations.map((station) => (
                        <tr key={station.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-gray-900 text-sm">{station.name}</div>
                              <div className="text-xs text-gray-600">{station.city || station.location} • {station.owner || 'Неизвестно'}</div>
                              <div className="text-xs text-blue-600">{station.connectedApp || 'Не подключено'}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge 
                              className={`text-xs ${
                                station.status === 'available' || station.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                                station.status === 'charging' || station.status === 'inactive' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' :
                                station.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                                station.status === 'error' || station.status === 'offline' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                                'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              }`}
                            >
                              {getStatusLabel(station.status)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-sm">{station.connectors?.length || 0}</div>
                            <div className="text-xs text-gray-500">
                              {station.connectors?.filter(c => c.status === 'available').length || 0} доступно
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-sm">{(station.totalSessions || 0).toLocaleString()}</div>
                            <div className="text-xs text-gray-500">всего</div>
                          </td>
                          <td className="py-3 px-4">
                            <Link to={`/station/${station.id}`}>
                              <Button variant="outline" size="sm">
                                Подробнее
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        </div>
      </div>
    </Layout>
  );
}