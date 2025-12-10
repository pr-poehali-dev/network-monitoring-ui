import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { wsService } from '@/services/websocket';

interface LogsTabProps {
  serialNumber: string;
}

export default function LogsTab({ serialNumber }: LogsTabProps) {
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    loadLogDates();
  }, [serialNumber]);

  const loadLogDates = async () => {
    setLoading(true);
    try {
      const data = await wsService.getStationLogDates(serialNumber);
      setDates(data.sort((a, b) => b.localeCompare(a)));
      if (data.length > 0) {
        setSelectedDate(data[data.length - 1]);
      }
    } catch (err) {
      console.error('Error loading log dates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (date: string) => {
    const url = `https://eprom.online:10008/logs/${serialNumber}/${date}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `${serialNumber}-${date}.log`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-500">Загрузка логов...</div>
        </CardContent>
      </Card>
    );
  }

  if (dates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="FileText" size={20} />
            Логи станции
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12">
          <div className="text-center space-y-3">
            <Icon name="FileX" size={48} className="mx-auto text-gray-400" />
            <p className="text-gray-500">Нет доступных логов для этой станции</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="FileText" size={20} />
            Логи станции
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Icon name="Info" size={16} />
              <span>Доступно логов: {dates.length}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {dates.map((date) => (
                <Card
                  key={date}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedDate === date
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedDate(date)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <Icon name="Calendar" size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {formatDate(date)}
                          </div>
                          <div className="text-xs text-gray-500">{date}</div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(date);
                        }}
                        className="hover:bg-blue-100"
                      >
                        <Icon name="Download" size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="FileCode" size={20} />
                Лог файл: {formatDate(selectedDate)}
              </div>
              <Button
                size="sm"
                onClick={() => handleDownload(selectedDate)}
                className="flex items-center gap-2"
              >
                <Icon name="Download" size={16} />
                Скачать
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Icon name="Hash" size={16} className="text-gray-500" />
                  <span className="text-gray-700">
                    Серийный номер: <span className="font-mono font-semibold">{serialNumber}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Calendar" size={16} className="text-gray-500" />
                  <span className="text-gray-700">
                    Дата: <span className="font-semibold">{selectedDate}</span>
                  </span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>Лог файл доступен для скачивания.</p>
                    <p className="text-xs text-gray-500">
                      Путь: /mnt/logs/{selectedDate}/{serialNumber}.log
                    </p>
                    <p className="text-xs text-gray-500">
                      URL: https://eprom.online:10008/logs/{serialNumber}/{selectedDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
