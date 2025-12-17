import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SystemMonitoring from '@/components/admin/SystemMonitoring';
import StationsManager from '@/components/admin/StationsManager';
import UnknownStations from '@/components/admin/UnknownStations';
import Icon from '@/components/ui/icon';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('monitoring');

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Icon name="Shield" size={32} className="text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">Панель администратора</h1>
          </div>
          <p className="text-gray-600">Управление системой и станциями</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-6">
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Icon name="Activity" size={18} />
              Мониторинг системы
            </TabsTrigger>
            <TabsTrigger value="stations" className="flex items-center gap-2">
              <Icon name="Radio" size={18} />
              Управление станциями
            </TabsTrigger>
            <TabsTrigger value="unknown" className="flex items-center gap-2">
              <Icon name="AlertCircle" size={18} />
              Неизвестные станции
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monitoring">
            <SystemMonitoring />
          </TabsContent>

          <TabsContent value="stations">
            <StationsManager />
          </TabsContent>

          <TabsContent value="unknown">
            <UnknownStations />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}