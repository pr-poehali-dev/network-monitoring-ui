import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MonitoringHeader from '@/components/monitoring/MonitoringHeader';
import SearchAndFilters from '@/components/monitoring/SearchAndFilters';
import CriticalNotificationsTab from '@/components/monitoring/CriticalNotificationsTab';
import ActiveAlertsTab from '@/components/monitoring/ActiveAlertsTab';
import HistoryAlertsTab from '@/components/monitoring/HistoryAlertsTab';
import { mockActiveAlerts, mockCriticalNotifications, mockHistoryAlerts } from '@/components/monitoring/mockData';
import { useMonitoring } from '@/hooks/useMonitoring';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function Monitoring() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const navigate = useNavigate();
  
  // Используем WebSocket данные
  const { monitoringData, stations, loading, error, refresh } = useMonitoring();

  // Используем данные из WebSocket или mock данные
  const alerts = monitoringData?.alerts || [];
  const recentActivity = monitoringData?.recentActivity || [];
  
  // Преобразуем WebSocket данные в формат для компонентов
  const wsActiveAlerts = alerts.filter(a => a.type !== 'maintenance').map(alert => ({
    id: alert.id,
    station: alert.stationName,
    type: alert.type as 'error' | 'warning',
    message: alert.message,
    time: new Date(alert.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    acknowledged: false
  }));
  
  const wsNotifications = alerts.filter(a => a.priority === 'high').map(alert => ({
    id: alert.id,
    station: alert.stationName,
    issue: alert.message,
    severity: 'critical' as const,
    time: new Date(alert.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    timeAgo: `${Math.floor((Date.now() - new Date(alert.timestamp).getTime()) / 60000)} мин назад`
  }));

  // Используем WebSocket данные если есть, иначе mock
  const activeAlerts = wsActiveAlerts.length > 0 ? wsActiveAlerts : mockActiveAlerts;
  const criticalNotifications = wsNotifications.length > 0 ? wsNotifications : mockCriticalNotifications;
  const historyAlerts = mockHistoryAlerts; // История пока из mock
  
  const filteredActiveAlerts = activeAlerts.filter(alert =>
    alert.station.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredHistoryAlerts = historyAlerts.filter(alert =>
    alert.station.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNotifications = criticalNotifications.filter(notification =>
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
      <MonitoringHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Показываем статистику из WebSocket */}
        {monitoringData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{monitoringData.summary.totalStations}</div>
                <p className="text-xs text-muted-foreground">Всего станций</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">{monitoringData.summary.activeStations}</div>
                <p className="text-xs text-muted-foreground">Активных</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-600">{monitoringData.summary.errorStations}</div>
                <p className="text-xs text-muted-foreground">С ошибками</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">{monitoringData.summary.totalPower} кВт</div>
                <p className="text-xs text-muted-foreground">Общая мощность</p>
              </CardContent>
            </Card>
          </div>
        )}

        {loading && (
          <Card className="mb-4 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-blue-600">
                <Icon name="Loader2" className="animate-spin" size={16} />
                <span className="text-sm">Загружаем данные мониторинга...</span>
              </div>
            </CardContent>
          </Card>
        )}

        <SearchAndFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="notifications" className="relative">
              Требуют действий
              <Badge variant="destructive" className="ml-2 text-xs animate-pulse">
                {filteredNotifications.length}
              </Badge>
              {filteredNotifications.length > 0 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
              )}
            </TabsTrigger>
            <TabsTrigger value="active">
              Активные ошибки 
              <Badge variant="destructive" className="ml-2 text-xs">
                {filteredActiveAlerts.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="history">История ошибок</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications">
            <CriticalNotificationsTab 
              notifications={filteredNotifications}
              onTakeAction={handleTakeAction}
              onDismiss={handleDismissNotification}
            />
          </TabsContent>

          <TabsContent value="active">
            <ActiveAlertsTab alerts={filteredActiveAlerts} />
          </TabsContent>

          <TabsContent value="history">
            <HistoryAlertsTab alerts={filteredHistoryAlerts} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}