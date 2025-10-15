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
  status: 'online' | 'offline' | 'error';
  connectors: Connector[];
  totalSessions: number;
  lastActivity: string;
  coordinates: [number, number];
}

interface Connector {
  id: string;
  type: string;
  status: 'available' | 'charging' | 'occupied' | 'error' | 'offline';
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
    status: 'error',
    coordinates: [55.7430, 37.6156],
    totalSessions: 203,
    lastActivity: '1 час назад',
    connectors: [
      { id: 'c5', type: 'Type 2', status: 'error', power: 22 },
      { id: 'c6', type: 'CCS', status: 'offline', power: 150 }
    ]
  },
  {
    id: '4',
    name: 'ЭЗС Арбат',
    location: 'ул. Арбат, 28',
    status: 'online',
    coordinates: [55.7520, 37.5895],
    totalSessions: 312,
    lastActivity: '5 мин назад',
    connectors: [
      { id: 'c7', type: 'Type 2', status: 'charging', power: 22, currentSession: { startTime: '15:10', energy: 8.3, cost: 290 } },
      { id: 'c8', type: 'CCS', status: 'available', power: 50 }
    ]
  },
  {
    id: '5',
    name: 'ЭЗС Красная Пресня',
    location: 'наб. Пресненская, 2',
    status: 'offline',
    coordinates: [55.7494, 37.5346],
    totalSessions: 67,
    lastActivity: '3 часа назад',
    connectors: [
      { id: 'c9', type: 'Type 2', status: 'offline', power: 22 },
      { id: 'c10', type: 'CCS', status: 'offline', power: 150 }
    ]
  },
  {
    id: '6',
    name: 'ЭЗС Сокольники',
    location: 'ул. Сокольнический Вал, 1',
    status: 'online',
    coordinates: [55.7915, 37.6713],
    totalSessions: 198,
    lastActivity: '1 мин назад',
    connectors: [
      { id: 'c11', type: 'Type 2', status: 'charging', power: 22, currentSession: { startTime: '14:50', energy: 15.2, cost: 532 } },
      { id: 'c12', type: 'CHAdeMO', status: 'available', power: 50 },
      { id: 'c13', type: 'CCS', status: 'available', power: 150 }
    ]
  },
  {
    id: '7',
    name: 'ЭЗС Таганка',
    location: 'ул. Таганская, 17',
    status: 'error',
    coordinates: [55.7403, 37.6533],
    totalSessions: 156,
    lastActivity: '25 мин назад',
    connectors: [
      { id: 'c14', type: 'Type 2', status: 'error', power: 22 },
      { id: 'c15', type: 'CCS', status: 'error', power: 50 }
    ]
  },
  {
    id: '8',
    name: 'ЭЗС Парк Горького',
    location: 'ул. Крымский Вал, 9',
    status: 'online',
    coordinates: [55.7308, 37.6014],
    totalSessions: 278,
    lastActivity: '10 мин назад',
    connectors: [
      { id: 'c16', type: 'Type 2', status: 'available', power: 22 },
      { id: 'c17', type: 'CCS', status: 'charging', power: 50, currentSession: { startTime: '15:25', energy: 5.8, cost: 203 } }
    ]
  },
  {
    id: '9',
    name: 'ЭЗС Лубянка',
    location: 'пл. Лубянская, 2',
    status: 'online',
    coordinates: [55.7594, 37.6279],
    totalSessions: 421,
    lastActivity: '3 мин назад',
    connectors: [
      { id: 'c18', type: 'Type 2', status: 'charging', power: 22, currentSession: { startTime: '15:30', energy: 3.5, cost: 123 } },
      { id: 'c19', type: 'CCS', status: 'available', power: 150 },
      { id: 'c20', type: 'CHAdeMO', status: 'available', power: 50 }
    ]
  },
  {
    id: '10',
    name: 'ЭЗС Кремль',
    location: 'Манежная пл., 1',
    status: 'offline',
    coordinates: [55.7525, 37.6173],
    totalSessions: 89,
    lastActivity: '5 часов назад',
    connectors: [
      { id: 'c21', type: 'Type 2', status: 'offline', power: 22 }
    ]
  },
  {
    id: '11',
    name: 'ЭЗС Тверская',
    location: 'ул. Тверская, 12',
    status: 'online',
    coordinates: [55.7628, 37.6066],
    totalSessions: 267,
    lastActivity: '7 мин назад',
    connectors: [
      { id: 'c22', type: 'Type 2', status: 'available', power: 22 },
      { id: 'c23', type: 'CCS', status: 'charging', power: 50, currentSession: { startTime: '15:20', energy: 6.7, cost: 235 } }
    ]
  },
  {
    id: '12',
    name: 'ЭЗС Останкино',
    location: 'ул. Академика Королёва, 15',
    status: 'error',
    coordinates: [55.8202, 37.6114],
    totalSessions: 134,
    lastActivity: '45 мин назад',
    connectors: [
      { id: 'c24', type: 'Type 2', status: 'error', power: 22 },
      { id: 'c25', type: 'CCS', status: 'offline', power: 150 }
    ]
  },
  {
    id: '13',
    name: 'ЭЗС Воробьёвы Горы',
    location: 'Университетская пл., 1',
    status: 'online',
    coordinates: [55.7031, 37.5443],
    totalSessions: 345,
    lastActivity: '2 мин назад',
    connectors: [
      { id: 'c26', type: 'Type 2', status: 'charging', power: 22, currentSession: { startTime: '14:45', energy: 18.2, cost: 637 } },
      { id: 'c27', type: 'CCS', status: 'available', power: 150 },
      { id: 'c28', type: 'CHAdeMO', status: 'available', power: 50 }
    ]
  },
  {
    id: '14',
    name: 'ЭЗС Китай-Город',
    location: 'Солянский пр., 5',
    status: 'online',
    coordinates: [55.7567, 37.6345],
    totalSessions: 189,
    lastActivity: '12 мин назад',
    connectors: [
      { id: 'c29', type: 'Type 2', status: 'available', power: 22 },
      { id: 'c30', type: 'CCS', status: 'available', power: 50 }
    ]
  },
  {
    id: '15',
    name: 'ЭЗС Измайлово',
    location: 'ш. Энтузиастов, 56',
    status: 'offline',
    coordinates: [55.7882, 37.7487],
    totalSessions: 92,
    lastActivity: '2 часа назад',
    connectors: [
      { id: 'c31', type: 'Type 2', status: 'offline', power: 22 },
      { id: 'c32', type: 'CCS', status: 'offline', power: 150 }
    ]
  }
];

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'online': return 'Онлайн';
    case 'offline': return 'Офлайн';
    case 'error': return 'Ошибка';
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
          <Map 
            stations={mockStations} 
            onStationClick={handleStationClick}
          />
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
                              station.status === 'error' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
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