import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface RectifierStatus {
  id: string;
  name: string;
  temperature: number;
  isDisabled: boolean;
  faults: {
    moduleFault: boolean;
    moduleProtection: boolean;
    sciCommunicationFailure: boolean;
    inputModeDetectionError: boolean;
    fanFailure: boolean;
    canCommunicationFailure: boolean;
    abnormalPFCVoltage: boolean;
    moduleUnevenness: boolean;
    shortCircuitToDCDC: boolean;
    dcDcOnOffStatus: boolean;
    temperatureLimitedPower: boolean;
    acPowerLimit: boolean;
    acOvervoltage: boolean;
    acUndervoltage: boolean;
    dcDcOutputOvervoltage: boolean;
    dcDcOvervoltage: boolean;
    dcDcOvertemperature: boolean;
    modulePowerLimit: boolean;
    noConnection: boolean;
  };
}

export default function RectifiersTab() {
  // Имитация данных по модулям выпрямителей
  const rectifiers: RectifierStatus[] = [
    {
      id: 'PM1',
      name: 'PM1',
      temperature: 25.1,
      isDisabled: false,
      faults: {
        moduleFault: false,
        moduleProtection: false,
        sciCommunicationFailure: false,
        inputModeDetectionError: false,
        fanFailure: false,
        canCommunicationFailure: false,
        abnormalPFCVoltage: false,
        moduleUnevenness: false,
        shortCircuitToDCDC: false,
        dcDcOnOffStatus: false,
        temperatureLimitedPower: false,
        acPowerLimit: false,
        acOvervoltage: false,
        acUndervoltage: false,
        dcDcOutputOvervoltage: false,
        dcDcOvervoltage: false,
        dcDcOvertemperature: false,
        modulePowerLimit: false,
        noConnection: false
      }
    },
    {
      id: 'PM2',
      name: 'PM2',
      temperature: 25.3,
      isDisabled: false,
      faults: {
        moduleFault: false,
        moduleProtection: false,
        sciCommunicationFailure: false,
        inputModeDetectionError: false,
        fanFailure: false,
        canCommunicationFailure: false,
        abnormalPFCVoltage: false,
        moduleUnevenness: false,
        shortCircuitToDCDC: false,
        dcDcOnOffStatus: false,
        temperatureLimitedPower: false,
        acPowerLimit: false,
        acOvervoltage: false,
        acUndervoltage: false,
        dcDcOutputOvervoltage: false,
        dcDcOvervoltage: false,
        dcDcOvertemperature: false,
        modulePowerLimit: false,
        noConnection: false
      }
    },
    {
      id: 'PM3',
      name: 'PM3',
      temperature: 24.3,
      isDisabled: false,
      faults: {
        moduleFault: false,
        moduleProtection: false,
        sciCommunicationFailure: false,
        inputModeDetectionError: false,
        fanFailure: false,
        canCommunicationFailure: false,
        abnormalPFCVoltage: false,
        moduleUnevenness: false,
        shortCircuitToDCDC: false,
        dcDcOnOffStatus: false,
        temperatureLimitedPower: false,
        acPowerLimit: false,
        acOvervoltage: false,
        acUndervoltage: false,
        dcDcOutputOvervoltage: false,
        dcDcOvervoltage: false,
        dcDcOvertemperature: false,
        modulePowerLimit: false,
        noConnection: false
      }
    },
    {
      id: 'PM4',
      name: 'PM4',
      temperature: 23.3,
      isDisabled: true, // Этот модуль отключен
      faults: {
        moduleFault: false,
        moduleProtection: false,
        sciCommunicationFailure: false,
        inputModeDetectionError: false,
        fanFailure: false,
        canCommunicationFailure: false,
        abnormalPFCVoltage: false,
        moduleUnevenness: false,
        shortCircuitToDCDC: false,
        dcDcOnOffStatus: false,
        temperatureLimitedPower: false,
        acPowerLimit: false,
        acOvervoltage: false,
        acUndervoltage: false,
        dcDcOutputOvervoltage: false,
        dcDcOvervoltage: false,
        dcDcOvertemperature: false,
        modulePowerLimit: false,
        noConnection: true // Нет связи
      }
    },
    {
      id: 'PM5',
      name: 'PM5',
      temperature: 21.7,
      isDisabled: false,
      faults: {
        moduleFault: false,
        moduleProtection: false,
        sciCommunicationFailure: false,
        inputModeDetectionError: false,
        fanFailure: false,
        canCommunicationFailure: false,
        abnormalPFCVoltage: false,
        moduleUnevenness: false,
        shortCircuitToDCDC: false,
        dcDcOnOffStatus: false,
        temperatureLimitedPower: false,
        acPowerLimit: false,
        acOvervoltage: false,
        acUndervoltage: false,
        dcDcOutputOvervoltage: false,
        dcDcOvervoltage: false,
        dcDcOvertemperature: false,
        modulePowerLimit: false,
        noConnection: false
      }
    }
  ];

  const statusRows = [
    { key: 'temperature', label: 'Температура °C', isTemperature: true },
    { key: 'isDisabled', label: 'Отключен', isStatus: true },
    { key: 'moduleFault', label: 'Module Fault' },
    { key: 'moduleProtection', label: 'Module Protection' },
    { key: 'sciCommunicationFailure', label: 'SCI Communication Failure in Module' },
    { key: 'inputModeDetectionError', label: 'Input Mode Detection Error' },
    { key: 'fanFailure', label: 'Fan Failure' },
    { key: 'canCommunicationFailure', label: 'CAN Communication Failure' },
    { key: 'abnormalPFCVoltage', label: 'Abnormal PFC Voltage' },
    { key: 'moduleUnevenness', label: 'Module Unevenness' },
    { key: 'shortCircuitToDCDC', label: 'Short Circuit to DC/DC' },
    { key: 'dcDcOnOffStatus', label: 'DC/DC On/Off Status' },
    { key: 'temperatureLimitedPower', label: 'Temperature Limited Power' },
    { key: 'acPowerLimit', label: 'AC Power Limit' },
    { key: 'acOvervoltage', label: 'AC Overvoltage' },
    { key: 'acUndervoltage', label: 'AC Undervoltage' },
    { key: 'dcDcOutputOvervoltage', label: 'DC/DC Output Overvoltage' },
    { key: 'dcDcOvervoltage', label: 'DC/DC Overvoltage' },
    { key: 'dcDcOvertemperature', label: 'DC/DC Overtemperature' },
    { key: 'modulePowerLimit', label: 'Module Power Limit' },
    { key: 'noConnection', label: 'Нет связи' }
  ];

  const getStatusValue = (rectifier: RectifierStatus, key: string) => {
    if (key === 'temperature') {
      return rectifier.temperature;
    }
    if (key === 'isDisabled') {
      return rectifier.isDisabled;
    }
    return rectifier.faults[key as keyof typeof rectifier.faults];
  };

  const getTemperatureColor = (temp: number, isDisabled: boolean) => {
    if (isDisabled) return 'text-gray-500';
    if (temp >= 30) return 'text-red-600';
    if (temp >= 25) return 'text-orange-600';
    return 'text-green-600';
  };

  const StatusCell = ({ value, isTemperature, isStatus, isDisabled }: { 
    value: boolean | number; 
    isTemperature?: boolean; 
    isStatus?: boolean;
    isDisabled?: boolean;
  }) => {
    if (isTemperature) {
      return (
        <div className={`font-mono text-sm ${getTemperatureColor(value as number, isDisabled || false)}`}>
          {(value as number).toFixed(1)}
        </div>
      );
    }

    if (isStatus) {
      return (
        <div className="flex justify-center">
          {value ? (
            <div className="w-4 h-4 bg-red-500 rounded-sm border border-gray-400"></div>
          ) : (
            <div className="w-4 h-4 bg-gray-200 rounded-sm border border-gray-400"></div>
          )}
        </div>
      );
    }

    // Для обычных статусов - черные квадраты для false, белые для true (как на изображении)
    return (
      <div className="flex justify-center">
        <div className={`w-3 h-3 border border-gray-600 ${
          value ? 'bg-white' : 'bg-black'
        }`}></div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Cpu" size={20} />
            Состояние модулей выпрямителей
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">
            Диагностическая таблица показывает текущее состояние всех выпрямительных модулей и их параметры.
            Черные квадраты означают нормальное состояние, белые - наличие проблемы.
          </div>
        </CardContent>
      </Card>

      {/* Стилизованная таблица */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              {/* Заголовок таблицы */}
              <thead>
                <tr className="bg-green-100">
                  <th className="border border-gray-400 px-4 py-3 text-left font-semibold text-gray-800 min-w-[200px]">
                    Параметр
                  </th>
                  {rectifiers.map((rectifier) => (
                    <th key={rectifier.id} className="border border-gray-400 px-4 py-3 text-center font-semibold text-gray-800 min-w-[80px]">
                      {rectifier.name}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Строки данных */}
              <tbody>
                {statusRows.map((row, rowIndex) => (
                  <tr key={row.key} className={rowIndex % 2 === 0 ? 'bg-green-50' : 'bg-green-100'}>
                    <td className="border border-gray-400 px-4 py-3 font-medium text-gray-800">
                      {row.label}
                    </td>
                    {rectifiers.map((rectifier) => (
                      <td key={rectifier.id} className="border border-gray-400 px-4 py-3 text-center">
                        <StatusCell 
                          value={getStatusValue(rectifier, row.key)}
                          isTemperature={row.isTemperature}
                          isStatus={row.isStatus}
                          isDisabled={rectifier.isDisabled}
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

      {/* Легенда */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Info" size={20} />
            Обозначения
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Статусы неисправностей:</h4>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-black border border-gray-600"></div>
                <span className="text-sm">Нормальное состояние (нет проблемы)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-white border border-gray-600"></div>
                <span className="text-sm">Обнаружена проблема</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Состояние модуля:</h4>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gray-200 rounded-sm border border-gray-400"></div>
                <span className="text-sm">Модуль включен</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-500 rounded-sm border border-gray-400"></div>
                <span className="text-sm">Модуль отключен</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Цвета температуры:</h4>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Нормальная (&lt; 25°C)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Повышенная (25-30°C)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Высокая (≥ 30°C)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}