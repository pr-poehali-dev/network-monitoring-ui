import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Transaction {
  time: string;
  connectorId: number;
  transactionId: number;
  energyKwh: number;
  durationSec: number;
  success: boolean;
  reason: string;
}

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

const generateMockChartData = (points: number = 30) => {
  return Array.from({ length: points }, (_, i) => {
    const progress = i / (points - 1);
    const minutes = Math.floor(progress * 120);
    
    return {
      time: `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`,
      current: 25 + Math.random() * 10 + (progress > 0.8 ? -15 * (progress - 0.8) * 5 : 0),
      voltage: 395 + Math.random() * 15,
      soc: 20 + progress * 65,
      power: 20 + Math.random() * 8 + (progress > 0.8 ? -10 * (progress - 0.8) * 5 : 0),
      energy: progress * 45
    };
  });
};

export default function TransactionDetailModal({ transaction, isOpen, onClose }: TransactionDetailModalProps) {
  if (!transaction) return null;

  const chartData = generateMockChartData();
  const mockData = {
    startTime: new Date(new Date(transaction.time).getTime() - transaction.durationSec * 1000).toLocaleString('ru-RU'),
    endTime: new Date(transaction.time).toLocaleString('ru-RU'),
    startSOC: 20,
    endSOC: 85,
    peakPower: 28.5,
    duration: `${Math.floor(transaction.durationSec / 3600)}ч ${Math.floor((transaction.durationSec % 3600) / 60)}м`
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Icon name="Activity" size={24} className="text-blue-500" />
            Детали зарядной сессии #{transaction.transactionId}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Основная информация */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-gray-600 mb-1">Время начала</div>
                <div className="text-sm font-semibold">{mockData.startTime}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-gray-600 mb-1">Время завершения</div>
                <div className="text-sm font-semibold">{mockData.endTime}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-gray-600 mb-1">Начальный процент</div>
                <div className="text-sm font-semibold text-orange-600">{mockData.startSOC}%</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-gray-600 mb-1">Конечный процент</div>
                <div className="text-sm font-semibold text-green-600">{mockData.endSOC}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-gray-600 mb-1">Пиковая мощность</div>
                <div className="text-sm font-semibold text-blue-600">{mockData.peakPower} кВт</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-gray-600 mb-1">Причина завершения</div>
                <div className="text-sm font-semibold">{transaction.reason}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-gray-600 mb-1">Переданная энергия</div>
                <div className="text-sm font-semibold text-green-600">{transaction.energyKwh.toFixed(2)} кВт⋅ч</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-gray-600 mb-1">Длительность</div>
                <div className="text-sm font-semibold">{mockData.duration}</div>
              </CardContent>
            </Card>
          </div>

          {/* Графики */}
          <div className="space-y-4">
            {/* График тока */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon name="Zap" size={16} className="text-yellow-500" />
                  Ток (А)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 w-full">
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
                        domain={[0, 40]}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="current" 
                        stroke="#eab308" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* График напряжения */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon name="Activity" size={16} className="text-purple-500" />
                  Напряжение (В)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 w-full">
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
                        domain={[380, 420]}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="voltage" 
                        stroke="#a855f7" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* График процента заряда */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon name="Battery" size={16} className="text-green-500" />
                  Процент заряда авто (%)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 w-full">
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
                        domain={[0, 100]}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="soc" 
                        stroke="#22c55e" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* График мощности */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon name="Gauge" size={16} className="text-blue-500" />
                  Мощность (кВт)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 w-full">
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
                        domain={[0, 35]}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="power" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* График переданной энергии */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon name="TrendingUp" size={16} className="text-emerald-500" />
                  Переданная энергия (кВт⋅ч)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 w-full">
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
                        domain={[0, 50]}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="energy" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Кнопка закрытия */}
          <div className="flex justify-end">
            <Button onClick={onClose} variant="outline">
              Закрыть
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
