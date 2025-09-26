import { useWebSocket } from '@/hooks/useWebSocket';
import Icon from '@/components/ui/icon';

export default function WebSocketStatus() {
  const { isConnected, isConnecting, error } = useWebSocket();

  if (isConnecting) {
    return (
      <div className="flex items-center gap-2 text-yellow-600 text-sm">
        <Icon name="Loader2" className="animate-spin" size={16} />
        Подключение...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-600 text-sm">
        <Icon name="WifiOff" size={16} />
        Ошибка подключения
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 text-green-600 text-sm">
        <Icon name="Wifi" size={16} />
        Подключено
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-gray-400 text-sm">
      <Icon name="WifiOff" size={16} />
      Отключено
    </div>
  );
}