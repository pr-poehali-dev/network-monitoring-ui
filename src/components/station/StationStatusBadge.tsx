import { Badge } from '@/components/ui/badge';
import { StationStatus } from '@/types/websocket';

interface StationStatusBadgeProps {
  status: StationStatus;
}

export default function StationStatusBadge({ status }: StationStatusBadgeProps) {
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
      return <Badge variant="secondary">Неизвестно</Badge>;
  }
}
