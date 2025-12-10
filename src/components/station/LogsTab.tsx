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
  const [logContent, setLogContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    loadLogDates();
  }, [serialNumber]);

  const loadLogDates = async () => {
    setLoading(true);
    try {
      const data = await wsService.getStationLogDates(serialNumber);
      const sortedDates = data.sort((a, b) => b.localeCompare(a));
      setDates(sortedDates);
      if (sortedDates.length > 0) {
        setSelectedDate(sortedDates[0]);
        await loadLogContent(sortedDates[0]);
      }
    } catch (err) {
      console.error('Error loading log dates:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLogContent = async (date: string) => {
    setLoadingContent(true);
    try {
      const result = await wsService.getStationLogFile(serialNumber, date, 1048576);
      if (result) {
        setLogContent(result.content);
      }
    } catch (err) {
      console.error('Error loading log content:', err);
      setLogContent('Ошибка загрузки содержимого лога');
    } finally {
      setLoadingContent(false);
    }
  };

  const handleDateSelect = async (date: string) => {
    setSelectedDate(date);
    await loadLogContent(date);
  };

  const handleDownload = () => {
    if (!selectedDate || !logContent) return;
    
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${serialNumber}-${selectedDate}.log`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Icon name="Info" size={16} />
                <span>Доступно логов: {dates.length}</span>
              </div>
              {selectedDate && (
                <Button
                  size="sm"
                  onClick={handleDownload}
                  className="flex items-center gap-2"
                  disabled={!logContent || loadingContent}
                >
                  <Icon name="Download" size={16} />
                  Скачать
                </Button>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              {dates.map((date) => (
                <Button
                  key={date}
                  variant={selectedDate === date ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleDateSelect(date)}
                  disabled={loadingContent}
                >
                  {formatDate(date)}
                </Button>
              ))}
            </div>

            {selectedDate && (
              <div className="space-y-2">
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

                {loadingContent ? (
                  <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                    Загрузка содержимого...
                  </div>
                ) : (
                  <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-xs max-h-96 overflow-y-auto">
                    {logContent.split('\n').map((line, idx) => (
                      <div key={idx} className="hover:bg-gray-800 py-0.5">
                        <span className="text-gray-500 select-none mr-4">{(idx + 1).toString().padStart(4, ' ')}</span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
