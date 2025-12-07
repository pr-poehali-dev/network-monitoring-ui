import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { wsService } from '@/services/websocket';
import { RectifierModule } from '@/types/websocket';

interface RectifiersTabProps {
  serialNumber: string;
}

export default function RectifiersTab({ serialNumber }: RectifiersTabProps) {
  const [modules, setModules] = useState<RectifierModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRectifiers();
  }, [serialNumber]);

  const loadRectifiers = async () => {
    setLoading(true);
    try {
      const data = await wsService.getRectifiersStatus(serialNumber);
      setModules(data);
    } catch (err) {
      console.error('Error loading rectifiers:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusRows = [
    { key: 'temperatureC', label: 'Температура °C', isTemperature: true },
    { key: 'isOn', label: 'Отключен / ON / OFF', isStatus: true },
    { key: 'moduleFault', label: 'Module Fault' },
    { key: 'moduleProtection', label: 'Module Protection' },
    { key: 'sciCommunicationFailureInModule', label: 'SCI Communication Failure in Module' },
    { key: 'inputModeDetectionError', label: 'Input Mode Detection Error' },
    { key: 'dcdcOvervoltage', label: 'DC/DC Overvoltage' },
    { key: 'abnormalPfcVoltage', label: 'Abnormal PFC Voltage' },
    { key: 'acOvervoltage', label: 'AC Overvoltage' },
    { key: 'acUndervoltage', label: 'AC Undervoltage' },
    { key: 'canCommunicationFailure', label: 'CAN Communication Failure' },
    { key: 'temperatureLimitedPower', label: 'Temperature Limited Power' },
    { key: 'acPowerLimit', label: 'AC Power Limit' },
    { key: 'shortCircuitToDcdc', label: 'Short Circuit to DC/DC' },
    { key: 'dcdcOvertemperature', label: 'DC/DC Overtemperature' },
    { key: 'dcdcOutputOvervoltage', label: 'DC/DC Output Overvoltage' },
    { key: 'notConnect', label: 'Нет связи' }
  ];

  const getStatusValue = (module: RectifierModule, key: string) => {
    return module[key as keyof RectifierModule];
  };

  const getTemperatureColor = (temp: number, notConnect: boolean) => {
    if (notConnect) return 'text-gray-500';
    if (temp >= 30) return 'text-red-600';
    if (temp >= 25) return 'text-orange-600';
    return 'text-green-600';
  };

  const StatusCell = ({ value, isTemperature, isStatus, notConnect }: { 
    value: boolean | number; 
    isTemperature?: boolean; 
    isStatus?: boolean;
    notConnect?: boolean;
  }) => {
    if (isTemperature) {
      return (
        <div className={`font-mono text-sm font-semibold ${getTemperatureColor(value as number, notConnect || false)}`}>
          {(value as number).toFixed(1)}
        </div>
      );
    }

    if (isStatus) {
      if (notConnect) {
        return (
          <div className="flex justify-center">
            <div className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
              НЕТ СВЯЗИ
            </div>
          </div>
        );
      }
      return (
        <div className="flex justify-center">
          {value ? (
            <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
              ON
            </div>
          ) : (
            <div className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
              OFF
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex justify-center">
        {value ? (
          <div className="w-3 h-3 bg-red-500 rounded-full border border-red-300 shadow-sm"></div>
        ) : (
          <div className="w-3 h-3 bg-green-500 rounded-full border border-green-300 shadow-sm"></div>
        )}
      </div>
    );
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

  if (modules.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-500">Нет данных о выпрямителях</div>
        </CardContent>
      </Card>
    );
  }

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
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Параметр
                  </th>
                  {modules.map((module) => (
                    <th key={module.moduleId} className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                      PM{module.moduleId}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {statusRows.map((row, idx) => (
                  <tr 
                    key={row.key} 
                    className={`border-b ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                  >
                    <td className="py-3 px-4 text-sm font-medium text-gray-700">
                      {row.label}
                    </td>
                    {modules.map((module) => (
                      <td key={module.moduleId} className="py-3 px-4 text-center">
                        <StatusCell 
                          value={getStatusValue(module, row.key) as boolean | number} 
                          isTemperature={row.isTemperature}
                          isStatus={row.isStatus}
                          notConnect={module.notConnect}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Info" size={20} />
            Легенда
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full border border-green-300"></div>
                <span className="text-sm text-gray-700">Нет проблем / Норма</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full border border-red-300"></div>
                <span className="text-sm text-gray-700">Ошибка / Проблема</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                  ON
                </div>
                <span className="text-sm text-gray-700">Модуль включен</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                  OFF
                </div>
                <span className="text-sm text-gray-700">Модуль выключен</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                  НЕТ СВЯЗИ
                </div>
                <span className="text-sm text-gray-700">Нет связи с модулем</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
