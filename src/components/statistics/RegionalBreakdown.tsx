import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface Station {
  region: string;
  totalSessions: number;
  successfulSessions: number;
  failedSessions: number;
  energyKwhTotal: number;
}

interface RegionalBreakdownProps {
  stations: Station[];
}

export default function RegionalBreakdown({ stations }: RegionalBreakdownProps) {
  const regionalStats = stations.reduce((acc, station) => {
    const region = station.region || 'Неизвестно';
    if (!acc[region]) {
      acc[region] = {
        region,
        stationCount: 0,
        totalSessions: 0,
        successfulSessions: 0,
        failedSessions: 0,
        totalEnergy: 0
      };
    }
    
    acc[region].stationCount++;
    acc[region].totalSessions += station.totalSessions || 0;
    acc[region].successfulSessions += station.successfulSessions || 0;
    acc[region].failedSessions += station.failedSessions || 0;
    acc[region].totalEnergy += station.energyKwhTotal || 0;
    
    return acc;
  }, {} as Record<string, any>);

  const sortedRegions = Object.values(regionalStats)
    .sort((a: any, b: any) => b.totalEnergy - a.totalEnergy);

  const maxEnergy = sortedRegions[0]?.totalEnergy || 1;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="MapPin" className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-lg">Статистика по регионам</CardTitle>
          </div>
          <div className="text-sm text-gray-500">
            {sortedRegions.length} регионов
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedRegions.map((region: any) => {
            const successRate = region.totalSessions > 0 
              ? ((region.successfulSessions / region.totalSessions) * 100).toFixed(1)
              : 0;

            return (
              <div key={region.region} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{region.region}</span>
                      <span className="text-xs text-gray-500">
                        {region.stationCount} станций
                      </span>
                    </div>
                    <Progress 
                      value={(region.totalEnergy / maxEnergy) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="bg-blue-50 rounded p-2">
                    <div className="text-gray-500">Энергия</div>
                    <div className="font-semibold text-blue-600">
                      {region.totalEnergy.toLocaleString()} кВт⋅ч
                    </div>
                  </div>
                  <div className="bg-green-50 rounded p-2">
                    <div className="text-gray-500">Сессии</div>
                    <div className="font-semibold text-green-600">
                      {region.totalSessions.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded p-2">
                    <div className="text-gray-500">Успешность</div>
                    <div className="font-semibold text-purple-600">
                      {successRate}%
                    </div>
                  </div>
                  <div className="bg-red-50 rounded p-2">
                    <div className="text-gray-500">Ошибки</div>
                    <div className="font-semibold text-red-600">
                      {region.failedSessions}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
