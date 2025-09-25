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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">ДОСТУПНОСТЬ</div>
              <div className="text-2xl font-bold text-gray-900">79.547 %</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">ВРЕМЯ OFFLINE</div>
              <div className="text-2xl font-bold text-gray-900">34:28:54</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">ВРЕМЯ ONLINE</div>
              <div className="text-2xl font-bold text-gray-900">134:06:34</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">ОБЩЕЕ ВРЕМЯ</div>
              <div className="text-2xl font-bold text-gray-900">168:35:29</div>
            </div>
          </div>

          {/* График доступности */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Доступность</h3>
            <div className="relative">
              {/* Ось Y с метками времени */}
              <div className="absolute left-0 top-0 h-48 flex flex-col justify-between text-xs text-gray-500 pr-2">
                <span>1 ч</span>
                <span>45 м</span>
                <span>30 м</span>
                <span>15 м</span>
                <span>0 м</span>
              </div>
              
              {/* График */}
              <div className="ml-8">
                <div className="flex items-end h-48 gap-px">
                  {/* Данные за неделю - каждая полоска представляет час */}
                  {Array.from({ length: 168 }, (_, i) => {
                    // Симуляция данных доступности по часам
                    const day = Math.floor(i / 24);
                    const hour = i % 24;
                    
                    let isOffline = false;
                    
                    // 20 сентября (день 1) - короткий сбой вечером
                    if (day === 1 && hour >= 18 && hour <= 20) {
                      isOffline = true;
                    }
                    // 22 сентября (день 3) - долгий сбой с утра до вечера
                    else if (day === 3 && hour >= 8 && hour <= 20) {
                      isOffline = true;
                    }
                    // 24 сентября (день 5) - короткие сбои
                    else if (day === 5 && ((hour >= 14 && hour <= 16) || (hour >= 20 && hour <= 22))) {
                      isOffline = true;
                    }
                    
                    const height = isOffline ? Math.random() * 40 + 10 : 90;
                    
                    return (
                      <div
                        key={i}
                        className={`flex-1 min-w-[2px] rounded-sm ${
                          isOffline ? 'bg-red-500' : 'bg-green-400'
                        }`}
                        style={{ height: `${height}%` }}
                        title={`День ${day + 1}, час ${hour}: ${isOffline ? 'Offline' : 'Online'}`}
                      />
                    );
                  })}
                </div>
                
                {/* Ось X с датами */}
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>19 сент.</span>
                  <span>19 сент.</span>
                  <span>20 сент.</span>
                  <span>21 сент.</span>
                  <span>22 сент.</span>
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

          {/* Дополнительная информация */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <h4 className="font-semibold mb-2">Статистика сбоев</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Количество сбоев:</span>
                  <span className="font-medium">4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Средняя длительность:</span>
                  <span className="font-medium">8ч 37м</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Самый долгий сбой:</span>
                  <span className="font-medium">12ч 45м</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Целевые показатели</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Цель доступности:</span>
                  <span className="font-medium text-green-600">95%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Текущий результат:</span>
                  <span className="font-medium text-red-600">79.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">До цели:</span>
                  <span className="font-medium">-15.5%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}