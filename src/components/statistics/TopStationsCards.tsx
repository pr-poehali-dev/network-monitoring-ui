import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

interface Station {
  stationId: number;
  serialNumber: string;
  name: string;
  region: string;
  totalSessions: number;
  successfulSessions: number;
  failedSessions: number;
  energyKwhTotal: number;
  successRatePct: number;
  effectiveSuccessRatePct: number;
  avgSessionDurationSec: number;
  avgEnergyPerSessionKwh: number;
  lastSessionTime?: string;
}

interface TopStationsCardsProps {
  stations: Station[];
}

export default function TopStationsCards({ stations }: TopStationsCardsProps) {
  const navigate = useNavigate();

  const topByEnergy = [...stations]
    .sort((a, b) => b.energyKwhTotal - a.energyKwhTotal)
    .slice(0, 5);

  const topBySessions = [...stations]
    .sort((a, b) => b.totalSessions - a.totalSessions)
    .slice(0, 5);

  const topBySuccessRate = [...stations]
    .filter(s => s.totalSessions >= 10)
    .sort((a, b) => b.effectiveSuccessRatePct - a.effectiveSuccessRatePct)
    .slice(0, 5);

  const worstByFailureRate = [...stations]
    .filter(s => s.totalSessions >= 10)
    .sort((a, b) => a.effectiveSuccessRatePct - b.effectiveSuccessRatePct)
    .slice(0, 5);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}ч ${minutes}м`;
  };

  const handleStationClick = (serialNumber: string) => {
    navigate(`/station/${serialNumber}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon name="Zap" className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-lg">Топ по энергии</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topByEnergy.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4">Нет данных за выбранный период</div>
            ) : (
              topByEnergy.map((station, index) => (
                <div
                  key={station.stationId}
                  onClick={() => handleStationClick(station.serialNumber)}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-500 text-white' :
                      'bg-gray-300 text-gray-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{station.name || station.serialNumber}</div>
                      <div className="text-xs text-gray-500">{station.region}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-yellow-600">{station.energyKwhTotal.toLocaleString()} кВт⋅ч</div>
                    <div className="text-xs text-gray-500">{station.totalSessions} сессий</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon name="Activity" className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-lg">Топ по активности</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topBySessions.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4">Нет данных за выбранный период</div>
            ) : (
              topBySessions.map((station, index) => (
                <div
                  key={station.stationId}
                  onClick={() => handleStationClick(station.serialNumber)}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-blue-500 text-white' :
                      index === 1 ? 'bg-blue-400 text-white' :
                      index === 2 ? 'bg-blue-300 text-white' :
                      'bg-gray-300 text-gray-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{station.name || station.serialNumber}</div>
                      <div className="text-xs text-gray-500">{station.region}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">{station.totalSessions.toLocaleString()} сессий</div>
                    <div className="text-xs text-gray-500">~{formatDuration(station.avgSessionDurationSec)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon name="TrendingUp" className="h-5 w-5 text-green-500" />
            <CardTitle className="text-lg">Лучшие по успешности</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topBySuccessRate.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4">Нет данных за выбранный период</div>
            ) : (
              topBySuccessRate.map((station, index) => (
                <div
                  key={station.stationId}
                  onClick={() => handleStationClick(station.serialNumber)}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{station.name || station.serialNumber}</div>
                      <div className="text-xs text-gray-500">{station.region}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{station.effectiveSuccessRatePct.toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">{station.successfulSessions}/{station.totalSessions}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon name="TrendingDown" className="h-5 w-5 text-red-500" />
            <CardTitle className="text-lg">Топ по неуспешности</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {worstByFailureRate.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4">Нет данных за выбранный период</div>
            ) : (
              worstByFailureRate.map((station, index) => (
                <div
                  key={station.stationId}
                  onClick={() => handleStationClick(station.serialNumber)}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 cursor-pointer transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{station.name || station.serialNumber}</div>
                      <div className="text-xs text-gray-500">{station.region}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600">{station.effectiveSuccessRatePct.toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">{station.failedSessions} ошибок из {station.totalSessions}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
