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

const getStatusLabel = (is_active: number) => {
  return is_active === 1 ? 'Активна' : 'Неактивна';
};

export default function Index() {
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredStations = stations.filter(station =>
    (station.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
    station.station_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (station.address?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

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

      {(wsError || error) && (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <Icon name="AlertCircle" className="text-red-600 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm font-medium text-red-800">Ошибка подключения</p>
              <p className="text-sm text-red-600 mt-1">{wsError || error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant={currentTab === 'map' ? 'default' : 'outline'}
            onClick={() => navigate('/?tab=map')}
            className="flex items-center gap-2"
          >
            <Icon name="Map" size={18} />
            Карта
          </Button>
          <Button
            variant={currentTab === 'list' ? 'default' : 'outline'}
            onClick={() => navigate('/?tab=list')}
            className="flex items-center gap-2"
          >
            <Icon name="List" size={18} />
            Список
          </Button>
          <div className="ml-auto w-80">
            <Input
              placeholder="Поиск по названию, ID, адресу..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {currentTab === 'map' ? (
          <Card>
            <CardContent className="p-0">
              <div className="h-[calc(100vh-280px)] min-h-[500px]">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Icon name="Loader2" className="animate-spin text-gray-400" size={32} />
                    <span className="ml-3 text-gray-600">Загрузка станций...</span>
                  </div>
                ) : (
                  <Map 
                    stations={filteredStations} 
                    onStationClick={handleStationClick}
                  />
                )}
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
                          <Badge 
                            variant={station.is_active === 1 ? 'default' : 'secondary'}
                            className={station.is_active === 1 ? 'bg-green-500' : ''}
                          >
                            {getStatusLabel(station.is_active)}
                          </Badge>
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
