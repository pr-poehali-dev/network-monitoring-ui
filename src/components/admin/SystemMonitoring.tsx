import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { wsService } from '@/services/websocket';

interface SystemStatsData {
  timestamp: number;
  timestampIso: string;
  cpu: {
    percent: number;
    cores: number;
  };
  memory: {
    percent: number;
    usedBytes: number;
    totalBytes: number;
  };
  network: {
    rxMbps: number;
    txMbps: number;
    totalMbps: number;
  };
  load: {
    '1m': number;
    '5m': number;
    '15m': number;
  };
  disks: Array<{
    path: string;
    usedBytes: number;
    totalBytes: number;
    usedPercent: number;
  }>;
  system: {
    os: string;
    kernel: string;
    uptimeSec: number;
    uptimeHuman: string;
    cpuModel: string;
    host: string;
  };
}

interface HistoryPoint {
  time: string;
  cpu: number;
  ram: number;
  network: number;
}

interface SystemMonitoringProps {
  isActive?: boolean;
}

export default function SystemMonitoring({ isActive = false }: SystemMonitoringProps) {
  const [stats, setStats] = useState<SystemStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  
  const [history, setHistory] = useState<HistoryPoint[]>([]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    console.log('Tab active, subscribing to system stats');
    let unsubscribe: (() => void) | null = null;
    let isSubscribed = false;

    const subscribe = async () => {
      try {
        setLoading(true);
        setError(null);

        unsubscribe = wsService.onSystemStatsUpdate((data) => {
          console.log('Received system stats update:', data);
          setStats(data);
          addToHistory(data);
          setLoading(false);
        });

        const response = await wsService.subscribeSystemStats(2000, ['/', '/home', '/var/log']);
        
        console.log('Subscribe response:', response);
        
        if (response.type === 'response') {
          if (response.data?.stats) {
            setStats(response.data.stats);
            addToHistory(response.data.stats);
          }
          isSubscribed = true;
          setSubscribed(true);
          setLoading(false);
        } else if (response.type === 'error') {
          setError(response.message || 'Ошибка подписки на системную статистику');
          setLoading(false);
        }

      } catch (err) {
        console.error('Error subscribing to system stats:', err);
        setError('Не удалось подключиться к мониторингу системы');
        setLoading(false);
      }
    };

    subscribe();

    return () => {
      console.log('Cleanup: unsubscribing from system stats, isSubscribed:', isSubscribed);
      if (isSubscribed) {
        wsService.unsubscribeSystemStats().catch(console.error);
        setSubscribed(false);
      }
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isActive]);

  const addToHistory = (data: SystemStatsData) => {
    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    setHistory(prev => {
      const updated = [...prev, {
        time: timeStr,
        cpu: data.cpu.percent,
        ram: data.memory.percent,
        network: data.network.totalMbps
      }];
      return updated.slice(-20);
    });
  };

  const getStatusColor = (value: number, thresholds: [number, number]) => {
    if (value < thresholds[0]) return 'text-green-600';
    if (value < thresholds[1]) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (value: number, thresholds: [number, number]) => {
    if (value < thresholds[0]) return 'bg-green-500';
    if (value < thresholds[1]) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatBytes = (bytes: number): string => {
    if (bytes >= 1099511627776) return `${(bytes / 1099511627776).toFixed(1)} ТБ`;
    if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} ГБ`;
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} МБ`;
    return `${(bytes / 1024).toFixed(1)} КБ`;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Icon name="Loader2" size={48} className="mx-auto text-gray-300 mb-3 animate-spin" />
        <p className="text-gray-500">Загрузка системной статистики...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
        <Icon name="AlertCircle" size={20} className="text-red-600" />
        <span className="text-red-700">{error}</span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <Icon name="Server" size={48} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">Нет данных</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Icon name="Cpu" size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Процессор</p>
                <p className={`text-2xl font-bold ${getStatusColor(stats.cpu.percent, [60, 80])}`}>
                  {stats.cpu.percent.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
          <Progress 
            value={stats.cpu.percent} 
            className="h-2"
            indicatorClassName={getProgressColor(stats.cpu.percent, [60, 80])}
          />
          <p className="text-xs text-gray-500 mt-2">{stats.cpu.cores} ядер</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Icon name="MemoryStick" size={24} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Оперативная память</p>
                <p className={`text-2xl font-bold ${getStatusColor(stats.memory.percent, [70, 85])}`}>
                  {stats.memory.percent.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
          <Progress 
            value={stats.memory.percent} 
            className="h-2"
            indicatorClassName={getProgressColor(stats.memory.percent, [70, 85])}
          />
          <p className="text-xs text-gray-500 mt-2">
            {formatBytes(stats.memory.usedBytes)} / {formatBytes(stats.memory.totalBytes)} использовано
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Icon name="Network" size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Сеть</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.network.totalMbps.toFixed(0)} Мбит/с
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">↓ Входящий</span>
              <span className="font-medium">{stats.network.rxMbps.toFixed(1)} Мбит/с</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">↑ Исходящий</span>
              <span className="font-medium">{stats.network.txMbps.toFixed(1)} Мбит/с</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Icon name="Gauge" size={24} className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Load Average</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.load['1m'].toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">1 мин</span>
              <span className="font-medium">{stats.load['1m'].toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">5 мин</span>
              <span className="font-medium">{stats.load['5m'].toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">15 мин</span>
              <span className="font-medium">{stats.load['15m'].toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="HardDrive" size={24} className="text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Дисковое пространство</h3>
          </div>
          <div className="space-y-4">
            {stats.disks.map((disk) => (
              <div key={disk.path}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">{disk.path}</span>
                  <span className="font-medium">
                    {formatBytes(disk.usedBytes)} / {formatBytes(disk.totalBytes)}
                  </span>
                </div>
                <Progress 
                  value={disk.usedPercent} 
                  className="h-2"
                  indicatorClassName={getProgressColor(disk.usedPercent, [70, 85])}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="Server" size={24} className="text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Информация о системе</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">ОС</span>
              <span className="font-medium">{stats.system.os}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ядро</span>
              <span className="font-medium text-sm">{stats.system.kernel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Процессор</span>
              <span className="font-medium text-sm">{stats.system.cpuModel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hostname</span>
              <span className="font-medium">{stats.system.host}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Uptime</span>
              <span className="font-medium">{stats.system.uptimeHuman}</span>
            </div>
          </div>
        </Card>
      </div>

      {history.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="Activity" size={24} className="text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">История мониторинга</h3>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="cpu" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="CPU %"
              />
              <Line 
                type="monotone" 
                dataKey="ram" 
                stroke="#a855f7" 
                strokeWidth={2}
                name="RAM %"
              />
              <Line 
                type="monotone" 
                dataKey="network" 
                stroke="#22c55e" 
                strokeWidth={2}
                name="Network Мбит/с"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}