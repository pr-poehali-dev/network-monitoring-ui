import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import StationStatus from './StationStatus';
import StationActions from './StationActions';

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

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'request' | 'response' | 'error' | 'info';
  message: string;
}

interface StationTabsProps {
  station: ChargingStation;
  mockLogs: LogEntry[];
  activeTab: string;
  onTabChange: (value: string) => void;
  onAction: (action: string) => void;
}

export default function StationTabs({ station, mockLogs, activeTab, onTabChange, onAction }: StationTabsProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  
  const mockTransactions = [
    { id: 'TXN001234', connector: 1, energy: 45.2, duration: '2ч 15м', status: 'Успешно завершена', startTime: '25.09.2025 14:30', endTime: '25.09.2025 16:45' },
    { id: 'TXN001235', connector: 2, energy: 12.8, duration: '45м', status: 'Прервана пользователем', startTime: '25.09.2025 12:00', endTime: '25.09.2025 12:45' },
    { id: 'TXN001236', connector: 1, energy: 78.5, duration: '3ч 20м', status: 'Автоматически', startTime: '24.09.2025 18:15', endTime: '24.09.2025 21:35' },
    { id: 'TXN001237', connector: 3, energy: 25.1, duration: '1ч 10м', status: 'Ошибка связи', startTime: '24.09.2025 09:30', endTime: '24.09.2025 10:40' },
    { id: 'TXN001238', connector: 2, energy: 92.7, duration: '4ч 5м', status: 'Успешно завершена', startTime: '23.09.2025 15:45', endTime: '23.09.2025 19:50' }
  ];

  const getTransactionById = (id: string) => mockTransactions.find(t => t.id === id);

  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="mb-6">
        <TabsTrigger value="management">Панель управления</TabsTrigger>
        <TabsTrigger value="transactions">Транзакции</TabsTrigger>
        <TabsTrigger value="settings">Настройки</TabsTrigger>
        <TabsTrigger value="errors">Ошибки</TabsTrigger>
        <TabsTrigger value="logs">Логи</TabsTrigger>
        <TabsTrigger value="stats">Статистика</TabsTrigger>
        <TabsTrigger value="availability">Доступность</TabsTrigger>
      </TabsList>

      <TabsContent value="management" className="space-y-6">
        <StationStatus station={station} />
        <StationActions onAction={onAction} />
      </TabsContent>

      <TabsContent value="transactions">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="CreditCard" size={20} />
              История транзакций
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">ID транзакции</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Коннектор</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Энергия</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Длительность</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Причина завершения</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Время начала</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Время завершения</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50/50 cursor-pointer"
                        onClick={() => setSelectedTransaction(transaction.id)}>
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm text-blue-600">#{transaction.id}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Icon name="Zap" size={14} className="text-green-500" />
                          <span className="text-sm">Коннектор {transaction.connector}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-green-600">{transaction.energy} кВт⋅ч</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{transaction.duration}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          transaction.status.includes('Успешно') || transaction.status === 'Автоматически' ? 'bg-green-100 text-green-700' :
                          transaction.status.includes('Прервана') ? 'bg-red-100 text-red-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs text-gray-500">{transaction.startTime}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs text-gray-500">{transaction.endTime}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

      <TabsContent value="errors">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="AlertTriangle" size={20} className="text-red-500" />
              Ошибки станции
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Приоритет</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm min-w-[300px]">Ошибка</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Коннектор</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Длительность</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Время начала</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-l-4 border-l-red-500 bg-red-50/30 hover:bg-red-50/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Icon name="AlertTriangle" size={14} className="text-red-500" />
                        <Badge variant="destructive" className="text-xs">
                          КРИТИЧНАЯ
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900 text-sm mb-1">Коннектор 1 недоступен</div>
                        <div className="text-xs text-gray-600">Нет связи с зарядным контроллером</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Icon name="Zap" size={12} className="text-gray-400" />
                        <span className="text-sm text-gray-900">Коннектор 1</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-red-600">2ч 15м</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs text-gray-500">25.09.2025 13:45:00</div>
                    </td>
                  </tr>
                  <tr className="border-b border-l-4 border-l-orange-500 bg-orange-50/30 hover:bg-orange-50/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Icon name="AlertCircle" size={14} className="text-orange-500" />
                        <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-200">
                          ВНИМАНИЕ
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900 text-sm mb-1">Высокая температура коннектора</div>
                        <div className="text-xs text-gray-600">Температура превысила 65°C, требуется охлаждение</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Icon name="Zap" size={12} className="text-gray-400" />
                        <span className="text-sm text-gray-900">Коннектор 2</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-orange-600">45м</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs text-gray-500">25.09.2025 15:15:00</div>
                    </td>
                  </tr>
                  <tr className="border-b border-l-4 border-l-orange-500 bg-orange-50/30 hover:bg-orange-50/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Icon name="AlertCircle" size={14} className="text-orange-500" />
                        <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-200">
                          ВНИМАНИЕ
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900 text-sm mb-1">Низкий заряд резервного источника</div>
                        <div className="text-xs text-gray-600">Уровень заряда UPS составляет 15%</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Icon name="Battery" size={12} className="text-gray-400" />
                        <span className="text-sm text-gray-900">UPS модуль</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-orange-600">1ч 40м</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs text-gray-500">25.09.2025 14:20:00</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="logs">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="FileText" size={20} />
              Логи по дням
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Button variant="default" size="sm">Сегодня</Button>
                <Button variant="outline" size="sm">Вчера</Button>
                <Button variant="outline" size="sm">2 дня назад</Button>
                <Button variant="outline" size="sm">3 дня назад</Button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
                {mockLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 py-2 border-b border-gray-200 last:border-0">
                    <span className="text-xs text-gray-500 w-24 flex-shrink-0">{log.timestamp.split(' ')[0]}</span>
                    <div className="flex items-center gap-2 flex-1">
                      {log.type === 'request' ? (
                        <Icon name="ArrowRight" size={14} className="text-blue-500" />
                      ) : log.type === 'response' ? (
                        <Icon name="ArrowLeft" size={14} className="text-green-500" />
                      ) : (
                        <Icon name="AlertCircle" size={14} className="text-red-500" />
                      )}
                      <span className="text-sm">{log.message.split('\n')[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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

      {/* Модальное окно детальной информации о транзакции */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Icon name="CreditCard" size={24} className="text-blue-500" />
              Детали транзакции #{selectedTransaction}
            </DialogTitle>
          </DialogHeader>
          
          {selectedTransaction && (() => {
            const transaction = getTransactionById(selectedTransaction);
            if (!transaction) return null;
            
            return (
              <div className="space-y-6">
                {/* Основная информация */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Icon name="Zap" size={14} />
                        Коннектор
                      </div>
                      <div className="text-lg font-semibold">Коннектор {transaction.connector}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Icon name="Battery" size={14} />
                        Энергия
                      </div>
                      <div className="text-lg font-semibold text-green-600">{transaction.energy} кВт⋅ч</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Icon name="Clock" size={14} />
                        Длительность
                      </div>
                      <div className="text-lg font-semibold">{transaction.duration}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Icon name="CheckCircle" size={14} />
                        Статус
                      </div>
                      <div className={`text-sm px-2 py-1 rounded-full font-medium ${
                        transaction.status.includes('Успешно') || transaction.status === 'Автоматически' ? 'bg-green-100 text-green-700' :
                        transaction.status.includes('Прервана') ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {transaction.status}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Временные метки */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Временная линия</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Время начала</div>
                        <div className="font-medium">{transaction.startTime}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Время завершения</div>
                        <div className="font-medium">{transaction.endTime}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Графики */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* График мощности */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Icon name="Zap" size={16} className="text-blue-500" />
                        Мощность (кВт)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <Icon name="TrendingUp" size={32} className="mx-auto mb-2" />
                          <p className="text-sm">График мощности</p>
                          <p className="text-xs">Пиковая мощность: 22.5 кВт</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* График энергии */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Icon name="Battery" size={16} className="text-green-500" />
                        Переданная энергия (кВт⋅ч)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <Icon name="BarChart3" size={32} className="mx-auto mb-2" />
                          <p className="text-sm">Накопительный график энергии</p>
                          <p className="text-xs">Итого: {transaction.energy} кВт⋅ч</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* График тока */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Icon name="Activity" size={16} className="text-orange-500" />
                        Ток (А)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <Icon name="LineChart" size={32} className="mx-auto mb-2" />
                          <p className="text-sm">График тока</p>
                          <p className="text-xs">Максимальный ток: 32 А</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* График напряжения */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Icon name="Gauge" size={16} className="text-purple-500" />
                        Напряжение (В)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <Icon name="LineChart" size={32} className="mx-auto mb-2" />
                          <p className="text-sm">График напряжения</p>
                          <p className="text-xs">Среднее напряжение: 400 В</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* График SOC батареи */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Icon name="BatteryCharging" size={16} className="text-blue-600" />
                        Заряд АКБ (SOC, %)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <Icon name="TrendingUp" size={32} className="mx-auto mb-2" />
                          <p className="text-sm">График заряда батареи</p>
                          <p className="text-xs">Начальный SOC: 20% → Конечный SOC: 85%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Кнопка закрытия */}
                <div className="flex justify-end pt-4 border-t">
                  <Button variant="outline" onClick={() => setSelectedTransaction(null)}>
                    Закрыть
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}