import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
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
    case 'available': return 'Online';
    case 'charging': return 'Зарядка';
    case 'error': return 'Ошибка';
    case 'offline': return 'Офлайн';
    default: return 'Неизвестно';
  }
};

const getConnectorIcon = (type: string) => {
  switch (type) {
    case 'CCS Combo 2':
    case 'CCS':
      return 'Zap';
    case 'CHAdeMO':
      return 'Battery';
    case 'Type 2':
      return 'Plug';
    case 'GB/T DC':
      return 'Power';
    default:
      return 'Plug';
  }
};

export default function Station() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('management');
  
  const station = mockStations.find(s => s.id === id);
  
  if (!station) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Станция не найдена</h1>
          <p className="text-gray-500 mb-4">Станция с ID {id} не существует</p>
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
              <Icon name="ArrowLeft" size={20} />
              <span>Назад к списку</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Station Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Icon name="MapPin" size={20} className="text-gray-400" />
            <h1 className="text-2xl font-bold">{station.name}</h1>
          </div>
          <p className="text-gray-500">{station.location}</p>
        </div>

        {/* Двухколоночный лэйаут */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Основной контент (левая колонка) */}
          <div className="xl:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="management">Панель управления</TabsTrigger>
                <TabsTrigger value="transactions">Транзакции</TabsTrigger>
                <TabsTrigger value="settings">Настройки</TabsTrigger>
                <TabsTrigger value="tariff">Тариф</TabsTrigger>
                <TabsTrigger value="ocpp">OCPP</TabsTrigger>
                <TabsTrigger value="stats">Статистика</TabsTrigger>
                <TabsTrigger value="availability">Доступность</TabsTrigger>
              </TabsList>

              <TabsContent value="management" className="space-y-6">
                {/* Station Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Зарядная станция
                      <Badge 
                        variant={station.status === 'error' ? 'destructive' : 'default'}
                        className={
                          station.status === 'available' ? 'bg-green-100 text-green-800' :
                          station.status === 'charging' ? 'bg-orange-100 text-orange-800' :
                          ''
                        }
                      >
                        {getStatusLabel(station.status)}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Icon name="BatteryCharging" size={32} className="text-green-600" />
                      <div>
                        <p className="font-medium">Available</p>
                        <p className="text-sm text-gray-500">Available</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Connectors */}
                <Card>
                  <CardHeader>
                    <CardTitle>Коннекторы</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {station.connectors.map((connector, index) => (
                      <div key={connector.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-green-800">{index + 1}</span>
                            </div>
                            <Icon name={getConnectorIcon(connector.type)} size={24} className="text-green-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">Available</span>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Available
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">{connector.type} • {connector.power} • DC</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="default" size="sm">
                            СТАРТ
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Icon name="MoreVertical" size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Действия</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Перезагрузка</p>
                        <p className="text-sm text-gray-500">Отправить команду Reset</p>
                      </div>
                      <Button onClick={() => handleAction('reset')}>
                        ПЕРЕЗАГРУЗКА
                      </Button>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Очистка кэша</p>
                        <p className="text-sm text-gray-500">Отправить команду ClearCache</p>
                      </div>
                      <Button onClick={() => handleAction('clearCache')}>
                        ОЧИСТИТЬ КЭШ
                      </Button>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Запрос сообщения</p>
                        <p className="text-sm text-gray-500">Отправить команду TriggerMessage</p>
                      </div>
                      <Button onClick={() => handleAction('triggerMessage')}>
                        ОТПРАВИТЬ
                      </Button>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Комментарий</p>
                        <p className="text-sm text-gray-500">Редактировать операционную информацию</p>
                      </div>
                      <Button onClick={() => handleAction('editComment')}>
                        РЕДАКТИРОВАТЬ
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Station Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Информация</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Производитель</span>
                      <span className="font-medium">{station.manufacturer}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-gray-500">Серийный номер</span>
                      <span className="font-medium">{station.serialNumber}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-gray-500">OCPP идентификатор</span>
                      <span className="font-medium text-sm">{station.ocppId}</span>
                    </div>
                  </CardContent>
                </Card>


              </TabsContent>

              <TabsContent value="transactions">
                <Card>
                  <CardHeader>
                    <CardTitle>История транзакций</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">История транзакций будет отображаться здесь</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Настройки станции</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">Настройки станции будут отображаться здесь</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tariff">
                <Card>
                  <CardHeader>
                    <CardTitle>Тарифная сетка</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">Тарифы будут отображаться здесь</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ocpp">
                <Card>
                  <CardHeader>
                    <CardTitle>OCPP протокол</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">OCPP информация будет отображаться здесь</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="stats">
                <Card>
                  <CardHeader>
                    <CardTitle>Статистика использования</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">Статистика будет отображаться здесь</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="availability">
                <Card>
                  <CardHeader>
                    <CardTitle>Доступность станции</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">График доступности будет отображаться здесь</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Правая колонка - Логи */}
          <div className="xl:col-span-1 flex flex-col">
            <div className="flex items-center gap-2 mb-4 px-1">
              <Icon name="FileText" size={20} />
              <h3 className="text-lg font-semibold">OCPP Логи</h3>
            </div>
            
            <div className="flex-1 bg-white border rounded-lg overflow-hidden">
              <div className="h-full overflow-y-auto">
                <div className="p-4 font-mono text-sm space-y-3">
                  {mockLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className="flex items-start justify-between gap-4 py-2 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex-shrink-0">
                          {log.type === 'request' ? (
                            <Icon name="ArrowRight" size={16} className="text-blue-500 mt-0.5" />
                          ) : log.type === 'response' ? (
                            <Icon name="ArrowLeft" size={16} className="text-green-500 mt-0.5" />
                          ) : (
                            <Icon name="AlertCircle" size={16} className="text-red-500 mt-0.5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm">
                            {log.message.split('\n')[0]}
                          </div>
                          {log.message.includes('\n') && (
                            <pre className="text-xs text-gray-600 mt-1 whitespace-pre-wrap font-mono">
                              {log.message.split('\n').slice(1).join('\n')}
                            </pre>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-xs text-gray-500 text-right">
                        <div>{log.timestamp.split(' ')[0]}</div>
                        <div>{log.timestamp.split(' ')[1]}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}