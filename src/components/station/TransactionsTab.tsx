import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Transaction {
  id: string;
  connector: number;
  energy: number;
  duration: string;
  status: string;
  startTime: string;
  endTime: string;
}

interface TransactionsTabProps {
  transactions: Transaction[];
  onTransactionClick: (transactionId: string) => void;
}

export default function TransactionsTab({ transactions, onTransactionClick }: TransactionsTabProps) {
  return (
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
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b hover:bg-gray-50/50 cursor-pointer"
                    onClick={() => onTransactionClick(transaction.id)}>
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
  );
}