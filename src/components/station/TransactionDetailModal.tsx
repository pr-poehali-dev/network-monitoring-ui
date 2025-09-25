import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';

interface Transaction {
  id: string;
  connector: number;
  energy: number;
  duration: string;
  status: string;
  startTime: string;
  endTime: string;
}

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

// Генерируем заглушечные данные для графиков
const generateMockData = (points: number, baseValue: number, variance: number) => {
  return Array.from({ length: points }, (_, i) => {
    const time = `${String(Math.floor(i / 4) + 14).padStart(2, '0')}:${String((i % 4) * 15).padStart(2, '0')}`;
    const randomVariance = (Math.random() - 0.5) * variance;
    return {
      time,
      value: Math.max(0, baseValue + randomVariance + Math.sin(i * 0.3) * variance * 0.3)
    };
  });
};

const generateEnergyData = (points: number, totalEnergy: number) => {
  return Array.from({ length: points }, (_, i) => {
    const time = `${String(Math.floor(i / 4) + 14).padStart(2, '0')}:${String((i % 4) * 15).padStart(2, '0')}`;
    const progress = i / (points - 1);
    // S-образная кривая для более реалистичного накопления энергии
    const energyProgress = progress < 0.1 ? progress * 2 : 
                          progress > 0.9 ? 0.2 + (progress - 0.1) * 0.5 : 
                          0.2 + (progress - 0.1) * 1.0;
    return {
      time,
      value: totalEnergy * Math.min(1, energyProgress)
    };
  });
};

const generateSOCData = (points: number) => {
  return Array.from({ length: points }, (_, i) => {
    const time = `${String(Math.floor(i / 4) + 14).padStart(2, '0')}:${String((i % 4) * 15).padStart(2, '0')}`;
    const progress = i / (points - 1);
    // SOC растет от 20% до 85% с замедлением к концу
    const socProgress = 20 + (85 - 20) * (1 - Math.pow(1 - progress, 1.5));
    return {
      time,
      value: Math.round(socProgress * 10) / 10
    };
  });
};

export default function TransactionDetailModal({ transaction, isOpen, onClose }: TransactionDetailModalProps) {
  if (!transaction) return null;

  // Генерируем данные на основе транзакции
  const powerData = generateMockData(20, 22, 4);
  const energyData = generateEnergyData(20, transaction.energy);
  const currentData = generateMockData(20, 28, 6);
  const voltageData = generateMockData(20, 400, 15);
  const socData = generateSOCData(20);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Icon name="CreditCard" size={24} className="text-blue-500" />
            Детали транзакции #{transaction.id}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Основная информация */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Icon name="Zap" size={14} />
                  Коннектор
                </div>
                <div className="text-lg font-semibold">Коннектор {transaction.connector}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Icon name="Battery" size={14} />
                  Энергия
                </div>
                <div className="text-lg font-semibold text-green-600">{transaction.energy} кВт⋅ч</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Icon name="Clock" size={14} />
                  Длительность
                </div>
                <div className="text-lg font-semibold">{transaction.duration}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Icon name="CheckCircle" size={14} />
                  Статус
                </div>
                <div className={`text-sm px-2 py-1 rounded-full font-medium ${
                  transaction.status.includes('Успешно') || transaction.status === 'Автоматически' ? 'bg-green-100 text-green-700' :
                  transaction.status.includes('Прервана') ? 'bg-red-100 text-red-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {transaction.status}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Временные метки */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Временная линия</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Время начала</div>
                  <div className="font-medium">{transaction.startTime}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Время завершения</div>
                  <div className="font-medium">{transaction.endTime}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Графики - каждый на полную ширину */}
          <div className="space-y-6">
            {/* График мощности */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon name="Zap" size={16} className="text-blue-500" />
                  Мощность (кВт)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={powerData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis 
                        dataKey="time" 
                        stroke="#666"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        stroke="#666"
                        tick={{ fontSize: 12 }}
                        domain={['dataMin - 2', 'dataMax + 2']}
                      />
                      <Tooltip 
                        labelStyle={{ color: '#333' }}
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #ccc',
                          borderRadius: '4px'
                        }}
                        formatter={(value: number) => [`${value.toFixed(1)} кВт`, 'Мощность']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* График энергии */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon name="Battery" size={16} className="text-green-500" />
                  Переданная энергия (кВт⋅ч)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={energyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis 
                        dataKey="time" 
                        stroke="#666"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        stroke="#666"
                        tick={{ fontSize: 12 }}
                        domain={[0, 'dataMax + 5']}
                      />
                      <Tooltip 
                        labelStyle={{ color: '#333' }}
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #ccc',
                          borderRadius: '4px'
                        }}
                        formatter={(value: number) => [`${value.toFixed(1)} кВт⋅ч`, 'Энергия']}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* График тока */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon name="Activity" size={16} className="text-orange-500" />
                  Ток (А)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={currentData} barCategoryGap="10%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis 
                        dataKey="time" 
                        stroke="#666"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        stroke="#666"
                        tick={{ fontSize: 12 }}
                        domain={['dataMin - 2', 'dataMax + 2']}
                      />
                      <Tooltip 
                        labelStyle={{ color: '#333' }}
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #ccc',
                          borderRadius: '4px'
                        }}
                        formatter={(value: number) => [`${value.toFixed(1)} А`, 'Ток']}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#f97316"
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* График напряжения */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon name="Gauge" size={16} className="text-purple-500" />
                  Напряжение (В)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={voltageData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis 
                        dataKey="time" 
                        stroke="#666"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        stroke="#666"
                        tick={{ fontSize: 12 }}
                        domain={['dataMin - 10', 'dataMax + 10']}
                      />
                      <Tooltip 
                        labelStyle={{ color: '#333' }}
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #ccc',
                          borderRadius: '4px'
                        }}
                        formatter={(value: number) => [`${value.toFixed(0)} В`, 'Напряжение']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#a855f7" 
                        strokeWidth={2}
                        dot={{ fill: '#a855f7', strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 5, stroke: '#a855f7', strokeWidth: 2, fill: '#fff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* График SOC батареи */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon name="BatteryCharging" size={16} className="text-blue-600" />
                  Заряд АКБ (SOC, %)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={socData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis 
                        dataKey="time" 
                        stroke="#666"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        stroke="#666"
                        tick={{ fontSize: 12 }}
                        domain={[15, 90]}
                      />
                      <Tooltip 
                        labelStyle={{ color: '#333' }}
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #ccc',
                          borderRadius: '4px'
                        }}
                        formatter={(value: number) => [`${value.toFixed(1)}%`, 'SOC']}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#2563eb"
                        fill="#2563eb"
                        fillOpacity={0.3}
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Кнопка закрытия */}
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Закрыть
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}