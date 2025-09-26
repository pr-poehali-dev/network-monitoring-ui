import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

interface CriticalNotification {
  id: string;
  station: string;
  stationId: string;
  issue: string;
  description: string;
  actionNeeded: string;
  urgency: 'immediate' | 'urgent' | 'high';
  occuredAt: string;
  repeatCount?: number;
  lastAttempt?: string;
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

const mockCriticalNotifications: CriticalNotification[] = [
  {
    id: 'n1',
    station: 'ЭЗС Центральная',
    stationId: '1',
    issue: 'Три неудачные попытки запуска зарядки',
    description: 'Пользователь не может начать зарядку. Коннектор блокируется после каждой попытки.',
    actionNeeded: 'Подключиться к станции и проверить состояние коннектора',
    urgency: 'immediate',
    occuredAt: '25.09.2025 15:45:00',
    repeatCount: 3,
    lastAttempt: '25.09.2025 15:47:00'
  },
  {
    id: 'n2',
    station: 'ЭЗС Парковая',
    stationId: '3',
    issue: 'Превышение температуры контроллера',
    description: 'Температура достигла 85°C. Система охлаждения не справляется.',
    actionNeeded: 'Немедленно проверить систему охлаждения и вентиляцию',
    urgency: 'immediate',
    occuredAt: '25.09.2025 15:30:00'
  },
  {
    id: 'n3',
    station: 'ЭЗС Торговый центр',
    stationId: '2',
    issue: 'Протечка охлаждающей жидкости',
    description: 'Датчики влажности зафиксировали протечку в отсеке контроллера.',
    actionNeeded: 'Отключить станцию и проверить систему охлаждения',
    urgency: 'urgent',
    occuredAt: '25.09.2025 14:15:00'
  },
  {
    id: 'n4',
    station: 'ЭЗС Промышленная',
    stationId: '4',
    issue: 'Неисправность контактора',
    description: 'Контактор не размыкается после завершения зарядки.',
    actionNeeded: 'Проверить и заменить контактор, обесточить станцию',
    urgency: 'urgent',
    occuredAt: '25.09.2025 13:20:00'
  },
  {
    id: 'n5',
    station: 'ЭЗС Центральная',
    stationId: '1',
    issue: 'Частые сбросы соединения RFID',
    description: 'Считыватель карт работает нестабильно, 5 сбросов за час.',
    actionNeeded: 'Проверить антенну RFID и кабельные соединения',
    urgency: 'high',
    occuredAt: '25.09.2025 12:30:00',
    repeatCount: 5
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

const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case 'immediate': return 'bg-red-100 border-red-500 text-red-800';
    case 'urgent': return 'bg-orange-100 border-orange-500 text-orange-800';
    case 'high': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
    default: return 'bg-gray-100 border-gray-500 text-gray-800';
  }
};

const getUrgencyText = (urgency: string) => {
  switch (urgency) {
    case 'immediate': return 'НЕМЕДЛЕННО';
    case 'urgent': return 'СРОЧНО';
    case 'high': return 'ВАЖНО';
    default: return 'ОБЫЧНО';
  }
};

const getUrgencyIcon = (urgency: string) => {
  switch (urgency) {
    case 'immediate': return 'Zap';
    case 'urgent': return 'AlertTriangle';
    case 'high': return 'AlertCircle';
    default: return 'Info';
  }
};

export default function Monitoring() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const navigate = useNavigate();

  const filteredActiveAlerts = mockActiveAlerts.filter(alert =>
    alert.station.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredHistoryAlerts = mockHistoryAlerts.filter(alert =>
    alert.station.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNotifications = mockCriticalNotifications.filter(notification =>
    notification.station.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.issue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTakeAction = (notificationId: string, stationId: string) => {
    console.log('Подключиться к станции:', stationId);
    navigate(`/station/${stationId}`);
  };

  const handleDismissNotification = (notificationId: string) => {
    console.log('Отклонить уведомление:', notificationId);
  };

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
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Требуют действий: {mockCriticalNotifications.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium">Критичные: 2</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium">Внимание: 5</span>
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
            <TabsTrigger value="notifications" className="relative">
              Требуют действий
              <Badge variant="destructive" className="ml-2 text-xs animate-pulse">
                {mockCriticalNotifications.length}
              </Badge>
              {mockCriticalNotifications.length > 0 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
              )}
            </TabsTrigger>
            <TabsTrigger value="active">
              Активные ошибки 
              <Badge variant="destructive" className="ml-2 text-xs">
                {mockActiveAlerts.filter(a => a.status === 'active').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="history">История ошибок</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Icon name="CheckCircle" size={48} className="text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Критичных уведомлений нет</h3>
                    <p className="text-gray-500">Все станции работают в штатном режиме</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <Card key={notification.id} className={`border-l-4 ${getUrgencyColor(notification.urgency).includes('red') ? 'border-l-red-500' : notification.urgency === 'urgent' ? 'border-l-orange-500' : 'border-l-yellow-500'}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${getUrgencyColor(notification.urgency)}`}>
                            <Icon name={getUrgencyIcon(notification.urgency)} size={20} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-lg">{notification.issue}</CardTitle>
                              <Badge className={`text-xs ${getUrgencyColor(notification.urgency)} border`}>
                                {getUrgencyText(notification.urgency)}
                              </Badge>
                              {notification.repeatCount && (
                                <Badge variant="outline" className="text-xs">
                                  {notification.repeatCount}x
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              <Icon name="MapPin" size={14} className="inline mr-1" />
                              {notification.station}
                            </div>
                            <p className="text-sm text-gray-700 mb-3">{notification.description}</p>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                              <div className="flex items-start gap-2">
                                <Icon name="Lightbulb" size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium text-blue-800 mb-1">Необходимые действия:</p>
                                  <p className="text-sm text-blue-700">{notification.actionNeeded}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Icon name="Clock" size={12} />
                                Возникло: {notification.occuredAt}
                              </div>
                              {notification.lastAttempt && (
                                <div className="flex items-center gap-1">
                                  <Icon name="RotateCcw" size={12} />
                                  Последняя попытка: {notification.lastAttempt}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-end gap-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDismissNotification(notification.id)}
                        >
                          Отклонить
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleTakeAction(notification.id, notification.stationId)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Icon name="ExternalLink" size={16} className="mr-2" />
                          Подключиться к станции
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

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
                          <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Станция</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Длительность</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Время начала</th>
                          <th className="w-8"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredActiveAlerts.map((alert) => (
                          <tr key={alert.id} className={`border-b border-l-4 ${getSeverityBg(alert.severity)} hover:bg-gray-50/50 cursor-pointer`}
                              onClick={() => navigate(`/station/${alert.stationId}`)}>
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
                              <div className="text-sm text-gray-900">{alert.station}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm font-medium text-red-600">{alert.duration}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-xs text-gray-500">{alert.startTime}</div>
                            </td>
                            <td className="py-3 px-4">
                              <Icon name="ChevronRight" size={16} className="text-gray-400" />
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