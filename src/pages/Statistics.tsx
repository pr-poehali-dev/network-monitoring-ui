import { useState } from 'react';
import Layout from '@/components/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface StationStats {
  id: string;
  name: string;
  city: string;
  owner: string;
  connectedApp: string;
  totalSessions: number;
  successfulSessions: number;
  totalEnergy: number; // kWh
  totalRevenue: number; // рубли
  errorsCount: number;
  avgSessionDuration: number; // минуты
  status: 'online' | 'offline' | 'maintenance';
  lastUpdate: string;
  utilization: number; // процент загруженности
}

interface GlobalStats {
  totalStations: number;
  totalSessions: number;
  successfulSessions: number;
  totalEnergy: number;
  totalRevenue: number;
  avgSuccessRate: number;
  totalErrors: number;
  activeStations: number;
  offlineStations: number;
  maintenanceStations: number;
  avgUtilization: number;
}

const mockStationsStats: StationStats[] = [
  {
    id: '1',
    name: 'ЭЗС Центральная',
    city: 'Москва',
    owner: 'ЭнергоТранс',
    connectedApp: 'ChargePoint',
    totalSessions: 1247,
    successfulSessions: 1189,
    totalEnergy: 15843.2,
    totalRevenue: 475296,
    errorsCount: 58,
    avgSessionDuration: 45,
    status: 'online',
    lastUpdate: '25.09.2025 16:15:00',
    utilization: 78
  },
  {
    id: '2',
    name: 'ЭЗС Торговый центр',
    city: 'Москва',
    owner: 'ЭнергоТранс',
    connectedApp: 'Tesla Supercharger',
    totalSessions: 892,
    successfulSessions: 856,
    totalEnergy: 11567.8,
    totalRevenue: 347034,
    errorsCount: 36,
    avgSessionDuration: 38,
    status: 'online',
    lastUpdate: '25.09.2025 16:12:00',
    utilization: 65
  },
  {
    id: '3',
    name: 'ЭЗС Парковая',
    city: 'Санкт-Петербург',
    owner: 'Северная Энергия',
    connectedApp: 'EV.Network',
    totalSessions: 1456,
    successfulSessions: 1398,
    totalEnergy: 18923.4,
    totalRevenue: 567702,
    errorsCount: 58,
    avgSessionDuration: 52,
    status: 'offline',
    lastUpdate: '25.09.2025 10:30:00',
    utilization: 0
  },
  {
    id: '4',
    name: 'ЭЗС Промышленная',
    city: 'Санкт-Петербург',
    owner: 'Северная Энергия',
    connectedApp: 'ChargePoint',
    totalSessions: 2134,
    successfulSessions: 2089,
    totalEnergy: 26784.6,
    totalRevenue: 803538,
    errorsCount: 45,
    avgSessionDuration: 48,
    status: 'online',
    lastUpdate: '25.09.2025 16:18:00',
    utilization: 92
  },
  {
    id: '5',
    name: 'ЭЗС Аэропорт',
    city: 'Екатеринбург',
    owner: 'УралЭнерго',
    connectedApp: 'Ionity',
    totalSessions: 756,
    successfulSessions: 723,
    totalEnergy: 9876.3,
    totalRevenue: 296289,
    errorsCount: 33,
    avgSessionDuration: 41,
    status: 'maintenance',
    lastUpdate: '24.09.2025 14:00:00',
    utilization: 0
  },
  {
    id: '6',
    name: 'ЭЗС Вокзал',
    city: 'Екатеринбург',
    owner: 'УралЭнерго',
    connectedApp: 'EV.Network',
    totalSessions: 1098,
    successfulSessions: 1034,
    totalEnergy: 13452.7,
    totalRevenue: 403581,
    errorsCount: 64,
    avgSessionDuration: 47,
    status: 'online',
    lastUpdate: '25.09.2025 16:20:00',
    utilization: 71
  }
];

