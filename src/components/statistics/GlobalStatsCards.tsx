import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { GlobalStats } from './types';

interface GlobalStatsCardsProps {
  globalStats: GlobalStats;
}

export default function GlobalStatsCards({ globalStats }: GlobalStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Всего сессий</CardTitle>
          <Icon name="Activity" className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{globalStats.totalSessions.toLocaleString()}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Успешные: {globalStats.successfulSessions.toLocaleString()}
            </div>
            <span>({globalStats.avgSuccessRate.toFixed(1)}%)</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Передано энергии</CardTitle>
          <Icon name="Zap" className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{globalStats.totalEnergy.toLocaleString()} кВт⋅ч</div>
          <p className="text-xs text-muted-foreground">
            ≈ {Math.round(globalStats.totalEnergy / 30)} дней работы дома
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Общие ошибки</CardTitle>
          <Icon name="AlertTriangle" className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{globalStats.totalErrors}</div>
          <p className="text-xs text-muted-foreground">
            Среднее на станцию: {Math.round(globalStats.totalErrors / globalStats.totalStations)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Статус станций</CardTitle>
          <Icon name="Server" className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{globalStats.activeStations}</div>
              <div className="text-xs text-gray-500">Активные</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{globalStats.offlineStations}</div>
              <div className="text-xs text-gray-500">Оффлайн</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-600">{globalStats.maintenanceStations}</div>
              <div className="text-xs text-gray-500">ТО</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}