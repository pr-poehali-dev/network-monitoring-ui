import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { wsService } from '@/services/websocket';

interface UnknownStation {
  serialNumber: string;
  ip: string | null;
  connectedSince: number | null;
  connectedSinceIso: string | null;
  stationStatus: string;
  errorInfo: string;
  firmware: string | null;
  dbMatchSerial: string | null;
}

interface UnknownStationsResponse {
  count: number;
  stations: UnknownStation[];
  error?: string;
}

interface UnknownStationsProps {
  isActive?: boolean;
}

export default function UnknownStations({ isActive = false }: UnknownStationsProps) {
  const [stations, setStations] = useState<UnknownStation[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadUnknownStations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Sending getUnknownConnectedStations request...');
      const result = await wsService.sendRequest({
        action: 'getUnknownConnectedStations',
      });
      
      console.log('Received response:', result);
      
      if (result.type === 'response' && result.data) {
        const responseData = result.data as UnknownStationsResponse;
        
        if (responseData.error) {
          setError(`Ошибка сбора данных: ${responseData.error}`);
        }
        
        setStations(responseData.stations || []);
        setLastUpdate(new Date());
        setHasLoaded(true);
      } else if (result.type === 'error') {
        setError(result.message || 'Ошибка загрузки данных');
      }
    } catch (err) {
      console.error('Error loading unknown stations:', err);
      setError('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isActive && !hasLoaded) {
      loadUnknownStations();
    }
  }, [isActive]);

  const formatDate = (isoString: string | null) => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            Подключена
          </Badge>
        );
      case 'initializing':
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            Инициализация
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            Ошибка
          </Badge>
        );
      case 'disconnected':
        return <Badge variant="secondary">Отключена</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Icon name="AlertCircle" size={20} className="text-orange-600" />
                Неизвестные подключённые станции
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Станции в сети, но не добавленные в систему
              </p>
            </div>
            <Button
              onClick={loadUnknownStations}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <Icon name="RefreshCw" size={16} className={loading ? 'animate-spin' : ''} />
              Обновить
            </Button>
          </div>
        </div>

        {lastUpdate && (
          <div className="mb-4 text-sm text-gray-500">
            Последнее обновление: {lastUpdate.toLocaleString('ru-RU')}
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <Icon name="AlertCircle" size={20} className="text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <Icon name="Loader2" size={48} className="mx-auto text-gray-300 mb-3 animate-spin" />
            <p className="text-gray-500">Загрузка данных...</p>
          </div>
        )}

        {!loading && !error && stations.length === 0 && (
          <div className="text-center py-12 bg-green-50 rounded-lg border border-green-200">
            <Icon name="CheckCircle2" size={48} className="mx-auto text-green-600 mb-3" />
            <p className="text-green-700 font-medium">Все подключённые станции добавлены в систему</p>
            <p className="text-green-600 text-sm mt-1">Неизвестных станций не обнаружено</p>
          </div>
        )}

        {!loading && stations.length > 0 && (
          <>
            <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Icon name="AlertTriangle" size={20} className="text-orange-600 mt-0.5" />
                <div>
                  <p className="text-orange-900 font-medium">
                    Обнаружено {stations.length} {stations.length === 1 ? 'неизвестная станция' : 'неизвестных станций'}
                  </p>
                  <p className="text-orange-700 text-sm mt-1">
                    Эти станции подключены к системе, но не зарегистрированы в базе данных
                  </p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Серийный номер</TableHead>
                    <TableHead>IP-адрес</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Прошивка</TableHead>
                    <TableHead>Подключена с</TableHead>
                    <TableHead>Совпадение в БД</TableHead>
                    <TableHead>Ошибки</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stations.map((station) => (
                    <TableRow key={station.serialNumber}>
                      <TableCell className="font-mono font-semibold text-orange-700">
                        {station.serialNumber}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {station.ip || '—'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(station.stationStatus)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {station.firmware || '—'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(station.connectedSinceIso)}
                      </TableCell>
                      <TableCell>
                        {station.dbMatchSerial ? (
                          <div className="flex items-center gap-2">
                            <Icon name="Info" size={16} className="text-blue-600" />
                            <span className="font-mono text-sm text-blue-700">
                              {station.dbMatchSerial}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {station.errorInfo ? (
                          <Badge variant="outline" className="text-red-600 border-red-300">
                            {station.errorInfo}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </Card>

      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
          <div className="space-y-2 text-sm text-blue-900">
            <p className="font-medium">О неизвестных станциях:</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>
                <strong>Серийный номер:</strong> идентификатор станции из Redis
              </li>
              <li>
                <strong>Совпадение в БД:</strong> если указано, значит в базе есть станция с похожим серийником 
                (обычно отличается ведущими нулями, например "857" и "00857")
              </li>
              <li>
                Для добавления станции в систему используйте раздел "Управление станциями"
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}