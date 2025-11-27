import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import Map from '@/components/Map';
import Layout from '@/components/Layout';
import { useWebSocket, useStations } from '@/hooks/useWebSocket';
import { StationData } from '@/types/websocket';

const getStationStatus = (station: StationData): 'online' | 'offline' => {
  const hasConnectors = station.connectors && station.connectors.length > 0;
  return (station.is_active === 1 && hasConnectors) ? 'online' : 'offline';
};

const getStatusLabel = (status: 'online' | 'offline') => {
  return status === 'online' ? 'Активна' : 'Оффлайн';
};

export default function Index() {
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [clustering, setClustering] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentTab = searchParams.get('tab') || 'map';
  
  const { isConnected, isConnecting, error: wsError } = useWebSocket();
  const { stations, loading, error, loadStations } = useStations();

  useEffect(() => {
    if (isConnected) {
      loadStations();
    }
  }, [isConnected, loadStations]);

  const filteredStations = stations.filter(station => {
    const matchesSearch = (station.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      station.station_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (station.address?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    const matchesRegion = !regionFilter || (station.region?.toLowerCase().includes(regionFilter.toLowerCase()) ?? false);
    
    const stationStatus = getStationStatus(station);
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && stationStatus === 'online') ||
      (statusFilter === 'inactive' && stationStatus === 'offline');
    
    return matchesSearch && matchesRegion && matchesStatus;
  });

  const handleStationClick = (stationId: number) => {
    navigate(`/station/${stationId}`);
  };

  const activeStationsCount = stations.filter(s => s.is_active === 1).length;
  const inactiveStationsCount = stations.filter(s => s.is_active === 0).length;

  return (
    <Layout>
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Мониторинг ЭЗС</h1>
              <p className="text-sm text-gray-500 mt-1">
                Всего станций: {stations.length} | Активных: {activeStationsCount} | Неактивных: {inactiveStationsCount}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : isConnecting ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Подключено' : isConnecting ? 'Подключение...' : 'Отключено'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
        <div className="space-y-4 mb-6">
          {/* Поиск и фильтры */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Поиск по названию, ID, адресу..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="relative">
              <Icon name="MapPin" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Фильтр по региону..."
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="pl-9 w-48"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                Все
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('active')}
              >
                Активные
              </Button>
              <Button
                variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('inactive')}
              >
                Неактивные
              </Button>
            </div>

            {(searchQuery || regionFilter || statusFilter !== 'all') && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setRegionFilter('');
                  setStatusFilter('all');
                }}
              >
                <Icon name="X" size={16} className="mr-1" />
                Сбросить
              </Button>
            )}
          </div>
        </div>

        {currentTab === 'map' ? (
          <Card>
            <CardContent className="p-0 relative">
              <div className="h-[calc(100vh-340px)] min-h-[500px]">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Icon name="Loader2" className="animate-spin text-gray-400" size={32} />
                    <span className="ml-3 text-gray-600">Загрузка станций...</span>
                  </div>
                ) : (
                  <Map 
                    stations={filteredStations} 
                    onStationClick={handleStationClick}
                    clustering={clustering}
                    onClusteringChange={setClustering}
                  />
                )}
              </div>
              
              {/* Панель управления картой */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000]">
                <div className="bg-white rounded-lg shadow-lg border px-4 py-2 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Кластеризация:</span>
                    <Button
                      variant={clustering ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setClustering(true)}
                    >
                      Вкл
                    </Button>
                    <Button
                      variant={!clustering ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setClustering(false)}
                    >
                      Выкл
                    </Button>
                  </div>
                  
                  <div className="h-4 w-px bg-gray-300" />
                  
                  <div className="text-sm text-gray-600">
                    Станций на карте: <span className="font-semibold">{filteredStations.filter(s => s.lat && s.lon).length}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Список станций ({filteredStations.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Icon name="Loader2" className="animate-spin text-gray-400" size={32} />
                  <span className="ml-3 text-gray-600">Загрузка станций...</span>
                </div>
              ) : filteredStations.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Icon name="Search" size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>Станции не найдены</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Название</TableHead>
                      <TableHead>Адрес</TableHead>
                      <TableHead>Регион</TableHead>
                      <TableHead>IP адрес</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStations.map((station) => (
                      <TableRow key={station.id}>
                        <TableCell className="font-mono text-sm">
                          {station.station_id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {station.name || '—'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {station.address || '—'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {station.region || '—'}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {station.ip_address || '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge 
                              variant={getStationStatus(station) === 'online' ? 'default' : 'secondary'}
                              className={getStationStatus(station) === 'online' ? 'bg-green-500' : ''}
                            >
                              {getStatusLabel(getStationStatus(station))}
                            </Badge>
                            {station.is_active === 1 && (!station.connectors || station.connectors.length === 0) && (
                              <span className="text-xs text-red-500">Нет данных</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStationClick(station.id)}
                          >
                            <Icon name="ArrowRight" size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}