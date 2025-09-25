import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

      <TabsContent value="errors">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="AlertTriangle" size={20} className="text-red-500" />
              Ошибки станции
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-xs">КРИТИЧНАЯ</Badge>
                  <span className="text-sm font-medium">Коннектор 1 недоступен</span>
                </div>
                <span className="text-xs text-gray-500">2ч 15м назад</span>
              </div>
              <p className="text-sm text-gray-700">Ошибка связи с коннектором. Код: E001</p>
            </div>
            
            <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded-r-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200 text-xs">ВНИМАНИЕ</Badge>
                  <span className="text-sm font-medium">Высокая температура</span>
                </div>
                <span className="text-xs text-gray-500">45м назад</span>
              </div>
              <p className="text-sm text-gray-700">Температура превышает норму на 5°C</p>
            </div>

            <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 text-xs">УВЕДОМЛЕНИЕ</Badge>
                  <span className="text-sm font-medium">Требуется техобслуживание</span>
                </div>
                <span className="text-xs text-gray-500">1д 3ч назад</span>
              </div>
              <p className="text-sm text-gray-700">Плановое ТО через 2 дня</p>
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
    </Tabs>
  );
}