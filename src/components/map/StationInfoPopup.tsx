import { StationData, ConnectorStatus } from '@/types/websocket';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface StationInfoPopupProps {
  station: StationData;
  onClose: () => void;
}

const getConnectorStatusInfo = (statusId: ConnectorStatus) => {
  if (statusId === 0) return { label: 'Доступен', variant: 'default' as const, color: 'bg-green-100 text-green-800' };
  if (statusId === 3) return { label: 'Зарядка', variant: 'default' as const, color: 'bg-blue-100 text-blue-800' };
  if (statusId === 1 || statusId === 2 || statusId === 6 || statusId === 7 || statusId === 8) {
    return { label: 'Подготовка', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' };
  }
  if (statusId === 4 || statusId === 5) return { label: 'Завершение', variant: 'secondary' as const, color: 'bg-orange-100 text-orange-800' };
  if (statusId === 254) return { label: 'Недоступен', variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' };
  if (statusId >= 243 && statusId <= 255) return { label: 'Ошибка', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' };
  return { label: 'Резерв', variant: 'secondary' as const, color: 'bg-purple-100 text-purple-800' };
};

const getConnectorTypeLabel = (connectorType: number) => {
  if (connectorType === 1) return 'Type 2';
  if (connectorType === 2) return 'CCS2';
  if (connectorType === 3) return 'CHAdeMO';
  return 'Unknown';
};

export default function StationInfoPopup({ station, onClose }: StationInfoPopupProps) {
  const hasConnectors = station.connectors && station.connectors.length > 0;

  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-10">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-lg">
          {station.name || station.station_id}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <Icon name="X" size={20} />
        </button>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm text-gray-500">ID: {station.station_id}</p>
        
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${station.is_active === 1 ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-sm font-medium">
            {station.is_active === 1 ? 'Активна' : 'Неактивна'}
          </span>
        </div>

        {station.address && (
          <p className="text-sm text-gray-600 pt-2 border-t">
            {station.address}
          </p>
        )}

        {hasConnectors && (
          <div className="pt-3 border-t">
            <h4 className="text-sm font-semibold mb-2">
              Коннекторы ({station.connectors.length})
            </h4>
            <div className="space-y-2">
              {station.connectors.map((connector) => {
                const statusInfo = getConnectorStatusInfo(connector.status);
                const typeLabel = getConnectorTypeLabel(connector.type);
                
                return (
                  <div
                    key={connector.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">#{connector.id}</span>
                      <span className="text-xs text-gray-500">{typeLabel}</span>
                    </div>
                    <Badge variant={statusInfo.variant} className="text-xs">
                      {statusInfo.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
