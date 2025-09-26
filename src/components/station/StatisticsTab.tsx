import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface ConnectorStats {
  id: string;
  type: string;
  totalSessions: number;
  successfulSessions: number;
  failedSessions: number;
  totalEnergyDelivered: number; // kWh
  averageSessionDuration: number; // minutes
  lastUsed: string;
}

interface StationStats {
  totalSessions: number;
  successfulSessions: number;
  failedSessions: number;
  totalEnergyDelivered: number;
  averageSessionDuration: number;
  connectors: ConnectorStats[];
}

export default function StatisticsTab() {
  // Имитация данных статистики
  const stationStats: StationStats = {
    totalSessions: 1247,
    successfulSessions: 1186,
    failedSessions: 61,
    totalEnergyDelivered: 45672.8,
    averageSessionDuration: 148, // минуты
    connectors: [
      {
        id: '1',
        type: 'CCS',
        totalSessions: 523,
        successfulSessions: 498,
        failedSessions: 25,
        totalEnergyDelivered: 19845.2,
        averageSessionDuration: 156,
        lastUsed: '25.09.2025 16:45'
      },
      {
        id: '2', 
        type: 'CHAdeMO',
        totalSessions: 389,
        successfulSessions: 371,
        failedSessions: 18,
        totalEnergyDelivered: 14523.7,
        averageSessionDuration: 142,
        lastUsed: '25.09.2025 12:45'
      },
      {
        id: '3',
        type: 'Type 2',
        totalSessions: 335,
        successfulSessions: 317,
        failedSessions: 18,
        totalEnergyDelivered: 11303.9,
        averageSessionDuration: 135,
        lastUsed: '24.09.2025 10:40'
      }
    ]
  };

  const formatEnergy = (energy: number) => {
    if (energy >= 1000) {
      return `${(energy / 1000).toFixed(1)} МВт⋅ч`;
    }
    return `${energy.toFixed(1)} кВт⋅ч`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ч ${mins}м`;
  };

  const getSuccessRate = (successful: number, total: number) => {
    return total > 0 ? ((successful / total) * 100).toFixed(1) : '0.0';
  };

  const getConnectorIcon = (type: string) => {
    switch (type) {
      case 'CCS': return 'Zap';
      case 'CHAdeMO': return 'Battery';
      case 'Type 2': return 'Plug';
      default: return 'Power';
    }
  };

  return (
    <div className="space-y-6">
      {/* Общая статистика по станции */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="BarChart3" size={20} />
            Общая статистика станции
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stationStats.totalSessions.toLocaleString()}</div>
              <div className="text-sm text-gray-600 mt-1">Всего зарядок</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stationStats.successfulSessions.toLocaleString()}</div>
              <div className="text-sm text-gray-600 mt-1">Успешных</div>
              <div className="text-xs text-green-600 font-medium mt-1">
                {getSuccessRate(stationStats.successfulSessions, stationStats.totalSessions)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stationStats.failedSessions}</div>
              <div className="text-sm text-gray-600 mt-1">Неудачных</div>
              <div className="text-xs text-red-600 font-medium mt-1">
                {getSuccessRate(stationStats.failedSessions, stationStats.totalSessions)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{formatEnergy(stationStats.totalEnergyDelivered)}</div>
              <div className="text-sm text-gray-600 mt-1">Отгружено энергии</div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center gap-4">
              <Icon name="Clock" size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600">
                Средняя продолжительность сессии: 
                <span className="font-medium ml-1">{formatDuration(stationStats.averageSessionDuration)}</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Статистика по коннекторам */}
      <div className="grid gap-6">
        <h3 className="text-lg font-semibold">Статистика по коннекторам</h3>
        
        {stationStats.connectors.map((connector) => (
          <Card key={connector.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Icon name={getConnectorIcon(connector.type)} size={20} className="text-blue-600" />
                  <span>Коннектор #{connector.id}</span>
                </div>
                <span className="text-sm font-normal bg-gray-100 px-2 py-1 rounded">
                  {connector.type}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{connector.totalSessions}</div>
                  <div className="text-sm text-gray-600 mt-1">Всего зарядок</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{connector.successfulSessions}</div>
                  <div className="text-sm text-gray-600 mt-1">Успешных</div>
                  <div className="text-xs text-green-600 font-medium mt-1">
                    {getSuccessRate(connector.successfulSessions, connector.totalSessions)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{connector.failedSessions}</div>
                  <div className="text-sm text-gray-600 mt-1">Неудачных</div>
                  <div className="text-xs text-red-600 font-medium mt-1">
                    {getSuccessRate(connector.failedSessions, connector.totalSessions)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{formatEnergy(connector.totalEnergyDelivered)}</div>
                  <div className="text-sm text-gray-600 mt-1">Отгружено энергии</div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Icon name="Clock" size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Средняя сессия: 
                    <span className="font-medium ml-1">{formatDuration(connector.averageSessionDuration)}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Calendar" size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Последнее использование: 
                    <span className="font-medium ml-1">{connector.lastUsed}</span>
                  </span>
                </div>
              </div>

              {/* Прогресс-бар использования коннектора от общей станции */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Доля от общих зарядок станции</span>
                  <span className="text-sm font-medium">
                    {((connector.totalSessions / stationStats.totalSessions) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${(connector.totalSessions / stationStats.totalSessions) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Дополнительная аналитика */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="TrendingUp" size={20} />
            Аналитика эффективности
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {(stationStats.totalEnergyDelivered / stationStats.totalSessions).toFixed(1)} кВт⋅ч
              </div>
              <div className="text-sm text-gray-600 mt-1">Среднее энергопотребление за сессию</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600">
                {stationStats.connectors.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Активных коннекторов</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {getSuccessRate(stationStats.successfulSessions, stationStats.totalSessions)}%
              </div>
              <div className="text-sm text-gray-600 mt-1">Общий процент успешности</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}