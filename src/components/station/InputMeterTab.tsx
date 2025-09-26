import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface PhaseData {
  phase: 'L1' | 'L2' | 'L3';
  voltage: number; // Вольты
  current: number; // Амперы
  power: number;   // Ватты
}

interface MeterReading {
  timestamp: string;
  phases: PhaseData[];
  frequency: number; // Герцы
  totalPower: number; // Общая мощность кВт
  totalEnergy: number; // Общая энергия кВт⋅ч
}

interface VoltagePoint {
  time: string;
  L1: number;
  L2: number;
  L3: number;
}

export default function InputMeterTab() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1h');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; data: VoltagePoint; index: number } | null>(null);
  const [voltageDataCache, setVoltageDataCache] = useState<Record<string, VoltagePoint[]>>({});

  // Имитация текущих показаний прибора учета
  const currentReading: MeterReading = {
    timestamp: new Date().toISOString(),
    phases: [
      { phase: 'L1', voltage: 231.4, current: 15.8, power: 3656 },
      { phase: 'L2', voltage: 229.7, current: 16.2, power: 3721 },
      { phase: 'L3', voltage: 232.1, current: 15.1, power: 3505 }
    ],
    frequency: 49.95,
    totalPower: 10.88, // кВт
    totalEnergy: 45672.8 // кВт⋅ч за все время
  };

  // Генерируем и кешируем данные для графика напряжения
  const generateVoltageData = (period: string): VoltagePoint[] => {
    if (voltageDataCache[period]) {
      return voltageDataCache[period];
    }

    const points: VoltagePoint[] = [];
    const now = new Date();
    let intervals: number;
    let stepMinutes: number;

    switch (period) {
      case '1h':
        intervals = 60;
        stepMinutes = 1;
        break;
      case '24h':
        intervals = 24;
        stepMinutes = 60;
        break;
      case '7d':
        intervals = 7 * 24;
        stepMinutes = 60;
        break;
      default:
        intervals = 60;
        stepMinutes = 1;
    }

    // Используем фиксированный seed для стабильных данных
    for (let i = intervals; i >= 0; i--) {
      const time = new Date(now.getTime() - i * stepMinutes * 60000);
      const seed = i * 0.1; // Фиксированный seed вместо Math.random()
      points.push({
        time: time.toLocaleTimeString('ru-RU', { 
          hour: '2-digit', 
          minute: '2-digit',
          ...(period === '7d' && { day: '2-digit', month: '2-digit' })
        }),
        L1: 230 + Math.sin(seed) * 3 + Math.cos(seed * 2) * 1.5,
        L2: 230 + Math.cos(seed) * 3 + Math.sin(seed * 1.5) * 1.5,
        L3: 230 + Math.sin(seed * 1.5) * 3 + Math.cos(seed * 3) * 1.5
      });
    }
    
    // Кешируем данные
    setVoltageDataCache(prev => ({ ...prev, [period]: points }));
    return points;
  };

  const voltageData = generateVoltageData(selectedPeriod);

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'L1': return 'text-red-600 border-red-200 bg-red-50';
      case 'L2': return 'text-yellow-600 border-yellow-200 bg-yellow-50';
      case 'L3': return 'text-blue-600 border-blue-200 bg-blue-50';
      default: return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case '1h': return 'Последний час';
      case '24h': return 'Последние 24 часа';
      case '7d': return 'Последняя неделя';
      default: return 'Период';
    }
  };

  const formatVoltage = (voltage: number) => voltage.toFixed(1);
  const formatCurrent = (current: number) => current.toFixed(1);
  const formatPower = (power: number) => (power / 1000).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Текущие показания */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Gauge" size={20} />
              Текущие показания входного прибора учета
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Общие параметры */}
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{currentReading.totalPower} кВт</div>
                <div className="text-sm text-gray-600 mt-1">Общая мощность</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{currentReading.totalEnergy.toLocaleString()} кВт⋅ч</div>
                <div className="text-sm text-gray-600 mt-1">Всего энергии</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">{currentReading.frequency} Гц</div>
                <div className="text-sm text-gray-600 mt-1">Частота</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Показания по фазам */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Показания по фазам</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Фаза</th>
                    <th className="text-center py-3 px-4">Напряжение</th>
                    <th className="text-center py-3 px-4">Ток</th>
                  </tr>
                </thead>
                <tbody>
                  {currentReading.phases.map((phase) => (
                    <tr key={phase.phase} className="border-b last:border-0">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            phase.phase === 'L1' ? 'bg-red-500' :
                            phase.phase === 'L2' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`} />
                          <span className="font-medium">Фаза {phase.phase}</span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">
                        <div className={`inline-block text-lg font-bold border-2 rounded-lg py-2 px-3 ${getPhaseColor(phase.phase)}`}>
                          {formatVoltage(phase.voltage)} В
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">
                        <div className={`inline-block text-lg font-bold border-2 rounded-lg py-2 px-3 ${getPhaseColor(phase.phase)}`}>
                          {formatCurrent(phase.current)} А
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* График напряжения */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Icon name="TrendingUp" size={20} />
              График напряжения по фазам
            </CardTitle>
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
          <p className="text-sm text-gray-500">
            {getPeriodLabel(selectedPeriod)} • Обновлено: {new Date().toLocaleTimeString('ru-RU')}
          </p>
        </CardHeader>
        <CardContent>
          {/* Легенда */}
          <div className="flex justify-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-sm">Фаза L1</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <span className="text-sm">Фаза L2</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-sm">Фаза L3</span>
            </div>
          </div>

          {/* Интерактивный график в виде SVG */}
          <div className="w-full h-80 border rounded-lg bg-gray-50 p-4 relative">
            <svg 
              width="100%" 
              height="100%" 
              viewBox="0 0 800 280"
              className="overflow-visible"
              preserveAspectRatio="none"
            >
              {/* Сетка */}
              <defs>
                <pattern id="grid" width="40" height="28" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 28" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Оси */}
              <line x1="30" y1="260" x2="770" y2="260" stroke="#6b7280" strokeWidth="2" />
              <line x1="30" y1="20" x2="30" y2="260" stroke="#6b7280" strokeWidth="2" />
              
              {/* Подписи осей */}
              <text x="400" y="280" textAnchor="middle" className="text-sm fill-gray-600">Время</text>
              
              {/* Масштаб по Y (200-250В) */}
              {[200, 210, 220, 230, 240, 250].map((voltage, i) => (
                <g key={voltage}>
                  <line x1="25" y1={260 - i * 40} x2="30" y2={260 - i * 40} stroke="#6b7280" strokeWidth="1" />
                  <text x="23" y={264 - i * 40} textAnchor="end" className="text-xs fill-gray-600">{voltage}</text>
                </g>
              ))}
              
              {/* Линии графика */}
              {voltageData.length > 1 && (
                <>
                  {/* L1 - красная */}
                  <polyline
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="2"
                    points={voltageData.map((point, i) => 
                      `${30 + (i * 740 / (voltageData.length - 1))},${260 - ((point.L1 - 200) * 200 / 50)}`
                    ).join(' ')}
                  />
                  
                  {/* L2 - желтая */}
                  <polyline
                    fill="none"
                    stroke="#eab308"
                    strokeWidth="2"
                    points={voltageData.map((point, i) => 
                      `${30 + (i * 740 / (voltageData.length - 1))},${260 - ((point.L2 - 200) * 200 / 50)}`
                    ).join(' ')}
                  />
                  
                  {/* L3 - синяя */}
                  <polyline
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2"
                    points={voltageData.map((point, i) => 
                      `${30 + (i * 740 / (voltageData.length - 1))},${260 - ((point.L3 - 200) * 200 / 50)}`
                    ).join(' ')}
                  />
                </>
              )}

              {/* Невидимая область для отслеживания мыши поверх графика */}
              <rect
                x="30"
                y="20"
                width="740"
                height="240"
                fill="transparent"
                onMouseMove={(e) => {
                  const svg = e.currentTarget.closest('svg')!;
                  const svgRect = svg.getBoundingClientRect();
                  // Получаем точную позицию мыши относительно SVG
                  const mouseX = ((e.clientX - svgRect.left) / svgRect.width) * 800;
                  
                  // Ограничиваем область действия графика
                  if (mouseX >= 30 && mouseX <= 770) {
                    // Вычисляем индекс данных на основе позиции мыши в области графика
                    const relativeX = mouseX - 30; // Смещение относительно начала графика
                    const dataIndex = Math.round((relativeX / 740) * (voltageData.length - 1));
                    
                    if (dataIndex >= 0 && dataIndex < voltageData.length) {
                      // Точная позиция линии на основе индекса данных
                      const actualX = 30 + (dataIndex * 740 / (voltageData.length - 1));
                      setHoveredPoint({
                        x: actualX,
                        y: 140,
                        data: voltageData[dataIndex],
                        index: dataIndex
                      });
                    }
                  }
                }}
                onMouseLeave={() => setHoveredPoint(null)}
              />

              {/* Вертикальная линия при наведении */}
              {hoveredPoint && (
                <line
                  x1={hoveredPoint.x}
                  y1="20"
                  x2={hoveredPoint.x}
                  y2="260"
                  stroke="#6b7280"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                  opacity="0.7"
                />
              )}

              {/* Точки на линиях при наведении */}
              {hoveredPoint && voltageData.length > 0 && (
                <>
                  {/* Точка L1 */}
                  <circle
                    cx={hoveredPoint.x}
                    cy={260 - ((hoveredPoint.data.L1 - 200) * 200 / 50)}
                    r="4"
                    fill="#dc2626"
                    stroke="white"
                    strokeWidth="2"
                  />
                  {/* Точка L2 */}
                  <circle
                    cx={hoveredPoint.x}
                    cy={260 - ((hoveredPoint.data.L2 - 200) * 200 / 50)}
                    r="4"
                    fill="#eab308"
                    stroke="white"
                    strokeWidth="2"
                  />
                  {/* Точка L3 */}
                  <circle
                    cx={hoveredPoint.x}
                    cy={260 - ((hoveredPoint.data.L3 - 200) * 200 / 50)}
                    r="4"
                    fill="#2563eb"
                    stroke="white"
                    strokeWidth="2"
                  />
                </>
              )}
              
              {/* Подписи времени */}
              {voltageData.length > 0 && selectedPeriod !== '7d' && (
                <>
                  <text x="30" y="275" textAnchor="start" className="text-xs fill-gray-600">
                    {voltageData[0].time}
                  </text>
                  <text x="770" y="275" textAnchor="end" className="text-xs fill-gray-600">
                    {voltageData[voltageData.length - 1].time}
                  </text>
                </>
              )}
            </svg>

            {/* Тултип с данными */}
            {hoveredPoint && (
              <div
                className="absolute pointer-events-none bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-10 min-w-[120px]"
                style={{
                  // Позиционируем тултип относительно SVG контейнера с учетом новой ширины
                  left: `${(hoveredPoint.x / 800) * 100}%`,
                  top: 10,
                  transform: hoveredPoint.x > 400 ? 'translateX(-100%)' : 'translateX(10px)'
                }}
              >
                <div className="text-xs font-semibold text-gray-700 mb-2">
                  {hoveredPoint.data.time}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-xs font-mono">L1: {formatVoltage(hoveredPoint.data.L1)} В</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-xs font-mono">L2: {formatVoltage(hoveredPoint.data.L2)} В</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-xs font-mono">L3: {formatVoltage(hoveredPoint.data.L3)} В</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Статистика по периоду - вычисляем один раз */}
          <div className="mt-6 pt-6 border-t">
            <div className="grid grid-cols-3 gap-6 text-center">
              {(() => {
                const avgL1 = voltageData.reduce((sum, p) => sum + p.L1, 0) / voltageData.length;
                const avgL2 = voltageData.reduce((sum, p) => sum + p.L2, 0) / voltageData.length;
                const avgL3 = voltageData.reduce((sum, p) => sum + p.L3, 0) / voltageData.length;
                
                return (
                  <>
                    <div>
                      <div className="text-lg font-semibold text-red-600">
                        {formatVoltage(avgL1)} В
                      </div>
                      <div className="text-sm text-gray-600">Среднее L1</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-yellow-600">
                        {formatVoltage(avgL2)} В
                      </div>
                      <div className="text-sm text-gray-600">Среднее L2</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-blue-600">
                        {formatVoltage(avgL3)} В
                      </div>
                      <div className="text-sm text-gray-600">Среднее L3</div>
                    </div>
                  </>
                );
              })()} 
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Дополнительные действия */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Settings" size={20} />
            Действия с прибором учета
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Icon name="Download" size={16} />
              Экспорт данных
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}