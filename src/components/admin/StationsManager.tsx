import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useStations } from '@/hooks/useWebSocket';
import { StationData } from '@/types/websocket';
import { parseErrorInfo, getErrorColor } from '@/utils/errors';
import { wsService } from '@/services/websocket';
import { useToast } from '@/hooks/use-toast';

export default function StationsManager() {
  const { stations, loadStations } = useStations();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStation, setEditingStation] = useState<StationData | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadStations();
  }, [loadStations]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    station_id: '',
    lat: '',
    lon: '',
    region: '',
    address: '',
    ip_address: '',
  });

  const filteredStations = stations.filter(station =>
    (station.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    station.station_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (station: StationData) => {
    setEditingStation(station);
    setFormData({
      name: station.name || '',
      station_id: station.station_id,
      lat: station.lat?.toString() || '',
      lon: station.lon?.toString() || '',
      region: station.region || '',
      address: station.address || '',
      ip_address: station.ip_address || '',
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingStation) return;
    
    setSaving(true);
    
    try {
      const result = await wsService.saveStation({
        stationId: editingStation.id,
        serialNumber: formData.station_id,
        name: formData.name || undefined,
        address: formData.address || undefined,
        region: formData.region || undefined,
        ipAddress: formData.ip_address || undefined,
        lat: formData.lat ? parseFloat(formData.lat) : undefined,
        lon: formData.lon ? parseFloat(formData.lon) : undefined,
      });
      
      if (result.type === 'response' && result.data?.operation) {
        toast({
          title: 'Станция обновлена',
          description: `Изменения успешно сохранены`,
        });
        
        setIsDialogOpen(false);
        setEditingStation(null);
        await loadStations();
      } else if (result.type === 'error') {
        let errorMessage = result.message || 'Ошибка при сохранении';
        
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
      console.error('Error saving station:', err);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить изменения',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setEditingStation(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Управление станциями</h3>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Icon
              name="Search"
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <Input
              placeholder="Поиск по названию или коду станции..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Код</TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Координаты</TableHead>
                <TableHead>IP-адрес</TableHead>
                <TableHead>Регион</TableHead>
                <TableHead>Адрес</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStations.map((station) => (
                <TableRow key={station.id}>
                  <TableCell className="font-mono text-sm">{station.station_id}</TableCell>
                  <TableCell className="font-medium">{station.name || '—'}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {station.lat?.toFixed(4)}, {station.lon?.toFixed(4)}
                  </TableCell>
                  <TableCell className="text-sm font-mono">{station.ip_address || '—'}</TableCell>
                  <TableCell className="text-sm">{station.region || '—'}</TableCell>
                  <TableCell className="text-sm">{station.address || '—'}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {station.station_status === 'connected' && (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          Подключена
                        </Badge>
                      )}
                      {station.station_status === 'initializing' && (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                          Инициализация
                        </Badge>
                      )}
                      {station.station_status === 'error' && (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                          Ошибка
                        </Badge>
                      )}
                      {station.station_status === 'disconnected' && (
                        <Badge variant="secondary">Отключена</Badge>
                      )}
                      {station.error_info && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {parseErrorInfo(station.error_info).map((error, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className={`text-xs ${getErrorColor(error.type)}`}
                            >
                              {error.label}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(station)}
                      className="hover:bg-blue-50"
                    >
                      <Icon name="Pencil" size={16} className="text-blue-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredStations.length === 0 && (
          <div className="text-center py-12">
            <Icon name="Search" size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Станции не найдены</p>
          </div>
        )}
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Pencil" size={20} />
              Редактирование станции
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="station_id">Код станции</Label>
              <Input
                id="station_id"
                value={formData.station_id}
                onChange={(e) => handleInputChange('station_id', e.target.value)}
                placeholder="ARCE"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Название</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Арцеулово"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lat">Широта</Label>
              <Input
                id="lat"
                type="number"
                step="0.000001"
                value={formData.lat}
                onChange={(e) => handleInputChange('lat', e.target.value)}
                placeholder="43.1234"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lon">Долгота</Label>
              <Input
                id="lon"
                type="number"
                step="0.000001"
                value={formData.lon}
                onChange={(e) => handleInputChange('lon', e.target.value)}
                placeholder="44.5678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ip_address">IP-адрес</Label>
              <Input
                id="ip_address"
                value={formData.ip_address}
                onChange={(e) => handleInputChange('ip_address', e.target.value)}
                placeholder="192.168.1.100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Регион</Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) => handleInputChange('region', e.target.value)}
                placeholder="Татарстан"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="address">Адрес</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="г. Владикавказ, ул. Ленина, д. 1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel} disabled={saving}>
              Отмена
            </Button>
            <Button 
              onClick={handleSave} 
              className="flex items-center gap-2"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Icon name="Loader2" size={18} className="animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Icon name="Save" size={18} />
                  Сохранить изменения
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}