import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { wsService } from '@/services/websocket';

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
  serialNumber?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionDetailModal({ transaction, serialNumber, isOpen, onClose }: TransactionDetailModalProps) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transaction && serialNumber && isOpen) {
      setLoading(true);
      wsService.getTransactionDetails(serialNumber, transaction.transactionId)
        .then(data => {
          setDetails(data);
        })
        .catch(err => {
          console.error('Error loading transaction details:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [transaction, serialNumber, isOpen]);

  if (!transaction) return null;

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatChartData = (metrics: any[]) => {
    return metrics.map(m => ({
      time: formatTime(m.time),
      value: m.value
    }));
  };

  const txDetails = details?.transaction;
  const metrics = details?.metrics;

  const durationSec = txDetails?.durationSec ?? transaction.durationSec;
  const startTime = txDetails ? new Date(txDetails.startTime).toLocaleString('ru-RU') : new Date(new Date(transaction.time).getTime() - transaction.durationSec * 1000).toLocaleString('ru-RU');
  const endTime = txDetails ? new Date(txDetails.endTime).toLocaleString('ru-RU') : new Date(transaction.time).toLocaleString('ru-RU');
  const startSOC = txDetails?.startSoc;
  const endSOC = txDetails?.endSoc;
  const peakPower = txDetails?.peakPowerKw;
  const energyKwh = txDetails?.energyKwh ?? transaction.energyKwh;
  const duration = `${Math.floor(durationSec / 3600)}ч ${Math.floor((durationSec % 3600) / 60)}м`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Icon name="Activity" size={24} className="text-blue-500" />
            Детали зарядной сессии #{transaction.transactionId}
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="py-12 text-center text-gray-500">Загрузка данных...</div>
        ) : (
          <div className="space-y-6">
            {/* Основная информация */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-xs text-gray-600 mb-1">Время начала</div>
                  <div className="text-sm font-semibold">{startTime}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-xs text-gray-600 mb-1">Время завершения</div>
                  <div className="text-sm font-semibold">{endTime}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-xs text-gray-600 mb-1">Начальный процент</div>
                  <div className="text-sm font-semibold text-orange-600">
                    {startSOC !== null && startSOC !== undefined ? `${startSOC}%` : 'Нет данных'}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-xs text-gray-600 mb-1">Конечный процент</div>
                  <div className="text-sm font-semibold text-green-600">
                    {endSOC !== null && endSOC !== undefined ? `${endSOC}%` : 'Нет данных'}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-xs text-gray-600 mb-1">Пиковая мощность</div>
                  <div className="text-sm font-semibold text-blue-600">
                    {peakPower !== null && peakPower !== undefined && peakPower > 0 ? `${peakPower.toFixed(1)} кВт` : 'Нет данных'}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-xs text-gray-600 mb-1">Причина завершения</div>
                  <div className="text-sm font-semibold">{transaction.reason || 'Нет данных'}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-xs text-gray-600 mb-1">Переданная энергия</div>
                  <div className="text-sm font-semibold text-green-600">
                    {energyKwh > 0 ? `${energyKwh.toFixed(2)} кВт⋅ч` : 'Нет данных'}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-xs text-gray-600 mb-1">Длительность</div>
                  <div className="text-sm font-semibold">{duration}</div>
                </CardContent>
              </Card>
            </div>

            {/* Графики */}
            {metrics && (
              <div className="space-y-4">
                {/* График тока */}
                {metrics.current && metrics.current.length > 0 && (
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
                          <LineChart data={formatChartData(metrics.current)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="time" 
                              tick={{ fontSize: 12 }}
                              stroke="#9ca3af"
                            />
                            <YAxis 
                              tick={{ fontSize: 12 }}
                              stroke="#9ca3af"
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
                              dataKey="value" 
                              stroke="#eab308" 
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* График напряжения */}
                {metrics.voltage && metrics.voltage.length > 0 && (
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
                          <LineChart data={formatChartData(metrics.voltage)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="time" 
                              tick={{ fontSize: 12 }}
                              stroke="#9ca3af"
                            />
                            <YAxis 
                              tick={{ fontSize: 12 }}
                              stroke="#9ca3af"
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
                              dataKey="value" 
                              stroke="#a855f7" 
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* График процента заряда */}
                {metrics.soc && metrics.soc.length > 0 && (
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
                          <LineChart data={formatChartData(metrics.soc)}>
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
                              dataKey="value" 
                              stroke="#22c55e" 
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* График мощности */}
                {metrics.power && metrics.power.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Icon name="Gauge" size={16} className="text-blue-500" />
                        Мощность (Вт)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={formatChartData(metrics.power)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="time" 
                              tick={{ fontSize: 12 }}
                              stroke="#9ca3af"
                            />
                            <YAxis 
                              tick={{ fontSize: 12 }}
                              stroke="#9ca3af"
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
                              dataKey="value" 
                              stroke="#3b82f6" 
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* График переданной энергии */}
                {metrics.energy && metrics.energy.length > 0 && (
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
                          <LineChart data={formatChartData(metrics.energy)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="time" 
                              tick={{ fontSize: 12 }}
                              stroke="#9ca3af"
                            />
                            <YAxis 
                              tick={{ fontSize: 12 }}
                              stroke="#9ca3af"
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
                              dataKey="value" 
                              stroke="#10b981" 
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Кнопка закрытия */}
            <div className="flex justify-end">
              <Button onClick={onClose} variant="outline">
                Закрыть
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}