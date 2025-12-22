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

const getOcppStatusColor = (status: string) => {
  switch (status) {
    case 'Available': return 'text-green-700 bg-green-50 border-green-200';
    case 'Charging': return 'text-blue-700 bg-blue-50 border-blue-200';
    case 'Preparing': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    case 'Finishing': return 'text-orange-700 bg-orange-50 border-orange-200';
    case 'Faulted': return 'text-red-700 bg-red-50 border-red-200';
    case 'Unavailable': return 'text-gray-700 bg-gray-50 border-gray-200';
    default: return 'text-gray-700 bg-gray-50 border-gray-200';
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
            {stationData?.ocpp_status && (
              <Badge 
                variant="outline"
                className={getOcppStatusColor(stationData.ocpp_status.status)}
              >
                {stationData.ocpp_status.status}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Icon 
                    name={isStationOnline ? "BatteryCharging" : "WifiOff"} 
                    size={32} 
                    className={isStationOnline ? "text-green-600" : "text-gray-400"} 
                  />
                  <div>
                    <p className="text-sm text-gray-500">
                      {isStationOnline ? 'Станция подключена' : 'Станция отключена'}
                    </p>
                  </div>
                </div>
                
                {/* OCPP Station Status */}
                {stationData?.ocpp_status && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs">Status:</span>
                      <Badge variant="outline" className={getOcppStatusColor(stationData.ocpp_status.status)}>
                        {stationData.ocpp_status.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs">Error:</span>
                      <span className="font-mono text-xs font-medium">{stationData.ocpp_status.errorCode}</span>
                    </div>
                    {stationData.ocpp_status.info && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs">Info:</span>
                        <span className="font-mono text-xs font-medium">{stationData.ocpp_status.info}</span>
                      </div>
                    )}
                    {stationData.ocpp_status.vendorErrorCode && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs">Vendor:</span>
                        <span className="font-mono text-xs font-medium">{stationData.ocpp_status.vendorErrorCode}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
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
              return (
            <div key={connector.id} className="flex items-center justify-between p-4 border rounded-lg border-gray-200">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100">
                    <span className="text-sm font-medium text-gray-700">{connector.id}</span>
                  </div>
                  <Icon name="Plug" size={24} className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{connector.type}</span>
                    <span className="text-sm text-gray-500">{connector.power} • DC</span>
                  </div>
                  
                  {/* OCPP Connector Status */}
                  {ocppStatus && (
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Status:</span>
                        <Badge variant="outline" className={getOcppStatusColor(ocppStatus.status)} size="sm">
                          {ocppStatus.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Error:</span>
                        <span className="font-mono font-medium">{ocppStatus.errorCode}</span>
                      </div>
                      {ocppStatus.info && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Info:</span>
                          <span className="font-mono font-medium">{ocppStatus.info}</span>
                        </div>
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