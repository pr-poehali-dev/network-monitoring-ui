import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import Map from '@/components/Map';
import Layout from '@/components/Layout';

interface ChargingStation {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'maintenance';
  connectors: Connector[];
  totalSessions: number;
  lastActivity: string;
  coordinates: [number, number];
}

interface Connector {
  id: string;
  type: string;
  status: 'available' | 'charging' | 'error' | 'offline';
  power: number;
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
    status: 'online',
    coordinates: [55.7558, 37.6176],
    totalSessions: 145,
    lastActivity: '2 мин назад',
    connectors: [
      { id: 'c1', type: 'Type 2', status: 'charging', power: 22, currentSession: { startTime: '14:30', energy: 12.5, cost: 450 } },
      { id: 'c2', type: 'CCS', status: 'available', power: 50 },
      { id: 'c3', type: 'CHAdeMO', status: 'available', power: 50 }
    ]
  },
  {
    id: '2',
    name: 'ЭЗС Северная',
    location: 'пр. Мира, 45',
    status: 'online',
    coordinates: [55.7665, 37.6177],
    totalSessions: 87,
    lastActivity: '15 мин назад',
    connectors: [
      { id: 'c3', type: 'Type 2', status: 'available', power: 22 },
      { id: 'c4', type: 'CHAdeMO', status: 'available', power: 50 },
      { id: 'c5', type: 'CCS', status: 'charging', power: 150 },
      { id: 'c6', type: 'CCS', status: 'available', power: 150 }
    ]
  },
  {
    id: '3',
    name: 'ЭЗС Южная',
    location: 'ул. Победы, 12',
    status: 'maintenance',
    coordinates: [55.7430, 37.6156],
    totalSessions: 203,
    lastActivity: '1 час назад',
    connectors: [
      { id: 'c5', type: 'Type 2', status: 'error', power: 22 },
      { id: 'c6', type: 'CCS', status: 'offline', power: 150 }
    ]
  }
];

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'online': return 'Онлайн';
    case 'offline': return 'Офлайн';
    case 'maintenance': return 'Обслуживание';
    default: return 'Неизвестно';
  }
};

export default function Index() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentTab = searchParams.get('tab') || 'map';

  const filteredStations = mockStations.filter(station =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.location.toLowerCase().includes(searchQuery.toLowerCase())
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
            <Card className="h-[600px] relative">
              <CardContent className="p-0 h-full">
                <Map 
                  stations={mockStations} 
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
                      <TableHead>Местоположение</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Коннекторы</TableHead>
                      <TableHead>Сессии</TableHead>
                      <TableHead>Активность</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStations.map((station) => (
                      <TableRow key={station.id}>
                        <TableCell className="font-medium">{station.name}</TableCell>
                        <TableCell>{station.location}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={station.status === 'offline' ? 'destructive' : 'default'}
                            className={
                              station.status === 'online' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                              station.status === 'maintenance' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' :
                              ''
                            }
                          >
                            {getStatusLabel(station.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{station.connectors.length}</TableCell>
                        <TableCell>{station.totalSessions}</TableCell>
                        <TableCell className="text-gray-500">{station.lastActivity}</TableCell>
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