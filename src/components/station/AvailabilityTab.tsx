import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function AvailabilityTab() {
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
              <div className="text-3xl font-bold text-gray-900">79.547 %</div>
            </div>
            <div className="text-left">
              <div className="text-sm text-gray-600 mb-2">ВРЕМЯ OFFLINE</div>
              <div className="text-3xl font-bold text-red-600">34:28:54</div>
            </div>
            <div className="text-left">
              <div className="text-sm text-gray-600 mb-2">ВРЕМЯ ONLINE</div>
              <div className="text-3xl font-bold text-green-600">134:06:34</div>
            </div>
            <div className="text-left">
              <div className="text-sm text-gray-600 mb-2">ОБЩЕЕ ВРЕМЯ</div>
              <div className="text-3xl font-bold text-gray-900">168:35:29</div>
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
                <div className="flex items-end h-48 gap-px">
                  {/* Данные за неделю - каждая полоска представляет 2 часа */}
                  {Array.from({ length: 84 }, (_, i) => {
                    // Каждый интервал = 2 часа (168 часов / 2 = 84 интервала)
                    const day = Math.floor(i / 12); // 12 интервалов по 2 часа в сутках
                    const intervalInDay = i % 12;
                    const startHour = intervalInDay * 2;
                    
                    // Симуляция данных доступности для 2-часового интервала
                    let onlineMinutes = 120; // По умолчанию весь интервал online
                    let offlineMinutes = 0;
                    
                    // 20 сентября (день 1) - сбой с 18:00 до 21:00 (3 часа)
                    if (day === 1 && startHour >= 18 && startHour < 22) {
                      if (startHour === 18) {
                        // 18:00-20:00 - полностью offline
                        onlineMinutes = 0;
                        offlineMinutes = 120;
                      } else if (startHour === 20) {
                        // 20:00-22:00 - 1 час offline, 1 час online
                        onlineMinutes = 60;
                        offlineMinutes = 60;
                      }
                    }
                    
                    // 22 сентября (день 3) - долгий сбой с 8:00 до 20:00
                    else if (day === 3 && startHour >= 8 && startHour < 20) {
                      onlineMinutes = 0;
                      offlineMinutes = 120;
                    }
                    
                    // 24 сентября (день 5) - короткие сбои 14:00-16:00 и 20:00-22:00
                    else if (day === 5) {
                      if (startHour === 14 || startHour === 20) {
                        onlineMinutes = 0;
                        offlineMinutes = 120;
                      }
                    }
                    
                    // Расчет высоты частей (от 0 до 100%)
                    const onlinePercent = (onlineMinutes / 120) * 100;
                    const offlinePercent = (offlineMinutes / 120) * 100;
                    
                    return (
                      <div
                        key={i}
                        className="flex-1 min-w-[3px] flex flex-col justify-end"
                        style={{ height: '100%' }}
                        title={`День ${day + 1}, ${startHour}:00-${startHour + 2}:00: Online ${Math.floor(onlineMinutes/60)}ч ${onlineMinutes%60}м, Offline ${Math.floor(offlineMinutes/60)}ч ${offlineMinutes%60}м`}
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
                  <span>19 сент.</span>
                  <span>20 сент.</span>
                  <span>21 сент.</span>
                  <span>22 сент.</span>
                  <span>23 сент.</span>
                  <span>24 сент.</span>
                  <span>25 сент.</span>
                  <span>26 сент.</span>
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
    </div>
  );
}