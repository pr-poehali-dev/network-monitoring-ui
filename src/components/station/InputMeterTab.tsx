import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { wsService } from '@/services/websocket';
import { EnergyMeterData, MetricPoint } from '@/types/websocket';

interface InputMeterTabProps {
  serialNumber: string;
}

interface TooltipData {
  x: number;
  y: number;
  time: string;
  values: { phase: string; value: number; color: string }[];
}

export default function InputMeterTab({ serialNumber }: InputMeterTabProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1h');
  const [meterData, setMeterData] = useState<EnergyMeterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChart, setActiveChart] = useState<'voltage' | 'current' | 'power' | 'energy'>('voltage');
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

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

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>,
    data: MetricPoint[] | undefined,
    dataL1?: MetricPoint[] | undefined,
    dataL2?: MetricPoint[] | undefined,
    dataL3?: MetricPoint[] | undefined,
    unit?: string
  ) => {
    if (!chartRef.current) return;

    const rect = chartRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const relativeX = x / rect.width;

    if (data && data.length > 0) {
      const index = Math.round(relativeX * (data.length - 1));
      const point = data[index];
      if (point) {
        setTooltip({
          x: e.clientX,
          y: e.clientY,
          time: formatTime(point.time),
          values: [{ phase: '', value: point.value, color: '' }]
        });
      }
    } else if (dataL1 || dataL2 || dataL3) {
      const maxLength = Math.max(dataL1?.length || 0, dataL2?.length || 0, dataL3?.length || 0);
      const index = Math.round(relativeX * (maxLength - 1));
      
      const values = [];
      if (dataL1 && dataL1[index]) {
        values.push({ phase: 'L1', value: dataL1[index].value, color: '#DC2626' });
      }
      if (dataL2 && dataL2[index]) {
        values.push({ phase: 'L2', value: dataL2[index].value, color: '#CA8A04' });
      }
      if (dataL3 && dataL3[index]) {
        values.push({ phase: 'L3', value: dataL3[index].value, color: '#2563EB' });
      }

      if (values.length > 0) {
        const timeSource = dataL1?.[index] || dataL2?.[index] || dataL3?.[index];
        setTooltip({
          x: e.clientX,
          y: e.clientY,
          time: timeSource ? formatTime(timeSource.time) : '',
          values
        });
      }
    }
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  const renderChart = (data: MetricPoint[] | undefined, label: string, unit: string, color: string) => {
    if (!data || data.length === 0) {
      return <div className="text-center text-gray-500 py-8">Нет данных</div>;
    }

    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;

    return (
      <div 
        ref={chartRef}
        className="relative h-64"
        onMouseMove={(e) => handleMouseMove(e, data, undefined, undefined, undefined, unit)}
        onMouseLeave={handleMouseLeave}
      >
        <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            points={data.map((point, i) => {
              const x = (i / (data.length - 1)) * 800;
              const y = 200 - ((point.value - minValue) / range) * 180;
              return `${x},${y}`;
            }).join(' ')}
          />
        </svg>
        <div className="absolute top-0 right-0 text-sm text-gray-600">
          {maxValue.toFixed(2)} {unit}
        </div>
        <div className="absolute bottom-0 right-0 text-sm text-gray-600">
          {minValue.toFixed(2)} {unit}
        </div>
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

    const maxValue = Math.max(...allData.map(d => d.value));
    const minValue = Math.min(...allData.map(d => d.value));
    const range = maxValue - minValue || 1;

    return (
      <div 
        ref={chartRef}
        className="relative h-64"
        onMouseMove={(e) => handleMouseMove(e, undefined, dataL1, dataL2, dataL3, unit)}
        onMouseLeave={handleMouseLeave}
      >
        <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
          {dataL1 && dataL1.length > 0 && (
            <polyline
              fill="none"
              stroke="#DC2626"
              strokeWidth="2"
              points={dataL1.map((point, i) => {
                const x = (i / (dataL1.length - 1)) * 800;
                const y = 200 - ((point.value - minValue) / range) * 180;
                return `${x},${y}`;
              }).join(' ')}
            />
          )}
          {dataL2 && dataL2.length > 0 && (
            <polyline
              fill="none"
              stroke="#CA8A04"
              strokeWidth="2"
              points={dataL2.map((point, i) => {
                const x = (i / (dataL2.length - 1)) * 800;
                const y = 200 - ((point.value - minValue) / range) * 180;
                return `${x},${y}`;
              }).join(' ')}
            />
          )}
          {dataL3 && dataL3.length > 0 && (
            <polyline
              fill="none"
              stroke="#2563EB"
              strokeWidth="2"
              points={dataL3.map((point, i) => {
                const x = (i / (dataL3.length - 1)) * 800;
                const y = 200 - ((point.value - minValue) / range) * 180;
                return `${x},${y}`;
              }).join(' ')}
            />
          )}
        </svg>
        <div className="absolute top-0 right-0 text-sm text-gray-600">
          {maxValue.toFixed(2)} {unit}
        </div>
        <div className="absolute bottom-0 right-0 text-sm text-gray-600">
          {minValue.toFixed(2)} {unit}
        </div>
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
      {/* Статус подключения */}
      {current.connected !== null && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${current.connected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="font-medium">
                {current.connected ? 'Счётчик подключен' : 'Счётчик отключен'}
              </span>
              {current.time && (
                <span className="text-sm text-gray-500">
                  • Обновлено: {new Date(current.time).toLocaleString('ru-RU')}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
                {current.power_total?.toFixed(2) || '—'} кВт
              </div>
              <div className="text-sm text-gray-600 mt-1">Мощность</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {current.energy_active?.toLocaleString() || '—'} кВт⋅ч
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

          {/* Легенда для трёхфазных графиков */}
          {(activeChart === 'voltage' || activeChart === 'current') && (
            <div className="flex justify-center gap-6 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-600" />
                <span className="text-sm text-gray-700">Фаза L1</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-600" />
                <span className="text-sm text-gray-700">Фаза L2</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600" />
                <span className="text-sm text-gray-700">Фаза L3</span>
              </div>
            </div>
          )}

          {/* График */}
          <div className="relative">
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
            
            {/* Тултип */}
            {tooltip && (
              <div
                className="fixed z-50 pointer-events-none"
                style={{
                  left: `${tooltip.x + 15}px`,
                  top: `${tooltip.y - 10}px`
                }}
              >
                <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm">
                  <div className="font-medium mb-1">{tooltip.time}</div>
                  <div className="space-y-1">
                    {tooltip.values.map((val, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        {val.phase && (
                          <>
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: val.color }}
                            />
                            <span className="text-gray-300">{val.phase}:</span>
                          </>
                        )}
                        <span className="font-semibold">
                          {val.value.toFixed(2)} {
                            activeChart === 'voltage' ? 'В' :
                            activeChart === 'current' ? 'А' :
                            activeChart === 'power' ? 'кВт' :
                            'кВт⋅ч'
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}