import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'request' | 'response' | 'error' | 'info';
  message: string;
}

interface LogsTabProps {
  logs: LogEntry[];
}

export default function LogsTab({ logs }: LogsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="FileText" size={20} />
          Логи по дням
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button variant="default" size="sm">Сегодня</Button>
            <Button variant="outline" size="sm">Вчера</Button>
            <Button variant="outline" size="sm">2 дня назад</Button>
            <Button variant="outline" size="sm">3 дня назад</Button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 py-2 border-b border-gray-200 last:border-0">
                <span className="text-xs text-gray-500 w-24 flex-shrink-0">{log.timestamp.split(' ')[0]}</span>
                <div className="flex items-center gap-2 flex-1">
                  {log.type === 'request' ? (
                    <Icon name="ArrowRight" size={14} className="text-blue-500" />
                  ) : log.type === 'response' ? (
                    <Icon name="ArrowLeft" size={14} className="text-green-500" />
                  ) : (
                    <Icon name="AlertCircle" size={14} className="text-red-500" />
                  )}
                  <span className="text-sm">{log.message.split('\n')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}