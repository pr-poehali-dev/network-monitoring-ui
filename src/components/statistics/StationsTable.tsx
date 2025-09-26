import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { StationStats } from './types';
import { getStatusColor, getStatusText } from './utils';

interface StationsTableProps {
  stations: StationStats[];
}

export default function StationsTable({ stations }: StationsTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Станция</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Статус</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Сессии</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Успешность</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Энергия</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Ошибки</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Загрузка</th>
              </tr>
            </thead>
            <tbody>
              {stations.map((station) => (
                <tr key={station.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{station.name}</div>
                      <div className="text-xs text-gray-600">{station.city} • {station.owner}</div>
                      <div className="text-xs text-blue-600">{station.connectedApp}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={`text-xs ${getStatusColor(station.status)}`}>
                      {getStatusText(station.status)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-sm">{station.totalSessions.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">~{station.avgSessionDuration}м сред.</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-sm text-green-600">
                      {((station.successfulSessions / station.totalSessions) * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {station.successfulSessions}/{station.totalSessions}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-sm">{station.totalEnergy.toLocaleString()} кВт⋅ч</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className={`font-medium text-sm ${station.errorsCount > 50 ? 'text-red-600' : station.errorsCount > 30 ? 'text-orange-600' : 'text-gray-600'}`}>
                      {station.errorsCount}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${station.utilization > 80 ? 'bg-red-500' : station.utilization > 60 ? 'bg-orange-500' : 'bg-green-500'}`}
                          style={{ width: `${station.utilization}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{station.utilization}%</span>
                    </div>
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