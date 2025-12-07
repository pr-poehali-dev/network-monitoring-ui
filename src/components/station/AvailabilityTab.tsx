import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useUptimeBuckets } from '@/hooks/useWebSocket';

interface TooltipData {
  interval: number;
  startTime: string;
  endTime: string;
  onlineMinutes: number;
  offlineMinutes: number;
  x: number;
  y: number;
}

interface AvailabilityTabProps {
  serialNumber: string;
}

export default function AvailabilityTab({ serialNumber }: AvailabilityTabProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const { buckets, loading, loadBuckets } = useUptimeBuckets(serialNumber);

  useEffect(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    loadBuckets(weekAgo.toISOString(), now.toISOString(), 120);
  }, [loadBuckets]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const secs = Math.floor((minutes - Math.floor(minutes)) * 60);
    
    if (hours > 0) {
      return `${hours} час${hours > 1 ? 'а' : ''}, ${mins} минут${mins > 1 ? 'ы' : ''}`;
    } else if (mins > 0) {
      return `${mins} минут${mins > 1 ? 'ы' : ''}, ${secs} секунд${secs > 1 ? 'ы' : 'а'}`;
    } else {
      return `${secs} секунд${secs > 1 ? 'ы' : 'а'}`;
    }
  };

  const totalOnlineMs = buckets.reduce((sum, b) => sum + b.onlineMs, 0);
  const totalOfflineMs = buckets.reduce((sum, b) => sum + b.offlineMs, 0);
  const totalMs = totalOnlineMs + totalOfflineMs;
  const availabilityPercent = totalMs > 0 ? ((totalOnlineMs / totalMs) * 100).toFixed(3) : '0.000';

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">Загрузка данных...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon name="Clock" size={20} />
            Доступность за неделю
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Метрики за неделю */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-left">
              <div className="text-sm text-gray-600 mb-2">ДОСТУПНОСТЬ</div>
              <div className="text-3xl font-bold text-gray-900">{availabilityPercent} %</div>
            </div>
            <div className="text-left">
              <div className="text-sm text-gray-600 mb-2">ВРЕМЯ OFFLINE</div>
              <div className="text-3xl font-bold text-red-600">{formatDuration(totalOfflineMs)}</div>
            </div>
            <div className="text-left">
              <div className="text-sm text-gray-600 mb-2">ВРЕМЯ ONLINE</div>
              <div className="text-3xl font-bold text-green-600">{formatDuration(totalOnlineMs)}</div>
            </div>
            <div className="text-left">
              <div className="text-sm text-gray-600 mb-2">ОБЩЕЕ ВРЕМЯ</div>
              <div className="text-3xl font-bold text-gray-900">{formatDuration(totalMs)}</div>
            </div>
          </div>

          {/* График доступности */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Доступность</h3>
            <div className="relative">
              {/* Ось Y с метками времени */}
              <div className="absolute left-0 top-0 h-48 flex flex-col justify-between text-xs text-gray-500 pr-2">
                <span>2 ч</span>
                <span>1 ч</span>
                <span>33 м</span>
                <span></span>
                <span>0 м</span>
              </div>
              
              {/* График */}
              <div className="ml-8">
                <div className="flex items-end h-48 gap-px relative">
                  {buckets.map((bucket, i) => {
                    const formatDateTime = (isoString: string) => {
                      const date = new Date(isoString);
                      const day = String(date.getDate()).padStart(2, '0');
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const year = date.getFullYear();
                      const hour = String(date.getHours()).padStart(2, '0');
                      const minute = String(date.getMinutes()).padStart(2, '0');
                      const second = String(date.getSeconds()).padStart(2, '0');
                      return `${day}.${month}.${year}, ${hour}:${minute}:${second}`;
                    };
                    
                    const onlineMinutes = bucket.onlineMs / 60000;
                    const offlineMinutes = bucket.offlineMs / 60000;
                    const totalMinutes = onlineMinutes + offlineMinutes;
                    
                    const onlinePercent = totalMinutes > 0 ? (onlineMinutes / totalMinutes) * 100 : 0;
                    const offlinePercent = totalMinutes > 0 ? (offlineMinutes / totalMinutes) * 100 : 0;
                    
                    return (
                      <div
                        key={i}
                        className="flex-1 min-w-[3px] flex flex-col justify-end cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ height: '100%' }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({
                            interval: i,
                            startTime: formatDateTime(bucket.from),
                            endTime: formatDateTime(bucket.to),
                            onlineMinutes,
                            offlineMinutes,
                            x: rect.left + rect.width / 2,
                            y: rect.top - 10
                          });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      >
                        {/* Красная часть (offline) сверху */}
                        {offlinePercent > 0 && (
                          <div
                            className="bg-red-500 w-full"
                            style={{ height: `${offlinePercent}%` }}
                          />
                        )}
                        {/* Зеленая часть (online) снизу */}
                        {onlinePercent > 0 && (
                          <div
                            className="bg-green-400 w-full"
                            style={{ height: `${onlinePercent}%` }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Ось X с датами */}
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  {buckets.length > 0 && (() => {
                    const days: string[] = [];
                    let lastDate = '';
                    const monthNames = ['янв.', 'фев.', 'мар.', 'апр.', 'мая', 'июн.', 'июл.', 'авг.', 'сен.', 'окт.', 'ноя.', 'дек.'];
                    
                    buckets.forEach((bucket) => {
                      const date = new Date(bucket.from);
                      const dateStr = `${date.getDate()} ${monthNames[date.getMonth()]}`;
                      if (dateStr !== lastDate) {
                        days.push(dateStr);
                        lastDate = dateStr;
                      }
                    });
                    
                    return days.map((day, idx) => <span key={idx}>{day}</span>);
                  })()}
                </div>
              </div>
            </div>
            
            {/* Легенда */}
            <div className="flex items-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
                <span className="text-gray-600">Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                <span className="text-gray-600">Offline</span>
              </div>
            </div>
          </div>

          {/* Статистика сбоев */}
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-4">Статистика сбоев</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 mb-1">4</div>
                <div className="text-sm text-gray-600">Количество сбоев</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">8ч 37м</div>
                <div className="text-sm text-gray-600">Средняя длительность</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-700 mb-1">12ч 45м</div>
                <div className="text-sm text-gray-600">Самый долгий сбой</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed bg-purple-100 border border-purple-200 rounded-lg p-3 shadow-lg z-50 text-sm pointer-events-none"
          style={{
            left: tooltip.x - 100,
            top: tooltip.y - 120,
            minWidth: '200px'
          }}
        >
          <div className="space-y-1">
            <div className="font-medium text-gray-900">{tooltip.startTime}</div>
            <div className="font-medium text-gray-900">{tooltip.endTime}</div>
            <div className="mt-2 space-y-1">
              <div className="text-gray-700">
                <span className="font-medium">Online:</span> {formatTime(tooltip.onlineMinutes)}
              </div>
              <div className="text-gray-700">
                <span className="font-medium">Offline:</span> {formatTime(tooltip.offlineMinutes)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}