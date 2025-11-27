import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

interface Connector {
  id: string;
  type: string;
  status: string;
  statusLabel: string;
  statusColor: string;
  statusBg: string;
  statusBorder: string;
  power: string;
  currentSession?: {
    startTime: string;
    energy: number;
    cost: number;
  };
}

interface ChargingStation {
  id: string;
  name: string;
  location: string;
  status: 'available' | 'charging' | 'error' | 'offline';
  connectors: Connector[];
  totalSessions: number;
  lastActivity: string;
  coordinates: [number, number];
  manufacturer: string;
  serialNumber: string;
  ocppId: string;
}

interface StationStatusProps {
  station: ChargingStation;
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'available': return 'Online';
    case 'charging': return 'Зарядка';
    case 'error': return 'Ошибка';
    case 'offline': return 'Офлайн';
    default: return 'Неизвестно';
  }
};



export default function StationStatus({ station }: StationStatusProps) {
  return (
    <div className="space-y-6">
      {/* Station Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Зарядная станция
            <Badge 
              variant={station.status === 'error' ? 'destructive' : 'default'}
              className={
                station.status === 'available' ? 'bg-green-100 text-green-800' :
                station.status === 'charging' ? 'bg-orange-100 text-orange-800' :
                ''
              }
            >
              {getStatusLabel(station.status)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="BatteryCharging" size={32} className="text-green-600" />
              <div>
                <p className="font-medium">Available</p>
                <p className="text-sm text-gray-500">Available</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                <Icon name="RotateCcw" size={16} />
                ПЕРЕЗАГРУЗКА
              </Button>
              <Button variant="outline" size="sm" className="text-gray-600 border-gray-200 hover:bg-gray-50">
                <Icon name="Wifi" size={16} />
                OCPP ВКЛ/ВЫКЛ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connectors */}
      <Card>
        <CardHeader>
          <CardTitle>Коннекторы</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {station.connectors.map((connector, index) => (
            <div key={connector.id} className={`flex items-center justify-between p-4 border rounded-lg ${connector.statusBorder}`}>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${connector.statusBg}`}>
                    <span className={`text-sm font-medium ${connector.statusColor}`}>{connector.id}</span>
                  </div>
                  <Icon name="Plug" size={24} className={connector.statusColor.replace('text-', 'text-').replace('-700', '-600')} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{connector.type}</span>
                    <Badge variant="outline" className={`${connector.statusBg} ${connector.statusColor} ${connector.statusBorder}`}>
                      {connector.statusLabel}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">{connector.power} • DC</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50">
                  СТАРТ
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                  СТОП
                </Button>
                <Button variant="outline" size="sm" className="text-gray-600 border-gray-200 hover:bg-gray-50">
                  <Icon name="Power" size={16} />
                  ВКЛ/ВЫКЛ
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Station Info */}
      <Card>
        <CardHeader>
          <CardTitle>Информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-500">Город</span>
            <span className="font-medium">Москва</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-gray-500">Приложение</span>
            <span className="font-medium">МосЭнерго Заряд</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-gray-500">IP адрес</span>
            <span className="font-medium text-sm">192.168.1.45</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-gray-500">Адрес</span>
            <span className="font-medium text-sm">ул. Тверская, 12</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-gray-500">Владелец</span>
            <span className="font-medium">ООО "ЭкоЗаряд"</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}