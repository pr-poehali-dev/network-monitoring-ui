import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function ErrorsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="AlertTriangle" size={20} className="text-red-500" />
          Ошибки станции
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Приоритет</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm min-w-[300px]">Ошибка</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Коннектор</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Длительность</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Время начала</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-l-4 border-l-red-500 bg-red-50/30 hover:bg-red-50/50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Icon name="AlertTriangle" size={14} className="text-red-500" />
                    <Badge variant="destructive" className="text-xs">
                      КРИТИЧНАЯ
                    </Badge>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div>
                    <div className="font-medium text-gray-900 text-sm mb-1">Коннектор 1 недоступен</div>
                    <div className="text-xs text-gray-600">Нет связи с зарядным контроллером</div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Icon name="Zap" size={12} className="text-gray-400" />
                    <span className="text-sm text-gray-900">Коннектор 1</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm font-medium text-red-600">2ч 15м</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-xs text-gray-500">25.09.2025 13:45:00</div>
                </td>
              </tr>
              <tr className="border-b border-l-4 border-l-orange-500 bg-orange-50/30 hover:bg-orange-50/50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Icon name="AlertCircle" size={14} className="text-orange-500" />
                    <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-200">
                      ВНИМАНИЕ
                    </Badge>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div>
                    <div className="font-medium text-gray-900 text-sm mb-1">Высокая температура коннектора</div>
                    <div className="text-xs text-gray-600">Температура превысила 65°C, требуется охлаждение</div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Icon name="Zap" size={12} className="text-gray-400" />
                    <span className="text-sm text-gray-900">Коннектор 2</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm font-medium text-orange-600">45м</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-xs text-gray-500">25.09.2025 15:15:00</div>
                </td>
              </tr>
              <tr className="border-b border-l-4 border-l-orange-500 bg-orange-50/30 hover:bg-orange-50/50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Icon name="AlertCircle" size={14} className="text-orange-500" />
                    <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-200">
                      ВНИМАНИЕ
                    </Badge>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div>
                    <div className="font-medium text-gray-900 text-sm mb-1">Низкий заряд резервного источника</div>
                    <div className="text-xs text-gray-600">Уровень заряда UPS составляет 15%</div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Icon name="Battery" size={12} className="text-gray-400" />
                    <span className="text-sm text-gray-900">UPS модуль</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm font-medium text-orange-600">1ч 40м</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-xs text-gray-500">25.09.2025 14:20:00</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}