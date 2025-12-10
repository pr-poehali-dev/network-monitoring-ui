import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { wsService } from '@/services/websocket';

interface LogsTabProps {
  serialNumber: string;
}

interface GroupedDates {
  [yearMonth: string]: string[];
}

export default function LogsTab({ serialNumber }: LogsTabProps) {
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [logContent, setLogContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

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
        const firstMonth = sortedDates[0].substring(0, 7);
        setExpandedMonths(new Set([firstMonth]));
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

  const toggleMonth = (yearMonth: string) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(yearMonth)) {
      newExpanded.delete(yearMonth);
    } else {
      newExpanded.add(yearMonth);
    }
    setExpandedMonths(newExpanded);
  };

  const groupDatesByMonth = (): GroupedDates => {
    const grouped: GroupedDates = {};
    dates.forEach((date) => {
      const yearMonth = date.substring(0, 7);
      if (!grouped[yearMonth]) {
        grouped[yearMonth] = [];
      }
      grouped[yearMonth].push(date);
    });
    return grouped;
  };

  const formatMonthYear = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('ru-RU', {
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDay = (dateStr: string) => {
    const day = dateStr.split('-')[2];
    return `${parseInt(day)}`;
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

  const groupedDates = groupDatesByMonth();
  const sortedMonths = Object.keys(groupedDates).sort((a, b) => b.localeCompare(a));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Calendar" size={20} />
              Даты логов
            </div>
            <span className="text-sm font-normal text-gray-500">{dates.length}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-[600px] overflow-y-auto">
          <div className="space-y-2">
            {sortedMonths.map((yearMonth) => {
              const isExpanded = expandedMonths.has(yearMonth);
              const monthDates = groupedDates[yearMonth];
              
              return (
                <div key={yearMonth} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleMonth(yearMonth)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Icon 
                        name={isExpanded ? "ChevronDown" : "ChevronRight"} 
                        size={16} 
                        className="text-gray-600"
                      />
                      <span className="font-medium text-sm capitalize">
                        {formatMonthYear(yearMonth)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                      {monthDates.length}
                    </span>
                  </button>
                  
                  {isExpanded && (
                    <div className="p-2 grid grid-cols-7 gap-1">
                      {monthDates.map((date) => (
                        <button
                          key={date}
                          onClick={() => handleDateSelect(date)}
                          disabled={loadingContent}
                          className={`
                            p-2 text-sm rounded transition-all
                            ${selectedDate === date 
                              ? 'bg-blue-600 text-white font-semibold shadow-md' 
                              : 'bg-white hover:bg-blue-50 text-gray-700 border border-gray-200'
                            }
                            ${loadingContent ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                          `}
                        >
                          {formatDay(date)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="FileText" size={20} />
              {selectedDate ? `Лог за ${selectedDate}` : 'Содержимое лога'}
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
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedDate ? (
            <div className="py-12 text-center text-gray-500">
              Выберите дату для просмотра лога
            </div>
          ) : loadingContent ? (
            <div className="py-12 text-center">
              <div className="inline-flex items-center gap-2 text-gray-500">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                Загрузка содержимого...
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Icon name="Hash" size={14} />
                  <span className="font-mono">{serialNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="FileCode" size={14} />
                  <span>{logContent.split('\n').length} строк</span>
                </div>
              </div>
              
              <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-xs max-h-[500px] overflow-auto">
                {logContent.split('\n').map((line, idx) => (
                  <div key={idx} className="hover:bg-gray-800 py-0.5">
                    <span className="text-gray-500 select-none mr-4 inline-block w-12 text-right">
                      {idx + 1}
                    </span>
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