const calculateGlobalStats = (stations: StationStats[]): GlobalStats => {
  const totalSessions = stations.reduce((sum, s) => sum + s.totalSessions, 0);
  const successfulSessions = stations.reduce((sum, s) => sum + s.successfulSessions, 0);
  const totalEnergy = stations.reduce((sum, s) => sum + s.totalEnergy, 0);
  const totalRevenue = stations.reduce((sum, s) => sum + s.totalRevenue, 0);
  const totalErrors = stations.reduce((sum, s) => sum + s.errorsCount, 0);
  const avgUtilization = stations.reduce((sum, s) => sum + s.utilization, 0) / stations.length;
  
  return {
    totalStations: stations.length,
    totalSessions,
    successfulSessions,
    totalEnergy,
    totalRevenue,
    avgSuccessRate: totalSessions > 0 ? (successfulSessions / totalSessions) * 100 : 0,
    totalErrors,
    activeStations: stations.filter(s => s.status === 'online').length,
    offlineStations: stations.filter(s => s.status === 'offline').length,
    maintenanceStations: stations.filter(s => s.status === 'maintenance').length,
    avgUtilization: Math.round(avgUtilization)
  };
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online': return 'text-green-600 bg-green-50';
    case 'offline': return 'text-red-600 bg-red-50';
    case 'maintenance': return 'text-yellow-600 bg-yellow-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'online': return 'Онлайн';
    case 'offline': return 'Оффлайн';
    case 'maintenance': return 'Обслуживание';
    default: return 'Неизвестно';
  }
};

