import { useState } from 'react';
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
      <MonitoringHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SearchAndFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

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