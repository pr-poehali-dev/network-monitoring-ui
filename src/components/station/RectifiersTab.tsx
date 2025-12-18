import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { wsService } from '@/services/websocket';

interface RectifiersTabProps {
  serialNumber: string;
}

export default function RectifiersTab({ serialNumber }: RectifiersTabProps) {
  const [modulesData, setModulesData] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRectifiers();
  }, [serialNumber]);

  const loadRectifiers = async () => {
    setLoading(true);
    try {
      const data = await wsService.getRectifiersStatus(serialNumber);
      const modulesArray = Object.values(data);
      setModulesData(modulesArray);
    } catch (err) {
      console.error('Error loading rectifiers:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value: any): JSX.Element | string => {
    if (typeof value === 'boolean') {
      return (
        <div className="flex justify-center">
          <div className={`w-2.5 h-2.5 rounded-full ${value ? 'bg-red-500' : 'bg-green-500'}`}></div>
        </div>
      );
    }
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    if (typeof value === 'object' && value !== null) {
      if ('source' in value && 'parsedValue' in value) {
        return value.parsedValue?.toFixed(2) || value.source;
      }
      return JSON.stringify(value);
    }
    return String(value);
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

  if (modulesData.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-500">Нет данных о выпрямителях</div>
        </CardContent>
      </Card>
    );
  }

  const allKeys = Array.from(
    new Set(modulesData.flatMap(module => Object.keys(module)))
  ).filter(key => key !== 'time');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Zap" size={20} />
            Состояние выпрямителей
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 w-48">
                    Параметр
                  </th>
                  {modulesData.map((module, idx) => (
                    <th key={idx} className="text-center py-2 px-2 text-xs font-semibold text-gray-700">
                      PM{module.moduleId || idx + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allKeys.map((key, idx) => (
                  <tr 
                    key={key} 
                    className={`border-b ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                  >
                    <td className="py-2 px-3 text-xs font-medium text-gray-700">
                      {key}
                    </td>
                    {modulesData.map((module, moduleIdx) => (
                      <td key={moduleIdx} className="py-2 px-2 text-center text-xs font-mono">
                        {formatValue(module[key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
