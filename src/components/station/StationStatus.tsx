import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { useStationControl } from '@/hooks/useWebSocket';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

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

interface StationData {
  station_id: string;
  name: string;
  ip_address: string;
  ssh_port: number;
  address: string;
  region: string;
  owner?: string;
  error_info?: string;
  ocpp_connected?: boolean;
  ocpp_status?: {
    status: string;
    errorCode: string;
    info: string;
    vendorErrorCode: string;
  };
  connectors?: Array<{
    id: string;
    status: number;
    type: number;
    ocpp_status?: {
      status: string;
      errorCode: string;
      info: string;
    };
  }>;
}

interface StationStatusProps {
  station: ChargingStation;
  isStationOnline?: boolean;
  stationData?: StationData | null;
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



export default function StationStatus({ station, isStationOnline = true, stationData }: StationStatusProps) {
  const { setOcppConnection, startConnector, stopConnector, setConnectorAvailability, loading } = useStationControl(stationData?.station_id);
  const ocppDisconnected = !stationData?.ocpp_connected;

  const handleOcppToggle = async () => {
    try {
      const newState = ocppDisconnected;
      await setOcppConnection(newState);
      alert(`OCPP ${newState ? 'включен' : 'отключен'}`);
    } catch (error) {
      alert(`Ошибка: ${error instanceof Error ? error.message : 'Не удалось изменить состояние OCPP'}`);
    }
  };

  const handleStartConnector = async (connectorId: string) => {
    try {
      await startConnector(Number(connectorId));
      alert(`Коннектор ${connectorId} запущен`);
    } catch (error) {
      alert(`Ошибка: ${error instanceof Error ? error.message : 'Не удалось запустить коннектор'}`);
    }
  };

  const handleStopConnector = async (connectorId: string) => {
    try {
      await stopConnector(Number(connectorId));
      alert(`Коннектор ${connectorId} остановлен`);
    } catch (error) {
      alert(`Ошибка: ${error instanceof Error ? error.message : 'Не удалось остановить коннектор'}`);
    }
  };

  const handleToggleConnector = async (connectorId: string) => {
    try {
      const connector = stationData?.connectors?.find(c => c.id === connectorId);
      const isUnavailable = connector?.status === 254;
      const newState = isUnavailable;
      await setConnectorAvailability(Number(connectorId), newState);
      alert(`Коннектор ${connectorId} ${newState ? 'включен' : 'отключен'}`);
    } catch (error) {
      alert(`Ошибка: ${error instanceof Error ? error.message : 'Не удалось изменить доступность коннектора'}`);
    }
  };

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
              <Icon 
                name={isStationOnline ? "BatteryCharging" : "WifiOff"} 
                size={32} 
                className={isStationOnline ? "text-green-600" : "text-gray-400"} 
              />
              <div>
                <p className="font-medium">{getStatusLabel(station.status)}</p>
                <p className="text-sm text-gray-500">
                  {isStationOnline ? 'Станция подключена' : 'Станция отключена'}
                </p>
                {stationData?.ocpp_status && (
                  <p className="text-xs text-gray-400 mt-1">
                    OCPP: {stationData.ocpp_status.status}
                    {stationData.ocpp_status.info && ` • ${stationData.ocpp_status.info}`}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-orange-600 border-orange-200 hover:bg-orange-50"
                disabled={loading}
              >
                <Icon name="RotateCcw" size={16} />
                ПЕРЕЗАГРУЗКА
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                disabled={loading}
                onClick={handleOcppToggle}
              >
                <Icon name="Wifi" size={16} />
                OCPP {ocppDisconnected ? 'ВКЛ' : 'ВЫКЛ'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connectors - скрываем только когда станция офлайн */}
      {stationData?.station_status !== 'disconnected' && (
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
                  {stationData?.connectors?.[index]?.ocpp_status && (
                    <p className="text-xs text-gray-400 mt-1">
                      OCPP: {stationData.connectors[index].ocpp_status.status}
                      {stationData.connectors[index].ocpp_status.errorCode !== 'NoError' && 
                        ` • ${stationData.connectors[index].ocpp_status.errorCode}`}
                      {stationData.connectors[index].ocpp_status.info && 
                        ` • ${stationData.connectors[index].ocpp_status.info}`}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-green-600 border-green-200 hover:bg-green-50"
                  disabled={loading}
                  onClick={() => handleStartConnector(connector.id)}
                >
                  СТАРТ
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  disabled={loading}
                  onClick={() => handleStopConnector(connector.id)}
                >
                  СТОП
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-gray-600 border-gray-200 hover:bg-gray-50"
                  disabled={loading}
                  onClick={() => handleToggleConnector(connector.id)}
                >
                  <Icon name="Power" size={16} />
                  ВКЛ/ВЫКЛ
                </Button>
              </div>
            </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Station Info */}
      <Card>
        <CardHeader>
          <CardTitle>Информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-500">Регион</span>
            <span className="font-medium">{stationData?.region || 'None'}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-gray-500">IP адрес</span>
            <span className="font-medium text-sm">{stationData?.ip_address || 'None'}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-gray-500">SSH порт</span>
            <span className="font-medium">{stationData?.ssh_port || 'None'}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-gray-500">Адрес</span>
            <span className="font-medium text-sm">{stationData?.address || 'None'}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-gray-500">Владелец</span>
            <span className="font-medium">{stationData?.owner || 'None'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}