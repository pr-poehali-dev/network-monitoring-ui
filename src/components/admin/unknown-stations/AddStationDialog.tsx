import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { StationFormData } from './UnknownStationsTypes';

interface AddStationDialogProps {
  isOpen: boolean;
  formData: StationFormData;
  addingStation: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onInputChange: (field: string, value: string) => void;
}

export default function AddStationDialog({
  isOpen,
  formData,
  addingStation,
  onClose,
  onSubmit,
  onInputChange,
}: AddStationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Plus" size={20} />
            Добавление станции
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="serialNumber">Серийный номер</Label>
            <Input
              id="serialNumber"
              value={formData.serialNumber}
              onChange={(e) => onInputChange('serialNumber', e.target.value)}
              placeholder="00857"
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Название</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onInputChange('name', e.target.value)}
              placeholder="ЭЗС 00857"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lat">Широта</Label>
            <Input
              id="lat"
              type="number"
              step="0.000001"
              value={formData.lat}
              onChange={(e) => onInputChange('lat', e.target.value)}
              placeholder="55.7558"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lon">Долгота</Label>
            <Input
              id="lon"
              type="number"
              step="0.000001"
              value={formData.lon}
              onChange={(e) => onInputChange('lon', e.target.value)}
              placeholder="37.6173"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ipAddress">IP-адрес</Label>
            <Input
              id="ipAddress"
              value={formData.ipAddress}
              onChange={(e) => onInputChange('ipAddress', e.target.value)}
              placeholder="62.118.80.8"
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="region">Регион</Label>
            <Input
              id="region"
              value={formData.region}
              onChange={(e) => onInputChange('region', e.target.value)}
              placeholder="Московская область"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner">Владелец</Label>
            <Input
              id="owner"
              value={formData.owner}
              onChange={(e) => onInputChange('owner', e.target.value)}
              placeholder="ООО Ромашка"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="app">Приложение</Label>
            <Input
              id="app"
              value={formData.app}
              onChange={(e) => onInputChange('app', e.target.value)}
              placeholder="ChargePoint"
            />
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="address">Адрес</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => onInputChange('address', e.target.value)}
              placeholder="г. Москва, ул. Ленина, д. 1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={addingStation}>
            Отмена
          </Button>
          <Button onClick={onSubmit} disabled={addingStation}>
            {addingStation ? (
              <>
                <Icon name="Loader2" size={16} className="animate-spin" />
                Добавление...
              </>
            ) : (
              'Добавить станцию'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
