import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UnknownStation } from './UnknownStationsTypes';

interface UnknownStationsTableProps {
  stations: UnknownStation[];
  loading: boolean;
  onAddStation: (station: UnknownStation) => void;
  formatDate: (isoString: string | null) => string;
  getStatusBadge: (status: string) => JSX.Element;
}

export default function UnknownStationsTable({
  stations,
  loading,
  onAddStation,
  formatDate,
  getStatusBadge,
}: UnknownStationsTableProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <Icon name="Loader2" size={48} className="mx-auto text-gray-300 mb-3 animate-spin" />
        <p className="text-gray-500">Загрузка данных...</p>
      </div>
    );
  }

  if (stations.length === 0) {
    return (
      <div className="text-center py-12 bg-green-50 rounded-lg border-2 border-green-200">
        <Icon name="CheckCircle2" size={48} className="mx-auto text-green-500 mb-3" />
        <p className="text-green-700 font-medium">Неизвестных станций не найдено</p>
        <p className="text-green-600 text-sm mt-1">Все подключённые станции добавлены в систему</p>
      </div>
    );
  }

  return (
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
            <TableHead>Ошибка</TableHead>
            <TableHead className="text-right">Действие</TableHead>
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
              <TableCell className="text-right">
                <Button
                  size="sm"
                  onClick={() => onAddStation(station)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Icon name="Plus" size={16} />
                  Добавить
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
