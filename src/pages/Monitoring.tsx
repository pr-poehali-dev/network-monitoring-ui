import { useState } from 'react';
import Layout from '@/components/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  station: string;
  stationId: string;
  message: string;
  description: string;
  startTime: string;
  duration: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

const mockActiveAlerts: Alert[] = [
  {
    id: '1',
    severity: 'critical',
    station: 'ЭЗС Центральная',
    stationId: '1',
    message: 'Коннектор 1 недоступен',
    description: 'Нет связи с зарядным контроллером',
    startTime: '25.09.2025 13:45:00',
    duration: '2ч 15м',
    status: 'active'
  },
  {
    id: '2',
    severity: 'critical',
    station: 'ЭЗС Парковая',
    stationId: '3',
    message: 'Станция недоступна',
    description: 'Потеря связи с OCPP сервером',
    startTime: '25.09.2025 10:30:00',
    duration: '5ч 30м',
    status: 'active'
  },
  {
    id: '3',
    severity: 'warning',
    station: 'ЭЗС Торговый центр',
    stationId: '2',
    message: 'Высокая температура коннектора',
    description: 'Температура превысила 65°C, требуется охлаждение',
    startTime: '25.09.2025 15:15:00',
    duration: '45м',
    status: 'active'
  },
  {
    id: '4',
    severity: 'warning',
    station: 'ЭЗС Центральная',
    stationId: '1',
    message: 'Низкий заряд резервного источника',
    description: 'Уровень заряда UPS составляет 15%',
    startTime: '25.09.2025 14:20:00',
    duration: '1ч 40м',
    status: 'acknowledged'
  },
  {
    id: '5',
    severity: 'info',
    station: 'ЭЗС Промышленная',
    stationId: '4',
    message: 'Плановое обслуживание',
    description: 'Запланировано обновление прошивки в 18:00',
    startTime: '24.09.2025 09:00:00',
    duration: '1д 7ч',
    status: 'active'
  }
];

const mockHistoryAlerts: Alert[] = [
  {
    id: '101',
    severity: 'critical',
    station: 'ЭЗС Центральная',
    stationId: '1',
    message: 'Аварийное отключение',
    description: 'Превышение максимального тока',
    startTime: '24.09.2025 18:30:00',
    duration: '2ч 15м',
    status: 'resolved'
  },
  {
    id: '102',
    severity: 'warning',
    station: 'ЭЗС Торговый центр',
    stationId: '2',
    message: 'Высокое напряжение',
    description: 'Напряжение превышает норму на 3%',
    startTime: '23.09.2025 16:45:00',
    duration: '1ч 30м',
    status: 'resolved'
  }
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'destructive';
    case 'warning': return 'outline';
    case 'info': return 'outline';
    default: return 'outline';
  }
};

const getSeverityText = (severity: string) => {
  switch (severity) {
    case 'critical': return 'КРИТИЧНАЯ';
    case 'warning': return 'ВНИМАНИЕ';
    case 'info': return 'УВЕДОМЛЕНИЕ';
    default: return 'НЕИЗВЕСТНО';
  }
};

const getSeverityBg = (severity: string) => {
  switch (severity) {
    case 'critical': return 'border-l-red-500 bg-red-50';
    case 'warning': return 'border-l-orange-500 bg-orange-50';
    case 'info': return 'border-l-blue-500 bg-blue-50';
    default: return 'border-l-gray-500 bg-gray-50';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'text-red-600';
    case 'acknowledged': return 'text-yellow-600';
    case 'resolved': return 'text-green-600';
    default: return 'text-gray-600';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return 'Активна';
    case 'acknowledged': return 'Подтверждена';
    case 'resolved': return 'Решена';
    default: return 'Неизвестно';
  }
};

export default function Monitoring() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('active');

  const filteredActiveAlerts = mockActiveAlerts.filter(alert =>
    alert.station.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredHistoryAlerts = mockHistoryAlerts.filter(alert =>
    alert.station.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAcknowledge = (alertId: string) => {
    console.log('Подтвердить ошибку:', alertId);
  };

  const handleResolve = (alertId: string) => {
    console.log('Решить ошибку:', alertId);
  };

  return (
    <Layout>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Icon name="AlertTriangle" size={24} className="text-red-500" />
              <h1 className="text-xl font-semibold">Мониторинг ошибок</h1>
            </div>
            
            {/* Summary Stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium">Критичные: 2</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium">Внимание: 5</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">Уведомления: 12</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filters */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Поиск по станции или ошибке..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Icon name="Filter" size={16} className="mr-2" />
              Фильтры
            </Button>
            <Button variant="outline" size="sm">
              <Icon name="Download" size={16} className="mr-2" />
              Экспорт
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="active">
              Активные ошибки 
              <Badge variant="destructive" className="ml-2 text-xs">
                {mockActiveAlerts.filter(a => a.status === 'active').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="history">История ошибок</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {filteredActiveAlerts.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Icon name="CheckCircle" size={48} className="text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Активных ошибок не найдено</h3>
                    <p className="text-gray-500">Все системы работают нормально</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Приоритет</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm min-w-[300px]">Ошибка</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Статус</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Станция</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Длительность</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Время начала</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredActiveAlerts.map((alert) => (
                          <tr key={alert.id} className={`border-b border-l-4 ${getSeverityBg(alert.severity)} hover:bg-gray-50/50`}>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                {alert.severity === 'critical' ? (
                                  <Icon name="AlertTriangle" size={14} className="text-red-500" />
                                ) : alert.severity === 'warning' ? (
                                  <Icon name="AlertCircle" size={14} className="text-orange-500" />
                                ) : (
                                  <Icon name="Info" size={14} className="text-blue-500" />
                                )}
                                <Badge variant={getSeverityColor(alert.severity)} className="text-xs">
                                  {getSeverityText(alert.severity)}
                                </Badge>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium text-gray-900 text-sm mb-1">{alert.message}</div>
                                <div className="text-xs text-gray-600">{alert.description}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                alert.status === 'active' ? 'bg-red-100 text-red-700' :
                                alert.status === 'acknowledged' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {getStatusText(alert.status)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm text-gray-900">{alert.station}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm font-medium text-red-600">{alert.duration}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-xs text-gray-500">{alert.startTime}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history">
            {filteredHistoryAlerts.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Icon name="History" size={48} className="text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">История пуста</h3>
                    <p className="text-gray-500">Решенные ошибки будут отображаться здесь</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Статус</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm min-w-[300px]">Ошибка</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Станция</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Длительность</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Время начала</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Решена</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredHistoryAlerts.map((alert) => (
                          <tr key={alert.id} className="border-b border-l-4 border-l-green-500 bg-green-50/30 hover:bg-green-50/50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Icon name="CheckCircle" size={14} className="text-green-500" />
                                <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-200">
                                  РЕШЕНА
                                </Badge>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium text-gray-700 text-sm mb-1">{alert.message}</div>
                                <div className="text-xs text-gray-600">{alert.description}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm text-gray-700">{alert.station}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm text-gray-600">{alert.duration}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-xs text-gray-500">{alert.startTime}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-xs text-green-600 font-medium">Вчера, 14:30</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}