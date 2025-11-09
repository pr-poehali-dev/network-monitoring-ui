import { useState } from 'react';
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
import { useWebSocket } from '@/hooks/useWebSocket';
import { Station } from '@/types/station';

export default function StationsManager() {
  const { stations } = useWebSocket();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    latitude: '',
    longitude: '',
    elevation: '',
    region: '',
    city: '',
    owner: '',
  });

  const filteredStations = stations.filter(station =>
    station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (station: Station) => {
    setEditingStation(station);
    setFormData({
      name: station.name,
      code: station.code,
      latitude: station.latitude?.toString() || '',
      longitude: station.longitude?.toString() || '',
      elevation: station.elevation?.toString() || '',
      region: station.region || '',
      city: station.city || '',
      owner: station.owner || '',
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    console.log('Сохранение станции:', formData);
    setIsDialogOpen(false);
    setEditingStation(null);
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Управление станциями</h3>
            <p className="text-sm text-gray-600 mt-1">
              Всего станций: {stations.length} • Активных: {stations.filter(s => s.is_active === 1).length}
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Icon name="Plus" size={18} />
            Добавить станцию
          </Button>
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
                <TableHead>Высота</TableHead>
                <TableHead>Регион</TableHead>
                <TableHead>Город</TableHead>
                <TableHead>Владелец</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStations.map((station) => (
                <TableRow key={station.id}>
                  <TableCell className="font-mono text-sm">{station.code}</TableCell>
                  <TableCell className="font-medium">{station.name}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {station.latitude?.toFixed(4)}, {station.longitude?.toFixed(4)}
                  </TableCell>
                  <TableCell className="text-sm">{station.elevation} м</TableCell>
                  <TableCell className="text-sm">{station.region || '—'}</TableCell>
                  <TableCell className="text-sm">{station.city || '—'}</TableCell>
                  <TableCell className="text-sm">{station.owner || '—'}</TableCell>
                  <TableCell>
                    {station.is_active === 1 ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        Активна
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Неактивна</Badge>
                    )}
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
              <Label htmlFor="code">Код станции</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
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
              <Label htmlFor="latitude">Широта</Label>
              <Input
                id="latitude"
                type="number"
                step="0.000001"
                value={formData.latitude}
                onChange={(e) => handleInputChange('latitude', e.target.value)}
                placeholder="43.1234"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">Долгота</Label>
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                value={formData.longitude}
                onChange={(e) => handleInputChange('longitude', e.target.value)}
                placeholder="44.5678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="elevation">Высота (м)</Label>
              <Input
                id="elevation"
                type="number"
                value={formData.elevation}
                onChange={(e) => handleInputChange('elevation', e.target.value)}
                placeholder="850"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Регион</Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) => handleInputChange('region', e.target.value)}
                placeholder="Северная Осетия"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Город</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Владикавказ"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner">Владелец</Label>
              <Input
                id="owner"
                value={formData.owner}
                onChange={(e) => handleInputChange('owner', e.target.value)}
                placeholder="ФГБУН ФНЦ СКФНЦ РАН"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Отмена
            </Button>
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Icon name="Save" size={18} />
              Сохранить изменения
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
