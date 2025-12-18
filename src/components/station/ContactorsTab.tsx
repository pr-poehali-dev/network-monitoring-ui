import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { wsService } from '@/services/websocket';
import { ContactorsData } from '@/types/websocket';

interface ContactorsTabProps {
  serialNumber: string;
}

export default function ContactorsTab({ serialNumber }: ContactorsTabProps) {
  const [data, setData] = useState<ContactorsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContactors();
  }, [serialNumber]);

  const loadContactors = async () => {
    setLoading(true);
    try {
      const result = await wsService.getContactorsStatus(serialNumber);
      setData(result);
    } catch (err) {
      console.error('Error loading contactors:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-500">Загрузка данных...</div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.contactors.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-500">Нет данных о контакторах</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Power" size={20} />
            Состояние контакторов
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Контактор
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Вход (IN)
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Выход (OUT)
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.contactors.map((contactor, idx) => (
                  <tr 
                    key={contactor.id} 
                    className={`border-b ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                  >
                    <td className="py-3 px-4 text-sm font-medium text-gray-700">
                      Контактор {contactor.id}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center">
                        <div className={`w-4 h-4 rounded-full ${contactor.in ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center">
                        <div className={`w-4 h-4 rounded-full ${contactor.out ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Всего контакторов:</span>
              <span className="ml-2 font-medium">{data.contactorsCount}</span>
            </div>
            <div>
              <span className="text-gray-500">Всего сигналов:</span>
              <span className="ml-2 font-medium">{data.signalsCount}</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Активен (ON)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                <span className="text-sm text-gray-700">Неактивен (OFF)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
