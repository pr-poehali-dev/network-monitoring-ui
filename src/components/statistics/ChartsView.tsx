import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StationStats } from './types';

interface ChartsViewProps {
  stations: StationStats[];
}

export default function ChartsView({ stations }: ChartsViewProps) {
  // Для графиков используем уникальные значения из отфильтрованных данных
  const cities = [...new Set(stations.map(s => s.city))];
  const owners = [...new Set(stations.map(s => s.owner))];
  const apps = [...new Set(stations.map(s => s.connectedApp))];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Распределение по городам</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cities.map(city => {
              const cityStations = stations.filter(s => s.city === city);
              const percentage = stations.length > 0 ? (cityStations.length / stations.length) * 100 : 0;
              return (
                <div key={city} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium">{city}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[100px]">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">{cityStations.length} ({percentage.toFixed(1)}%)</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Распределение по собственникам</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {owners.map(owner => {
              const ownerStations = stations.filter(s => s.owner === owner);
              const percentage = stations.length > 0 ? (ownerStations.length / stations.length) * 100 : 0;
              return (
                <div key={owner} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium">{owner}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[100px]">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">{ownerStations.length} ({percentage.toFixed(1)}%)</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Подключенные приложения</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {apps.map(app => {
              const appStations = stations.filter(s => s.connectedApp === app);
              const percentage = stations.length > 0 ? (appStations.length / stations.length) * 100 : 0;
              return (
                <div key={app} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium">{app}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[100px]">
                      <div 
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">{appStations.length} ({percentage.toFixed(1)}%)</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Топ по энергии</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stations
              .slice()
              .sort((a, b) => b.totalEnergy - a.totalEnergy)
              .slice(0, 5)
              .map((station, index) => (
                <div key={station.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{station.name}</div>
                      <div className="text-xs text-gray-500">{station.city}</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-blue-600">
                    {station.totalEnergy.toLocaleString()} кВт⋅ч
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}