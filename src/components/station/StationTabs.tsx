import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StationStatus from './StationStatus';
import StationActions from './StationActions';
import TransactionsTab from './TransactionsTab';
import ErrorsTab from './ErrorsTab';
import LogsTab from './LogsTab';
import TransactionDetailModal from './TransactionDetailModal';
import SimpleTabContent from './SimpleTabContent';
import AvailabilityTab from './AvailabilityTab';
import StatisticsTab from './StatisticsTab';
import InputMeterTab from './InputMeterTab';
import RectifiersTab from './RectifiersTab';

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
  isStationOnline?: boolean;
  stationData?: any;
}

export default function StationTabs({ station, mockLogs, activeTab, onTabChange, onAction, isStationOnline = true, stationData }: StationTabsProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);

  const handleTransactionClick = (transactionId: string) => {
    setSelectedTransaction(transactionId);
  };

  const handleModalClose = () => {
    setSelectedTransaction(null);
  };

  return (
    <>
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="mb-6 inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-full overflow-x-auto">
          <TabsTrigger value="management" className="whitespace-nowrap">Панель управления</TabsTrigger>
          <TabsTrigger value="transactions" className="whitespace-nowrap">Транзакции</TabsTrigger>
          <TabsTrigger value="settings" className="whitespace-nowrap">Настройки</TabsTrigger>
          <TabsTrigger value="errors" className="whitespace-nowrap">Ошибки</TabsTrigger>
          <TabsTrigger value="logs" className="whitespace-nowrap">Логи</TabsTrigger>
          <TabsTrigger value="stats" className="whitespace-nowrap">Статистика</TabsTrigger>
          <TabsTrigger value="availability" className="whitespace-nowrap">Доступность</TabsTrigger>
          <TabsTrigger value="input-meter" className="whitespace-nowrap">Прибор учета</TabsTrigger>
          <TabsTrigger value="rectifiers" className="whitespace-nowrap">Выпрямители</TabsTrigger>
        </TabsList>

        <TabsContent value="management" className="space-y-6">
          <StationStatus station={station} isStationOnline={isStationOnline} stationData={stationData} />
          <StationActions onAction={onAction} isStationOnline={isStationOnline} />
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionsTab serialNumber={station.serialNumber} onTransactionClick={handleTransactionClick} />
        </TabsContent>

        <TabsContent value="settings">
          <SimpleTabContent 
            title="Настройки станции" 
            content="Настройки станции будут отображаться здесь" 
          />
        </TabsContent>

        <TabsContent value="errors">
          <ErrorsTab />
        </TabsContent>

        <TabsContent value="logs">
          <LogsTab logs={mockLogs} />
        </TabsContent>

        <TabsContent value="stats">
          <StatisticsTab />
        </TabsContent>

        <TabsContent value="availability">
          <AvailabilityTab serialNumber={station.serialNumber} />
        </TabsContent>

        <TabsContent value="input-meter">
          <InputMeterTab />
        </TabsContent>

        <TabsContent value="rectifiers">
          <RectifiersTab />
        </TabsContent>
      </Tabs>

      {selectedTransaction && (
        <TransactionDetailModal 
          transaction={null}
          isOpen={true}
          onClose={handleModalClose}
        />
      )}
    </>
  );
}