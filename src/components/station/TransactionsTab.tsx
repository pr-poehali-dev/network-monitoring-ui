import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Transaction } from '@/types/websocket';
import { useTransactions } from '@/hooks/useWebSocket';

interface TransactionsTabProps {
  serialNumber: string;
  onTransactionClick?: (transaction: Transaction) => void;
}

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}ч ${minutes}м`;
  }
  return `${minutes}м`;
}



export default function TransactionsTab({ serialNumber, onTransactionClick }: TransactionsTabProps) {
  const { transactions, loading, error, loadTransactions } = useTransactions(serialNumber);
  const [period, setPeriod] = useState<'24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    const now = new Date();
    let from: Date;
    
    switch (period) {
      case '24h':
        from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }
    
    loadTransactions(from.toISOString(), now.toISOString(), 100);
  }, [period, loadTransactions]);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Icon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Ошибка загрузки транзакций: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="CreditCard" size={20} />
            История транзакций
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={period === '24h' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('24h')}
            >
              24 часа
            </Button>
            <Button
              variant={period === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('7d')}
            >
              7 дней
            </Button>
            <Button
              variant={period === '30d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('30d')}
            >
              30 дней
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 text-center">
            <Icon name="Loader2" size={32} className="text-blue-500 mx-auto mb-2 animate-spin" />
            <p className="text-gray-500">Загрузка транзакций...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-6 text-center">
            <Icon name="Inbox" size={48} className="text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Нет транзакций за выбранный период</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Коннектор</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Энергия</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Длительность</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Статус</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Причина</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Время начала/завершения</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, idx) => (
                  <tr
                    key={`${transaction.transactionId}-${idx}`}
                    className="border-b hover:bg-gray-50/50 cursor-pointer"
                    onClick={() => onTransactionClick?.(transaction)}
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-blue-600">#{transaction.transactionId}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Icon name="Zap" size={14} className="text-green-500" />
                        <span className="text-sm">Коннектор {transaction.connectorId}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-green-600">
                        {transaction.energyKwh.toFixed(1)} кВт⋅ч
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">{formatDuration(transaction.durationSec)}</span>
                    </td>
                    <td className="py-3 px-4">
                      {transaction.isActive ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1 w-fit">
                          <Icon name="Loader2" size={12} className="animate-spin" />
                          В процессе
                        </span>
                      ) : (
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            transaction.success
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {transaction.success ? 'Успешно' : 'Неуспешно'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-gray-600">{transaction.reason}</span>
                    </td>
                    <td className="py-3 px-4">
                      {transaction.isActive && transaction.startTime ? (
                        <div className="text-xs">
                          <div className="text-blue-600 font-medium">Начало: {formatDateTime(transaction.startTime)}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">{formatDateTime(transaction.time)}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}