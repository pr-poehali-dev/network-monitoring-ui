import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Alert } from './types';

interface HistoryAlertsTabProps {
  alerts: Alert[];
}

export default function HistoryAlertsTab({ alerts }: HistoryAlertsTabProps) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Icon name="History" size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">История пуста</h3>
            <p className="text-gray-500">Решенные ошибки будут отображаться здесь</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
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
              {alerts.map((alert) => (
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
  );
}