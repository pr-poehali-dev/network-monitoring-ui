import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useStationErrors } from '@/hooks/useWebSocket';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ErrorsTabProps {
  serialNumber?: string;
}

const errorSourceLabels: Record<string, string> = {
  sig1: 'EmergencyBtn',
  sig2: 'DoorsOpen',
  sig3: 'WaterAlarm',
  sig4: 'ShockSensor',
  sig5: 'FireAlarm',
  sig6: 'UnderVoltage',
  sig7: 'PLCCommError',
  signal: 'Сигнал',
  rectifier: 'Выпрямитель',
  ocpp: 'OCPP',
  connector: 'Коннектор'
};

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}ч ${minutes}м`;
  }
  return `${minutes}м`;
}

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

export default function ErrorsTab({ serialNumber }: ErrorsTabProps) {
  const { errors, loading, error, loadErrors } = useStationErrors(serialNumber);
  const [periodFilter, setPeriodFilter] = useState('week');

  useEffect(() => {
    if (!serialNumber) return;

    let from: string | undefined;
    let to: string | undefined;
    const now = new Date();
    
    switch (periodFilter) {
      case 'today':
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        to = now.toISOString();
        break;
      case 'week':
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        to = now.toISOString();
        break;
      case 'month':
        from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        to = now.toISOString();
        break;
      case 'all':
        from = undefined;
        to = undefined;
        break;
    }
    
    loadErrors(from, to, 200, true, false);
  }, [serialNumber, periodFilter, loadErrors]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center gap-3 text-gray-500">
            <Icon name="Loader2" className="h-6 w-6 animate-spin" />
            <span>Загрузка ошибок...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-3 text-red-500">
            <Icon name="AlertCircle" className="h-6 w-6" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentErrors = errors?.current || [];
  const historyErrors = errors?.history || [];
  const hasActiveErrors = currentErrors.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">
            Активные ошибки: <span className="text-red-600">{currentErrors.length}</span>
          </h3>
          {errors?.station?.errorInfo && (
            <Badge variant="destructive" className="text-xs">
              {errors.station.errorInfo}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Период:</span>
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Сегодня</SelectItem>
              <SelectItem value="week">Последние 7 дней</SelectItem>
              <SelectItem value="month">Текущий месяц</SelectItem>
              <SelectItem value="all">За все время</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveErrors && (
        <Card className="border-red-200 bg-red-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Icon name="AlertTriangle" size={20} />
              Текущие ошибки
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-red-100/50">
                  <tr className="border-b border-red-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Код</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm min-w-[200px]">Название</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Источник</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Длительность</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Время начала</th>
                  </tr>
                </thead>
                <tbody>
                  {currentErrors.map((err: any, index: number) => (
                    <tr key={index} className="border-b border-red-100 hover:bg-red-50">
                      <td className="py-3 px-4">
                        <code className="text-xs font-mono bg-red-100 text-red-800 px-2 py-1 rounded">
                          {err.code}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900 text-sm">
                          {err.name || errorSourceLabels[err.code] || err.code}
                        </div>
                        {err.details && (
                          <div className="text-xs text-gray-600 mt-1">{err.details}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs">
                          {errorSourceLabels[err.source] || err.source}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium text-red-600">
                          {formatDuration(err.durationSec || 0)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs text-gray-500">
                          {formatDateTime(err.since)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {historyErrors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="History" size={20} className="text-gray-500" />
              История ошибок
              <Badge variant="secondary" className="ml-2 text-xs">
                {historyErrors.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Код</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm min-w-[200px]">Название</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Источник</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Длительность</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Начало</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Конец</th>
                  </tr>
                </thead>
                <tbody>
                  {historyErrors.map((err: any, index: number) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <code className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {err.code}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900 text-sm">
                          {err.name || errorSourceLabels[err.code] || err.code}
                        </div>
                        {err.details && (
                          <div className="text-xs text-gray-600 mt-1">{err.details}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs">
                          {errorSourceLabels[err.source] || err.source}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium text-gray-600">
                          {formatDuration(err.durationSec || 0)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs text-gray-500">
                          {formatDateTime(err.startedAt)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs text-gray-500">
                          {formatDateTime(err.endedAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {!hasActiveErrors && historyErrors.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
              <Icon name="CheckCircle" className="h-12 w-12" />
              <div className="text-center">
                <div className="font-medium text-lg">Нет ошибок</div>
                <div className="text-sm">Станция работает без ошибок за выбранный период</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
