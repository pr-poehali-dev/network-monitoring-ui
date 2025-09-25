import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

interface Connector {
  id: string;
  type: string;
  status: 'available' | 'charging' | 'error';
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

const getConnectorIcon = (type: string) => {
  switch (type) {
    case 'CCS Combo 2':
    case 'CCS':
      return 'Zap';
    case 'CHAdeMO':
      return 'Battery';
    case 'Type 2':
      return 'Plug';
    case 'GB/T DC':
      return 'Power';
    default:
      return 'Plug';
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
          <div className="flex items-center gap-3">
            <Icon name="BatteryCharging" size={32} className="text-green-600" />
            <div>
              <p className="font-medium">Available</p>
              <p className="text-sm text-gray-500">Available</p>
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
            <div key={connector.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-green-800">{index + 1}</span>
                  </div>
                  <Icon name={getConnectorIcon(connector.type)} size={24} className="text-green-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">Available</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Available
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">{connector.type} • {connector.power} • DC</p>
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
            <span className="text-gray-500">Производитель</span>
            <span className="font-medium">{station.manufacturer}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-gray-500">Серийный номер</span>
            <span className="font-medium">{station.serialNumber}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-gray-500">OCPP идентификатор</span>
            <span className="font-medium text-sm">{station.ocppId}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}