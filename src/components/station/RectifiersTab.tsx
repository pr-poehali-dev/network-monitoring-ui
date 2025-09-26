import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface RectifierModule {
  id: string;
  name: string;
  status: 'active' | 'standby' | 'error' | 'maintenance';
  inputVoltage: number; // AC вход (В)
  outputVoltage: number; // DC выход (В)
  outputCurrent: number; // DC ток (А)
  outputPower: number; // Выходная мощность (кВт)
  efficiency: number; // КПД (%)
  temperature: number; // Температура (°C)
  serialNumber: string;
  lastMaintenance: string;
}

export default function RectifiersTab() {
  // Имитация данных выпрямителей
  const rectifiers: RectifierModule[] = [
    {
      id: '1',
      name: 'Выпрямитель #1',
      status: 'active',
      inputVoltage: 400,
      outputVoltage: 760,
      outputCurrent: 78.5,
      outputPower: 59.7,
      efficiency: 96.2,
      temperature: 42,
      serialNumber: 'REC001-2024',
      lastMaintenance: '15.08.2025'
    },
    {
      id: '2',
      name: 'Выпрямитель #2',
      status: 'active',
      inputVoltage: 400,
      outputVoltage: 762,
      outputCurrent: 65.2,
      outputPower: 49.7,
      efficiency: 95.8,
      temperature: 39,
      serialNumber: 'REC002-2024',
      lastMaintenance: '15.08.2025'
    },
    {
      id: '3',
      name: 'Выпрямитель #3',
      status: 'standby',
      inputVoltage: 400,
      outputVoltage: 758,
      outputCurrent: 0,
      outputPower: 0,
      efficiency: 0,
      temperature: 25,
      serialNumber: 'REC003-2024',
      lastMaintenance: '15.08.2025'
    },
    {
      id: '4',
      name: 'Выпрямитель #4',
      status: 'error',
      inputVoltage: 0,
      outputVoltage: 0,
      outputCurrent: 0,
      outputPower: 0,
      efficiency: 0,
      temperature: 65,
      serialNumber: 'REC004-2024',
      lastMaintenance: '10.08.2025'
    }
  ];

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'standby': return 'Резерв';
      case 'error': return 'Ошибка';
      case 'maintenance': return 'ТО';
      default: return 'Неизвестно';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'standby': return 'secondary';
      case 'error': return 'destructive';
      case 'maintenance': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'standby': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return 'Play';
      case 'standby': return 'Pause';
      case 'error': return 'AlertTriangle';
      case 'maintenance': return 'Wrench';
      default: return 'Help';
    }
  };

  const getTotalPower = () => {
    return rectifiers.reduce((sum, rect) => sum + rect.outputPower, 0);
  };

  const getActiveCount = () => {
    return rectifiers.filter(rect => rect.status === 'active').length;
  };

  const getAverageEfficiency = () => {
    const activeRectifiers = rectifiers.filter(rect => rect.status === 'active');
    if (activeRectifiers.length === 0) return 0;
    return activeRectifiers.reduce((sum, rect) => sum + rect.efficiency, 0) / activeRectifiers.length;
  };

  return (
    <div className="space-y-6">
      {/* Общая информация */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Zap" size={20} />
            Обзор выпрямительных модулей
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{getTotalPower().toFixed(1)} кВт</div>
              <div className="text-sm text-gray-600 mt-1">Общая мощность</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{getActiveCount()}/{rectifiers.length}</div>
              <div className="text-sm text-gray-600 mt-1">Активных модулей</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{getAverageEfficiency().toFixed(1)}%</div>
              <div className="text-sm text-gray-600 mt-1">Средний КПД</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {Math.max(...rectifiers.map(r => r.temperature))}°C
              </div>
              <div className="text-sm text-gray-600 mt-1">Макс. температура</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Детальная информация по модулям */}
      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Состояние выпрямительных модулей</h3>
        
        {rectifiers.map((rectifier) => (
          <Card key={rectifier.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-3">
                  <Icon name={getStatusIcon(rectifier.status)} size={20} 
                        className={rectifier.status === 'active' ? 'text-green-600' : 
                                 rectifier.status === 'standby' ? 'text-blue-600' :
                                 rectifier.status === 'error' ? 'text-red-600' : 'text-yellow-600'} />
                  <span>{rectifier.name}</span>
                  <Badge 
                    variant={getStatusVariant(rectifier.status)}
                    className={getStatusColor(rectifier.status)}
                  >
                    {getStatusLabel(rectifier.status)}
                  </Badge>
                </CardTitle>
                <div className="text-sm text-gray-500">
                  S/N: {rectifier.serialNumber}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {/* Входное напряжение */}
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-700">{rectifier.inputVoltage} В</div>
                  <div className="text-xs text-gray-500 mt-1">AC Вход</div>
                </div>
                
                {/* Выходное напряжение */}
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-700">{rectifier.outputVoltage} В</div>
                  <div className="text-xs text-gray-500 mt-1">DC Выход</div>
                </div>
                
                {/* Выходной ток */}
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-700">{rectifier.outputCurrent} А</div>
                  <div className="text-xs text-gray-500 mt-1">Ток</div>
                </div>
                
                {/* Мощность */}
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-700">{rectifier.outputPower} кВт</div>
                  <div className="text-xs text-gray-500 mt-1">Мощность</div>
                </div>
                
                {/* КПД */}
                <div className="text-center p-3 bg-indigo-50 rounded-lg">
                  <div className="text-lg font-bold text-indigo-700">
                    {rectifier.efficiency > 0 ? `${rectifier.efficiency}%` : '—'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">КПД</div>
                </div>
                
                {/* Температура */}
                <div className={`text-center p-3 rounded-lg ${
                  rectifier.temperature > 60 ? 'bg-red-50' :
                  rectifier.temperature > 45 ? 'bg-yellow-50' : 'bg-green-50'
                }`}>
                  <div className={`text-lg font-bold ${
                    rectifier.temperature > 60 ? 'text-red-700' :
                    rectifier.temperature > 45 ? 'text-yellow-700' : 'text-green-700'
                  }`}>
                    {rectifier.temperature}°C
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Температура</div>
                </div>
              </div>

              {/* Дополнительная информация и действия */}
              <div className="mt-6 pt-4 border-t flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <Icon name="Calendar" size={16} className="inline mr-1" />
                  Последнее ТО: {rectifier.lastMaintenance}
                </div>
                
                <div className="flex gap-2">
                  {rectifier.status === 'active' && (
                    <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                      <Icon name="Pause" size={16} />
                      В резерв
                    </Button>
                  )}
                  
                  {rectifier.status === 'standby' && (
                    <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50">
                      <Icon name="Play" size={16} />
                      Активировать
                    </Button>
                  )}
                  
                  {rectifier.status === 'error' && (
                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                      <Icon name="RotateCcw" size={16} />
                      Перезапуск
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm" className="text-gray-600 border-gray-200 hover:bg-gray-50">
                    <Icon name="Settings" size={16} />
                    Настройки
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Системные действия */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Settings" size={20} />
            Системные действия
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Icon name="Power" size={16} />
              Включить все модули
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Icon name="PowerOff" size={16} />
              Выключить все модули
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Icon name="RotateCcw" size={16} />
              Перезапуск системы
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Icon name="Download" size={16} />
              Экспорт диагностики
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Icon name="AlertTriangle" size={16} />
              Тест системы
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Предупреждения и рекомендации */}
      {rectifiers.some(r => r.status === 'error' || r.temperature > 60) && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <Icon name="AlertTriangle" size={20} />
              Требуется внимание
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rectifiers.filter(r => r.status === 'error').map(rect => (
                <div key={rect.id} className="text-red-700">
                  • {rect.name}: Неисправность модуля - требуется диагностика
                </div>
              ))}
              {rectifiers.filter(r => r.temperature > 60).map(rect => (
                <div key={rect.id} className="text-red-700">
                  • {rect.name}: Высокая температура ({rect.temperature}°C) - проверьте охлаждение
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}