export default function Statistics() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterCity, setFilterCity] = useState('all');
  const [filterOwner, setFilterOwner] = useState('all');
  const [filterApp, setFilterApp] = useState('all');

  const globalStats = calculateGlobalStats(mockStationsStats);

  // Фильтрация и сортировка
  const filteredStations = mockStationsStats.filter(station => {
    const matchesSearch = station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         station.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         station.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = filterCity === 'all' || station.city === filterCity;
    const matchesOwner = filterOwner === 'all' || station.owner === filterOwner;
    const matchesApp = filterApp === 'all' || station.connectedApp === filterApp;
    
    return matchesSearch && matchesCity && matchesOwner && matchesApp;
  });

  // Сортировка
  filteredStations.sort((a, b) => {
    switch (sortBy) {
      case 'sessions':
        return b.totalSessions - a.totalSessions;
      case 'energy':
        return b.totalEnergy - a.totalEnergy;
      case 'revenue':
        return b.totalRevenue - a.totalRevenue;
      case 'errors':
        return b.errorsCount - a.errorsCount;
      case 'utilization':
        return b.utilization - a.utilization;
      case 'city':
        return a.city.localeCompare(b.city);
      case 'owner':
        return a.owner.localeCompare(b.owner);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const cities = [...new Set(mockStationsStats.map(s => s.city))];
  const owners = [...new Set(mockStationsStats.map(s => s.owner))];
  const apps = [...new Set(mockStationsStats.map(s => s.connectedApp))];

  return (
    <Layout>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Icon name="BarChart3" size={24} className="text-blue-500" />
              <h1 className="text-xl font-semibold">Статистика станций</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Icon name="Download" size={16} className="mr-2" />
                Экспорт отчета
              </Button>
              <Button variant="outline" size="sm">
                <Icon name="RefreshCw" size={16} className="mr-2" />
                Обновить
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Глобальная статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего сессий</CardTitle>
              <Icon name="Activity" className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{globalStats.totalSessions.toLocaleString()}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Успешные: {globalStats.successfulSessions.toLocaleString()}
                </div>
                <span>({globalStats.avgSuccessRate.toFixed(1)}%)</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Передано энергии</CardTitle>
              <Icon name="Zap" className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{globalStats.totalEnergy.toLocaleString()} кВт⋅ч</div>
              <p className="text-xs text-muted-foreground">
                ≈ {Math.round(globalStats.totalEnergy / 30)} дней работы дома
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Общий доход</CardTitle>
              <Icon name="DollarSign" className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{globalStats.totalRevenue.toLocaleString()} ₽</div>
              <p className="text-xs text-muted-foreground">
                Средний доход на станцию: {Math.round(globalStats.totalRevenue / globalStats.totalStations).toLocaleString()} ₽
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Статус станций</CardTitle>
              <Icon name="Server" className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{globalStats.activeStations}</div>
                  <div className="text-xs text-gray-500">Активные</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">{globalStats.offlineStations}</div>
                  <div className="text-xs text-gray-500">Оффлайн</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-600">{globalStats.maintenanceStations}</div>
                  <div className="text-xs text-gray-500">ТО</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="table" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="table">Таблица</TabsTrigger>
              <TabsTrigger value="charts">Графики</TabsTrigger>
            </TabsList>
            
            {/* Фильтры и поиск */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Поиск станций..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Сортировка" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">По названию</SelectItem>
                  <SelectItem value="sessions">По сессиям</SelectItem>
                  <SelectItem value="energy">По энергии</SelectItem>
                  <SelectItem value="revenue">По доходу</SelectItem>
                  <SelectItem value="errors">По ошибкам</SelectItem>
                  <SelectItem value="utilization">По загрузке</SelectItem>
                  <SelectItem value="city">По городу</SelectItem>
                  <SelectItem value="owner">По собственнику</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Дополнительные фильтры */}
          <div className="flex items-center gap-4">
            <Select value={filterCity} onValueChange={setFilterCity}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Все города" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все города</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterOwner} onValueChange={setFilterOwner}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Все собственники" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все собственники</SelectItem>
                {owners.map(owner => (
                  <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterApp} onValueChange={setFilterApp}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Все приложения" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все приложения</SelectItem>
                {apps.map(app => (
                  <SelectItem key={app} value={app}>{app}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(filterCity !== 'all' || filterOwner !== 'all' || filterApp !== 'all') && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setFilterCity('all');
                  setFilterOwner('all');
                  setFilterApp('all');
                }}
              >
                <Icon name="X" size={16} className="mr-1" />
                Сбросить
              </Button>
            )}
          </div>

          <TabsContent value="table">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Станция</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Статус</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Сессии</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Успешность</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Энергия</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Доход</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Ошибки</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Загрузка</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStations.map((station) => (
                        <tr key={station.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-gray-900 text-sm">{station.name}</div>
                              <div className="text-xs text-gray-600">{station.city} • {station.owner}</div>
                              <div className="text-xs text-blue-600">{station.connectedApp}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={`text-xs ${getStatusColor(station.status)}`}>
                              {getStatusText(station.status)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-sm">{station.totalSessions.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">~{station.avgSessionDuration}м сред.</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-sm text-green-600">
                              {((station.successfulSessions / station.totalSessions) * 100).toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-500">
                              {station.successfulSessions}/{station.totalSessions}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-sm">{station.totalEnergy.toLocaleString()} кВт⋅ч</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-sm">{station.totalRevenue.toLocaleString()} ₽</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className={`font-medium text-sm ${station.errorsCount > 50 ? 'text-red-600' : station.errorsCount > 30 ? 'text-orange-600' : 'text-gray-600'}`}>
                              {station.errorsCount}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${station.utilization > 80 ? 'bg-red-500' : station.utilization > 60 ? 'bg-orange-500' : 'bg-green-500'}`}
                                  style={{ width: `${station.utilization}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{station.utilization}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Распределение по городам</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cities.map(city => {
                      const cityStations = filteredStations.filter(s => s.city === city);
                      const percentage = (cityStations.length / filteredStations.length) * 100;
                      return (
                        <div key={city} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-medium">{city}</div>
                            <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[100px]">
                              <div 
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">{cityStations.length} ({percentage.toFixed(1)}%)</div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Распределение по собственникам</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {owners.map(owner => {
                      const ownerStations = filteredStations.filter(s => s.owner === owner);
                      const percentage = (ownerStations.length / filteredStations.length) * 100;
                      return (
                        <div key={owner} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-medium">{owner}</div>
                            <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[100px]">
                              <div 
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">{ownerStations.length} ({percentage.toFixed(1)}%)</div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Подключенные приложения</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {apps.map(app => {
                      const appStations = filteredStations.filter(s => s.connectedApp === app);
                      const percentage = (appStations.length / filteredStations.length) * 100;
                      return (
                        <div key={app} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-medium">{app}</div>
                            <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[100px]">
                              <div 
                                className="bg-purple-500 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">{appStations.length} ({percentage.toFixed(1)}%)</div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Топ по доходности</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredStations
                      .slice()
                      .sort((a, b) => b.totalRevenue - a.totalRevenue)
                      .slice(0, 5)
                      .map((station, index) => (
                        <div key={station.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="text-sm font-medium">{station.name}</div>
                              <div className="text-xs text-gray-500">{station.city}</div>
                            </div>
                          </div>
                          <div className="text-sm font-medium text-green-600">
                            {station.totalRevenue.toLocaleString()} ₽
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}