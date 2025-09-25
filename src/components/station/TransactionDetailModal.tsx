import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

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

export default function TransactionDetailModal({ transaction, isOpen, onClose }: TransactionDetailModalProps) {
  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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

          {/* Графики */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* График мощности */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon name="Zap" size={16} className="text-blue-500" />
                  Мощность (кВт)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Icon name="TrendingUp" size={32} className="mx-auto mb-2" />
                    <p className="text-sm">График мощности</p>
                    <p className="text-xs">Пиковая мощность: 22.5 кВт</p>
                  </div>
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
                <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Icon name="BarChart3" size={32} className="mx-auto mb-2" />
                    <p className="text-sm">Накопительный график энергии</p>
                    <p className="text-xs">Итого: {transaction.energy} кВт⋅ч</p>
                  </div>
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
                <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Icon name="LineChart" size={32} className="mx-auto mb-2" />
                    <p className="text-sm">График тока</p>
                    <p className="text-xs">Максимальный ток: 32 А</p>
                  </div>
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
                <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Icon name="LineChart" size={32} className="mx-auto mb-2" />
                    <p className="text-sm">График напряжения</p>
                    <p className="text-xs">Среднее напряжение: 400 В</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* График SOC батареи */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon name="BatteryCharging" size={16} className="text-blue-600" />
                  Заряд АКБ (SOC, %)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Icon name="TrendingUp" size={32} className="mx-auto mb-2" />
                    <p className="text-sm">График заряда батареи</p>
                    <p className="text-xs">Начальный SOC: 20% → Конечный SOC: 85%</p>
                  </div>
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