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

interface Transaction {
  id: string;
  connector: number;
  energy: number;
  duration: string;
  status: string;
  startTime: string;
  endTime: string;
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
  
  const mockTransactions: Transaction[] = [
    { id: 'TXN001234', connector: 1, energy: 45.2, duration: '2ч 15м', status: 'Успешно завершена', startTime: '25.09.2025 14:30', endTime: '25.09.2025 16:45' },
    { id: 'TXN001235', connector: 2, energy: 12.8, duration: '45м', status: 'Прервана пользователем', startTime: '25.09.2025 12:00', endTime: '25.09.2025 12:45' },
    { id: 'TXN001236', connector: 1, energy: 78.5, duration: '3ч 20м', status: 'Автоматически', startTime: '24.09.2025 18:15', endTime: '24.09.2025 21:35' },
    { id: 'TXN001237', connector: 3, energy: 25.1, duration: '1ч 10м', status: 'Ошибка связи', startTime: '24.09.2025 09:30', endTime: '24.09.2025 10:40' },
    { id: 'TXN001238', connector: 2, energy: 92.7, duration: '4ч 5м', status: 'Успешно завершена', startTime: '23.09.2025 15:45', endTime: '23.09.2025 19:50' }
  ];

  const getTransactionById = (id: string): Transaction | null => {
    return mockTransactions.find(t => t.id === id) || null;
  };

  const handleTransactionClick = (transactionId: string) => {
    setSelectedTransaction(transactionId);
  };

  const handleModalClose = () => {
    setSelectedTransaction(null);
  };

  const selectedTransactionData = selectedTransaction ? getTransactionById(selectedTransaction) : null;

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
          <StationStatus station={station} />
          <StationActions onAction={onAction} />
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionsTab transactions={mockTransactions} onTransactionClick={handleTransactionClick} />
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
          <AvailabilityTab />
        </TabsContent>

        <TabsContent value="input-meter">
          <InputMeterTab />
        </TabsContent>

        <TabsContent value="rectifiers">
          <RectifiersTab />
        </TabsContent>
      </Tabs>

      <TransactionDetailModal 
        transaction={selectedTransactionData}
        isOpen={!!selectedTransaction}
        onClose={handleModalClose}
      />
    </>
  );
}