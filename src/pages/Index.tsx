import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

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
    name: 'ЭЗС Торговый центр',
    location: 'ТЦ Метрополис',
    status: 'available',
    coordinates: [55.7387, 37.6032],
    totalSessions: 89,
    lastActivity: '15 мин назад',
    connectors: [
      { id: 'c3', type: 'Type 2', status: 'available', power: '22 кВт' },
      { id: 'c4', type: 'CHAdeMO', status: 'available', power: '50 кВт' }
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
    connectors: [
      { id: 'c5', type: 'Type 2', status: 'error', power: '22 кВт' },
      { id: 'c6', type: 'CCS', status: 'error', power: '50 кВт' }
    ]
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'available': return 'bg-station-available';
    case 'charging': return 'bg-station-charging';
    case 'error': return 'bg-station-error';
    case 'offline': return 'bg-station-offline';
    default: return 'bg-gray-400';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'available': return 'Доступна';
    case 'charging': return 'Зарядка';
    case 'error': return 'Ошибка';
    case 'offline': return 'Офлайн';
    default: return 'Неизвестно';
  }
};

export default function Index() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStations = mockStations.filter(station =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Icon name="Zap" className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Система мониторинга ЭЗС
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Онлайн: 2
              </Badge>
              <Badge variant="outline" className="gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Ошибки: 1
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="map" className="space-y-6">
          <TabsList>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Icon name="Map" size={16} />
              Карта
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Icon name="List" size={16} />
              Список станций
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-4">
            {/* Map Placeholder */}
            <Card className="h-[600px] relative">
              <CardContent className="p-0 h-full">
                <div className="h-full bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="grid grid-cols-12 gap-1 h-full">
                      {Array.from({ length: 144 }).map((_, i) => (
                        <div key={i} className="bg-blue-200 opacity-30"></div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Station Markers */}
                  <Link to="/station/1" className="absolute top-20 left-32">
                    <div className={`w-4 h-4 ${getStatusColor('charging')} rounded-full animate-pulse cursor-pointer hover:scale-110 transition-transform`}>
                    </div>
                    <div className="text-xs mt-1 font-medium hover:text-blue-600">ЭЗС Центральная</div>
                  </Link>
                  
                  <Link to="/station/2" className="absolute bottom-32 right-40">
                    <div className={`w-4 h-4 ${getStatusColor('available')} rounded-full cursor-pointer hover:scale-110 transition-transform`}>
                    </div>
                    <div className="text-xs mt-1 font-medium hover:text-blue-600">ЭЗС ТЦ</div>
                  </Link>
                  
                  <Link to="/station/3" className="absolute top-40 right-20">
                    <div className={`w-4 h-4 ${getStatusColor('error')} rounded-full cursor-pointer hover:scale-110 transition-transform`}>
                    </div>
                    <div className="text-xs mt-1 font-medium hover:text-blue-600">ЭЗС Парковая</div>
                  </Link>

                  <div className="text-center">
                    <Icon name="MapPin" size={48} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-lg mb-2">Интерактивная карта OpenStreetMap</p>
                    <p className="text-gray-400 text-sm">Кликните на маркеры для подробной информации</p>
                  </div>
                </div>
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
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
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
                            variant={station.status === 'error' ? 'destructive' : 'default'}
                            className={
                              station.status === 'available' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                              station.status === 'charging' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' :
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
                            <Button
                              variant="outline"
                              size="sm"
                            >
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
          </TabsContent>
        </Tabs>
      </div>


    </div>
  );
}