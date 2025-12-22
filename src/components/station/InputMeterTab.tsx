import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { wsService } from '@/services/websocket';
import { EnergyMeterData, MetricPoint } from '@/types/websocket';

interface InputMeterTabProps {
  serialNumber: string;
}

export default function InputMeterTab({ serialNumber }: InputMeterTabProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1h');
  const [meterData, setMeterData] = useState<EnergyMeterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChart, setActiveChart] = useState<'voltage' | 'current' | 'power' | 'energy'>('voltage');

  useEffect(() => {
    loadMeterData();
  }, [serialNumber, selectedPeriod]);

  const loadMeterData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { from, to } = getPeriodRange(selectedPeriod);
      const data = await wsService.getEnergyMeterMetrics(serialNumber, from, to, 300);
      setMeterData(data);
    } catch (err) {
      console.error('Failed to load energy meter data:', err);
      setError('Не удалось загрузить данные счётчика');
    } finally {
      setIsLoading(false);
    }
  };

  const getPeriodRange = (period: string): { from: string; to: string } => {
    const now = new Date();
    const to = now.toISOString();
    let from: Date;

    switch (period) {
      case '1h':
        from = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        from = new Date(now.getTime() - 60 * 60 * 1000);
    }

    return { from: from.toISOString(), to };
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case '1h': return 'Последний час';
      case '24h': return 'Последние 24 часа';
      case '7d': return 'Последняя неделя';
      default: return 'Период';
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'L1': return 'text-red-600 border-red-200 bg-red-50';
      case 'L2': return 'text-yellow-600 border-yellow-200 bg-yellow-50';
      case 'L3': return 'text-blue-600 border-blue-200 bg-blue-50';
      default: return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    if (selectedPeriod === '7d') {
      return date.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const formatEnergy = (wattHours: number | undefined): string => {
    if (wattHours === undefined || wattHours === null) return '—';
    
    const absValue = Math.abs(wattHours);
    
    if (absValue >= 1_000_000_000) {
      return `${(wattHours / 1_000_000_000).toFixed(2)} ГВт⋅ч`;
    } else if (absValue >= 1_000_000) {
      return `${(wattHours / 1_000_000).toFixed(2)} МВт⋅ч`;
    } else if (absValue >= 1_000) {
      return `${(wattHours / 1_000).toFixed(2)} кВт⋅ч`;
    } else {
      return `${wattHours.toFixed(2)} Вт⋅ч`;
    }
  };

  const formatPower = (watts: number | undefined): string => {
    if (watts === undefined || watts === null) return '—';
    
    const absValue = Math.abs(watts);
    
    if (absValue >= 1_000_000_000) {
      return `${(watts / 1_000_000_000).toFixed(2)} ГВт`;
    } else if (absValue >= 1_000_000) {
      return `${(watts / 1_000_000).toFixed(2)} МВт`;
    } else if (absValue >= 1_000) {
      return `${(watts / 1_000).toFixed(2)} кВт`;
    } else {
      return `${watts.toFixed(2)} Вт`;
    }
  };

  const formatChartData = (data: MetricPoint[] | undefined) => {
    if (!data) return [];
    return data.map(m => ({
      time: formatTime(m.time),
      value: m.value
    }));
  };

  const formatMultiPhaseChartData = (
    dataL1: MetricPoint[] | undefined,
    dataL2: MetricPoint[] | undefined,
    dataL3: MetricPoint[] | undefined
  ) => {
    const maxLength = Math.max(dataL1?.length || 0, dataL2?.length || 0, dataL3?.length || 0);
    const result = [];
    
    for (let i = 0; i < maxLength; i++) {
      const item: any = {};
      
      if (dataL1 && dataL1[i]) {
        item.time = formatTime(dataL1[i].time);
        item.L1 = dataL1[i].value;
      }
      if (dataL2 && dataL2[i]) {
        if (!item.time) item.time = formatTime(dataL2[i].time);
        item.L2 = dataL2[i].value;
      }
      if (dataL3 && dataL3[i]) {
        if (!item.time) item.time = formatTime(dataL3[i].time);
        item.L3 = dataL3[i].value;
      }
      
      if (item.time) result.push(item);
    }
    
    return result;
  };

  const renderChart = (data: MetricPoint[] | undefined, label: string, unit: string, color: string) => {
    if (!data || data.length === 0) {
      return <div className="text-center text-gray-500 py-8">Нет данных</div>;
    }

    const chartData = formatChartData(data);

    return (
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
              label={{ value: unit, angle: -90, position: 'insideLeft', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              formatter={(value: any) => [`${value.toFixed(2)} ${unit}`, label]}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={2}
              dot={false}
              name={label}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderMultiPhaseChart = (
    dataL1: MetricPoint[] | undefined,
    dataL2: MetricPoint[] | undefined,
    dataL3: MetricPoint[] | undefined,
    label: string,
    unit: string
  ) => {
    const allData = [...(dataL1 || []), ...(dataL2 || []), ...(dataL3 || [])];
    if (allData.length === 0) {
      return <div className="text-center text-gray-500 py-8">Нет данных</div>;
    }

    const chartData = formatMultiPhaseChartData(dataL1, dataL2, dataL3);

    return (
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
              label={{ value: unit, angle: -90, position: 'insideLeft', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              formatter={(value: any) => `${value.toFixed(2)} ${unit}`}
            />
            <Legend />
            {dataL1 && dataL1.length > 0 && (
              <Line 
                type="monotone" 
                dataKey="L1" 
                stroke="#DC2626" 
                strokeWidth={2}
                dot={false}
                name="Фаза L1"
              />
            )}
            {dataL2 && dataL2.length > 0 && (
              <Line 
                type="monotone" 
                dataKey="L2" 
                stroke="#CA8A04" 
                strokeWidth={2}
                dot={false}
                name="Фаза L2"
              />
            )}
            {dataL3 && dataL3.length > 0 && (
              <Line 
                type="monotone" 
                dataKey="L3" 
                stroke="#2563EB" 
                strokeWidth={2}
                dot={false}
                name="Фаза L3"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Загрузка данных счётчика...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!meterData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Нет данных</div>
      </div>
    );
  }

  const { current, metrics } = meterData;

  return (
    <div className="space-y-6">


      {/* Текущие показания */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Gauge" size={20} />
            Текущие показания
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatPower(current.power_total)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Мощность</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatEnergy(current.energy_active)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Энергия</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {current.voltageL1?.toFixed(1) || '—'} В
              </div>
              <div className="text-sm text-gray-600 mt-1">Напряжение L1</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {current.currentL1?.toFixed(2) || '—'} А
              </div>
              <div className="text-sm text-gray-600 mt-1">Ток L1</div>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Фаза</th>
                  <th className="text-center py-3 px-4">Напряжение</th>
                  <th className="text-center py-3 px-4">Ток</th>
                </tr>
              </thead>
              <tbody>
                {['L1', 'L2', 'L3'].map((phase) => {
                  const voltage = current[`voltage${phase}` as keyof typeof current] as number | undefined;
                  const currentVal = current[`current${phase}` as keyof typeof current] as number | undefined;
                  return (
                    <tr key={phase} className="border-b last:border-0">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            phase === 'L1' ? 'bg-red-500' :
                            phase === 'L2' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`} />
                          <span className="font-medium">Фаза {phase}</span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">
                        <div className={`inline-block text-lg font-bold border-2 rounded-lg py-2 px-3 ${getPhaseColor(phase)}`}>
                          {voltage?.toFixed(1) || '—'} В
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">
                        <div className={`inline-block text-lg font-bold border-2 rounded-lg py-2 px-3 ${getPhaseColor(phase)}`}>
                          {currentVal?.toFixed(2) || '—'} А
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Графики */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Icon name="TrendingUp" size={20} />
              Динамика показаний
            </CardTitle>
            <div className="flex gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Последний час</SelectItem>
                  <SelectItem value="24h">Последние 24 часа</SelectItem>
                  <SelectItem value="7d">Последняя неделя</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {getPeriodLabel(selectedPeriod)}
          </p>
        </CardHeader>
        <CardContent>
          {/* Переключатель графиков */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setActiveChart('voltage')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeChart === 'voltage'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Напряжение
            </button>
            <button
              onClick={() => setActiveChart('current')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeChart === 'current'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Ток
            </button>
            <button
              onClick={() => setActiveChart('power')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeChart === 'power'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Мощность
            </button>
            <button
              onClick={() => setActiveChart('energy')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeChart === 'energy'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Энергия
            </button>
          </div>

          {/* График */}
          <div>
            {activeChart === 'voltage' && renderMultiPhaseChart(
              metrics.voltageL1,
              metrics.voltageL2,
              metrics.voltageL3,
              'Напряжение',
              'В'
            )}
            {activeChart === 'current' && renderMultiPhaseChart(
              metrics.currentL1,
              metrics.currentL2,
              metrics.currentL3,
              'Ток',
              'А'
            )}
            {activeChart === 'power' && renderChart(
              metrics.power_total,
              'Мощность',
              'кВт',
              '#10B981'
            )}
            {activeChart === 'energy' && renderChart(
              metrics.energy_active,
              'Энергия',
              'кВт⋅ч',
              '#8B5CF6'
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}