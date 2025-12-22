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
  station_status?: string;
  ocpp_connected?: boolean;
  ocpp_status?: {
    status: string;
    errorCode: string;
    info: string;
    vendorErrorCode?: string;
    vendor_error_code?: string;
  };
  connectors?: Array<{
    id: string;
    status: number;
    type: number;
    ocpp_status?: {
      status: string;
      errorCode: string;
      info: string;
      vendorErrorCode?: string;
      vendor_error_code?: string;
    };
  }>;
}

interface StationStatusProps {
  station: ChargingStation;
  isStationOnline?: boolean;
  stationData?: StationData | null;
}

const getOcppStatusColors = (status: string) => {
  switch (status) {
    case 'Available':
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: 'text-green-600',
        text: 'text-green-700',
        badge: 'bg-green-100 text-green-800'
      };
    case 'Preparing':
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        icon: 'text-yellow-600',
        text: 'text-yellow-700',
        badge: 'bg-yellow-100 text-yellow-800'
      };
    case 'Charging':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'text-blue-600',
        text: 'text-blue-700',
        badge: 'bg-blue-100 text-blue-800'
      };
    case 'Finishing':
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        icon: 'text-orange-600',
        text: 'text-orange-700',
        badge: 'bg-orange-100 text-orange-800'
      };
    case 'Faulted':
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: 'text-red-600',
        text: 'text-red-700',
        badge: 'bg-red-100 text-red-800'
      };
    case 'Unavailable':
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        icon: 'text-gray-600',
        text: 'text-gray-700',
        badge: 'bg-gray-100 text-gray-800'
      };
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        icon: 'text-gray-600',
        text: 'text-gray-700',
        badge: 'bg-gray-100 text-gray-800'
      };
  }
};



export default function StationStatus({ station, isStationOnline = true, stationData }: StationStatusProps) {
  const { setOcppConnection, startConnector, stopConnector, setConnectorAvailability, loading } = useStationControl(stationData?.station_id);
  const ocppDisconnected = stationData?.error_info === 'OCPP not connected';
  const stationColors = stationData?.ocpp_status ? getOcppStatusColors(stationData.ocpp_status.status) : getOcppStatusColors('Unavailable');
  
  // Станция считается отключенной только если station_status === 'disconnected'
  const isStationReallyOnline = stationData?.station_status !== 'disconnected';
  // Для иконки wifi используем ocpp_connected
  const isOcppConnected = stationData?.ocpp_connected !== false;

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
      <Card className={`${stationColors.border} border-2`}>
        <CardHeader className={stationColors.bg}>
          <CardTitle className="flex items-center gap-2">
            Зарядная станция
            {stationData?.ocpp_status && (
              <Badge className={stationColors.badge}>
                {stationData.ocpp_status.status}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className={stationColors.bg}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon 
                name={isOcppConnected ? "BatteryCharging" : "WifiOff"} 
                size={32} 
                className={isOcppConnected ? stationColors.icon : "text-gray-400"} 
              />
              <div className="space-y-1">
                <p className="text-sm text-gray-500">
                  {isStationReallyOnline ? (
                    isOcppConnected ? 'Станция подключена' : 'OCPP отключен'
                  ) : 'Станция отключена'}
                </p>
                {stationData?.ocpp_status && (
                  <div className="space-y-1 text-xs">
                    <div><span className="text-gray-500">Status:</span> <span className="font-medium">{stationData.ocpp_status.status}</span></div>
                    <div><span className="text-gray-500">Error:</span> <span className="font-medium">{stationData.ocpp_status.errorCode}</span></div>
                    {stationData.ocpp_status.info && (
                      <div><span className="text-gray-500">Info:</span> <span className="font-medium">{stationData.ocpp_status.info}</span></div>
                    )}
                    {(stationData.ocpp_status.vendor_error_code || stationData.ocpp_status.vendorErrorCode) && (
                      <div><span className="text-gray-500">Vendor:</span> <span className="font-medium">{stationData.ocpp_status.vendor_error_code || stationData.ocpp_status.vendorErrorCode}</span></div>
                    )}
                  </div>
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
            {station.connectors.map((connector, index) => {
              const ocppStatus = stationData?.connectors?.[index]?.ocpp_status;
              const connectorColors = ocppStatus ? getOcppStatusColors(ocppStatus.status) : getOcppStatusColors('Unavailable');
              return (
            <div key={connector.id} className={`flex items-center justify-between p-4 border-2 rounded-lg ${connectorColors.border} ${connectorColors.bg}`}>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${connectorColors.bg} border-2 ${connectorColors.border}`}>
                    <span className={`text-sm font-medium ${connectorColors.text}`}>{connector.id}</span>
                  </div>
                  <Icon name="Plug" size={24} className={connectorColors.icon} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{connector.type}</span>
                    <span className="text-sm text-gray-500">{connector.power} • DC</span>
                    {ocppStatus && (
                      <Badge className={connectorColors.badge}>
                        {ocppStatus.status}
                      </Badge>
                    )}
                  </div>
                  {ocppStatus && (
                    <div className="space-y-1 text-xs">
                      <div><span className="text-gray-500">Status:</span> <span className="font-medium">{ocppStatus.status}</span></div>
                      <div><span className="text-gray-500">Error:</span> <span className="font-medium">{ocppStatus.errorCode}</span></div>
                      {ocppStatus.info && (
                        <div><span className="text-gray-500">Info:</span> <span className="font-medium">{ocppStatus.info}</span></div>
                      )}
                      {(ocppStatus.vendor_error_code || ocppStatus.vendorErrorCode) && (
                        <div><span className="text-gray-500">Vendor:</span> <span className="font-medium">{ocppStatus.vendor_error_code || ocppStatus.vendorErrorCode}</span></div>
                      )}
                    </div>
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
              );
            })}
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