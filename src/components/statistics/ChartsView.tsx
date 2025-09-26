import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StationStats } from './types';

interface ChartsViewProps {
  stations: StationStats[];
}

export default function ChartsView({ stations }: ChartsViewProps) {
  // Группируем и сортируем по количеству станций, берем топ-5
  const getCityStats = () => {
    const cityGroups = stations.reduce((acc, station) => {
      const city = station.city;
      if (!acc[city]) acc[city] = [];
      acc[city].push(station);
      return acc;
    }, {} as Record<string, StationStats[]>);
    
    return Object.entries(cityGroups)
      .map(([city, cityStations]) => ({
        name: city,
        count: cityStations.length,
        percentage: stations.length > 0 ? (cityStations.length / stations.length) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const getOwnerStats = () => {
    const ownerGroups = stations.reduce((acc, station) => {
      const owner = station.owner;
      if (!acc[owner]) acc[owner] = [];
      acc[owner].push(station);
      return acc;
    }, {} as Record<string, StationStats[]>);
    
    return Object.entries(ownerGroups)
      .map(([owner, ownerStations]) => ({
        name: owner,
        count: ownerStations.length,
        percentage: stations.length > 0 ? (ownerStations.length / stations.length) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const getAppStats = () => {
    const appGroups = stations.reduce((acc, station) => {
      const app = station.connectedApp;
      if (!acc[app]) acc[app] = [];
      acc[app].push(station);
      return acc;
    }, {} as Record<string, StationStats[]>);
    
    return Object.entries(appGroups)
      .map(([app, appStations]) => ({
        name: app,
        count: appStations.length,
        percentage: stations.length > 0 ? (appStations.length / stations.length) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const topCities = getCityStats();
  const topOwners = getOwnerStats();
  const topApps = getAppStats();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Топ городов</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topCities.map((city, index) => (
              <div key={city.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="text-sm font-medium">{city.name}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[100px]">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${city.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">{city.count} ({city.percentage.toFixed(1)}%)</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Топ собственников</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topOwners.map((owner, index) => (
              <div key={owner.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="text-sm font-medium">{owner.name}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[100px]">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${owner.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">{owner.count} ({owner.percentage.toFixed(1)}%)</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Топ приложений</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topApps.map((app, index) => (
              <div key={app.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="text-sm font-medium">{app.name}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[100px]">
                    <div 
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${app.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">{app.count} ({app.percentage.toFixed(1)}%)</div>
              </div>
            ))}
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