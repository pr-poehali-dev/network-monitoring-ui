import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SystemStats {
  cpu: number;
  ram: number;
  network: number;
  load: number[];
}

interface HistoryPoint {
  time: string;
  cpu: number;
  ram: number;
  network: number;
}

export default function SystemMonitoring() {
  const [stats, setStats] = useState<SystemStats>({
    cpu: 45,
    ram: 62,
    network: 128,
    load: [1.2, 0.8, 0.5]
  });

  const [history, setHistory] = useState<HistoryPoint[]>([
    { time: '10:00', cpu: 35, ram: 55, network: 100 },
    { time: '10:05', cpu: 42, ram: 58, network: 120 },
    { time: '10:10', cpu: 38, ram: 60, network: 95 },
    { time: '10:15', cpu: 45, ram: 62, network: 128 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newStats = {
        cpu: Math.floor(Math.random() * 30) + 30,
        ram: Math.floor(Math.random() * 20) + 55,
        network: Math.floor(Math.random() * 100) + 80,
        load: [
          Math.random() * 2,
          Math.random() * 1.5,
          Math.random() * 1
        ]
      };
      setStats(newStats);

      const now = new Date();
      const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      setHistory(prev => {
        const updated = [...prev, { 
          time: timeStr, 
          cpu: newStats.cpu, 
          ram: newStats.ram,
          network: newStats.network 
        }];
        return updated.slice(-20);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
                <p className={`text-2xl font-bold ${getStatusColor(stats.cpu, [60, 80])}`}>
                  {stats.cpu}%
                </p>
              </div>
            </div>
          </div>
          <Progress 
            value={stats.cpu} 
            className="h-2"
            indicatorClassName={getProgressColor(stats.cpu, [60, 80])}
          />
          <p className="text-xs text-gray-500 mt-2">8 ядер / 16 потоков</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Icon name="MemoryStick" size={24} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Оперативная память</p>
                <p className={`text-2xl font-bold ${getStatusColor(stats.ram, [70, 85])}`}>
                  {stats.ram}%
                </p>
              </div>
            </div>
          </div>
          <Progress 
            value={stats.ram} 
            className="h-2"
            indicatorClassName={getProgressColor(stats.ram, [70, 85])}
          />
          <p className="text-xs text-gray-500 mt-2">
            {(stats.ram * 0.32).toFixed(1)} / 32 ГБ использовано
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
                  {stats.network} Мбит/с
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">↓ Входящий</span>
              <span className="font-medium">{Math.floor(stats.network * 0.6)} Мбит/с</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">↑ Исходящий</span>
              <span className="font-medium">{Math.floor(stats.network * 0.4)} Мбит/с</span>
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
                  {stats.load[0].toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">1 мин</span>
              <span className="font-medium">{stats.load[0].toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">5 мин</span>
              <span className="font-medium">{stats.load[1].toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">15 мин</span>
              <span className="font-medium">{stats.load[2].toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Icon name="TrendingUp" size={24} className="text-gray-700" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">История нагрузки</h3>
            <p className="text-sm text-gray-600">Последние 20 измерений</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="time" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              label={{ value: '%', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="cpu" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={false}
              name="CPU"
            />
            <Line 
              type="monotone" 
              dataKey="ram" 
              stroke="#a855f7" 
              strokeWidth={2}
              dot={false}
              name="RAM"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="HardDrive" size={24} className="text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Дисковое пространство</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">/ (root)</span>
                <span className="font-medium">256 / 500 ГБ</span>
              </div>
              <Progress value={51} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">/home</span>
                <span className="font-medium">1.2 / 2 ТБ</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">/var/log</span>
                <span className="font-medium">32 / 100 ГБ</span>
              </div>
              <Progress value={32} className="h-2" indicatorClassName="bg-green-500" />
            </div>
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
              <span className="font-medium">Ubuntu 22.04 LTS</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ядро</span>
              <span className="font-medium">Linux 5.15.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Аптайм</span>
              <span className="font-medium">15 дней 7 часов</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Процессор</span>
              <span className="font-medium">Intel Xeon E5-2680</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Хост</span>
              <span className="font-medium">seismic-monitor-01</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
