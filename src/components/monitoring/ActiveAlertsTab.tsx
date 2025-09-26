import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Alert } from './types';
import { getSeverityColor, getSeverityText, getSeverityBg } from './utils';

interface ActiveAlertsTabProps {
  alerts: Alert[];
}

export default function ActiveAlertsTab({ alerts }: ActiveAlertsTabProps) {
  const navigate = useNavigate();

  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Icon name="CheckCircle" size={48} className="text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Активных ошибок не найдено</h3>
            <p className="text-gray-500">Все системы работают нормально</p>
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
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Приоритет</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm min-w-[300px]">Ошибка</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Станция</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Длительность</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Время начала</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr 
                  key={alert.id} 
                  className={`border-b border-l-4 ${getSeverityBg(alert.severity)} hover:bg-gray-50/50 cursor-pointer`}
                  onClick={() => navigate(`/station/${alert.stationId}`)}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {alert.severity === 'critical' ? (
                        <Icon name="AlertTriangle" size={14} className="text-red-500" />
                      ) : alert.severity === 'warning' ? (
                        <Icon name="AlertCircle" size={14} className="text-orange-500" />
                      ) : (
                        <Icon name="Info" size={14} className="text-blue-500" />
                      )}
                      <Badge variant={getSeverityColor(alert.severity)} className="text-xs">
                        {getSeverityText(alert.severity)}
                      </Badge>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900 text-sm mb-1">{alert.message}</div>
                      <div className="text-xs text-gray-600">{alert.description}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-900">{alert.station}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium text-red-600">{alert.duration}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-xs text-gray-500">{alert.startTime}</div>
                  </td>
                  <td className="py-3 px-4">
                    <Icon name="ChevronRight" size={16} className="text-gray-400" />
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