import { ReactNode, useEffect, useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import Layout from './Layout';
import Icon from './ui/icon';
import { Button } from './ui/button';

interface ConnectionGuardProps {
  children: ReactNode;
}

export default function ConnectionGuard({ children }: ConnectionGuardProps) {
  const { isConnected, isConnecting, error: wsError } = useWebSocket();
  const [retryIn, setRetryIn] = useState(0);
  const [nextRetryTime, setNextRetryTime] = useState<number | null>(null);

  useEffect(() => {
    if (!isConnected && !isConnecting) {
      const retryDelay = 10;
      setNextRetryTime(Date.now() + retryDelay * 1000);
      setRetryIn(retryDelay);

      const timer = setInterval(() => {
        setRetryIn(prev => {
          if (prev <= 1) {
            window.location.reload();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setNextRetryTime(null);
      setRetryIn(0);
    }
  }, [isConnected, isConnecting]);

  if (isConnecting) {
    return (
      <Layout showSidebar={false}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center px-4">
            <div className="mb-6">
              <Icon name="Loader2" size={64} className="mx-auto text-blue-500 animate-spin" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Подключение к серверу</h1>
            <p className="text-gray-600">
              Устанавливаем соединение с системой мониторинга...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isConnected) {
    return (
      <Layout showSidebar={false}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center px-4">
            <div className="mb-6">
              <Icon name="WifiOff" size={64} className="mx-auto text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Нет подключения к серверу</h1>
            <p className="text-gray-600 mb-6">
              {wsError || 'Не удалось установить соединение с WebSocket сервером'}
            </p>
            
            {retryIn > 0 && (
              <div className="mb-6">
                <div className="inline-flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-6 py-3">
                  <Icon name="Clock" size={20} className="text-blue-600" />
                  <span className="text-blue-900 font-medium">
                    Автоматическое переподключение через {retryIn} сек
                  </span>
                </div>
              </div>
            )}

            <Button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2"
            >
              <Icon name="RotateCw" size={18} />
              Обновить сейчас
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return <>{children}</>;
}
