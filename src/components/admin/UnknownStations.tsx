import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { wsService } from '@/services/websocket';
import { useToast } from '@/hooks/use-toast';
import UnknownStationsTable from './unknown-stations/UnknownStationsTable';
import AddStationDialog from './unknown-stations/AddStationDialog';
import {
  UnknownStation,
  UnknownStationsResponse,
  StationFormData,
} from './unknown-stations/UnknownStationsTypes';

interface UnknownStationsProps {
  isActive?: boolean;
}

export default function UnknownStations({ isActive = false }: UnknownStationsProps) {
  const [stations, setStations] = useState<UnknownStation[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [addingStation, setAddingStation] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<UnknownStation | null>(null);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<StationFormData>({
    name: '',
    serialNumber: '',
    lat: '',
    lon: '',
    region: '',
    address: '',
    ipAddress: '',
    owner: '',
    app: '',
  });

  const loadUnknownStations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Sending getUnknownConnectedStations request...');
      const result = await wsService.getUnknownConnectedStations();
      
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

  const handleOpenAddDialog = (station: UnknownStation) => {
    setSelectedStation(station);
    setFormData({
      name: `ЭЗС ${station.serialNumber}`,
      serialNumber: station.serialNumber,
      lat: '',
      lon: '',
      region: '',
      address: '',
      ipAddress: station.ip || '',
      owner: '',
      app: 'ChargePoint',
    });
    setIsDialogOpen(true);
  };

  const handleAddStation = async () => {
    if (!selectedStation) return;
    
    setAddingStation(true);
    
    try {
      const result = await wsService.saveStation({
        serialNumber: formData.serialNumber,
        name: formData.name || undefined,
        address: formData.address || undefined,
        region: formData.region || undefined,
        ipAddress: formData.ipAddress || undefined,
        lat: formData.lat ? parseFloat(formData.lat) : undefined,
        lon: formData.lon ? parseFloat(formData.lon) : undefined,
        owner: formData.owner || undefined,
        app: formData.app || undefined,
      });
      
      if (result.type === 'response' && result.data?.operation) {
        toast({
          title: 'Станция добавлена',
          description: `Станция ${formData.serialNumber} успешно добавлена в систему`,
        });
        
        setIsDialogOpen(false);
        setSelectedStation(null);
        await loadUnknownStations();
      } else if (result.type === 'error') {
        let errorMessage = result.message || 'Ошибка при добавлении станции';
        
        if (result.code === 'ALREADY_EXISTS') {
          errorMessage = 'Станция с таким серийным номером уже существует';
        } else if (result.code === 'SERIAL_NORMALIZED_EXISTS') {
          errorMessage = 'Станция с похожим серийным номером уже существует (проверьте ведущие нули)';
        } else if (result.code === 'INVALID_REQUEST') {
          errorMessage = 'Некорректные данные для сохранения станции';
        }
        
        toast({
          title: 'Ошибка',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Error adding station:', err);
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить станцию',
        variant: 'destructive',
      });
    } finally {
      setAddingStation(false);
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setSelectedStation(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

        {!loading && !error && (
          <>
            <UnknownStationsTable
              stations={stations}
              loading={loading}
              onAddStation={handleOpenAddDialog}
              formatDate={formatDate}
              getStatusBadge={getStatusBadge}
            />

            {stations.length > 0 && (
              <div className="mt-4 text-sm text-gray-500">
                Всего неизвестных станций: <strong>{stations.length}</strong>
              </div>
            )}
          </>
        )}

        {loading && (
          <div className="text-center py-12">
            <Icon name="Loader2" size={48} className="mx-auto text-gray-300 mb-3 animate-spin" />
            <p className="text-gray-500">Загрузка данных...</p>
          </div>
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
                Для добавления станции в систему нажмите кнопку "Добавить" в таблице
              </li>
            </ul>
          </div>
        </div>
      </Card>

      <AddStationDialog
        isOpen={isDialogOpen}
        formData={formData}
        addingStation={addingStation}
        onClose={handleCancel}
        onSubmit={handleAddStation}
        onInputChange={handleInputChange}
      />
    </div>
  );
}
