import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { wsService } from '@/services/websocket';

interface StatisticsTabProps {
  serialNumber: string;
}

interface ConnectorStats {
  connectorId: string;
  connectorType: number;
  totalSessions: number;
  successfulSessions: number;
  failedSessions: number;
  successRatePct: number;
  failureRatePct: number;
  energyKwhTotal: number;
  avgSessionDurationSec: number;
  lastSessionEnd: string;
  shareOfStationSessionsPct: number;
}

interface StatisticsData {
  summary: {
    serialNumber: string;
    from: string;
    to: string;
    totalSessions: number;
    successfulSessions: number;
    failedSessions: number;
    successRatePct: number;
    failureRatePct: number;
    energyKwhTotal: number;
    avgSessionDurationSec: number;
    avgEnergyPerSessionKwh: number;
    activeConnectors: number;
  };
  connectors: ConnectorStats[];
}

const CONNECTOR_TYPE_NAMES: { [key: number]: string } = {
  1: 'Type 2',
  2: 'CCS',
  3: 'CHAdeMO',
  4: 'Type 1',
};

const PRESET_RANGES = [
  { label: 'Последние 7 дней', days: 7 },
  { label: 'Последние 30 дней', days: 30 },
  { label: 'Последние 90 дней', days: 90 },
  { label: 'Последний год', days: 365 },
];

export default function StatisticsTab({ serialNumber }: StatisticsTabProps) {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState(365);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  useEffect(() => {
    loadStatistics();
  }, [serialNumber, selectedRange]);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const to = new Date().toISOString();
      const from = new Date(Date.now() - selectedRange * 24 * 60 * 60 * 1000).toISOString();
      
      const data = await wsService.getStationStatistics(serialNumber, from, to);
      setStatistics(data);
    } catch (err) {
      console.error('Error loading statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomRange = async () => {
    if (!customFrom || !customTo) return;
    
    setLoading(true);
    try {
      const from = new Date(customFrom).toISOString();
      const to = new Date(customTo).toISOString();
      
      const data = await wsService.getStationStatistics(serialNumber, from, to);
      setStatistics(data);
      setSelectedRange(0);
    } catch (err) {
      console.error('Error loading custom statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatEnergy = (kwh: number): string => {
    if (kwh >= 1000) {
      return `${(kwh / 1000).toFixed(2)} МВт·ч`;
    }
    return `${kwh.toFixed(2)} кВт·ч`;
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}ч ${minutes}м`;
    }
    if (minutes > 0) {
      return `${minutes}м ${secs}с`;
    }
    return `${secs}с`;
  };

  const formatDateTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-gray-500">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              Загрузка статистики...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!statistics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="BarChart3" size={20} />
            Статистика станции
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12">
          <div className="text-center space-y-3">
            <Icon name="AlertCircle" size={48} className="mx-auto text-gray-400" />
            <p className="text-gray-500">Не удалось загрузить статистику</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { summary, connectors } = statistics;

  const hasData = summary.totalSessions > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Calendar" size={20} />
            Период статистики
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {PRESET_RANGES.map((range) => (
                <Button
                  key={range.days}
                  variant={selectedRange === range.days ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedRange(range.days)}
                >
                  {range.label}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">От</label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">До</label>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <Button 
                onClick={loadCustomRange}
                disabled={!customFrom || !customTo}
                className="flex items-center gap-2"
              >
                <Icon name="Search" size={16} />
                Применить
              </Button>
            </div>

            <div className="text-xs text-gray-500">
              Текущий период: {formatDateTime(summary.from)} — {formatDateTime(summary.to)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="BarChart3" size={20} />
            Общая статистика станции
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasData ? (
            <div className="py-12 text-center space-y-3">
              <Icon name="DatabaseZap" size={48} className="mx-auto text-gray-400" />
              <p className="text-gray-600 font-medium">Нет данных за выбранный период</p>
              <p className="text-sm text-gray-500">
                За период с {formatDateTime(summary.from)} по {formatDateTime(summary.to)} не зафиксировано транзакций
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <Icon name="Zap" size={18} />
                <span className="text-sm font-medium">Всего зарядок</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">{summary.totalSessions}</div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <Icon name="CheckCircle2" size={18} />
                <span className="text-sm font-medium">Успешных</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {summary.successfulSessions}
                <span className="text-sm ml-2 text-green-600">({summary.successRatePct.toFixed(1)}%)</span>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-700 mb-2">
                <Icon name="XCircle" size={18} />
                <span className="text-sm font-medium">Неудачных</span>
              </div>
              <div className="text-2xl font-bold text-red-900">
                {summary.failedSessions}
                <span className="text-sm ml-2 text-red-600">({summary.failureRatePct.toFixed(1)}%)</span>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-purple-700 mb-2">
                <Icon name="Battery" size={18} />
                <span className="text-sm font-medium">Отгружено энергии</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">{formatEnergy(summary.energyKwhTotal)}</div>
            </div>

            <div className="bg-amber-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-amber-700 mb-2">
                <Icon name="Clock" size={18} />
                <span className="text-sm font-medium">Средняя сессия</span>
              </div>
              <div className="text-2xl font-bold text-amber-900">{formatDuration(summary.avgSessionDurationSec)}</div>
            </div>

            <div className="bg-indigo-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-indigo-700 mb-2">
                <Icon name="Activity" size={18} />
                <span className="text-sm font-medium">Энергия за сессию</span>
              </div>
              <div className="text-2xl font-bold text-indigo-900">{summary.avgEnergyPerSessionKwh.toFixed(1)} кВт·ч</div>
            </div>

            <div className="bg-teal-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-teal-700 mb-2">
                <Icon name="Plug" size={18} />
                <span className="text-sm font-medium">Активных коннекторов</span>
              </div>
              <div className="text-2xl font-bold text-teal-900">{summary.activeConnectors}</div>
            </div>

            <div className="bg-cyan-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-cyan-700 mb-2">
                <Icon name="TrendingUp" size={18} />
                <span className="text-sm font-medium">Общая успешность</span>
              </div>
              <div className="text-2xl font-bold text-cyan-900">{summary.successRatePct.toFixed(1)}%</div>
            </div>
          </div>
          )}
        </CardContent>
      </Card>

      {hasData && connectors.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {connectors.map((connector) => (
          <Card key={connector.connectorId}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="Plug2" size={18} />
                  <span>Коннектор #{connector.connectorId}</span>
                </div>
                <span className="text-sm font-normal bg-gray-100 px-3 py-1 rounded-full">
                  {CONNECTOR_TYPE_NAMES[connector.connectorType] || `Тип ${connector.connectorType}`}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">Всего зарядок</span>
                  <span className="font-semibold">{connector.totalSessions}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">Успешных</span>
                  <span className="font-semibold text-green-700">
                    {connector.successfulSessions} ({connector.successRatePct.toFixed(1)}%)
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">Неудачных</span>
                  <span className="font-semibold text-red-700">
                    {connector.failedSessions} ({connector.failureRatePct.toFixed(1)}%)
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">Отгружено энергии</span>
                  <span className="font-semibold text-purple-700">{formatEnergy(connector.energyKwhTotal)}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">Средняя сессия</span>
                  <span className="font-semibold">{formatDuration(connector.avgSessionDurationSec)}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">Последнее использование</span>
                  <span className="text-sm font-medium">{formatDateTime(connector.lastSessionEnd)}</span>
                </div>

                <div className="bg-blue-50 rounded-lg p-3 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">Доля от общих зарядок</span>
                    <span className="text-lg font-bold text-blue-900">
                      {connector.shareOfStationSessionsPct.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}
    </div>
  );
}